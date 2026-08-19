"use client";

import Link from "next/link";
import { useConfirm } from "@/components/ConfirmModalProvider";
import { toast } from "react-hot-toast";
import { deleteUser } from "./[id]/edit/actions";
import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";

export function UserActionButtons({ user, currentUserId }: { user: any, currentUserId: string }) {
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    confirm({
      title: "Hapus Pengguna",
      message: `Apakah Anda yakin ingin menghapus pengguna "${user.name}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Hapus",
      danger: true,
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteUser(user.id);
          toast.success("Pengguna berhasil dihapus");
        } catch (error: any) {
          toast.error(error.message || "Gagal menghapus pengguna");
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-3">
      <Link 
        href={`/pengguna/${user.id}/edit`}
        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        title="Edit"
      >
        <Edit2 size={16} />
      </Link>
      
      {currentUserId !== user.id && (
        <button 
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
          title="Hapus"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
