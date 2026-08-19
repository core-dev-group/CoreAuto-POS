"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cashflowSchema, parseFormData } from "@/lib/validations";

export async function createCashflow(formData: FormData) {
  const data = parseFormData(cashflowSchema, formData);
  const session = await getServerSession(authOptions);
  const created_by = session?.user?.name || "admin";

  await prisma.cashflowEntry.create({
    data: {
      type: data.type,
      category: data.category,
      amount: data.amount,
      description: data.description,
      branch_id: data.branch_id,
      created_by,
    },
  });

  revalidatePath("/finance/cashflow");
}
