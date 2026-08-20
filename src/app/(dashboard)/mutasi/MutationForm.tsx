"use client";

import { useState } from "react";
import { useRouter } from "next-nprogress-bar";
import { createMutation } from "./actions";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/components/ConfirmModalProvider";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface MutationFormProps {
  branches: { id: string; name: string }[];
  products: { id: string; name: string; sku: string }[];
}

export default function MutationForm({ branches, products }: MutationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { confirm } = useConfirm();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get("type") as string;
    const qty = formData.get("quantity") as string;
    
    confirm({
      title: "Konfirmasi Mutasi",
      message: `Apakah Anda yakin ingin mencatat mutasi ${type} sebanyak ${qty} item?`,
      confirmText: "Ya, Simpan",
      onConfirm: async () => {
        setLoading(true);
        setError("");

        try {
          await createMutation(formData);
          toast.success("Mutasi stok berhasil dicatat");
          router.push("/mutasi");
        } catch (err: any) {
          const errorMessage = err.message || "Terjadi kesalahan saat menyimpan mutasi";
          setError(errorMessage);
          toast.error(errorMessage);
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-100 flex items-center gap-4">
        <Link 
          href="/mutasi"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-xl font-semibold text-gray-900">
          Catat Mutasi Stok Baru
        </h2>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="branch_id" className="block text-sm font-medium text-gray-700 mb-1">
              Cabang <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              name="branch_id"
              options={branches.map(b => ({ value: b.id, label: b.name }))}
              placeholder="Pilih Cabang..."
              defaultValue={branches.length > 0 ? branches[0].id : ""}
            />
          </div>

          <div>
            <label htmlFor="product_id" className="block text-sm font-medium text-gray-700 mb-1">
              Barang <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              name="product_id"
              options={products.map(p => ({ value: p.id, label: `[${p.sku}] ${p.name}` }))}
              placeholder="Pilih Barang..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Mutasi <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                name="type"
                options={[
                  { value: "MASUK", label: "MASUK (Penambahan Stok)" },
                  { value: "KELUAR", label: "KELUAR (Pengurangan Stok)" },
                  { value: "RETUR", label: "RETUR (Barang Kembali)" },
                  { value: "RUSAK", label: "RUSAK (Barang Afkir)" }
                ]}
                placeholder="Pilih Tipe Mutasi..."
                defaultValue="MASUK"
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Kuantitas <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                required
                min="1"
                placeholder="10"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Catatan Keterangan
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              placeholder="e.g. Pembelian dari supplier A"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <Link
              href="/mutasi"
              className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow flex items-center gap-2 transition-all disabled:bg-blue-400"
            >
              <Save size={18} />
              {loading ? "Menyimpan..." : "Simpan Mutasi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
