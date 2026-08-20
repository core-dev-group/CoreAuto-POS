import { getRequests } from "./actions";
import { Plus, PackageCheck, PackageX, Truck, ArrowRight, Package, Clock } from "lucide-react";
import { LinkWithLoading as Link } from "@/components/LinkWithLoading";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ActionButtons from "./ActionButtons";
import { Pagination } from "@/components/ui/Pagination";

export const metadata = {
  title: "Permintaan Barang | CoreAuto POS",
};

export default async function PermintaanBarangPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role as string;
  const isCentralAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN_GUDANG_PUSAT";
  const isBranchAdmin = userRole === "KEPALA_CABANG" || userRole === "ADMIN_GUDANG";
  const isKasir = userRole === "KASIR";

  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const { data: requests, totalPages } = await getRequests(currentPage);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Permintaan Barang</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isCentralAdmin ? "Kelola permintaan barang dari seluruh cabang." : "Ajukan permintaan barang ke Gudang Pusat."}
          </p>
        </div>
        {!isCentralAdmin && (
          <Link 
            href="/permintaan-barang/new" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow"
          >
            <Plus size={16} />
            Buat Request
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Produk</th>
                <th className="px-4 py-3 font-semibold text-center">Qty</th>
                <th className="px-4 py-3 font-semibold">Rute</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Belum ada permintaan barang.
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  let StatusIcon = Package;
                  let statusColor = "text-gray-700 bg-gray-100 border-gray-200";
                  
                  if (req.status === "PENDING") {
                    StatusIcon = Package;
                    statusColor = "text-yellow-700 bg-yellow-50 border-yellow-200";
                  } else if (req.status === "MENUNGGU_CABANG") {
                    StatusIcon = Clock;
                    statusColor = "text-orange-700 bg-orange-50 border-orange-200";
                  } else if (req.status === "DIKIRIM") {
                    StatusIcon = Truck;
                    statusColor = "text-blue-700 bg-blue-50 border-blue-200";
                  } else if (req.status === "DITERIMA") {
                    StatusIcon = PackageCheck;
                    statusColor = "text-green-700 bg-green-50 border-green-200";
                  } else if (req.status === "DITOLAK") {
                    StatusIcon = PackageX;
                    statusColor = "text-red-700 bg-red-50 border-red-200";
                  }

                  return (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors text-sm">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {format(new Date(req.created_at), "dd MMM yyyy HH:mm", { locale: id })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{req.product.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{req.product.sku}</div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900 font-bold">
                        {req.quantity}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="truncate max-w-[100px]" title={req.from_branch_name}>{req.from_branch_name}</span>
                          <ArrowRight size={12} className="text-gray-400 shrink-0" />
                          <span className="font-medium truncate max-w-[100px]" title={req.to_branch_name}>{req.to_branch_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                          <StatusIcon size={12} /> {
                            req.status === "PENDING" ? "Menunggu Pusat" :
                            req.status === "MENUNGGU_CABANG" ? "Menunggu Cabang" :
                            req.status === "DIKIRIM" ? "Dikirim" :
                            req.status === "DITERIMA" ? "Diterima" :
                            req.status === "DITOLAK" ? "Ditolak" : req.status
                          }
                        </span>
                        {req.status === "DITOLAK" && req.rejection_reason && (
                          <div className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={req.rejection_reason}>
                            {req.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ActionButtons 
                          request={req} 
                          isCentralAdmin={isCentralAdmin} 
                          isBranchAdmin={isBranchAdmin}
                        />
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
