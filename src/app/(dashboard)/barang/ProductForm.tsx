"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "./actions";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/components/ConfirmModalProvider";

interface ProductFormProps {
  initialData?: {
    id: string;
    sku: string;
    barcode: string | null;
    name: string;
    category: string | null;
    purchase_price: number;
    sell_price: number;
    min_stock_threshold_default: number;
  };
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { confirm } = useConfirm();

  const isEdit = !!initialData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataEntries = Array.from(new FormData(e.currentTarget).entries());
    
    confirm({
      title: isEdit ? "Simpan Perubahan Barang" : "Tambah Barang Baru",
      message: isEdit 
        ? "Apakah Anda yakin ingin menyimpan perubahan pada data barang ini?"
        : "Apakah Anda yakin ingin menambahkan barang ini ke dalam sistem?",
      confirmText: "Simpan",
      onConfirm: async () => {
        const formData = new FormData();
        formDataEntries.forEach(([key, value]) => formData.append(key, value));
        
        setLoading(true);
        setError("");
        
        try {
          if (isEdit) {
            await updateProduct(initialData.id, formData);
            toast.success("Data barang berhasil diperbarui");
          } else {
            await createProduct(formData);
            toast.success("Barang baru berhasil ditambahkan");
          }
          router.push("/barang");
          router.refresh();
        } catch (err: any) {
          const errorMessage = err.message || "Terjadi kesalahan saat menyimpan data";
          setError(errorMessage);
          toast.error(errorMessage);
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="max-w-3xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-gray-100 flex items-center gap-3 md:gap-4">
        <Link 
          href="/barang"
          className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors -ml-1.5 md:ml-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          {isEdit ? "Edit Barang" : "Tambah Barang Baru"}
        </h2>
      </div>

      <div className="p-4 md:p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                defaultValue={initialData?.sku}
                required
                placeholder="e.g. OLI-MTX-01"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            
            <div>
              <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
                Barcode (Opsional)
              </label>
              <input
                type="text"
                id="barcode"
                name="barcode"
                defaultValue={initialData?.barcode || ""}
                placeholder="Scan barcode disini"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Barang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={initialData?.name}
                required
                placeholder="e.g. Oli Mesin Yamalube 800ml"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <input
                type="text"
                id="category"
                name="category"
                defaultValue={initialData?.category || ""}
                placeholder="e.g. Pelumas"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700 mb-1">
                Harga Beli <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="number"
                  id="purchase_price"
                  name="purchase_price"
                  defaultValue={initialData?.purchase_price}
                  required
                  min="0"
                  className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sell_price" className="block text-sm font-medium text-gray-700 mb-1">
                Harga Jual <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="number"
                  id="sell_price"
                  name="sell_price"
                  defaultValue={initialData?.sell_price}
                  required
                  min="0"
                  className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="min_stock_threshold_default" className="block text-sm font-medium text-gray-700 mb-1">
                Batas Minimum Stok (Default) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="min_stock_threshold_default"
                name="min_stock_threshold_default"
                defaultValue={initialData?.min_stock_threshold_default || 5}
                required
                min="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Peringatan akan muncul jika stok di bawah batas ini.</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <Link
              href="/barang"
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
              {loading ? "Menyimpan..." : "Simpan Barang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
