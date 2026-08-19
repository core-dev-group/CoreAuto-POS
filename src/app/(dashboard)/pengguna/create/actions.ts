"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { userSchema, parseFormData } from "@/lib/validations";

export async function createUser(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const data = parseFormData(userSchema, formData);
  const branch_id = data.branch_id === "" ? null : data.branch_id;

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email sudah terdaftar. Gunakan email lain.");
  }

  const password_hash = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      branch_id,
      password_hash,
    },
  });

  revalidatePath("/pengguna");
  redirect("/pengguna");
}
