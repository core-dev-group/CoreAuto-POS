"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { productSchema, parseFormData } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";

export async function getProducts(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      include: {
        branchStocks: true,
      }
    }),
    prisma.product.count(),
  ]);

  const mappedData = data.map(item => ({
    ...item,
    totalStock: item.branchStocks.reduce((sum, s) => sum + s.quantity, 0)
  }));

  return {
    data: mappedData,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createProduct(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN_GUDANG_PUSAT")) {
    throw new Error("Unauthorized");
  }

  const data = parseFormData(productSchema, formData);

  const sku = data.sku.trim();
  const barcode = data.barcode ? data.barcode.trim() : null;

  const existingSku = await prisma.product.findUnique({ where: { sku } });
  if (existingSku) {
    throw new Error("SKU sudah terdaftar");
  }
  if (barcode) {
    const existingBarcode = await prisma.product.findUnique({ where: { barcode } });
    if (existingBarcode) {
      throw new Error(`Barcode ${barcode} sudah terdaftar pada barang lain`);
    }
  }

  const product = await prisma.product.create({
    data: {
      sku,
      barcode,
      name: data.name,
      category: data.category || null,
      purchase_price: data.purchase_price,
      sell_price: data.sell_price,
      min_stock_threshold_default: data.min_stock_threshold_default,
    },
  });

  await createAuditLog({
    action: "CREATE_PRODUCT",
    entity: "Product",
    entity_id: product.id,
    details: { name: product.name, sku: product.sku, barcode: product.barcode, sell_price: product.sell_price },
  });

  revalidatePath("/barang");
  revalidatePath("/pos");
  revalidatePath("/stok");
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN_GUDANG_PUSAT")) {
    throw new Error("Unauthorized");
  }

  const data = parseFormData(productSchema, formData);

  const sku = data.sku.trim();
  const barcode = data.barcode ? data.barcode.trim() : null;

  const existingSku = await prisma.product.findUnique({ where: { sku } });
  if (existingSku && existingSku.id !== id) {
    throw new Error("SKU sudah terdaftar untuk barang lain");
  }
  if (barcode) {
    const existingBarcode = await prisma.product.findUnique({ where: { barcode } });
    if (existingBarcode && existingBarcode.id !== id) {
      throw new Error(`Barcode ${barcode} sudah terdaftar pada barang lain`);
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      sku,
      barcode,
      name: data.name,
      category: data.category || null,
      purchase_price: data.purchase_price,
      sell_price: data.sell_price,
      min_stock_threshold_default: data.min_stock_threshold_default,
    },
  });

  await createAuditLog({
    action: "UPDATE_PRODUCT",
    entity: "Product",
    entity_id: product.id,
    details: { name: product.name, sku: product.sku, barcode: product.barcode, sell_price: product.sell_price },
  });

  revalidatePath("/barang");
  revalidatePath("/pos");
  revalidatePath("/stok");
}

export async function deleteProduct(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN_GUDANG_PUSAT")) {
    throw new Error("Unauthorized");
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new Error("Barang tidak ditemukan");
  }

  await prisma.product.delete({ where: { id } });

  await createAuditLog({
    action: "DELETE_PRODUCT",
    entity: "Product",
    entity_id: id,
    details: { name: product.name, sku: product.sku },
  });

  revalidatePath("/barang");
  revalidatePath("/pos");
  revalidatePath("/stok");
}
