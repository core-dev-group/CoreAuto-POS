import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DollarSign, Wrench, AlertTriangle, Receipt } from "lucide-react";
import { LinkWithLoading as Link } from "@/components/LinkWithLoading";
import { format, subDays } from "date-fns";
import { id } from "date-fns/locale";

export const metadata = {
  title: "Dashboard | CoreAuto POS",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/api/auth/signin");

  // Redirect kasir langsung ke halaman khusus POS
  if (session.user.role === "KASIR") {
    redirect("/pos");
  }

  const branchId = session.user.role === "SUPER_ADMIN" ? undefined : session.user.branchId;
  const branchFilter = branchId ? { branch_id: branchId } : {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // 1. Total Omzet Hari Ini
  const todayTransactions = await prisma.transaction.findMany({
    where: {
      ...branchFilter,
      status: "SELESAI",
      created_at: {
        gte: today,
        lte: endOfToday,
      }
    },
    include: {
      items: true
    }
  });

  const omzetHariIni = todayTransactions.reduce((acc, curr) => acc + curr.total, 0);

  // 2. Jumlah Kendaraan Servis Hari Ini
  // Count transactions that have at least one service item
  let servisHariIni = 0;
  todayTransactions.forEach(trx => {
    const hasService = trx.items.some(item => item.service_item_id !== null);
    if (hasService) servisHariIni++;
  });

  // 3. Stok Menipis
  const allStocks = await prisma.branchStock.findMany({
    where: branchFilter,
    include: { product: true }
  });

  const lowStocks = allStocks.filter(st => {
    const threshold = st.min_stock_threshold ?? st.product.min_stock_threshold_default;
    return st.quantity <= threshold;
  });

  // 4. Trend Pendapatan 7 Hari Terakhir
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    d.setHours(0,0,0,0);
    return d;
  });

  const trendData = await Promise.all(last7Days.map(async (date) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const trxs = await prisma.transaction.findMany({
      where: {
        ...branchFilter,
        status: "SELESAI",
        created_at: {
          gte: date,
          lte: end
        }
      },
      select: { total: true }
    });

    const total = trxs.reduce((sum, t) => sum + t.total, 0);
    
    return {
      date: format(date, "EE", { locale: id }), // e.g. Sen, Sel, Rab
      fullDate: format(date, "dd MMM", { locale: id }),
      total
    };
  }));

  const maxTrendVal = Math.max(...trendData.map(d => d.total), 1); // Avoid division by zero

  // 5. Transaksi Terakhir
  const recentTransactions = await prisma.transaction.findMany({
    where: branchFilter,
    orderBy: { created_at: "desc" },
    take: 5,
    include: { branch: true }
  });

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN_GUDANG: "Admin Gudang",
    KASIR: "Kasir",
  };
  const roleLabel = roleLabels[session.user.role] || session.user.role;

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-3 mt-1.5">
          <p className="text-sm text-gray-500">
            Selamat datang, <span className="font-semibold text-gray-900">{session.user.name}</span>
          </p>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
            {roleLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Omzet Hari Ini */}
        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="overflow-hidden pr-2">
              <p className="text-xs md:text-sm font-medium text-gray-500">Omzet Hari Ini</p>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mt-1 truncate" title={`Rp ${omzetHariIni.toLocaleString("id-ID")}`}>Rp {omzetHariIni.toLocaleString("id-ID")}</h3>
            </div>
            <div className="p-2.5 md:p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <DollarSign size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-xs md:text-sm text-gray-500">Total pendapatan kotor hari ini</p>
        </div>

        {/* Servis Hari Ini */}
        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500">Kendaraan Servis</p>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mt-1">{servisHariIni} Unit</h3>
            </div>
            <div className="p-2.5 md:p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
              <Wrench size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-xs md:text-sm text-gray-500">Transaksi servis hari ini</p>
        </div>

        {/* Stok Menipis */}
        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500">Stok Menipis</p>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mt-1">{lowStocks.length} Barang</h3>
            </div>
            <div className="p-2.5 md:p-3 bg-red-50 text-red-600 rounded-lg shrink-0">
              <AlertTriangle size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
          <Link href="/stok" className="text-xs md:text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
            Lihat Detail &rarr;
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CSS Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5 lg:col-span-2">
          <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6">Tren Pendapatan (7 Hari Terakhir)</h2>
          
          <div className="flex items-end gap-1.5 md:gap-2 h-48 md:h-64">
            {trendData.map((d, i) => {
              const heightPercent = (d.total / maxTrendVal) * 100;
              return (
                <div key={i} className="flex flex-col items-center flex-1 h-full group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none z-10 whitespace-nowrap absolute -top-6">
                    {d.fullDate}: Rp {d.total.toLocaleString("id-ID")}
                  </div>

                  {/* Bar container */}
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-blue-500 hover:bg-blue-600 transition-all rounded-t"
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    ></div>
                  </div>

                  {/* Label */}
                  <span className="text-xs text-gray-500 mt-2 shrink-0">{d.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-bold text-gray-900">Transaksi Terakhir</h2>
            <Link href="/invoice" className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium">
              Lihat Semua
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Belum ada transaksi.</p>
            ) : (
              recentTransactions.map(trx => (
                <div key={trx.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                    <Receipt size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-semibold text-gray-900 text-sm">{trx.invoice_number}</p>
                      <p className="font-bold text-gray-900 text-sm">Rp {trx.total.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">{trx.vehicle_plate || "Tanpa Plat"}</p>
                        <span className="text-[10px] text-gray-400">&bull;</span>
                        <p className="text-xs font-medium text-gray-600">{trx.branch.name}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        trx.status === "SELESAI" ? "bg-green-50 text-green-700 border border-green-200" :
                        trx.status === "DIBATALKAN" ? "bg-red-50 text-red-700 border border-red-200" :
                        "bg-yellow-50 text-yellow-700 border border-yellow-200"
                      }`}>
                        {trx.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
