"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit";

export async function getRequests(page = 1, limit = 10) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const { role, branchId } = session.user as any;

  const isCentralAdmin = role === "SUPER_ADMIN" || role === "ADMIN_GUDANG_PUSAT";
  
  let whereClause: any = {};
  if (isCentralAdmin) {
    whereClause = {
      status: { not: "MENUNGGU_CABANG" }
    };
  } else {
    whereClause = { to_branch_id: branchId };
  }

  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    prisma.stockTransfer.findMany({
      where: whereClause,
      include: {
        product: true,
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.stockTransfer.count({ where: whereClause })
  ]);

  // We need branch names. Let's fetch all branches and attach.
  const branches = await prisma.branch.findMany();
  const branchMap = branches.reduce((acc, b) => {
    acc[b.id] = b.name;
    return acc;
  }, {} as Record<string, string>);

  const data = requests.map(req => ({
    ...req,
    from_branch_name: branchMap[req.from_branch_id] || "Unknown",
    to_branch_name: branchMap[req.to_branch_id] || "Unknown",
  }));

  return { data, totalPages: Math.ceil(total / limit) };
}

export async function createRequest(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const { branchId, name: user_name, role } = session.user as any;
  
  if (!branchId) {
    throw new Error("Anda tidak terhubung ke cabang manapun.");
  }

  const product_id = formData.get("product_id") as string;
  const quantity = parseInt(formData.get("quantity") as string, 10);

  if (!product_id || isNaN(quantity) || quantity <= 0) {
    throw new Error("Data tidak valid");
  }

  // Find the central branch
  let centralBranch = await prisma.branch.findFirst({
    where: { is_central: true }
  });

  // Self-healing: if not set, auto-assign the first branch with "Pusat" in name
  if (!centralBranch) {
    centralBranch = await prisma.branch.findFirst({
      where: { name: { contains: "Pusat" } }
    });
    
    if (centralBranch) {
      centralBranch = await prisma.branch.update({
        where: { id: centralBranch.id },
        data: { is_central: true }
      });
    }
  }

  if (!centralBranch) {
    throw new Error("Gudang Pusat belum diatur di sistem.");
  }

  if (centralBranch.id === branchId) {
    throw new Error("Gudang Pusat tidak perlu melakukan request ke dirinya sendiri.");
  }

  const status = role === "KASIR" ? "MENUNGGU_CABANG" : "PENDING";
  const request = await prisma.stockTransfer.create({
    data: {
      product_id,
      quantity,
      from_branch_id: centralBranch.id,
      to_branch_id: branchId,
      status,
      requested_by: user_name,
    }
  });

  await createAuditLog({
    action: "CREATE_STOCK_REQUEST",
    entity: "StockTransfer",
    entity_id: request.id,
    details: { quantity, product_id, status }
  });

  revalidatePath("/permintaan-barang");
  redirect("/permintaan-barang");
}

export async function approveRequest(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const user_name = session.user.name as string;
  const role = (session.user as any).role;

  if (role !== "SUPER_ADMIN" && role !== "ADMIN_GUDANG_PUSAT") {
    throw new Error("Unauthorized: Hanya Admin Gudang Pusat yang dapat menyetujui.");
  }

  const request = await prisma.stockTransfer.findUnique({ where: { id } });
  if (!request || request.status !== "PENDING") {
    throw new Error("Request tidak valid atau sudah diproses.");
  }

  // Deduct from Pusat
  await prisma.$transaction(async (tx) => {
    // 1. Mark as DIKIRIM
    await tx.stockTransfer.update({
      where: { id },
      data: {
        status: "DIKIRIM",
        approved_by: user_name,
      }
    });

    // 2. Reduce stock at Pusat
    const centralStock = await tx.branchStock.findUnique({
      where: {
        product_id_branch_id: {
          product_id: request.product_id,
          branch_id: request.from_branch_id
        }
      }
    });

    if (!centralStock || centralStock.quantity < request.quantity) {
      throw new Error("Stok Gudang Pusat tidak mencukupi untuk memenuhi permintaan ini.");
    }

    await tx.branchStock.update({
      where: { id: centralStock.id },
      data: { quantity: { decrement: request.quantity } }
    });

    // 3. Create StockMutation for Pusat
    await tx.stockMutation.create({
      data: {
        product_id: request.product_id,
        branch_id: request.from_branch_id,
        type: "KELUAR",
        quantity: request.quantity,
        note: `Pengiriman ke Cabang (Ref: ${id})`,
        created_by: user_name,
        reference_id: id,
      }
    });

    await tx.auditLog.create({
      data: {
        user_id: session.user.id,
        branch_id: request.from_branch_id,
        action: "APPROVE_STOCK_REQUEST",
        entity: "StockTransfer",
        entity_id: id,
        details: JSON.stringify({ quantity: request.quantity, product_id: request.product_id }),
      }
    });
  });

  revalidatePath("/permintaan-barang");
  revalidatePath("/stok");
}

