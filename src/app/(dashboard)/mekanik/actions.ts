"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { mechanicSchema, parseFormData } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";

export async function getMechanics(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.mechanic.findMany({
      include: { branch: true },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.mechanic.count(),
  ]);
  
  return { data, totalPages: Math.ceil(total / limit) };
}

export async function createMechanic(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KEPALA_CABANG")) {
    throw new Error("Unauthorized");
  }

  const data = parseFormData(mechanicSchema, formData);

  const mechanic = await prisma.mechanic.create({
    data: {
      name: data.name,
      branch_id: data.branch_id,
      phone: data.phone || null,
      commission_rate: data.commission_rate,
      active: data.active,
    },
  });

  await createAuditLog({
    action: "CREATE_MECHANIC",
    entity: "Mechanic",
    entity_id: mechanic.id,
    details: { name: mechanic.name, branch_id: mechanic.branch_id, commission_rate: mechanic.commission_rate },
  });

  revalidatePath("/mekanik");
}

export async function updateMechanic(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KEPALA_CABANG")) {
    throw new Error("Unauthorized");
  }

  const data = parseFormData(mechanicSchema, formData);

  const mechanic = await prisma.mechanic.update({
    where: { id },
    data: {
      name: data.name,
      branch_id: data.branch_id,
      phone: data.phone || null,
      commission_rate: data.commission_rate,
      active: data.active,
    },
  });

  await createAuditLog({
    action: "UPDATE_MECHANIC",
    entity: "Mechanic",
    entity_id: mechanic.id,
    details: { name: mechanic.name, branch_id: mechanic.branch_id, commission_rate: mechanic.commission_rate },
  });

  revalidatePath("/mekanik");
}

export async function deleteMechanic(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KEPALA_CABANG")) {
    throw new Error("Unauthorized");
  }

  const mechanic = await prisma.mechanic.findUnique({ where: { id } });
  if (!mechanic) throw new Error("Mekanik tidak ditemukan.");

  await prisma.mechanic.delete({ where: { id } });

  await createAuditLog({
    action: "DELETE_MECHANIC",
    entity: "Mechanic",
    entity_id: id,
    details: { name: mechanic.name, branch_id: mechanic.branch_id },
  });

  revalidatePath("/mekanik");
}
