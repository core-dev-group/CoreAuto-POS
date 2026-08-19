import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, History } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { createCommissionPayout } from "../actions";
import { redirect } from "next/navigation";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

export const metadata = {
  title: "Detail Komisi Mekanik | CoreAuto POS",
};

export default async function MechanicCommissionDetail({
  params,
  searchParams,
}: {
  params: Promise<{ mechanicId: string }>;
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const { mechanicId } = await params;
  const { start, end } = await searchParams;

  const mechanic = await prisma.mechanic.findUnique({
    where: { id: mechanicId },
    include: {
      branch: true,
      commissionPayouts: {
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!mechanic) {
    notFound();
  }

  // Set default filter to this month if not provided
  const today = new Date();
  const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const defaultEnd = today.toISOString().split('T')[0];

  const startDate = start ? new Date(start) : new Date(defaultStart);
  const endDate = end ? new Date(end) : new Date(defaultEnd);
  endDate.setHours(23, 59, 59, 999); // Akhir hari

  // Hitung transaksi jasa mekanik di rentang waktu tsb
  const transactionItems = await prisma.transactionItem.findMany({
    where: {
      mechanic_id: mechanicId,
      is_commission_paid: false,
      transaction: {
        status: "SELESAI",
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    include: {
      transaction: true,
      service_item: true,
    },
    orderBy: {
      transaction: {
        created_at: "desc",
      }
    }
  });

  const totalJasa = transactionItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalKomisi = totalJasa * mechanic.commission_rate / 100;

  async function action(formData: FormData) {
    "use server";
    await createCommissionPayout(formData);
    // Refresh page by redirecting
    redirect(`/finance/commission/${mechanicId}`);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
        <Link
          href="/finance/commission"
          className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors -ml-1.5 md:ml-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Detail Komisi: {mechanic.name}</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Rate Komisi: {mechanic.commission_rate}% • Cabang: {mechanic.branch.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kalkulator & Form Pencairan */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Hitung & Cairkan Komisi</h2>
            
            <form className="space-y-4 mb-6 border-b border-gray-100 pb-6">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Dari Tanggal</label>
                <input 
                  type="date" 
                  name="start" 
                  defaultValue={start || defaultStart} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Sampai Tanggal</label>
                <input 
                  type="date" 
                  name="end" 
                  defaultValue={end || defaultEnd} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-lg text-sm transition-colors"
              >
                Terapkan Filter
              </button>
            </form>

            <form action={action} className="space-y-4">
              <input type="hidden" name="mechanic_id" value={mechanic.id} />
              <input type="hidden" name="start_date" value={start || defaultStart} />
              <input type="hidden" name="end_date" value={end || defaultEnd} />
              <input type="hidden" name="total_amount" value={totalKomisi} />

              <div className="bg-blue-50 p-4 rounded-lg text-blue-900 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Harga Jasa:</span>
                  <span className="font-semibold">Rp {totalJasa.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rate Komisi:</span>
                  <span className="font-semibold">{mechanic.commission_rate}%</span>
                </div>
                <div className="pt-2 border-t border-blue-200 flex justify-between items-center">
                  <span className="font-bold">Total Komisi:</span>
                  <span className="text-lg font-bold text-blue-700">Rp {totalKomisi.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {totalKomisi > 0 ? (
                 <ConfirmSubmitButton 
                  confirmTitle="Rekam Pencairan Komisi"
                  confirmMessage={`Apakah Anda yakin mencairkan komisi sebesar Rp ${totalKomisi.toLocaleString("id-ID")} untuk ${mechanic.name}?`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <CheckCircle2 size={18} /> Rekam Pencairan (Payout)
                </ConfirmSubmitButton>
              ) : (
                <button 
                  type="button"
                  disabled
                  className="w-full bg-gray-200 text-gray-500 font-medium py-3 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <CheckCircle2 size={18} /> Tidak Ada Komisi
                </button>
              )}
            </form>
          </div>
        </div>

        {/* List Transaksi Jasa di Kanan */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800">Rincian Transaksi Jasa Terpilih</h2>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200 text-gray-600 text-xs md:text-sm">
                    <th className="p-2 md:p-3 font-semibold">Tgl / Invoice</th>
                    <th className="p-2 md:p-3 font-semibold">Jasa</th>
                    <th className="p-2 md:p-3 font-semibold text-right">Subtotal Jasa</th>
                    <th className="p-2 md:p-3 font-semibold text-right">Nilai Komisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
                  {transactionItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 md:p-8 text-center text-gray-500">
                        Tidak ada transaksi jasa pada rentang tanggal ini.
                      </td>
                    </tr>
                  ) : (
                    transactionItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-2 md:p-3">
                          <div className="text-xs md:text-sm font-medium text-gray-900">{item.transaction.invoice_number}</div>
                          <div className="text-[10px] md:text-xs text-gray-500">{format(new Date(item.transaction.created_at), "dd MMM yy", { locale: localeId })}</div>
                        </td>
                        <td className="p-2 md:p-3 text-xs md:text-sm text-gray-800">
                          {item.service_item?.name}
                        </td>
                        <td className="p-2 md:p-3 text-right font-medium text-gray-900 text-xs md:text-sm">
                          Rp {item.subtotal.toLocaleString("id-ID")}
                        </td>
                        <td className="p-2 md:p-3 text-right font-bold text-green-600 text-xs md:text-sm">
                          Rp {(item.subtotal * mechanic.commission_rate / 100).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Riwayat Payout */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <History size={18} className="text-gray-500" />
              <h2 className="font-semibold text-gray-800">Riwayat Pencairan Komisi</h2>
            </div>
            <div className="p-0">
              {mechanic.commissionPayouts.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">Belum ada riwayat pencairan.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {mechanic.commissionPayouts.map((payout) => (
                    <div key={payout.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                      <div>
                        <div className="font-medium text-gray-900">
                          Periode: {format(new Date(payout.period_start), "dd MMM yy", { locale: localeId })} - {format(new Date(payout.period_end), "dd MMM yy", { locale: localeId })}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Dicairkan tgl: {payout.paid_at ? format(new Date(payout.paid_at), "dd MMM yyyy, HH:mm", { locale: localeId }) : "-"}
                        </div>
                      </div>
                      <div className="font-bold text-gray-900">
                        Rp {payout.total_amount.toLocaleString("id-ID")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
