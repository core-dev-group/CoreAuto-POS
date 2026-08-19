import { prisma } from "@/lib/prisma";
import { Package, Store, AlertTriangle, Download } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

import { Pagination } from "@/components/ui/Pagination";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Stok Cabang | CoreAuto POS",
};

export default async function StokPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string; search?: string; page?: string }>;
}) {
  const { branch: paramBranchId, search, page } = await searchParams;
  
  const session = await getServerSession(authOptions);
  const isKasir = session?.user?.role === "KASIR";
  const userBranchId = (session?.user as any)?.branchId;
  
  // If KASIR, force branchId to their own branch. Otherwise use param.
  const branchId = isKasir ? userBranchId : paramBranchId;
  const currentPage = Number(page) || 1;
  const limit = 10;
  const skip = (currentPage - 1) * limit;

  const branches = await prisma.branch.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const [branchStocks, total] = await Promise.all([
    prisma.branchStock.findMany({
      where: {
        ...(branchId ? { branch_id: branchId } : {}),
        ...(search
          ? {
              product: {
                name: { contains: search },
              },
            }
          : {}),
      },
      include: {
        product: true,
        branch: true,
      },
      orderBy: [
        { branch: { name: "asc" } },
        { product: { name: "asc" } },
      ],
      skip,
      take: limit,
    }),
    prisma.branchStock.count({
      where: {
        ...(branchId ? { branch_id: branchId } : {}),
        ...(search
          ? {
              product: {
                name: { contains: search },
              },
            }
          : {}),
      }
    })
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Stok Cabang</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Pantau sisa kuantitas barang di setiap cabang.</p>
        </div>
        <a 
          href={`/api/export/stock?branch=${branchId || ""}`}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Download size={16} />
          Export CSV
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Simple filters */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 bg-gray-50">
          <form className="flex flex-col md:flex-row gap-4 md:items-center w-full max-w-3xl">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Cari Barang</label>
              <input
                type="text"
                id="search"
                name="search"
                defaultValue={search || ""}
                placeholder="Cari nama barang..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs md:text-sm"
              />
            </div>
            {!isKasir && (
              <div className="flex-1">
                <label htmlFor="branch" className="sr-only">Filter Cabang</label>
                <CustomSelect
                  name="branch"
                  defaultValue={branchId || ""}
                  placeholder="Semua Cabang"
                  options={[
                    { value: "", label: "Semua Cabang" },
                    ...branches.map((b) => ({ value: b.id, label: b.name }))
                  ]}
                />
              </div>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-gray-800 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors"
            >
              Filter
            </button>
            {(search || (branchId && !isKasir)) && (
              <a href="/stok" className="px-4 py-2 text-gray-600 hover:text-gray-900 text-xs md:text-sm font-medium">
                Reset
              </a>
            )}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-gray-600 text-xs md:text-sm">
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Cabang</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">SKU / Nama Barang</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold text-center">Stok</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branchStocks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data stok ditemukan.
                  </td>
                </tr>
              ) : (
                branchStocks.map((stock) => {
                  const threshold = stock.min_stock_threshold ?? stock.product.min_stock_threshold_default;
                  const isLow = stock.quantity <= threshold;

                  return (
                    <tr key={stock.id} className="hover:bg-gray-50 transition-colors text-xs md:text-sm">
                      <td className="px-3 md:px-4 py-2 md:py-3 text-gray-700 font-medium">
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <Store size={14} className="text-gray-400 shrink-0" />
                          {stock.branch.name}
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <div className="font-medium text-gray-900">{stock.product.name}</div>
                        <div className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">{stock.product.sku}</div>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-center text-gray-900 font-medium">
                        {stock.quantity}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            <AlertTriangle size={12} className="md:w-3.5 md:h-3.5" /> Stok Menipis ({"<="} {threshold})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            <Package size={12} className="md:w-3.5 md:h-3.5" /> Aman
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
