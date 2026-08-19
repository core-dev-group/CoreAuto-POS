"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function voidTransaction(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KEPALA_CABANG")) {
    return { error: "Unauthorized to void transaction" };
  }

  const id = formData.get("id") as string;
  const reason = formData.get("reason") as string;

  if (!id || !reason) {
    return { error: "Invalid input" };
  }

  await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!transaction || transaction.status === "DIBATALKAN") {
      throw new Error("Transaction not found or already cancelled");
    }

    // Return stock for any products
    for (const item of transaction.items) {
      if (item.product_id) {
        // Find branch stock
        const branchStock = await tx.branchStock.findUnique({
          where: {
            product_id_branch_id: {
              product_id: item.product_id,
              branch_id: transaction.branch_id,
            }
          }
        });

        if (branchStock) {
          await tx.branchStock.update({
            where: { id: branchStock.id },
            data: {
              quantity: {
                increment: item.quantity
              }
            }
          });
        }
      }
    }

    // Update transaction
    await tx.transaction.update({
      where: { id },
      data: {
        status: "DIBATALKAN",
        cancelled_by: session.user.name || session.user.id,
        cancellation_reason: reason,
        cancelled_at: new Date(),
      }
    });

    // Create Audit Log
    await createAuditLog({
      action: "VOID_TRANSACTION",
      entity: "Transaction",
      entity_id: id,
      details: {
        invoice_number: transaction.invoice_number,
        reason,
      }
    });
  });

  revalidatePath("/invoice");
  revalidatePath(`/invoice/${id}`);
  return { success: true };
}
