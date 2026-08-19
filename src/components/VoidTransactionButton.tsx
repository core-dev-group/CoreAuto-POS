"use client";

import { useState } from "react";
import { XCircle, AlertTriangle } from "lucide-react";
import { voidTransaction } from "@/app/(dashboard)/invoice/[id]/actions";

export function VoidTransactionButton({ transactionId }: { transactionId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
      >
        <XCircle size={20} />
        Batalkan Transaksi
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle size={24} />
              <h2 className="text-xl font-bold">Batalkan Transaksi</h2>
            </div>
            
            <p className="text-gray-600 text-sm mb-6">
              Apakah Anda yakin ingin membatalkan transaksi ini? Stok barang akan dikembalikan, dan tindakan ini tidak dapat diurungkan serta akan dicatat di log aktivitas.
            </p>

            <form action={async (formData) => {
              setIsPending(true);
              try {
                const res = await voidTransaction(formData);
                if (res?.error) {
                  alert(res.error);
                } else {
                  // success
                  setIsOpen(false);
                }
              } catch (e) {
                console.error(e);
                alert("Terjadi kesalahan sistem.");
              } finally {
                setIsPending(false);
              }
            }}>
              <input type="hidden" name="id" value={transactionId} />
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Pembatalan</label>
                <textarea 
                  name="reason" 
                  required 
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-red-500 text-sm"
                  placeholder="Misal: Kasir salah input barang..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                >
                  {isPending ? "Memproses..." : "Konfirmasi Batal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
