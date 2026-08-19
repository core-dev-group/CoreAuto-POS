"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, PackageCheck } from "lucide-react";
import { approveRequest, receiveRequest, rejectRequest, forwardRequest } from "./actions";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/components/ConfirmModalProvider";

export default function ActionButtons({ request, isCentralAdmin, isBranchAdmin }: { request: any, isCentralAdmin: boolean, isBranchAdmin?: boolean }) {
  const [loading, setLoading] = useState(false);
  const { confirm } = useConfirm();

  const handleApprove = () => {
    confirm({
      title: "Setujui Permintaan",
      message: `Anda akan mengirimkan ${request.quantity} unit ${request.product.name} ke ${request.to_branch_name}. Stok Pusat akan otomatis dikurangi. Lanjutkan?`,
      confirmText: "Ya, Kirim Barang",
      onConfirm: async () => {
        setLoading(true);
        try {
          await approveRequest(request.id);
          toast.success("Permintaan disetujui, barang dalam status pengiriman.");
        } catch (error: any) {
          toast.error(error.message || "Gagal menyetujui permintaan");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleReject = () => {
    const reason = window.prompt("Masukkan alasan penolakan permintaan ini:");
    if (reason === null) return; // user cancelled
    if (reason.trim() === "") {
      toast.error("Alasan penolakan wajib diisi");
      return;
    }
    
    confirm({
      title: "Konfirmasi Penolakan",
      message: `Tolak permintaan ini dengan alasan: "${reason}"?`,
      confirmText: "Ya, Tolak",
      danger: true,
      onConfirm: async () => {
        setLoading(true);
        try {
          await rejectRequest(request.id, reason.trim());
          toast.success("Permintaan berhasil ditolak");
        } catch (error: any) {
          toast.error(error.message || "Gagal menolak permintaan");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleReceive = () => {
    confirm({
      title: "Terima Barang",
      message: `Konfirmasi bahwa Anda telah menerima ${request.quantity} unit ${request.product.name} secara fisik. Stok cabang akan bertambah.`,
      confirmText: "Ya, Terima Barang",
      onConfirm: async () => {
        setLoading(true);
        try {
          await receiveRequest(request.id);
          toast.success("Barang berhasil diterima dan stok bertambah.");
        } catch (error: any) {
          toast.error(error.message || "Gagal menerima barang");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleForward = () => {
    confirm({
      title: "Teruskan Permintaan",
      message: `Teruskan permintaan ${request.quantity} unit ${request.product.name} ini ke Gudang Pusat?`,
      confirmText: "Ya, Teruskan",
      onConfirm: async () => {
        setLoading(true);
        try {
          await forwardRequest(request.id);
          toast.success("Permintaan diteruskan ke Pusat");
        } catch (error: any) {
          toast.error(error.message || "Gagal meneruskan permintaan");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  if (request.status === "PENDING" && isCentralAdmin) {
    return (
      <div className="flex items-center justify-end gap-2">
        <button 
          onClick={handleApprove}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <CheckCircle2 size={14} /> Kirim
        </button>
        <button 
          onClick={handleReject}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <XCircle size={14} /> Tolak
        </button>
      </div>
    );
  }

  if (request.status === "DIKIRIM" && !isCentralAdmin) {
    return (
      <div className="flex items-center justify-end">
        <button 
          onClick={handleReceive}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <PackageCheck size={14} /> Terima
        </button>
      </div>
    );
  }

  if (request.status === "MENUNGGU_CABANG" && isBranchAdmin) {
    return (
      <div className="flex items-center justify-end gap-2">
        <button 
          onClick={handleForward}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <CheckCircle2 size={14} /> Teruskan ke Pusat
        </button>
        <button 
          onClick={handleReject}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <XCircle size={14} /> Tolak
        </button>
      </div>
    );
  }

  return <div className="text-xs text-gray-400 text-right">-</div>;
}
