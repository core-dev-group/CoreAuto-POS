"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteCashflow } from "@/app/(dashboard)/finance/cashflow/actions";

export function DeleteCashflowButton({ id }: { id: string }) {
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    if (confirm("Apakah Anda yakin ingin menghapus data arus kas ini?")) {
      setIsPending(true);
      try {
        await deleteCashflow(id);
      } catch (error: any) {
        alert(error.message || "Gagal menghapus arus kas");
        setIsPending(false);
      }
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 hover:text-red-900 transition-colors p-1"
      title="Hapus Data"
    >
      <Trash2 size={16} className={isPending ? "opacity-50" : ""} />
    </button>
  );
}
