import { getBranches, deleteBranch } from "./actions";
import { Plus, Edit2, Trash2, MapPin, Phone } from "lucide-react";
import { LinkWithLoading as Link } from "@/components/LinkWithLoading";
import DeleteButton from "./DeleteButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

import { Pagination } from "@/components/ui/Pagination";

export const metadata = {
  title: "Manajemen Cabang | CoreAuto POS",
};

export default async function CabangPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") redirect("/");

  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const { data: branches, totalPages } = await getBranches(currentPage);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Manajemen Cabang</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Kelola data seluruh cabang bengkel Anda.</p>
        </div>
        <Link 
          href="/cabang/new" 
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex justify-center items-center gap-2 transition-all shadow-sm hover:shadow text-sm"
        >
          <Plus size={18} />
          Tambah Cabang
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs md:text-sm">
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Nama Cabang</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Alamat</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Nomor Telepon</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
              {branches.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 md:px-4 py-8 text-center text-gray-500">
                    Belum ada data cabang.
                  </td>
                </tr>
              ) : (
                branches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-4 py-2 md:py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {branch.name}
                        {branch.is_central && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] md:text-xs rounded-full font-medium">
                            Pusat
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600 max-w-[200px] truncate" title={branch.address || ""}>
                      <div className="flex items-center gap-2">
                        <MapPin className="text-gray-400 w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                        <span className="truncate">{branch.address}</span>
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="text-gray-400 w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                        {branch.phone}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link 
                          href={`/cabang/${branch.id}/edit`}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                        </Link>
                        <DeleteButton id={branch.id} />
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
