"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";

export default function AutoPrint() {
  const router = useRouter();

  useEffect(() => {
    // Attempt auto-print after DOM is ready
    const timer = setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.error("Print dialog blocked or failed:", e);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-4 left-4 right-4 print:hidden flex justify-between items-center z-50">
      <button 
        type="button"
        onClick={() => { window.location.href = "/pos"; }}
        className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg font-medium transition-all cursor-pointer"
      >
        <ArrowLeft size={18} /> Kembali ke Kasir
      </button>

      <button 
        type="button"
        onClick={() => { window.print(); }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg font-medium transition-all cursor-pointer"
      >
        <Printer size={18} /> Cetak Struk
      </button>
    </div>
  );
}
