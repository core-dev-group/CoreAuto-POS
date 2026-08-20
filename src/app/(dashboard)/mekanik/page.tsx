import { getMechanics } from "./actions";
import { Plus, Edit2, Store, Phone, CheckCircle, XCircle } from "lucide-react";
import { LinkWithLoading as Link } from "@/components/LinkWithLoading";
import DeleteButton from "./DeleteButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Manajemen Mekanik | CoreAuto POS",
};

export default async function MekanikPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role === "KASIR") redirect("/");

  const mechanics = await getMechanics();

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Manajemen Mekanik</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Kelola data mekanik dan persentase komisi.</p>
        </div>
        <Link 
          href="/mekanik/new" 
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex justify-center items-center gap-2 transition-all shadow-sm hover:shadow text-sm"
        >
          <Plus size={18} />
          Tambah Mekanik
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs md:text-sm">
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Nama Mekanik</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Cabang</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Kontak</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Komisi</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Status</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
              {mechanics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 md:px-4 py-8 text-center text-gray-500">
                    Belum ada data mekanik.
                  </td>
                </tr>
              ) : (
                mechanics.map((mechanic) => (
                  <tr key={mechanic.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-4 py-2 md:py-3 font-medium text-gray-900">
                      <span className="truncate max-w-[150px] inline-block align-middle" title={mechanic.name}>{mechanic.name}</span>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <Store className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[120px]" title={mechanic.branch.name}>{mechanic.branch.name}</span>
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600">
                      {mechanic.phone ? (
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 shrink-0" />
                          {mechanic.phone}
                        </div>
                      ) : "-"}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-900 font-medium">
                      {mechanic.commission_rate}%
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      {mechanic.active ? (
                        <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle className="w-3 h-3 md:w-3.5 md:h-3.5" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3 h-3 md:w-3.5 md:h-3.5" /> Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link 
                          href={`/mekanik/${mechanic.id}/edit`}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                        </Link>
                        <DeleteButton id={mechanic.id} />
                      </div>
                    </td>
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
