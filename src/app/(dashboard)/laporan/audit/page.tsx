import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

import { Pagination } from "@/components/ui/Pagination";

export const metadata = {
  title: "Log Aktivitas (Audit) | CoreAuto POS",
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; branch?: string; action?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/"); // Only SUPER_ADMIN can see audit logs
  }

  const { start, end, branch, action, page } = await searchParams;
  const currentPage = Number(page) || 1;
  const limit = 10;
  const skip = (currentPage - 1) * limit;

  const today = new Date();
  const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const defaultEnd = today.toISOString().split('T')[0];

  const startDate = start ? new Date(start) : new Date(defaultStart);
  const endDate = end ? new Date(end) : new Date(defaultEnd);
  endDate.setHours(23, 59, 59, 999);

  const where: any = {
    created_at: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (branch) {
    where.branch_id = branch;
  }
  
  if (action) {
    where.action = action;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: true,
        branch: true,
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const branches = await prisma.branch.findMany({
    orderBy: { name: "asc" },
  });

  const branchOptions = [
    { value: "", label: "Semua Cabang" },
    ...branches.map(b => ({ value: b.id, label: b.name }))
  ];

  const actionOptions = [
    { value: "", label: "Semua Aksi" },
    { value: "CREATE_TRANSACTION", label: "POS Transaksi" },
    { value: "VOID_TRANSACTION", label: "Void Transaksi" },
    { value: "STOCK_MUTATION", label: "Mutasi Stok" },
    { value: "OPEN_SHIFT", label: "Buka Shift" },
    { value: "CLOSE_SHIFT", label: "Tutup Shift" },
    { value: "PAY_COMMISSION", label: "Cairkan Komisi" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Jejak Aktivitas (Audit)</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau pergerakan transaksi, kasir, dan gudang di seluruh cabang.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <form className="grid grid-cols-1 md:grid-cols-5 items-end gap-4">
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-1">Mulai</label>
              <input type="date" name="start" defaultValue={start || defaultStart} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-1">Sampai</label>
              <input type="date" name="end" defaultValue={end || defaultEnd} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-1">Cabang</label>
              <CustomSelect 
                name="branch" 
                options={branchOptions} 
                defaultValue={branch || ""} 
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-1">Aksi</label>
              <CustomSelect 
                name="action" 
                options={actionOptions} 
                defaultValue={action || ""} 
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1.5 rounded-lg text-sm transition-colors h-[34px] flex items-center justify-center">
              Filter
            </button>
          </form>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b border-gray-100">
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold text-xs md:text-sm">Waktu</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold text-xs md:text-sm">Aktor / Cabang</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold text-xs md:text-sm">Aksi</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold text-xs md:text-sm">Entitas</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold text-xs md:text-sm hidden md:table-cell">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 md:px-4 py-8 text-center text-gray-500">
                    Tidak ada log aktivitas pada rentang ini.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  let parsedDetails: any = null;
                  if (log.details) {
                    try {
                      parsedDetails = JSON.parse(log.details);
                    } catch (e) {
                      parsedDetails = log.details;
                    }
                  }

                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 md:px-4 py-2 md:py-3 align-top">
                        {format(new Date(log.created_at), "dd MMM yyyy, HH:mm", { locale: localeId })}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 align-top">
                        <div className="font-medium text-gray-900">{log.user.name}</div>
                        <div className="text-xs text-gray-500">{log.branch?.name || "Pusat"}</div>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 align-top">
                        <span className={`inline-block px-2 py-1 rounded text-[11px] font-semibold tracking-wide uppercase
                          ${log.action.includes('VOID') || log.action.includes('DELETE') ? 'bg-red-100 text-red-700' : ''}
                          ${log.action.includes('CREATE') || log.action.includes('OPEN') ? 'bg-blue-100 text-blue-700' : ''}
                          ${log.action.includes('UPDATE') || log.action.includes('EDIT') ? 'bg-amber-100 text-amber-700' : ''}
                          ${log.action.includes('SHIFT') || log.action.includes('MUTATION') ? 'bg-purple-100 text-purple-700' : ''}
                          ${!log.action.includes('VOID') && !log.action.includes('DELETE') && !log.action.includes('CREATE') && !log.action.includes('OPEN') && !log.action.includes('UPDATE') && !log.action.includes('EDIT') && !log.action.includes('SHIFT') && !log.action.includes('MUTATION') ? 'bg-gray-100 text-gray-700' : ''}
                        `}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 align-top text-gray-700">
                        <div className="font-medium">{log.entity}</div>
                        {log.entity_id && (
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5" title={log.entity_id}>
                            ID: {log.entity_id.substring(0, 8)}...
                          </div>
                        )}
                        {/* Mobile view for details */}
                        <div className="md:hidden mt-2 p-2 bg-gray-50 rounded border border-gray-100 text-[11px]">
                          <span className="font-semibold text-gray-500 mb-1 block">Detail:</span>
                          {parsedDetails ? (
                            typeof parsedDetails === 'object' ? (
                              <div className="space-y-0.5 font-mono">
                                {Object.entries(parsedDetails).map(([k, v]) => (
                                  <div key={k} className="flex gap-1.5 break-all">
                                    <span className="text-gray-500">{k}:</span>
                                    <span className="text-gray-900">{String(v)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="font-mono break-all text-gray-600">{String(parsedDetails)}</div>
                            )
                          ) : (
                            <div className="text-gray-400">-</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 align-top hidden md:table-cell">
                        {parsedDetails ? (
                          typeof parsedDetails === 'object' ? (
                            <div className="space-y-1 text-xs text-gray-700 font-mono bg-gray-50 p-2 rounded border border-gray-100 max-h-32 overflow-y-auto">
                              {Object.entries(parsedDetails).map(([k, v]) => (
                                <div key={k} className="flex gap-2">
                                  <span className="text-gray-500 font-semibold">{k.replace(/_/g, ' ')}:</span>
                                  <span className="break-all">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-600 font-mono break-all bg-gray-50 p-2 rounded border border-gray-100 max-h-32 overflow-y-auto">
                              {String(parsedDetails)}
                            </div>
                          )
                        ) : (
                          <div className="text-gray-400 text-xs italic">-</div>
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