export async function receiveRequest(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const user_name = session.user.name as string;
  const role = (session.user as any).role;

  if (role === "KASIR") {
    throw new Error("Unauthorized: Kasir tidak dapat menerima barang.");
  }

  const request = await prisma.stockTransfer.findUnique({ where: { id } });
  if (!request || request.status !== "DIKIRIM") {
    throw new Error("Request tidak valid atau belum dikirim.");
  }

  await prisma.$transaction(async (tx) => {
    // 1. Mark as DITERIMA
    await tx.stockTransfer.update({
      where: { id },
      data: {
        status: "DITERIMA",
        received_by: user_name,
      }
    });

    // 2. Increase stock at Cabang
    const cabangStock = await tx.branchStock.findUnique({
      where: {
        product_id_branch_id: {
          product_id: request.product_id,
          branch_id: request.to_branch_id
        }
      }
    });

    if (cabangStock) {
      await tx.branchStock.update({
        where: { id: cabangStock.id },
        data: { quantity: { increment: request.quantity } }
      });
    } else {
      await tx.branchStock.create({
        data: {
          product_id: request.product_id,
          branch_id: request.to_branch_id,
          quantity: request.quantity,
        }
      });
    }

    // 3. Create StockMutation for Cabang
    await tx.stockMutation.create({
      data: {
        product_id: request.product_id,
        branch_id: request.to_branch_id,
        type: "MASUK",
        quantity: request.quantity,
        note: `Penerimaan dari Pusat (Ref: ${id})`,
        created_by: user_name,
        reference_id: id,
      }
    });

    await tx.auditLog.create({
      data: {
        user_id: session.user.id,
        branch_id: request.to_branch_id,
        action: "RECEIVE_STOCK_REQUEST",
        entity: "StockTransfer",
        entity_id: id,
        details: JSON.stringify({ quantity: request.quantity, product_id: request.product_id }),
      }
    });
  });

  revalidatePath("/permintaan-barang");
  revalidatePath("/stok");
}

export async function rejectRequest(id: string, reason: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const user_name = session.user.name as string;
  const role = (session.user as any).role;

  if (role !== "SUPER_ADMIN" && role !== "ADMIN_GUDANG_PUSAT") {
    throw new Error("Unauthorized: Hanya Admin Gudang Pusat yang dapat menolak.");
  }

  const request = await prisma.stockTransfer.findUnique({ where: { id } });
  if (!request || (request.status !== "PENDING" && request.status !== "MENUNGGU_CABANG")) {
    throw new Error("Request tidak valid atau sudah diproses.");
  }

  await prisma.stockTransfer.update({
    where: { id },
    data: {
      status: "DITOLAK",
      rejection_reason: reason,
      approved_by: user_name, // whoever rejected it
    }
  });

  await createAuditLog({
    action: "REJECT_STOCK_REQUEST",
    entity: "StockTransfer",
    entity_id: id,
    details: { reason, status: request.status }
  });

  revalidatePath("/permintaan-barang");
}

export async function forwardRequest(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const request = await prisma.stockTransfer.findUnique({ where: { id } });
  if (!request || request.status !== "MENUNGGU_CABANG") {
    throw new Error("Request tidak valid atau sudah diteruskan.");
  }

  await prisma.stockTransfer.update({
    where: { id },
    data: {
      status: "PENDING",
    }
  });

  await createAuditLog({
    action: "FORWARD_STOCK_REQUEST",
    entity: "StockTransfer",
    entity_id: id,
    details: { status: "PENDING" }
  });

  revalidatePath("/permintaan-barang");
}
