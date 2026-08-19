"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { AlertCircle, X } from "lucide-react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  danger?: boolean; // Jika true, tombol akan berwarna merah
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isProcessing) return;
    setIsOpen(false);
    setTimeout(() => {
      setOptions(null);
    }, 200); // Menunggu transisi
  };

  const handleConfirm = async () => {
    if (!options) return;
    
    setIsProcessing(true);
    try {
      await options.onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setOptions(null);
      }, 200);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {isOpen && options && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-full ${options.danger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  <AlertCircle size={24} />
                </div>
                <button 
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {options.title}
              </h3>
              <p className="text-gray-600 mb-8">
                {options.message}
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {options.cancelText || "Batal"}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className={`px-4 py-2 text-white font-medium rounded-lg transition-colors flex items-center justify-center min-w-[100px] disabled:opacity-50 ${
                    options.danger 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    options.confirmText || "Konfirmasi"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error("useConfirm must be used within a ConfirmModalProvider");
  }
  return context;
}
