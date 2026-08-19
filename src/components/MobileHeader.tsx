"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";

export default function MobileHeader({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="md:hidden bg-gray-900 text-white h-14 flex items-center justify-between px-4 shrink-0">
        <div className="font-bold text-lg">CoreAuto POS</div>
        <button onClick={() => setIsOpen(true)} className="p-2 -mr-2">
          <Menu size={24} />
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="relative z-10 w-60 h-full bg-gray-900 flex flex-col shadow-2xl">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white bg-gray-800 rounded-full"
            >
              <X size={20} />
            </button>
            <Sidebar session={session} onClick={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
