import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

export const metadata = {
  title: "Laporan Laba/Rugi | CoreAuto POS",
};

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; branch?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/api/auth/signin");

  const { start, end, branch } = await searchParams;

  // Role validation
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  const branchId = isSuperAdmin ? (branch || undefined) : session.user.branchId;

  // Date filters
  const today = new Date();
  const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const defaultEnd = today.toISOString().split('T')[0];

  const startDate = start ? new Date(start) : new Date(defaultStart);
  const endDate = end ? new Date(end) : new Date(defaultEnd);
  endDate.setHours(23, 59, 59, 999);

  const branches = isSuperAdmin ? await prisma.branch.findMany({ orderBy: { name: "asc" } }) : [];

  // Fetch Data
  const whereBranch = branchId ? { branch_id: branchId } : {};

  // 1. Omzet Transaksi & HPP Barang
  const transactions = await prisma.transaction.findMany({
    where: {
      ...whereBranch,
      status: "SELESAI",
      created_at: {
        gte: startDate,
        lte: endDate,
      }
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  let totalOmzet = 0;
  let totalHPP = 0;

  transactions.forEach(trx => {
    totalOmzet += trx.total;
    trx.items.forEach(item => {
      if (item.product) {
        totalHPP += (item.product.purchase_price * item.quantity);
      }
    });
  });

  // 2. Cashflow (Pemasukan Manual & Pengeluaran)
  const cashflows = await prisma.cashflowEntry.findMany({
    where: {
      ...whereBranch,
      created_at: {
        gte: startDate,
        lte: endDate,
      }
    }
  });

  let totalPemasukanLain = 0;
  let totalPengeluaran = 0;

  cashflows.forEach(cf => {
    if (cf.type === "MASUK") {
      totalPemasukanLain += cf.amount;
    } else if (cf.type === "KELUAR") {
      totalPengeluaran += cf.amount;
    }
  });

  // 3. Payout Komisi Mekanik
  // CommissionPayout is tied to mechanic. branch_id is inside mechanic.
  const payouts = await prisma.commissionPayout.findMany({
    where: {
      mechanic: branchId ? { branch_id: branchId } : undefined,
      paid_at: {
        gte: startDate,
        lte: endDate,
      },
      paid: true
    }
  });

  let totalKomisiDibayar = 0;
  payouts.forEach(p => {
    totalKomisiDibayar += p.total_amount;
  });

  // Calculations
  const labaKotor = totalOmzet - totalHPP;
  const totalPendapatan = labaKotor + totalPemasukanLain;
  const totalBeban = totalPengeluaran + totalKomisiDibayar;
  const labaBersih = totalPendapatan - totalBeban;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Laporan Laba & Rugi</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">Ringkasan pendapatan, pengeluaran, dan profitabilitas bengkel.</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <form className="flex flex-col md:flex-row gap-3 md:gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
            <input 
              type="date" 
              name="start" 
              defaultValue={start || defaultStart} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <input 
              type="date" 
              name="end" 
              defaultValue={end || defaultEnd} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          {isSuperAdmin && (
            <div className="flex-1 w-full">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Filter Cabang</label>
              <CustomSelect
                name="branch"
                options={[
                  { value: "", label: "Semua Cabang" },
                  ...branches.map(b => ({ value: b.id, label: b.name }))
                ]}
                defaultValue={branch || ""}
                placeholder="Semua Cabang"
              />
            </div>
          )}
          <button 
            type="submit" 
            className="w-full md:w-auto px-4 md:px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium h-[42px] text-sm"
          >
            Terapkan
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500">Omzet Kotor (POS)</p>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mt-1">Rp {totalOmzet.toLocaleString("id-ID")}</h3>
            </div>
            <div className="p-2 md:p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-[10px] md:text-sm text-gray-500">Penjualan barang & jasa</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500">HPP Barang Terjual</p>
              <h3 className="text-lg md:text-2xl font-bold text-orange-600 mt-1">- Rp {totalHPP.toLocaleString("id-ID")}</h3>
            </div>
            <div className="p-2 md:p-3 bg-orange-50 text-orange-600 rounded-lg shrink-0">
              <Package className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-[10px] md:text-sm text-gray-500">Modal beli *sparepart*</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500">Total Pengeluaran</p>
              <h3 className="text-lg md:text-2xl font-bold text-red-600 mt-1">- Rp {totalBeban.toLocaleString("id-ID")}</h3>
            </div>
            <div className="p-2 md:p-3 bg-red-50 text-red-600 rounded-lg shrink-0">
              <TrendingDown className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-[10px] md:text-sm text-gray-500">Arus kas keluar & komisi</p>
        </div>

        <div className={`p-4 md:p-6 rounded-xl border shadow-sm flex flex-col justify-between ${labaBersih >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <div>
              <p className={`text-xs md:text-sm font-bold ${labaBersih >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                {labaBersih >= 0 ? 'Laba Bersih' : 'Rugi Bersih'}
              </p>
              <h3 className={`text-lg md:text-2xl font-black mt-1 ${labaBersih >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                Rp {Math.abs(labaBersih).toLocaleString("id-ID")}
              </h3>
            </div>
            <div className={`p-2 md:p-3 rounded-lg shrink-0 ${labaBersih >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {labaBersih >= 0 ? <TrendingUp className="w-5 h-5 md:w-6 md:h-6" /> : <TrendingDown className="w-5 h-5 md:w-6 md:h-6" />}
            </div>
          </div>
          <p className={`text-[10px] md:text-sm ${labaBersih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Setelah potong modal & biaya
          </p>
        </div>
      </div>

      {/* Rincian P&L Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6 md:mt-8">
        <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-base md:text-lg font-bold text-gray-900">Rincian Laba & Rugi</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[500px]">
            <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
              <tr className="bg-white">
                <td className="px-4 py-3 md:p-4 font-semibold text-gray-900">Pendapatan Kotor (Omzet Transaksi)</td>
                <td className="px-4 py-3 md:p-4 text-right font-medium text-gray-900">Rp {totalOmzet.toLocaleString("id-ID")}</td>
              </tr>
              <tr className="bg-orange-50">
                <td className="px-4 py-3 md:p-4 text-orange-800">Dikurangi: Harga Pokok Penjualan (HPP Sparepart)</td>
                <td className="px-4 py-3 md:p-4 text-right text-orange-800">- Rp {totalHPP.toLocaleString("id-ID")}</td>
              </tr>
              <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                <td className="px-4 py-3 md:p-4 text-gray-900">Laba Kotor Transaksi</td>
                <td className="px-4 py-3 md:p-4 text-right text-gray-900">Rp {labaKotor.toLocaleString("id-ID")}</td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-3 md:p-4 text-gray-700">Ditambah: Pemasukan Kas Lainnya</td>
                <td className="px-4 py-3 md:p-4 text-right text-gray-700">+ Rp {totalPemasukanLain.toLocaleString("id-ID")}</td>
              </tr>
              <tr className="bg-blue-50 font-bold border-t-2 border-blue-200">
                <td className="px-4 py-3 md:p-4 text-blue-900">Total Pendapatan (Gross Margin)</td>
                <td className="px-4 py-3 md:p-4 text-right text-blue-900">Rp {totalPendapatan.toLocaleString("id-ID")}</td>
              </tr>
              <tr className="bg-red-50">
                <td className="px-4 py-3 md:p-4 text-red-800">Dikurangi: Pengeluaran Kas (Beban Operasional)</td>
                <td className="px-4 py-3 md:p-4 text-right text-red-800">- Rp {totalPengeluaran.toLocaleString("id-ID")}</td>
              </tr>
              <tr className="bg-red-50">
                <td className="px-4 py-3 md:p-4 text-red-800">Dikurangi: Komisi Mekanik Dibayarkan</td>
                <td className="px-4 py-3 md:p-4 text-right text-red-800">- Rp {totalKomisiDibayar.toLocaleString("id-ID")}</td>
              </tr>
              <tr className={`${labaBersih >= 0 ? 'bg-green-600' : 'bg-red-600'} text-white font-black border-t-4 border-gray-900`}>
                <td className="px-4 py-3 md:p-4 text-sm md:text-lg">{labaBersih >= 0 ? 'LABA BERSIH (NET PROFIT)' : 'RUGI BERSIH (NET LOSS)'}</td>
                <td className="px-4 py-3 md:p-4 text-right text-base md:text-xl">Rp {Math.abs(labaBersih).toLocaleString("id-ID")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
