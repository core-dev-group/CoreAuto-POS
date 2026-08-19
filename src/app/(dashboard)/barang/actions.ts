"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { productSchema, parseFormData } from "@/lib/validations";

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

  await prisma.product.create({
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

  revalidatePath("/barang");
  revalidatePath("/pos");
  revalidatePath("/stok");
}

export async function updateProduct(id: string, formData: FormData) {
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

  await prisma.product.update({
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

  revalidatePath("/barang");
  revalidatePath("/pos");
  revalidatePath("/stok");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/barang");
  revalidatePath("/pos");
  revalidatePath("/stok");
}
