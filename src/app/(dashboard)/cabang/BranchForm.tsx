"use client";

import { useState } from "react";
import { useRouter } from "next-nprogress-bar";
import { createBranch, updateBranch } from "./actions";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/components/ConfirmModalProvider";

interface BranchFormProps {
  initialData?: {
    id: string;
    name: string;
    address: string;
    phone: string;
    is_central: boolean;
  };
}

export default function BranchForm({ initialData }: BranchFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { confirm } = useConfirm();

  const isEdit = !!initialData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataEntries = Array.from(new FormData(e.currentTarget).entries());

    confirm({
      title: isEdit ? "Simpan Perubahan Cabang" : "Tambah Cabang Baru",
      message: isEdit 
        ? "Apakah Anda yakin ingin menyimpan perubahan pada data cabang ini?"
        : "Apakah Anda yakin ingin menambahkan cabang ini ke dalam sistem?",
      confirmText: "Simpan",
      onConfirm: async () => {
        const formData = new FormData();
        formDataEntries.forEach(([key, value]) => formData.append(key, value));
        
        setLoading(true);
        setError("");
        
        try {
          if (isEdit) {
            await updateBranch(initialData.id, formData);
            toast.success("Data cabang berhasil diperbarui");
          } else {
            await createBranch(formData);
            toast.success("Cabang baru berhasil ditambahkan");
          }
          router.push("/cabang");
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
          href="/cabang"
          className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors -ml-1.5 md:ml-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          {isEdit ? "Edit Cabang" : "Tambah Cabang Baru"}
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
              Nama Cabang <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={initialData?.name}
              required
              placeholder="e.g. Cabang Sudirman"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Telepon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              defaultValue={initialData?.phone}
              required
              placeholder="e.g. 08123456789"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Lengkap <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              defaultValue={initialData?.address}
              required
              rows={3}
              placeholder="Masukkan alamat lengkap cabang"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_central"
              name="is_central"
              value="true"
              defaultChecked={initialData?.is_central}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_central" className="text-sm font-medium text-gray-700">
              Jadikan sebagai Gudang Pusat
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link
              href="/cabang"
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
              {loading ? "Menyimpan..." : "Simpan Cabang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
