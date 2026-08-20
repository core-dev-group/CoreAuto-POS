"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

export function InstallPrompt() {
  const [isReady, setIsReady] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsReady(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsReady(false);
  };

  if (!isReady) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gray-900 text-white p-4 rounded-xl shadow-2xl z-50 flex items-start gap-4">
      <div className="flex-1">
        <h3 className="font-bold text-sm">Install CoreAuto POS</h3>
        <p className="text-xs text-gray-300 mt-1">Tambahkan ke layar utama untuk pengalaman seperti aplikasi native.</p>
        <button 
          onClick={handleInstallClick}
          className="mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Download size={16} />
          Install Sekarang
        </button>
      </div>
      <button 
        onClick={() => setIsReady(false)}
        className="text-gray-400 hover:text-white transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
}
