import { prisma } from "./prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

type AuditAction = 
  | "CREATE_TRANSACTION"
  | "VOID_TRANSACTION"
  | "STOCK_MUTATION"
  | "OPEN_SHIFT"
  | "CLOSE_SHIFT"
  | "PAY_COMMISSION";

export async function createAuditLog({
  action,
  entity,
  entity_id,
  details,
}: {
  action: AuditAction;
  entity: String;
  entity_id?: string;
  details?: Record<string, any>;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    console.warn("Attempted to create audit log without user session");
    return;
  }

  try {
    await prisma.auditLog.create({
      data: {
        user_id: session.user.id,
        branch_id: session.user.branchId || null,
        action,
        entity: String(entity),
        entity_id,
        details: details ? JSON.stringify(details) : null,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
