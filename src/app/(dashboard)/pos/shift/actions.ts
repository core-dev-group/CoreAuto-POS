"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function openShift(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.branchId) throw new Error("Unauthorized");

  const startingCash = parseFloat(formData.get("starting_cash") as string) || 0;

  // Check if there is already an open shift
  const existingShift = await prisma.cashierShift.findFirst({
    where: {
      user_id: session.user.id,
      branch_id: session.user.branchId,
      status: "OPEN"
    }
  });

  if (existingShift) throw new Error("A shift is already open");

  const shift = await prisma.cashierShift.create({
    data: {
      user_id: session.user.id,
      branch_id: session.user.branchId,
      starting_cash: startingCash,
      status: "OPEN"
    }
  });

  await createAuditLog({
    action: "OPEN_SHIFT",
    entity: "CashierShift",
    entity_id: shift.id,
    details: { starting_cash: startingCash }
  });

  revalidatePath("/pos");
  revalidatePath("/pos/shift");
  redirect("/pos");
}

export async function closeShift(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.branchId) throw new Error("Unauthorized");

  const actualEndingCash = parseFloat(formData.get("actual_ending_cash") as string) || 0;
  const notes = formData.get("notes") as string;

  const shift = await prisma.cashierShift.findFirst({
    where: {
      user_id: session.user.id,
      branch_id: session.user.branchId,
      status: "OPEN"
    },
    include: {
      transactions: true
    }
  });

  if (!shift) throw new Error("No open shift found");

  // Calculate expected cash
  const cashSales = shift.transactions
    .filter(t => t.payment_method === "CASH" && t.status === "SELESAI")
    .reduce((sum, t) => sum + t.total, 0);
  
  const expectedEndingCash = shift.starting_cash + cashSales;
  const difference = actualEndingCash - expectedEndingCash;

  await prisma.cashierShift.update({
    where: { id: shift.id },
    data: {
      status: "CLOSED",
      end_time: new Date(),
      actual_ending_cash: actualEndingCash,
      expected_ending_cash: expectedEndingCash,
      difference,
      notes
    }
  });

  await createAuditLog({
    action: "CLOSE_SHIFT",
    entity: "CashierShift",
    entity_id: shift.id,
    details: { 
      expected: expectedEndingCash,
      actual: actualEndingCash,
      difference 
    }
  });

  revalidatePath("/pos");
  revalidatePath("/pos/shift");
  return { success: true };
}
