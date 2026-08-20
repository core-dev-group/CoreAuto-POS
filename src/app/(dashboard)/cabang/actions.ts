"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { branchSchema, parseFormData } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";

export async function getBranches(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.branch.findMany({
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.branch.count(),
  ]);

  return {
    data,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createBranch(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  const data = parseFormData(branchSchema, formData);

  if (data.is_central) {
    await prisma.branch.updateMany({
      where: { is_central: true },
      data: { is_central: false }
    });
  }

  const branch = await prisma.branch.create({ data });
  
  await createAuditLog({
    action: "CREATE_BRANCH",
    entity: "Branch",
    entity_id: branch.id,
    details: { name: branch.name, address: branch.address, is_central: branch.is_central },
  });
  
  revalidatePath("/cabang");
}

export async function updateBranch(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  const data = parseFormData(branchSchema, formData);

  if (data.is_central) {
    await prisma.branch.updateMany({
      where: { id: { not: id }, is_central: true },
      data: { is_central: false }
    });
  }

  const branch = await prisma.branch.update({ where: { id }, data });
  
  await createAuditLog({
    action: "UPDATE_BRANCH",
    entity: "Branch",
    entity_id: branch.id,
    details: { name: branch.name, address: branch.address, is_central: branch.is_central },
  });
  
  revalidatePath("/cabang");
}

export async function deleteBranch(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  const branch = await prisma.branch.findUnique({ where: { id } });
  if (!branch) throw new Error("Cabang tidak ditemukan.");

  await prisma.branch.delete({ where: { id } });
  
  await createAuditLog({
    action: "DELETE_BRANCH",
    entity: "Branch",
    entity_id: id,
    details: { name: branch.name },
  });
  
  revalidatePath("/cabang");
}
