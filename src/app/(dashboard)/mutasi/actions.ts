"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mutationSchema, parseFormData } from "@/lib/validations";

export async function createMutation(formData: FormData) {
  const data = parseFormData(mutationSchema, formData);
  const session = await getServerSession(authOptions);
  const created_by = session?.user?.name || "Sistem Admin";

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
  });

  revalidatePath("/mutasi");
  revalidatePath("/stok");
  revalidatePath("/pos");
}
