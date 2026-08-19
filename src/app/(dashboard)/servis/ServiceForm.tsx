"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createService, updateService } from "./actions";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/components/ConfirmModalProvider";

interface ServiceFormProps {
  initialData?: {
    id: string;
    name: string;
    default_price: number;
    commission_rate_override: number | null;
  };
}

export default function ServiceForm({ initialData }: ServiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { confirm } = useConfirm();

  const isEdit = !!initialData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataEntries = Array.from(new FormData(e.currentTarget).entries());

    confirm({
      title: isEdit ? "Simpan Perubahan Jasa Servis" : "Tambah Jasa Servis Baru",
      message: isEdit 
        ? "Apakah Anda yakin ingin menyimpan perubahan pada data jasa servis ini?"
        : "Apakah Anda yakin ingin menambahkan jasa servis ini ke dalam sistem?",
      confirmText: "Simpan",
      onConfirm: async () => {
        const formData = new FormData();
        formDataEntries.forEach(([key, value]) => formData.append(key, value));
        
        setLoading(true);
        setError("");
        
        try {
          if (isEdit) {
            await updateService(initialData.id, formData);
            toast.success("Jasa servis berhasil diperbarui");
          } else {
            await createService(formData);
            toast.success("Jasa servis baru berhasil ditambahkan");
          }
          router.push("/servis");
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
    <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-gray-100 flex items-center gap-3 md:gap-4">
        <Link 
          href="/servis"
          className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors -ml-1.5 md:ml-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          {isEdit ? "Edit Jasa Servis" : "Tambah Jasa Servis Baru"}
        </h2>
      </div>

      <div className="p-4 md:p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Jasa Servis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={initialData?.name}
              required
              placeholder="e.g. Servis Ringan / Ganti Oli"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="default_price" className="block text-sm font-medium text-gray-700 mb-1">
              Harga Jasa (Default) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
              <input
                type="number"
                id="default_price"
                name="default_price"
                defaultValue={initialData?.default_price}
                required
                min="0"
                className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="commission_rate_override" className="block text-sm font-medium text-gray-700 mb-1">
              Persentase Komisi Khusus (%) (Opsional)
            </label>
            <input
              type="number"
              id="commission_rate_override"
              name="commission_rate_override"
              defaultValue={initialData?.commission_rate_override || ""}
              min="0"
              max="100"
              step="0.01"
              placeholder="e.g. 15 (Kosongkan jika mengikuti komisi default mekanik)"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">Jika diisi, nilai ini akan menimpa komisi default mekanik saat menangani jasa ini.</p>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <Link
              href="/servis"
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
              {loading ? "Menyimpan..." : "Simpan Jasa Servis"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
