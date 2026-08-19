import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { openShift, closeShift } from "./actions";
import { Wallet, LogIn, LogOut, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { CloseShiftForm } from "./CloseShiftForm";

export const metadata = {
  title: "Tutup Kasir (Shift) | CoreAuto POS",
};

export default async function ShiftPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.branchId) {
    redirect("/");
  }

  const shift = await prisma.cashierShift.findFirst({
    where: {
      user_id: session.user.id,
      branch_id: session.user.branchId,
      status: "OPEN"
    },
    include: {
      transactions: true
    }
  });

  const allShifts = await prisma.cashierShift.findMany({
    where: {
      user_id: session.user.id,
      branch_id: session.user.branchId,
    },
    orderBy: {
      start_time: "desc"
    },
    take: 10
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Kasir (Shift)</h1>
        <p className="text-sm text-gray-500 mt-1">Buka shift sebelum melayani pelanggan, dan tutup shift saat selesai.</p>
      </div>

      {!shift ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
            <LogIn size={32} />
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Buka Shift Kasir</h2>
          <p className="text-center text-sm text-gray-500 mb-6">Anda belum memulai shift. Silakan masukkan uang modal tunai yang ada di laci kasir saat ini.</p>
          
          <form action={openShift} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Uang Modal (Starting Cash)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                <input 
                  type="number" 
                  name="starting_cash" 
                  required
                  min="0"
                  defaultValue="0"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors">
              Buka Shift Sekarang
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-blue-50 text-blue-900">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold">Shift Sedang Aktif</h2>
                  <p className="text-sm text-blue-700 mt-1">
                    Dimulai: {format(new Date(shift.start_time), "dd MMM yyyy, HH:mm", { locale: localeId })}
                  </p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  OPEN
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-blue-200 text-sm">
                <div className="flex justify-between">
                  <span>Uang Modal (Awal):</span>
                  <span className="font-semibold">Rp {shift.starting_cash.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pemasukan Tunai:</span>
                  <span className="font-semibold text-green-700">+ Rp {shift.transactions.filter(t => t.payment_method === "CASH" && t.status === "SELESAI").reduce((s, t) => s + t.total, 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="pt-3 border-t border-blue-200 flex justify-between items-center">
                  <span className="font-bold">Estimasi Uang Laci:</span>
                  <span className="text-xl font-bold">
                    Rp {(shift.starting_cash + shift.transactions.filter(t => t.payment_method === "CASH" && t.status === "SELESAI").reduce((s, t) => s + t.total, 0)).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Tutup Shift Sekarang</h3>
              <CloseShiftForm />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800">10 Riwayat Shift Terakhir Anda</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {allShifts.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">Belum ada riwayat shift.</div>
              ) : (
                allShifts.map(s => (
                  <div key={s.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm text-gray-900">
                        {format(new Date(s.start_time), "dd MMM yy, HH:mm", { locale: localeId })} 
                        {s.end_time ? ` - ${format(new Date(s.end_time), "HH:mm")}` : " - Sekarang"}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${s.status === "OPEN" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {s.status}
                      </span>
                    </div>
                    {s.status === "CLOSED" && (
                      <div className="text-xs text-gray-600 grid grid-cols-2 gap-x-4 gap-y-1">
                        <div>Sistem: <span className="font-medium">Rp {s.expected_ending_cash?.toLocaleString("id-ID")}</span></div>
                        <div>Fisik: <span className="font-medium">Rp {s.actual_ending_cash?.toLocaleString("id-ID")}</span></div>
                        <div className="col-span-2 mt-1">
                          Selisih: <span className={`font-bold ${!s.difference || s.difference === 0 ? "text-green-600" : s.difference > 0 ? "text-blue-600" : "text-red-600"}`}>
                            {s.difference && s.difference > 0 ? "+" : ""}Rp {s.difference?.toLocaleString("id-ID") || 0}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
