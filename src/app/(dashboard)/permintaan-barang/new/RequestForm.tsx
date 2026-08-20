"use client";

import { useState } from "react";
import { useRouter } from "next-nprogress-bar";
import { createRequest } from "../actions";
import { Save } from "lucide-react";
import { LinkWithLoading as Link } from "@/components/LinkWithLoading";
import { toast } from "react-hot-toast";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useConfirm } from "@/components/ConfirmModalProvider";

export default function RequestForm({ products }: { products: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { confirm } = useConfirm();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataEntries = Array.from(new FormData(e.currentTarget).entries());

    confirm({
      title: "Ajukan Permintaan Barang",
      message: "Apakah Anda yakin ingin mengajukan permintaan barang ini ke Pusat?",
      confirmText: "Ajukan Permintaan",
      onConfirm: async () => {
        const formData = new FormData();
        formDataEntries.forEach(([key, value]) => formData.append(key, value));
        
        setLoading(true);
        setError("");
        
        try {
          await createRequest(formData);
          toast.success("Permintaan barang berhasil diajukan");
          // Action already redirects, but if it throws we catch it
        } catch (err: any) {
          const errorMessage = err.message || "Terjadi kesalahan";
          setError(errorMessage);
          toast.error(errorMessage);
          setLoading(false);
        }
      }
    });
  };

  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.sku})`
  }));

  return (
    <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Produk <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            name="product_id"
            options={productOptions}
            placeholder="Pilih produk..."
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Jumlah <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="0"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Link
            href="/permintaan-barang"
            className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow flex items-center gap-2 transition-all disabled:bg-blue-400 text-sm"
          >
            <Save size={16} />
            {loading ? "Memproses..." : "Ajukan Permintaan"}
          </button>
        </div>
      </form>
    </div>
  );
}
