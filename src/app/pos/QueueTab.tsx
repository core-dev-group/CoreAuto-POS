"use client";

import { useState, useEffect } from "react";
import { Clock, Car, Wrench, Trash2, X, ShoppingCart, User } from "lucide-react";
import { getActiveTransactions, deleteTransaction } from "./actions";
import { useConfirm } from "@/components/ConfirmModalProvider";
import { toast } from "react-hot-toast";
import CheckoutModal from "./CheckoutModal";

interface QueueTabProps {
  branchId: string;
  onSelect: (transactionId: string) => void;
}

export default function QueueTab({ branchId, onSelect }: QueueTabProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailTx, setDetailTx] = useState<any | null>(null);
  const [checkoutTx, setCheckoutTx] = useState<any | null>(null);
  const { confirm } = useConfirm();

  const fetchQueue = async () => {
    try {
      const data = await getActiveTransactions(branchId);
      setTransactions(data);
      // Update detailTx if it's currently open
      if (detailTx) {
        const updated = data.find(t => t.id === detailTx.id);
        if (updated) setDetailTx(updated);
        else setDetailTx(null);
      }
    } catch (error) {
      console.warn("Failed to load active transactions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [branchId]);

  const handleDelete = (e: React.MouseEvent, txId: string, vehiclePlate: string) => {
    e.stopPropagation();
    confirm({
      title: "Batalkan Antrean / SPK",
      message: `Apakah Anda yakin ingin membatalkan SPK untuk kendaraan ${vehiclePlate || "Tanpa Kendaraan"}? Stok akan dikembalikan dan SPK akan tercatat sebagai dibatalkan.`,
      confirmText: "Ya, Batalkan",
      danger: true,
      onConfirm: async () => {
        try {
          await deleteTransaction(txId);
          toast.success("SPK berhasil dibatalkan!");
          if (detailTx?.id === txId) setDetailTx(null);
          fetchQueue();
        } catch (error: any) {
          toast.error(error.message || "Gagal membatalkan SPK");
        }
      }
    });
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <Clock className="text-blue-600 w-6 h-6 md:w-7 md:h-7" />
        <h2 className="text-lg md:text-2xl font-bold text-gray-900">Daftar Antrean (SPK Aktif)</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Memuat antrean...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20 text-gray-500 flex flex-col items-center">
            <Clock size={64} className="mb-4 text-gray-300" />
            <p className="text-lg">Tidak ada antrean / SPK aktif saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                onClick={() => setDetailTx(tx)}
                className="bg-white border border-gray-100 rounded-lg md:rounded-2xl p-3.5 md:p-5 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full relative overflow-hidden shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex justify-between items-start mb-2 md:mb-3">
                  <div className="font-bold text-base md:text-xl text-gray-900 group-hover:text-blue-700 leading-tight">
                    {tx.vehicle_plate || "Tanpa Kendaraan"}
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="text-[10px] md:text-sm font-medium text-blue-700 bg-blue-50 px-2 py-0.5 md:py-1 rounded-full border border-blue-100">
                      {tx.invoice_number}
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, tx.id, tx.vehicle_plate)}
                      className="p-1.5 md:p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Batalkan SPK"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
                <div className="relative z-10 text-xs md:text-sm text-gray-600 flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4">
                  <Car className="w-4 h-4 text-gray-400" /> {tx.customer?.name || "Pelanggan Umum"}
                </div>
                <div className="relative z-10 mt-auto border-t border-gray-100 pt-2.5 md:pt-3 flex justify-between items-center text-xs md:text-sm">
                  <div className="text-gray-500 flex items-center gap-1">
                    <Wrench className="w-3 h-3 md:w-4 md:h-4 text-gray-400" /> {tx.items.length} Item
                  </div>
                  <div className="font-bold text-base md:text-lg text-gray-900">
                    Rp {tx.subtotal.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="text-blue-600" size={24} /> Detail Antrean
                </h2>
                <div className="text-sm text-gray-500 mt-1">SPK: {detailTx.invoice_number}</div>
              </div>
              <button onClick={() => setDetailTx(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6">
              <div className="grid grid-cols-2 gap-4 mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">KENDARAAN</div>
                  <div className="font-bold text-gray-900">{detailTx.vehicle_plate || "-"}</div>
                  <div className="text-sm text-gray-600">{detailTx.vehicle_model || "Model tidak ada"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">PELANGGAN</div>
                  <div className="font-bold text-gray-900">{detailTx.customer?.name || "-"}</div>
                  <div className="text-sm text-gray-600">{detailTx.customer?.phone || "-"}</div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Daftar Item ({detailTx.items.length})</h3>
              <div className="space-y-3">
                {detailTx.items.map((item: any) => (
                  <div key={item.id} className="flex flex-col gap-2 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {item.product_id ? item.product?.name : item.service_item?.name}
                        </div>
                        {item.product_id && item.product?.sku && (
                          <div className="text-xs text-gray-500">{item.product.sku}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">Rp {item.subtotal.toLocaleString("id-ID")}</div>
                        <div className="text-xs text-gray-500">{item.quantity} x {item.unit_price.toLocaleString("id-ID")}</div>
                      </div>
                    </div>
                    {item.mechanic_id && (
                      <div className="mt-1 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 p-1.5 rounded-lg w-fit">
                        <User size={14} className="text-blue-600" />
                        Mekanik: <span className="font-semibold text-gray-900">{item.mechanic?.name || "ID: " + item.mechanic_id}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 md:p-6 border-t border-gray-100 bg-white shrink-0 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Estimasi Subtotal</div>
                <div className="text-2xl font-black text-gray-900">Rp {detailTx.subtotal.toLocaleString("id-ID")}</div>
              </div>
                <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                  <button
                    onClick={() => {
                      onSelect(detailTx.id);
                      setDetailTx(null);
                    }}
                    className="flex-1 sm:flex-none py-3 px-4 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Wrench size={20} /> Ubah Item
                  </button>
                  <button
                    onClick={() => {
                      setCheckoutTx(detailTx);
                    }}
                    className="flex-1 sm:flex-none py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} /> Bayar Tagihan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {checkoutTx && (
          <CheckoutModal 
            cart={checkoutTx.items.map((i: any) => ({
              id: Math.random().toString(36).substr(2, 9),
              type: i.product_id ? "BARANG" : "JASA",
              item_id: i.product_id || i.service_item_id,
              name: i.product?.name || i.service_item?.name,
              sku: i.product?.sku,
              price: i.unit_price,
              quantity: i.quantity,
              mechanic_id: i.mechanic_id || undefined
            }))}
            subtotal={checkoutTx.subtotal}
            branchId={branchId}
            transactionId={checkoutTx.id}
            initialCustomerInfo={{
              customerName: checkoutTx.customer?.name || "",
              customerPhone: checkoutTx.customer?.phone || "",
              vehiclePlate: checkoutTx.vehicle_plate || "",
              vehicleModel: checkoutTx.vehicle_model || ""
            }}
            onClose={(isDraftSaved) => {
              setCheckoutTx(null);
              const wasSuccessful = typeof isDraftSaved === "boolean" ? isDraftSaved : false;
              if (wasSuccessful) {
                setDetailTx(null);
                fetchQueue();
              }
            }}
          />
        )}
      </div>
    );
  }
