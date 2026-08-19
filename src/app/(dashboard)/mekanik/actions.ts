"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { mechanicSchema, parseFormData } from "@/lib/validations";

export async function getMechanics() {
  return await prisma.mechanic.findMany({
    include: { branch: true },
    orderBy: { created_at: "desc" },
  });
}

export async function createMechanic(formData: FormData) {
  const data = parseFormData(mechanicSchema, formData);

  await prisma.mechanic.create({
    data: {
      name: data.name,
      branch_id: data.branch_id,
      phone: data.phone || null,
      commission_rate: data.commission_rate,
      active: data.active,
    },
  });

  revalidatePath("/mekanik");
}

export async function updateMechanic(id: string, formData: FormData) {
  const data = parseFormData(mechanicSchema, formData);

  await prisma.mechanic.update({
    where: { id },
    data: {
      name: data.name,
      branch_id: data.branch_id,
      phone: data.phone || null,
      commission_rate: data.commission_rate,
      active: data.active,
    },
  });

  revalidatePath("/mekanik");
}

export async function deleteMechanic(id: string) {
  await prisma.mechanic.delete({ where: { id } });
  revalidatePath("/mekanik");
}
