"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cashflowSchema, parseFormData } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";

export async function createCashflow(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const data = parseFormData(cashflowSchema, formData);
  const created_by = session.user.name || "admin";

  const cashflow = await prisma.cashflowEntry.create({
    data: {
      type: data.type,
      category: data.category,
      amount: data.amount,
      description: data.description,
      branch_id: data.branch_id,
      created_by,
    },
  });

  await createAuditLog({
    action: "CREATE_CASHFLOW",
    entity: "Cashflow",
    entity_id: cashflow.id,
    details: { type: data.type, amount: data.amount, description: data.description },
  });

  revalidatePath("/finance/cashflow");
}

export async function deleteCashflow(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  if (session.user.role !== "OWNER" && session.user.role !== "SUPER_ADMIN") {
    throw new Error("Hanya OWNER yang dapat menghapus data arus kas");
  }

  const cashflow = await prisma.cashflowEntry.findUnique({ where: { id } });
  if (!cashflow) throw new Error("Data tidak ditemukan");

  await prisma.cashflowEntry.delete({
    where: { id },
  });

  await createAuditLog({
    action: "DELETE_CASHFLOW",
    entity: "Cashflow",
    entity_id: id,
    details: { type: cashflow.type, amount: cashflow.amount, description: cashflow.description },
  });

  revalidatePath("/finance/cashflow");
}
