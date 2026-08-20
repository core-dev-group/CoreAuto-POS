import { prisma } from "@/lib/prisma";
import { LinkWithLoading as Link } from "@/components/LinkWithLoading";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Plus, Wallet, TrendingUp, TrendingDown, Download } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Arus Kas | CoreAuto POS",
};

export default async function CashflowPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role === "KASIR") redirect("/");

  const { branch } = await searchParams;

  const branches = await prisma.branch.findMany({ orderBy: { name: "asc" } });
  
  const activeBranchId = branch || (branches.length > 0 ? branches[0].id : undefined);

  const cashflows = await prisma.cashflowEntry.findMany({
    where: activeBranchId ? { branch_id: activeBranchId } : {},
    include: { branch: true },
    orderBy: { created_at: "desc" },
    take: 100, // Limit for performance
  });

  const totalMasuk = cashflows
    .filter((c) => c.type === "MASUK")
    .reduce((sum, c) => sum + c.amount, 0);

  const totalKeluar = cashflows
    .filter((c) => c.type === "KELUAR")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Arus Kas</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Pencatatan uang masuk dan keluar (pengeluaran bengkel).</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <a
            href={`/api/export/cashflow?branch=${activeBranchId || ""}`}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex justify-center items-center gap-2 transition-all shadow-sm text-sm"
          >
            <Download size={18} />
            Export CSV
          </a>
          <Link
            href={`/finance/cashflow/new?branch=${activeBranchId || ""}`}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex justify-center items-center gap-2 transition-all shadow-sm hover:shadow text-sm"
          >
            <Plus size={18} />
            Catat Transaksi
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-2.5 md:p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Wallet size={24} className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs md:text-sm text-gray-500 font-medium">Saldo Arus Kas</div>
            <div className="text-lg md:text-2xl font-bold text-gray-900 truncate">
              Rp {(totalMasuk - totalKeluar).toLocaleString("id-ID")}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-2.5 md:p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
            <TrendingUp size={24} className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs md:text-sm text-gray-500 font-medium">Uang Masuk</div>
            <div className="text-lg md:text-2xl font-bold text-gray-900 truncate">
              Rp {totalMasuk.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-2.5 md:p-3 bg-red-50 text-red-600 rounded-lg shrink-0">
            <TrendingDown size={24} className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs md:text-sm text-gray-500 font-medium">Pengeluaran</div>
            <div className="text-lg md:text-2xl font-bold text-gray-900 truncate">
              Rp {totalKeluar.toLocaleString("id-ID")}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <form className="flex flex-col sm:flex-row gap-4">
            <CustomSelect
              name="branch"
              defaultValue={activeBranchId || ""}
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors"
            >
              Filter
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-gray-600 text-xs md:text-sm">
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Waktu</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Tipe</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Kategori</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Keterangan</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold text-right">Nominal</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Pembuat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
              {cashflows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 md:px-4 py-8 text-center text-gray-500">
                    Belum ada data arus kas.
                  </td>
                </tr>
              ) : (
                cashflows.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600">
                      {format(new Date(item.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      {item.type === "MASUK" ? (
                        <span className="inline-flex items-center px-2 py-0.5 md:py-1 rounded-md text-[10px] md:text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          Pemasukan
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 md:py-1 rounded-md text-[10px] md:text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          Pengeluaran
                        </span>
                      )}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 font-medium text-gray-900">{item.category}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600 max-w-[200px] truncate" title={item.description || ""}>{item.description || "-"}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-right font-bold text-gray-900">
                      Rp {item.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-500">{item.created_by}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
