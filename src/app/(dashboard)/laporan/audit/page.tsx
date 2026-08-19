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
          {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500 border-t border-gray-100">Tidak ada log aktivitas pada rentang ini.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Desktop Table Header */}
              <div className="hidden md:grid md:grid-cols-5 gap-4 p-4 bg-white border-b border-gray-200 text-gray-600 text-sm font-semibold">
                <div>Waktu</div>
                <div>Aktor / Cabang</div>
                <div>Tindakan</div>
                <div>Entitas</div>
                <div>Detail</div>
              </div>
              
              {/* Rows */}
              {logs.map((log) => {
                let parsedDetails: any = null;
                if (log.details) {
                  try {
                    parsedDetails = JSON.parse(log.details);
                  } catch (e) {
                    parsedDetails = log.details;
                  }
                }

                return (
                  <div key={log.id} className="p-4 hover:bg-gray-50 flex flex-col md:grid md:grid-cols-5 gap-4 md:items-start text-sm">
                    {/* Waktu */}
                    <div className="text-gray-500 text-xs md:text-sm flex justify-between md:block">
                      <span className="md:hidden font-semibold text-gray-700">Waktu:</span>
                      {format(new Date(log.created_at), "dd MMM yyyy HH:mm", { locale: localeId })}
                    </div>
                    
                    {/* Aktor / Cabang */}
                    <div className="flex justify-between md:block">
                      <span className="md:hidden font-semibold text-gray-700">Aktor / Cabang:</span>
                      <div className="text-right md:text-left">
                        <div className="font-medium text-gray-900">{log.user.name}</div>
                        <div className="text-xs text-gray-500">{log.branch?.name || "Pusat"}</div>
                      </div>
                    </div>

                    {/* Tindakan */}
                    <div className="flex justify-between md:block">
                      <span className="md:hidden font-semibold text-gray-700">Aksi:</span>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold
                        ${log.action.includes('VOID') ? 'bg-red-100 text-red-700' : ''}
                        ${log.action.includes('CREATE') ? 'bg-blue-100 text-blue-700' : ''}
                        ${log.action.includes('SHIFT') ? 'bg-purple-100 text-purple-700' : ''}
                        ${!log.action.includes('VOID') && !log.action.includes('CREATE') && !log.action.includes('SHIFT') ? 'bg-gray-100 text-gray-700' : ''}
                      `}>
                        {log.action}
                      </span>
                    </div>

                    {/* Entitas */}
                    <div className="flex justify-between md:block text-gray-600">
                      <span className="md:hidden font-semibold text-gray-700">Entitas:</span>
                      <div className="text-right md:text-left">
                        <div>{log.entity}</div>
                        {log.entity_id && (
                          <span className="text-xs text-gray-400 font-mono" title={log.entity_id}>
                            {log.entity_id.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detail */}
                    <div className="mt-2 md:mt-0 bg-white md:bg-transparent border md:border-0 border-gray-100 rounded p-2 md:p-0">
                      <span className="md:hidden font-semibold text-gray-700 text-xs block mb-1">Detail:</span>
                      {parsedDetails ? (
                        typeof parsedDetails === 'object' ? (
                          <div className="space-y-1 text-xs text-gray-700 font-mono">
                            {Object.entries(parsedDetails).map(([k, v]) => (
                              <div key={k} className="flex gap-2">
                                <span className="font-semibold text-gray-900">{k.replace(/_/g, ' ')}:</span>
                                <span>{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-600 font-mono break-all">{String(parsedDetails)}</div>
                        )
                      ) : (
                        <div className="text-gray-400 text-xs">-</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
