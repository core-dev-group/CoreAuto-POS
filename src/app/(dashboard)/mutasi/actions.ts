"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mutationSchema, parseFormData } from "@/lib/validations";

export async function createMutation(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  // Kasir cannot create mutations
  const role = (session.user as any).role;
  if (role === "KASIR") throw new Error("Unauthorized");

  const data = parseFormData(mutationSchema, formData);
  const created_by = session.user.name || "Sistem Admin";

  let multiplier = 1;
  if (data.type === "KELUAR" || data.type === "RUSAK") {
    multiplier = -1;
  }

  const quantityChange = data.quantity * multiplier;

  await prisma.$transaction(async (tx) => {
    await tx.stockMutation.create({
      data: {
        branch_id: data.branch_id,
        product_id: data.product_id,
        type: data.type,
        quantity: data.quantity,
        note: data.note,
        created_by,
      },
    });

    const existingStock = await tx.branchStock.findUnique({
      where: {
        product_id_branch_id: {
          product_id: data.product_id,
          branch_id: data.branch_id,
        },
      },
    });

    if (existingStock) {
      const newQuantity = existingStock.quantity + quantityChange;
      if (newQuantity < 0) {
        throw new Error("Stok tidak mencukupi untuk melakukan mutasi ini!");
      }
      await tx.branchStock.update({
        where: { id: existingStock.id },
        data: { quantity: newQuantity },
      });
    } else {
      if (quantityChange < 0) {
        throw new Error("Stok tidak mencukupi untuk melakukan mutasi ini (Stok kosong)!");
      }
      await tx.branchStock.create({
        data: {
          branch_id: data.branch_id,
          product_id: data.product_id,
          quantity: quantityChange,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        user_id: session.user.id,
        branch_id: data.branch_id,
        action: "STOCK_MUTATION",
        entity: "StockMutation",
        entity_id: data.product_id,
        details: JSON.stringify({ type: data.type, quantity: data.quantity, note: data.note }),
      }
    });
  });

  revalidatePath("/mutasi");
  revalidatePath("/stok");
  revalidatePath("/pos");
}
