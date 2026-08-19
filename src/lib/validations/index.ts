import { z } from "zod";

const requiredStr = (label: string) => z.string().min(1, `${label} harus diisi`);
const positiveNumber = (label: string) => z.coerce.number().positive(`${label} harus lebih dari 0`);
const nonNegativeNumber = (label: string) => z.coerce.number().min(0, `${label} tidak boleh negatif`);

export const productSchema = z.object({
  sku: requiredStr("SKU"),
  barcode: z.string().optional().default(""),
  name: requiredStr("Nama"),
  category: z.string().optional().default(""),
  purchase_price: positiveNumber("Harga Beli"),
  sell_price: positiveNumber("Harga Jual"),
  min_stock_threshold_default: z.coerce.number().int().min(0).default(5),
});

export const branchSchema = z.object({
  name: requiredStr("Nama Cabang"),
  address: requiredStr("Alamat"),
  phone: requiredStr("Telepon"),
  is_central: z.enum(["true", "false"]).transform((v) => v === "true").catch(false),
});

export const mechanicSchema = z.object({
  name: requiredStr("Nama"),
  branch_id: requiredStr("Cabang"),
  phone: z.string().optional().default(""),
  commission_rate: nonNegativeNumber("Komisi"),
  active: z.enum(["true", "false"]).transform((v) => v === "true").catch(true),
});

export const serviceSchema = z.object({
  name: requiredStr("Nama Jasa"),
  default_price: positiveNumber("Harga Default"),
  commission_rate_override: z.union([
    z.literal("").transform(() => null),
    z.coerce.number().min(0),
  ]).optional().catch(null),
});

export const mutationSchema = z.object({
  branch_id: requiredStr("Cabang"),
  product_id: requiredStr("Produk"),
  type: z.enum(["MASUK", "KELUAR", "RUSAK", "RETUR"], { message: "Tipe mutasi tidak valid" }),
  quantity: z.coerce.number().int().positive("Jumlah harus lebih dari 0"),
  note: z.string().optional().default(""),
});

export const userSchema = z.object({
  name: requiredStr("Nama"),
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["SUPER_ADMIN", "ADMIN_GUDANG_PUSAT", "KEPALA_CABANG", "ADMIN_GUDANG", "KASIR"], { message: "Role tidak valid" }),
  branch_id: z.string().optional().default(""),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const cashflowSchema = z.object({
  type: z.enum(["MASUK", "KELUAR"], { message: "Tipe cashflow tidak valid" }),
  category: requiredStr("Kategori"),
  amount: positiveNumber("Jumlah"),
  description: z.string().optional().default(""),
  branch_id: requiredStr("Cabang"),
});

export const commissionPayoutSchema = z.object({
  mechanic_id: requiredStr("Mekanik"),
  start_date: z.coerce.date({ message: "Tanggal mulai tidak valid" }),
  end_date: z.coerce.date({ message: "Tanggal akhir tidak valid" }),
  total_amount: positiveNumber("Total"),
});

const cartItemSchema = z.object({
  id: z.string(),
  type: z.enum(["BARANG", "JASA"]),
  item_id: z.string().min(1),
  name: z.string().min(1),
  sku: z.string().optional(),
  price: nonNegativeNumber("Harga"),
  quantity: z.coerce.number().int().positive("Qty harus > 0"),
  mechanic_id: z.string().optional(),
});

export const checkoutSchema = z.object({
  transaction_id: z.string().optional(),
  is_draft: z.boolean().optional().default(false),
  branch_id: requiredStr("Cabang"),
  customer_name: z.string().optional(),
  customer_phone: z.string().optional(),
  vehicle_plate: z.string().optional(),
  vehicle_model: z.string().optional(),
  cart: z.array(cartItemSchema).min(1, "Keranjang tidak boleh kosong"),
  discount: nonNegativeNumber("Diskon"),
  tax: nonNegativeNumber("Pajak"),
  payment_method: requiredStr("Metode Pembayaran"),
});

export function parseFormData<T extends z.ZodType>(schema: T, formData: FormData): z.infer<T> {
  const raw = Object.fromEntries(formData.entries());
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(result.error.issues.map((e: z.ZodIssue) => e.message).join(", "));
  }
  return result.data;
}
