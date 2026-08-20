"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { serviceSchema, parseFormData } from "@/lib/validations";

export async function getServices(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.serviceItem.findMany({
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.serviceItem.count(),
  ]);

  return {
    data,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createService(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  const data = parseFormData(serviceSchema, formData);

  await prisma.serviceItem.create({
    data: {
      name: data.name,
      default_price: data.default_price,
      commission_rate_override: data.commission_rate_override,
    },
  });

  revalidatePath("/servis");
}

export async function updateService(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  const data = parseFormData(serviceSchema, formData);

  await prisma.serviceItem.update({
    where: { id },
    data: {
      name: data.name,
      default_price: data.default_price,
      commission_rate_override: data.commission_rate_override,
    },
  });

  revalidatePath("/servis");
}

export async function deleteService(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  await prisma.serviceItem.delete({ where: { id } });
  revalidatePath("/servis");
}
