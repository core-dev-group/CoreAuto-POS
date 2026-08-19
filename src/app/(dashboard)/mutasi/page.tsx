import { prisma } from "@/lib/prisma";
import { Plus, ArrowDownRight, ArrowUpRight, AlertTriangle, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { Pagination } from "@/components/ui/Pagination";

export const metadata = {
  title: "Riwayat Mutasi Stok | CoreAuto POS",
};

export default async function MutasiPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const limit = 10;
  const skip = (currentPage - 1) * limit;
  const [mutations, total] = await Promise.all([
    prisma.stockMutation.findMany({
      include: {
        product: true,
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.stockMutation.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  // To display the branch name, we need to fetch it manually if we didn't define the relation
  // Wait, stockMutation only has branch_id. Let's fetch all branches and map them.
  const branches = await prisma.branch.findMany();
  const branchMap = branches.reduce((acc, branch) => {
    acc[branch.id] = branch.name;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Riwayat Mutasi Stok</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Daftar pergerakan barang (Masuk, Keluar, Retur, Rusak).</p>
        </div>
        <Link 
          href="/mutasi/new" 
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex justify-center items-center gap-2 transition-all shadow-sm hover:shadow"
        >
          <Plus size={16} />
          Catat Mutasi
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs md:text-sm">
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Tanggal</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Tipe</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Barang</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Cabang</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold text-center">Qty</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Oleh</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mutations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Belum ada riwayat mutasi.
                  </td>
                </tr>
              ) : (
                mutations.map((mutation) => {
                  let TypeIcon = ArrowUpRight;
                  let typeColor = "text-green-700 bg-green-50 border-green-200";
                  
                  if (mutation.type === "KELUAR") {
                    TypeIcon = ArrowDownRight;
                    typeColor = "text-red-700 bg-red-50 border-red-200";
                  } else if (mutation.type === "RUSAK") {
                    TypeIcon = AlertTriangle;
                    typeColor = "text-red-700 bg-red-50 border-red-200";
                  } else if (mutation.type === "RETUR") {
                    TypeIcon = RefreshCcw;
                    typeColor = "text-orange-700 bg-orange-50 border-orange-200";
                  }

                  return (
                    <tr key={mutation.id} className="hover:bg-gray-50 transition-colors text-xs md:text-sm">
                      <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600">
                        {format(new Date(mutation.created_at), "dd MMM yyyy HH:mm", { locale: id })}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <span className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium border ${typeColor}`}>
                          <TypeIcon size={12} className="md:w-3.5 md:h-3.5" /> {mutation.type}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <div className="font-medium text-gray-900">{mutation.product.name}</div>
                        <div className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">{mutation.product.sku}</div>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600">
                        {branchMap[mutation.branch_id] || "Unknown"}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-center text-gray-900 font-bold">
                        {mutation.quantity}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600">
                        {mutation.created_by}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600 max-w-[150px] md:max-w-[200px] truncate" title={mutation.note || ""}>
                        {mutation.note || "-"}
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
