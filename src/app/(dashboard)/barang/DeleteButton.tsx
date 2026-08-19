"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteProduct } from "./actions";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/components/ConfirmModalProvider";

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const { confirm } = useConfirm();

  const handleDelete = () => {
    confirm({
      title: "Hapus Barang",
      message: "Apakah Anda yakin ingin menghapus barang ini? Tindakan ini tidak dapat dibatalkan.",
      danger: true,
      onConfirm: async () => {
        return new Promise<void>((resolve) => {
          startTransition(async () => {
            try {
              await deleteProduct(id);
              toast.success("Barang berhasil dihapus");
            } catch (error: any) {
              toast.error("Gagal menghapus barang");
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
