"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { checkoutSchema } from "@/lib/validations";

export type CartItem = {
  id: string;
  type: "BARANG" | "JASA";
  item_id: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  mechanic_id?: string;
};

async function generateInvoiceNumber(tx: any) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `INV/${dateStr}/`;

  const lastTx = await tx.transaction.findFirst({
    where: { invoice_number: { startsWith: prefix } },
    orderBy: { invoice_number: "desc" },
  });

  if (!lastTx) return `${prefix}0001`;

  const lastNumber = parseInt(lastTx.invoice_number.slice(-4));
  const newNumber = (lastNumber + 1).toString().padStart(4, "0");
  return `${prefix}${newNumber}`;
}

export async function processCheckout(payload: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const result = checkoutSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
  }
  const data = result.data;

  const { branch_id, vehicle_plate, cart, discount, tax, payment_method } = data;
  const cashier_id = session.user.id;
  const role = (session.user as any).role;
  const sessionBranchId = (session.user as any).branchId;

  if (role !== "SUPER_ADMIN" && branch_id !== sessionBranchId) {
    throw new Error("Forbidden: Tidak dapat membuat transaksi untuk cabang lain.");
  }

  // Fetch real prices from database to prevent client manipulation
  const productIds = cart.filter(i => i.type === "BARANG").map(i => i.item_id);
  const serviceIds = cart.filter(i => i.type === "JASA").map(i => i.item_id);

  const [dbProducts, dbServices] = await Promise.all([
    prisma.product.findMany({ where: { id: { in: productIds } } }),
    prisma.serviceItem.findMany({ where: { id: { in: serviceIds } } })
  ]);

  const productPriceMap = new Map(dbProducts.map(p => [p.id, p.sell_price]));
  const servicePriceMap = new Map(dbServices.map(s => [s.id, s.default_price]));

  let subtotal = 0;
  for (const item of cart) {
    const realPrice = item.type === "BARANG"
      ? (productPriceMap.get(item.item_id) ?? 0)
      : (servicePriceMap.get(item.item_id) ?? 0);

    // Override client price with DB price
    item.price = realPrice;
    subtotal += realPrice * item.quantity;
  }

  if (discount > subtotal) {
    throw new Error("Diskon tidak boleh melebihi subtotal.");
  }

  const total = subtotal - discount + tax;

  return await prisma.$transaction(async (tx) => {
    let finalCustomerId: string | null = null;
    let finalVehiclePlate: string | null = vehicle_plate || null;

    if (vehicle_plate) {
      const normalizedPlate = vehicle_plate.toUpperCase().trim();
      finalVehiclePlate = normalizedPlate;

      const existingVehicle = await tx.vehicle.findUnique({
        where: { plate_number: normalizedPlate },
      });

      if (existingVehicle) {
        finalCustomerId = existingVehicle.customer_id;
      } else if (data.customer_name) {
        let customer = await tx.customer.findFirst({
          where: { name: data.customer_name },
        });

        if (!customer) {
          customer = await tx.customer.create({
            data: {
              name: data.customer_name,
              phone: data.customer_phone || null,
            },
          });
        }

        finalCustomerId = customer.id;

        await tx.vehicle.create({
          data: {
            plate_number: normalizedPlate,
            customer_id: finalCustomerId,
            model: data.vehicle_model || null,
          },
        });
      }
    }

    let transaction;
    const finalStatus = data.is_draft ? "PROSES" : "SELESAI";
    const finalPaymentMethod = data.is_draft ? "BELUM_BAYAR" : payment_method;

    const openShift = await tx.cashierShift.findFirst({
      where: {
        user_id: cashier_id,
        branch_id,
        status: "OPEN"
      }
    });

    if (data.transaction_id) {
      const existingTx = await tx.transaction.findUnique({
        where: { id: data.transaction_id },
        include: { items: true },
      });

      if (!existingTx || existingTx.status === "SELESAI") {
        throw new Error("Transaksi tidak valid atau sudah selesai.");
      }

      if (role !== "SUPER_ADMIN" && existingTx.branch_id !== sessionBranchId) {
        throw new Error("Forbidden: Transaksi bukan milik cabang ini.");
      }

      for (const item of existingTx.items) {
        if (item.product_id) {
          await tx.branchStock.update({
            where: { product_id_branch_id: { product_id: item.product_id, branch_id } },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }

      await tx.transactionItem.deleteMany({
        where: { transaction_id: existingTx.id },
      });

      transaction = await tx.transaction.update({
        where: { id: existingTx.id },
        data: {
          customer_id: finalCustomerId,
          vehicle_plate: finalVehiclePlate,
          subtotal,
          total,
          payment_method: finalPaymentMethod,
          status: finalStatus,
          shift_id: openShift?.id,
        },
      });
    } else {
      const invoice_number = await generateInvoiceNumber(tx);
      transaction = await tx.transaction.create({
        data: {
          invoice_number,
          branch_id,
          cashier_id,
          customer_id: finalCustomerId,
          vehicle_plate: finalVehiclePlate,
          subtotal,
          total,
          payment_method: finalPaymentMethod,
          status: finalStatus,
          shift_id: openShift?.id,
        },
      });
    }

    for (const item of cart) {
      const itemSubtotal = item.price * item.quantity;

      if (item.type === "BARANG") {
        const stock = await tx.branchStock.findUnique({
          where: { product_id_branch_id: { product_id: item.item_id, branch_id } },
        });

        if (!stock || stock.quantity < item.quantity) {
          throw new Error(`Stok tidak cukup untuk barang: ${item.name}. Tersisa: ${stock?.quantity || 0}`);
        }

        await tx.branchStock.update({
          where: { id: stock.id },
          data: { quantity: stock.quantity - item.quantity },
        });

        await tx.transactionItem.create({
          data: {
            transaction_id: transaction.id,
            product_id: item.item_id,
            quantity: item.quantity,
            unit_price: item.price,
            subtotal: itemSubtotal,
          },
        });
      } else if (item.type === "JASA") {
        await tx.transactionItem.create({
          data: {
            transaction_id: transaction.id,
            service_item_id: item.item_id,
            mechanic_id: item.mechanic_id,
            quantity: item.quantity,
            unit_price: item.price,
            subtotal: itemSubtotal,
          },
        });
      }
    }

    const auditAction = data.transaction_id ? "UPDATE_TRANSACTION" : "CREATE_TRANSACTION";
    await tx.auditLog.create({
      data: {
        user_id: session.user.id,
        branch_id: transaction.branch_id,
        action: auditAction,
        entity: "Transaction",
        entity_id: transaction.id,
        details: JSON.stringify({ invoice_number: transaction.invoice_number, total: transaction.total, status: transaction.status }),
      }
    });

    return transaction.id;
  });
}

export async function searchVehicles(query: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  if (!query || query.length < 2) return [];

  return await prisma.vehicle.findMany({
    where: { plate_number: { contains: query.toUpperCase() } },
    include: { customer: true },
    take: 5,
  });
}

export async function getActiveTransactions(branch_id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  return await prisma.transaction.findMany({
    where: { branch_id, status: "PROSES" },
    include: { customer: true, items: true },
    orderBy: { created_at: "desc" },
  });
}

export async function getTransactionById(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  return await prisma.transaction.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: { product: true, service_item: true, mechanic: true },
      },
    },
  });
}

export async function deleteTransaction(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  return await prisma.$transaction(async (tx) => {
    const existingTx = await tx.transaction.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingTx || existingTx.status === "SELESAI") {
      throw new Error("Transaksi tidak valid atau sudah selesai.");
    }

    if ((session.user as any).role !== "SUPER_ADMIN" && existingTx.branch_id !== (session.user as any).branchId) {
      throw new Error("Forbidden: Transaksi bukan milik cabang ini.");
    }

    // Restore stock
    for (const item of existingTx.items) {
      if (item.product_id) {
        await tx.branchStock.update({
          where: { product_id_branch_id: { product_id: item.product_id, branch_id: existingTx.branch_id } },
          data: { quantity: { increment: item.quantity } },
        });
      }
    }

    // Update status to DIBATALKAN instead of physical delete
    await tx.transaction.update({
      where: { id },
      data: { status: "DIBATALKAN" }
    });

    await tx.auditLog.create({
      data: {
        user_id: session.user.id,
        branch_id: existingTx.branch_id,
        action: "VOID_TRANSACTION",
        entity: "Transaction",
        entity_id: existingTx.id,
        details: JSON.stringify({ invoice_number: existingTx.invoice_number, total: existingTx.total }),
      }
    });

    return true;
  });
}
