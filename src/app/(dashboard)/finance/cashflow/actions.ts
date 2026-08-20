"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cashflowSchema, parseFormData } from "@/lib/validations";

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

  await prisma.auditLog.create({
    data: {
      user_id: session.user.id,
      branch_id: data.branch_id,
      action: "CREATE",
      entity: "Cashflow",
      entity_id: cashflow.id,
      details: `Membuat pencatatan arus kas ${data.type} sebesar Rp${data.amount}`,
    },
  });

  revalidatePath("/finance/cashflow");
}

export async function deleteCashflow(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  if (session.user.role !== "OWNER" && session.user.role !== "SUPERADMIN") {
    throw new Error("Hanya OWNER yang dapat menghapus data arus kas");
  }

  const cashflow = await prisma.cashflowEntry.findUnique({ where: { id } });
  if (!cashflow) throw new Error("Data tidak ditemukan");

  await prisma.cashflowEntry.delete({
    where: { id },
  });

  await prisma.auditLog.create({
    data: {
      user_id: session.user.id,
      branch_id: cashflow.branch_id,
      action: "DELETE",
      entity: "Cashflow",
      entity_id: id,
      details: `Menghapus pencatatan arus kas ${cashflow.type} sebesar Rp${cashflow.amount}`,
    },
  });

  revalidatePath("/finance/cashflow");
}
