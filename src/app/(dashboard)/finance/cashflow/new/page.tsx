import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createCashflow } from "../actions";
import { redirect } from "next/navigation";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { CustomSelect } from "@/components/ui/CustomSelect";

export const metadata = {
  title: "Catat Arus Kas | CoreAuto POS",
};

export default async function NewCashflowPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string }>;
}) {
  const { branch } = await searchParams;
  const branches = await prisma.branch.findMany({ orderBy: { name: "asc" } });

  async function action(formData: FormData) {
    "use server";
    await createCashflow(formData);
    redirect("/finance/cashflow");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/finance/cashflow"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Catat Transaksi Kas</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Input data pemasukan atau pengeluaran bengkel.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form action={action} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Cabang Bengkel</label>
            <CustomSelect
              name="branch_id"
              options={branches.map(b => ({ value: b.id, label: b.name }))}
              defaultValue={branch || (branches.length > 0 ? branches[0].id : "")}
              placeholder="Pilih Cabang"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Tipe Transaksi</label>
              <CustomSelect
                name="type"
                options={[
                  { value: "MASUK", label: "Pemasukan (Uang Masuk)" },
                  { value: "KELUAR", label: "Pengeluaran (Uang Keluar)" }
                ]}
                defaultValue="MASUK"
                placeholder="Pilih Tipe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Nominal (Rp)</label>
              <input
                type="number"
                name="amount"
                min="0"
                required
                placeholder="0"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Kategori</label>
            <input
              type="text"
              name="category"
              required
              placeholder="Cth: Gaji Karyawan, Listrik, Modal Awal"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Keterangan / Deskripsi</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Penjelasan opsional mengenai transaksi ini..."
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Link
              href="/finance/cashflow"
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </Link>
            <ConfirmSubmitButton
              confirmTitle="Simpan Transaksi Kas"
              confirmMessage="Apakah Anda yakin ingin menyimpan transaksi arus kas ini?"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              Simpan Transaksi
            </ConfirmSubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
