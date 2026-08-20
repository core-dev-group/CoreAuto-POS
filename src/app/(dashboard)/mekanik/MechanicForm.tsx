"use client";

import { useState } from "react";
import { useRouter } from "next-nprogress-bar";
import { createMechanic, updateMechanic } from "./actions";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/components/ConfirmModalProvider";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface MechanicFormProps {
  initialData?: {
    id: string;
    name: string;
    branch_id: string;
    phone: string | null;
    commission_rate: number;
    active: boolean;
  };
  branches: { id: string; name: string }[];
}

export default function MechanicForm({ initialData, branches }: MechanicFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { confirm } = useConfirm();

  const isEdit = !!initialData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataEntries = Array.from(new FormData(e.currentTarget).entries());

    confirm({
      title: isEdit ? "Simpan Perubahan Mekanik" : "Tambah Mekanik Baru",
      message: isEdit 
        ? "Apakah Anda yakin ingin menyimpan perubahan pada data mekanik ini?"
        : "Apakah Anda yakin ingin menambahkan mekanik ini ke dalam sistem?",
      confirmText: "Simpan",
      onConfirm: async () => {
        const formData = new FormData();
        formDataEntries.forEach(([key, value]) => formData.append(key, value));
        
        setLoading(true);
        setError("");
        
        try {
          if (isEdit) {
            await updateMechanic(initialData.id, formData);
            toast.success("Data mekanik berhasil diperbarui");
          } else {
            await createMechanic(formData);
            toast.success("Mekanik baru berhasil ditambahkan");
          }
          router.push("/mekanik");
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
          href="/mekanik"
          className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors -ml-1.5 md:ml-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          {isEdit ? "Edit Mekanik" : "Tambah Mekanik Baru"}
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
              Nama Mekanik <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={initialData?.name}
              required
              placeholder="e.g. Budi Santoso"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="branch_id" className="block text-sm font-medium text-gray-700 mb-1">
              Cabang Penempatan <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              name="branch_id"
              options={branches.map(b => ({ value: b.id, label: b.name }))}
              defaultValue={initialData?.branch_id || (branches.length > 0 ? branches[0].id : "")}
              placeholder="Pilih Cabang"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Telepon (Opsional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              defaultValue={initialData?.phone || ""}
              placeholder="e.g. 08123456789"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="commission_rate" className="block text-sm font-medium text-gray-700 mb-1">
              Persentase Komisi (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="commission_rate"
              name="commission_rate"
              defaultValue={initialData?.commission_rate || 0}
              required
              min="0"
              max="100"
              step="0.01"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="hidden"
              name="active"
              value={isEdit ? (initialData?.active ? "true" : "false") : "true"}
              id="active_hidden"
            />
            <input
              type="checkbox"
              id="active_checkbox"
              defaultChecked={isEdit ? initialData?.active : true}
              onChange={(e) => {
                const hiddenInput = document.getElementById("active_hidden") as HTMLInputElement;
                if (hiddenInput) {
                  hiddenInput.value = e.target.checked ? "true" : "false";
                }
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="active_checkbox" className="text-sm font-medium text-gray-700">
              Mekanik Aktif
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <Link
              href="/mekanik"
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
              {loading ? "Menyimpan..." : "Simpan Mekanik"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
