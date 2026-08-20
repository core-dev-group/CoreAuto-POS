"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit";

const updateUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["SUPER_ADMIN", "KEPALA_CABANG", "ADMIN_GUDANG", "ADMIN_GUDANG_PUSAT", "KASIR"]),
  branch_id: z.string().optional(),
  password: z.string().optional(),
});

export async function updateUser(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    role: formData.get("role") as string,
    branch_id: formData.get("branch_id") as string,
    password: formData.get("password") as string,
  };

  const data = updateUserSchema.parse(rawData);
  const branch_id = data.branch_id === "" ? null : data.branch_id;

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser && existingUser.id !== id) {
    throw new Error("Email sudah terdaftar untuk pengguna lain.");
  }

  const updateData: any = {
    name: data.name,
    email: data.email,
    role: data.role,
    branch_id,
  };

  if (data.password && data.password.trim() !== "") {
    if (data.password.length < 6) {
      throw new Error("Password minimal 6 karakter.");
    }
    updateData.password_hash = await bcrypt.hash(data.password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  await createAuditLog({
    action: "UPDATE_USER",
    entity: "User",
    entity_id: updatedUser.id,
    details: { name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, branch_id: updatedUser.branch_id },
  });

  revalidatePath("/pengguna");
  redirect("/pengguna");
}

export async function deleteUser(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  if (session.user.id === id) {
    throw new Error("Anda tidak dapat menghapus akun Anda sendiri.");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error("Pengguna tidak ditemukan.");
  }

  await prisma.user.delete({
    where: { id },
  });

  await createAuditLog({
    action: "DELETE_USER",
    entity: "User",
    entity_id: id,
    details: { name: user.name, email: user.email, role: user.role, branch_id: user.branch_id },
  });

  revalidatePath("/pengguna");
}
