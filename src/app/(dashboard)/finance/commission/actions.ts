"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { commissionPayoutSchema, parseFormData } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";

export async function createCommissionPayout(formData: FormData) {
  const data = parseFormData(commissionPayoutSchema, formData);

  const period_end = new Date(data.end_date);
  period_end.setHours(23, 59, 59, 999);

  await prisma.$transaction(async (tx) => {
    const payout = await tx.commissionPayout.create({
      data: {
        mechanic_id: data.mechanic_id,
        period_start: data.start_date,
        period_end,
        total_amount: data.total_amount,
        paid: true,
        paid_at: new Date(),
      },
    });

    await tx.transactionItem.updateMany({
      where: {
        mechanic_id: data.mechanic_id,
        is_commission_paid: false,
        transaction: {
          status: "SELESAI",
          created_at: {
            gte: data.start_date,
            lte: period_end,
          },
        },
      },
      data: {
        is_commission_paid: true,
      },
    });

    return payout;
  });

  await createAuditLog({
    action: "PAY_COMMISSION",
    entity: "CommissionPayout",
    details: { mechanic_id: data.mechanic_id, amount: data.total_amount, start: data.start_date, end: data.end_date }
  });

  revalidatePath("/finance/commission");
  revalidatePath(`/finance/commission/${data.mechanic_id}`);
}
