import { prisma } from "@/lib/prisma";
import { LinkWithLoading as Link } from "@/components/LinkWithLoading";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Receipt, Search, Printer, FileText, Download } from "lucide-react";

import { Pagination } from "@/components/ui/Pagination";

export const metadata = {
  title: "Riwayat Invoice | CoreAuto POS",
};

export default async function InvoiceHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search, page } = await searchParams;
  const currentPage = Number(page) || 1;
  const limit = 10;
  const skip = (currentPage - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: search
        ? {
            OR: [
              { invoice_number: { contains: search } },
              { vehicle_plate: { contains: search } },
            ],
          }
        : {},
      include: {
        branch: true,
        items: true,
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.transaction.count({
      where: search
        ? {
            OR: [
              { invoice_number: { contains: search } },
              { vehicle_plate: { contains: search } },
            ],
          }
        : {},
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Riwayat Transaksi (Invoice)</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Daftar seluruh transaksi kasir yang telah selesai.</p>
        </div>
        <a 
          href="/api/export/transactions"
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Download size={16} />
          Export CSV
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <form className="max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Cari No. Invoice / Plat Nomor..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs md:text-sm"
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-gray-600 text-xs md:text-sm">
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">No. Invoice</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Tanggal</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Plat Nomor</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Cabang</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Total</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Status / Pembayaran</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada transaksi ditemukan.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors text-xs md:text-sm">
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5 md:gap-2">
                        <Receipt size={14} className="text-gray-400 shrink-0" />
                        {transaction.invoice_number}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600">
                      {format(new Date(transaction.created_at), "dd MMM yyyy HH:mm", { locale: id })}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <div className="font-medium text-gray-900">{transaction.vehicle_plate || "-"}</div>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600">
                      {transaction.branch.name}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 font-bold text-gray-900">
                      Rp {transaction.total.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      {transaction.status === "DIBATALKAN" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          Dibatalkan
                        </span>
                      ) : transaction.payment_method === "BELUM_BAYAR" || transaction.payment_method === "BELUM BAYAR" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          Belum Bayar
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          {transaction.payment_method}
                        </span>
                      )}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <div className="flex items-center justify-end gap-2 md:gap-3">
                        <Link 
                          href={`/invoice/${transaction.id}`}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Detail"
                        >
                          <FileText size={16} />
                        </Link>
                        <Link 
                          href={`/print/invoice/${transaction.id}`}
                          target="_blank"
                          className="text-gray-400 hover:text-green-600 transition-colors"
                          title="Cetak Struk"
                        >
                          <Printer size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
