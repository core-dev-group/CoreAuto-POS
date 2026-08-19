"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteBranch } from "./actions";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/components/ConfirmModalProvider";

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const { confirm } = useConfirm();

  const handleDelete = () => {
    confirm({
      title: "Hapus Cabang",
      message: "Apakah Anda yakin ingin menghapus cabang ini? Tindakan ini tidak dapat dibatalkan.",
      danger: true,
      onConfirm: async () => {
        return new Promise<void>((resolve) => {
          startTransition(async () => {
            try {
              await deleteBranch(id);
              toast.success("Cabang berhasil dihapus");
            } catch (error: any) {
              toast.error("Gagal menghapus cabang");
            } finally {
              resolve();
            }
          });
        });
      },
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`text-gray-400 transition-colors ${
        isPending ? "opacity-50 cursor-not-allowed" : "hover:text-red-600"
      }`}
      title="Hapus"
    >
      <Trash2 size={18} />
    </button>
  );
}
