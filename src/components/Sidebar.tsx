"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, Package, Store, Users, FileText, Wrench, ShoppingCart, ArrowLeftRight, Box, Receipt, Wallet, Banknote, History } from "lucide-react";
import { signOut } from "next-auth/react";
import { useConfirm } from "./ConfirmModalProvider";

export default function Sidebar({ session, onClick }: { session?: any, onClick?: () => void }) {
  const { confirm } = useConfirm();
  const pathname = usePathname();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    confirm({
      title: "Konfirmasi Keluar",
      message: "Apakah Anda yakin ingin keluar dari Bengkelin? Anda harus login kembali untuk mengakses sistem.",
      confirmText: "Ya, Keluar",
      danger: true,
      onConfirm: () => signOut({ callbackUrl: "/login" }),
    });
  };

  const formatRole = (role?: string) => {
    if (!role) return "";
    if (role === "SUPER_ADMIN") return "Owner";
    if (role === "KEPALA_CABANG") return "Kepala Bengkel";
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="w-60 bg-gray-900 text-white flex flex-col h-full shrink-0">
      <div className="p-4 text-xl font-bold border-b border-gray-800 flex items-center gap-3">
        <div className="p-0.5 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-sm shrink-0">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-[6px] object-cover" />
        </div>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-blue-200">CoreAuto POS</span>
      </div>
      <div className="p-4 text-sm text-gray-400 border-b border-gray-800 bg-gray-900/50">
        <p className="font-semibold text-gray-300 truncate">{session?.user?.name}</p>
        <p className="text-xs mt-0.5">
          {formatRole(session?.user?.role)}
        </p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto text-sm">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1 mb-2 mt-2">Utama</div>
        {session?.user?.role !== "KASIR" && (
          <Link onClick={onClick} href="/" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname === "/" ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`}>
            <Home size={18} /> Dashboard
          </Link>
        )}
        <Link onClick={onClick} href="/pos" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname === "/pos" ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`}>
          <ShoppingCart size={18} /> Point of Sale
        </Link>
        <Link onClick={onClick} href="/pos/shift" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname.startsWith("/pos/shift") ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`}>
          <Wallet size={18} /> Tutup Kasir / Shift
        </Link>
        
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1 mb-2 mt-6">Transaksi</div>
        <Link onClick={onClick} href="/invoice" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname.startsWith("/invoice") ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`}>
          <Receipt size={18} /> Riwayat Invoice
        </Link>
        
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1 mb-2 mt-6">Inventaris</div>
        <Link onClick={onClick} href="/stok" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname.startsWith("/stok") ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`}>
          <Box size={18} /> Stok Cabang
        </Link>
        {session?.user?.role !== "KASIR" && (
          <Link onClick={onClick} href="/mutasi" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname.startsWith("/mutasi") ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`}>
            <ArrowLeftRight size={18} /> Mutasi Stok
          </Link>
        )}
        <Link onClick={onClick} href="/permintaan-barang" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname.startsWith("/permintaan-barang") ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`}>
          <Package size={18} /> Permintaan Barang
        </Link>

        {(session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "KEPALA_CABANG") && (
          <>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1 mb-2 mt-6">Keuangan</div>
            <Link onClick={onClick} href="/finance/cashflow" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname.startsWith("/finance/cashflow") ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`}>
              <Wallet size={18} /> Arus Kas
            </Link>
            <Link onClick={onClick} href="/finance/commission" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname.startsWith("/finance/commission") ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`}>
              <Banknote size={18} /> Komisi Mekanik
            </Link>
          </>
        )}

        {(session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "KEPALA_CABANG" || session?.user?.role === "ADMIN_GUDANG_PUSAT") && (
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1 mb-2 mt-6">Master Data</div>
        )}

        {(session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "KEPALA_CABANG") && (
          <Link onClick={onClick} href="/cabang" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname.startsWith("/cabang") ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`}>
            <Store size={18} /> Cabang
          </Link>
        )}
        
        {(session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "KEPALA_CABANG" || session?.user?.role === "ADMIN_GUDANG_PUSAT") && (
          <Link onClick={onClick} href="/barang" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname.startsWith("/barang") ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`}>
            <Package size={18} /> Barang
          </Link>
        )}
        {(session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "KEPALA_CABANG") && (
          <>
            <Link onClick={onClick} href="/servis" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname.startsWith("/servis") ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`}>
              <Wrench size={18} /> Jasa Servis
            </Link>
            <Link onClick={onClick} href="/mekanik" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname.startsWith("/mekanik") ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`}>
              <Users size={18} /> Mekanik
            </Link>
          </>
        )}
        {session?.user?.role === "SUPER_ADMIN" && (
          <Link onClick={onClick} href="/pengguna" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname.startsWith("/pengguna") ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`}>
            <Users size={18} /> Pengguna
          </Link>
        )}
        
        {(session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "KEPALA_CABANG") && (
          <>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1 mb-2 mt-6">Laporan</div>
            <Link onClick={onClick} href="/laporan" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname === "/laporan" ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`}>
              <FileText size={18} /> Laba / Rugi
            </Link>
            {session?.user?.role === "SUPER_ADMIN" && (
              <Link onClick={onClick} href="/laporan/audit" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname.startsWith("/laporan/audit") ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`}>
                <History size={18} /> Log Aktivitas
              </Link>
            )}
          </>
        )}
      </nav>
      <div className="p-4 border-t border-gray-800 space-y-2">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-900/50 text-red-400 transition-colors text-sm font-medium">
          <LogOut size={18} /> Keluar
        </button>
        <div className="text-[10px] text-center text-gray-500 font-medium tracking-wider uppercase pt-1">
          Powered by <a href="https://core-dev-group.my.id" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white font-semibold underline decoration-dotted transition-colors">Core Dev Group</a>
        </div>
      </div>
    </div>
  );
}
