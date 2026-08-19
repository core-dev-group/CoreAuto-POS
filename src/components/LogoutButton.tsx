"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useConfirm } from "./ConfirmModalProvider";

interface LogoutButtonProps {
  className?: string;
  forceShowText?: boolean;
}

export default function LogoutButton({ className = "", forceShowText = false }: LogoutButtonProps) {
  const { confirm } = useConfirm();

  const handleLogout = () => {
    confirm({
      title: "Keluar dari Sistem",
      message: "Apakah Anda yakin ingin keluar dari POS Bengkelin? Anda harus login kembali untuk masuk.",
      confirmText: "Ya, Keluar",
      danger: true,
      onConfirm: () => {
        signOut({ callbackUrl: "/login" });
      }
    });
  };

  return (
    <button 
      onClick={handleLogout}
      className={`flex items-center gap-2 px-3 md:px-4 py-1.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm hover:shadow transition-all ${className}`}
      title="Keluar"
    >
      <LogOut size={18} className={forceShowText ? "" : "md:w-4 md:h-4"} />
      <span className={forceShowText ? "" : "hidden md:inline"}>Keluar</span>
    </button>
  );
}
