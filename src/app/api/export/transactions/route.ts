import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  const branchId = isSuperAdmin ? undefined : session.user.branchId;

  const whereClause: any = {
    branch_id: branchId || undefined,
  };

  if (start && end) {
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    whereClause.created_at = {
      gte: new Date(start),
      lte: endDate
    };
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    include: {
      branch: true,
      items: {
        include: {
          product: true,
          service_item: true,
          mechanic: true
        }
      }
    },
    orderBy: { created_at: "desc" }
  });

  // Build CSV
  const header = ["Invoice", "Cabang", "Tanggal", "Tipe Item", "Nama Item", "Mekanik", "Qty", "Harga Satuan", "Subtotal"];
  
  const rows = [header.join(",")];

  transactions.forEach(trx => {
    const date = new Date(trx.created_at).toISOString().split('T')[0];
    const branchName = `"${trx.branch.name}"`;
    const invoice = `"${trx.invoice_number}"`;

    if (trx.items.length === 0) {
      // Empty transaction case
      rows.push([invoice, branchName, date, "", "", "", 0, 0, trx.total].join(","));
    }

    trx.items.forEach(item => {
      let type = "";
      let name = "";
      if (item.product) {
        type = "Barang";
        name = `"${item.product.name}"`;
      } else if (item.service_item) {
        type = "Jasa";
        name = `"${item.service_item.name}"`;
      }

      const mechanic = item.mechanic ? `"${item.mechanic.name}"` : '""';
      
      rows.push([
        invoice,
        branchName,
        date,
        type,
        name,
        mechanic,
        item.quantity,
        item.unit_price,
        item.subtotal
      ].join(","));
    });
  });

  const csv = rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="transaksi_export_${new Date().getTime()}.csv"`
    }
  });
}
