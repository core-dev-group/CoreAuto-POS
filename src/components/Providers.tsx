"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { Toaster } from "react-hot-toast";
import { ConfirmModalProvider } from "./ConfirmModalProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ConfirmModalProvider>
        {children}
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              maxWidth: '90vw',
              fontSize: '14px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
          }}
        />
      </ConfirmModalProvider>
    </SessionProvider>
  );
}
