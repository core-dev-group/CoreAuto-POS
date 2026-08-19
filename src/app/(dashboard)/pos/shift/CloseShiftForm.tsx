"use client";

import { LogOut } from "lucide-react";
import { closeShift } from "./actions";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useConfirm } from "@/components/ConfirmModalProvider";

export function CloseShiftForm() {
  const [isPending, setIsPending] = useState(false);
  const { confirm } = useConfirm();

  async function executeSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await closeShift(formData);
      // Automatically log out after closing shift
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error(error);
      alert("Gagal menutup shift.");
      setIsPending(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const actualEndingCash = formData.get("actual_ending_cash");
    
    confirm({
      title: "Konfirmasi Tutup Shift",
      message: `Apakah Anda yakin ingin menutup shift ini dengan hasil uang fisik sebesar Rp ${Number(actualEndingCash).toLocaleString("id-ID")}? Anda akan otomatis logout setelah proses ini selesai.`,
      confirmText: "Tutup & Keluar",
      danger: true,
      onConfirm: () => executeSubmit(formData)
    });
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Total Uang Fisik di Laci</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
          <input 
            type="number" 
            name="actual_ending_cash" 
            required
            min="0"
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-red-500 font-medium"
            placeholder="Masukkan jumlah hasil hitungan fisik..."
            disabled={isPending}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Hitung seluruh uang tunai yang ada di laci kasir saat ini.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
        <textarea 
          name="notes" 
          rows={2}
          className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-red-500 text-sm"
          placeholder="Contoh: Ada selisih Rp 5.000 karena kembalian kurang..."
          disabled={isPending}
        />
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
      >
        <LogOut size={18} /> {isPending ? "Menutup..." : "Tutup Shift & Keluar"}
      </button>
    </form>
  );
}
