import { getServices } from "./actions";
import { Plus, Edit2, Wrench } from "lucide-react";
import Link from "next/link";
import DeleteButton from "./DeleteButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

import { Pagination } from "@/components/ui/Pagination";

export const metadata = {
  title: "Manajemen Jasa Servis | CoreAuto POS",
};

export default async function ServisPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role === "KASIR") redirect("/");

  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const { data: services, totalPages } = await getServices(currentPage);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Manajemen Jasa Servis</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Kelola daftar layanan jasa dan pengaturan komisi khusus.</p>
        </div>
        <Link 
          href="/servis/new" 
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex justify-center items-center gap-2 transition-all shadow-sm hover:shadow text-sm"
        >
          <Plus size={18} />
          Tambah Jasa
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs md:text-sm">
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Nama Jasa</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Harga (Default)</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Komisi Khusus</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 md:px-4 py-8 text-center text-gray-500">
                    Belum ada data jasa servis.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-4 py-2 md:py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <Wrench className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[200px]" title={service.name}>{service.name}</span>
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-900 font-medium">
                      Rp {service.default_price.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600">
                      {service.commission_rate_override !== null ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          {service.commission_rate_override}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px] md:text-xs">Ikut Mekanik</span>
                      )}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link 
                          href={`/servis/${service.id}/edit`}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                        </Link>
                        <DeleteButton id={service.id} />
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
