"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { branchSchema, parseFormData } from "@/lib/validations";

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
  const data = parseFormData(branchSchema, formData);

  if (data.is_central) {
    await prisma.branch.updateMany({
      where: { is_central: true },
      data: { is_central: false }
    });
  }

  await prisma.branch.create({ data });
  revalidatePath("/cabang");
}

export async function updateBranch(id: string, formData: FormData) {
  const data = parseFormData(branchSchema, formData);

  if (data.is_central) {
    await prisma.branch.updateMany({
      where: { id: { not: id }, is_central: true },
      data: { is_central: false }
    });
  }

  await prisma.branch.update({ where: { id }, data });
  revalidatePath("/cabang");
}

export async function deleteBranch(id: string) {
  await prisma.branch.delete({ where: { id } });
  revalidatePath("/cabang");
}
