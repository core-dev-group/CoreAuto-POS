"use client";

import { useState } from "react";
import { Menu, X, User, Home } from "lucide-react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

interface POSMobileMenuProps {
  user: { name?: string | null; role?: string | null };
}

export default function POSMobileMenu({ user }: POSMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 top-16 z-40 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-16 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-xl flex flex-col p-4 gap-4 animate-in slide-in-from-top-2 duration-200">
            {/* User Profile Card */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-100/50">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <User size={20} />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-gray-900 leading-none">
                  {user.name?.replace(/\s*\(Kasir\)\s*/i, '')}
                </span>
                {user.role !== "KASIR" && (
                  <span className="text-[10px] text-gray-500 font-bold tracking-wide mt-1 uppercase">
                    {user.role?.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-col gap-2">
              {user.role !== "KASIR" && (
                <Link 
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-blue-600 rounded-xl transition-all"
                >
                  <Home size={18} className="text-gray-400" />
                  Dashboard Admin
                </Link>
              )}
              <div onClick={() => setIsOpen(false)} className="w-full">
                <LogoutButton className="w-full justify-center py-3" forceShowText={true} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
