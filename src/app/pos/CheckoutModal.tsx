"use client";

import { useState, useEffect, useRef } from "react";
import { X, CreditCard, Banknote, Wallet, Smartphone, Printer, Camera, Loader2 } from "lucide-react";
import { processCheckout, CartItem, searchVehicles } from "./actions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/ConfirmModalProvider";
import { createWorker, Worker } from "tesseract.js";

interface CheckoutModalProps {
  cart: CartItem[];
  subtotal: number;
  branchId: string;
  transactionId?: string;
  initialCustomerInfo?: any;
  onClose: (isDraftSaved?: boolean) => void;
}

export default function CheckoutModal({ cart, subtotal, branchId, transactionId, initialCustomerInfo, onClose }: CheckoutModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [cashReceived, setCashReceived] = useState<number | "">("");
  
  const [customerName, setCustomerName] = useState(initialCustomerInfo?.customerName || "");
  const [customerPhone, setCustomerPhone] = useState(initialCustomerInfo?.customerPhone || "");
  const [vehiclePlate, setVehiclePlate] = useState(initialCustomerInfo?.vehiclePlate || "");
  const [vehicleModel, setVehicleModel] = useState(initialCustomerInfo?.vehicleModel || "");
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [worker, setWorker] = useState<Worker | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let w: Worker;
    const initWorker = async () => {
      try {
        w = await createWorker('eng');
        setWorker(w);
      } catch (e) {
        console.warn("Failed to load OCR worker:", e);
      }
    };
    initWorker();

    return () => {
      if (w) w.terminate();
    };
  }, []);

  const handleCapturePlate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!worker) {
      toast.error("Sistem sedang memuat AI OCR, mohon tunggu beberapa detik lalu coba lagi...");
      return;
    }

    setIsScanning(true);
    const toastId = toast.loading("Membaca plat nomor...");

    try {
      const ret = await worker.recognize(file);
      const text = ret.data.text;
      
      // Extract Indonesian license plate (e.g., B 1234 CD, AB 12 C)
      const plateRegex = /([A-Z]{1,2})[\s\.\-]*(\d{1,4})[\s\.\-]*([A-Z]{0,3})/i;
      const match = text.match(plateRegex);

      if (match) {
        const parsedPlate = `${match[1]} ${match[2]} ${match[3]}`.trim().toUpperCase();
        setVehiclePlate(parsedPlate);
        toast.success(`Plat nomor terdeteksi: ${parsedPlate}`, { id: toastId });
        setShowSuggestions(true);
      } else {
        toast.error("Gagal mendeteksi plat nomor. Silakan ketik manual.", { id: toastId });
      }
    } catch (error) {
      console.warn(error);
      toast.error("Terjadi kesalahan saat membaca gambar.", { id: toastId });
    } finally {
      setIsScanning(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      if (vehiclePlate.length >= 2) {
        const results = await searchVehicles(vehiclePlate);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    };
    
    const timeout = setTimeout(fetchVehicles, 300);
    return () => clearTimeout(timeout);
  }, [vehiclePlate]);

  const selectVehicle = (vehicle: any) => {
    setVehiclePlate(vehicle.plate_number);
    setVehicleModel(vehicle.model || "");
    setCustomerName(vehicle.customer.name);
    setCustomerPhone(vehicle.customer.phone || "");
    setShowSuggestions(false);
  };

  const total = subtotal - discount + tax;
  const change = typeof cashReceived === "number" ? Math.max(0, cashReceived - total) : 0;

  const { confirm } = useConfirm();

  const handleCheckout = async (isDraft: boolean) => {
    // Validate JASA has mechanic assigned
    const unassignedJasa = cart.find(i => i.type === "JASA" && !i.mechanic_id);
    if (unassignedJasa) {
      toast.error(`Mekanik belum dipilih untuk jasa: ${unassignedJasa.name}`);
      return;
    }

    if (!isDraft && paymentMethod === "CASH") {
      if (cashReceived === "" || cashReceived < total) {
        toast.error("Uang tunai yang diterima kurang dari total tagihan!");
        return;
      }
    }

    const confirmTitle = isDraft ? "Simpan SPK" : "Konfirmasi Pembayaran";
    const confirmMessage = isDraft 
      ? "Simpan antrean ini agar mekanik dapat bekerja?" 
      : `Apakah Anda yakin ingin memproses pembayaran ini dengan total Rp ${total.toLocaleString("id-ID")}?`;
    const confirmBtn = isDraft ? "Simpan" : "Ya, Proses";

    confirm({
      title: confirmTitle,
      message: confirmMessage,
      confirmText: confirmBtn,
      onConfirm: async () => {
        setLoading(true);
        try {
          const invoiceId = await processCheckout({
            transaction_id: transactionId,
            is_draft: isDraft,
            branch_id: branchId,
            customer_name: customerName,
            customer_phone: customerPhone,
            vehicle_plate: vehiclePlate,
            vehicle_model: vehicleModel,
            cart,
            discount,
            tax,
            payment_method: paymentMethod
          });

          toast.success(isDraft ? "SPK Berhasil Disimpan!" : "Transaksi berhasil! Mengalihkan ke halaman cetak...");
          
          if (isDraft) {
            onClose(true);
            setLoading(false);
          } else {
            // Force a hard navigation to ensure print styles load perfectly and 
            // the user sees the browser loading indicator immediately.
            window.location.href = `/print/invoice/${invoiceId}`;
          }
        } catch (err: any) {
          toast.error(err.message || "Gagal memproses transaksi");
          setLoading(false);
        }
      }
    });
  };

  const paymentMethods = [
    { id: "CASH", label: "Tunai", icon: Banknote },
    { id: "TRANSFER", label: "Transfer", icon: Wallet },
    { id: "DEBIT", label: "Debit/Kredit", icon: CreditCard },
    { id: "QRIS", label: "QRIS", icon: Smartphone },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Pembayaran</h2>
          <button onClick={() => onClose(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Customer Info Form */}
          <div className="flex-1 space-y-5">
            <h3 className="font-semibold text-gray-900 text-lg mb-4">Informasi Pelanggan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan</label>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Opsional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. HP / WA</label>
                <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Opsional" />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Plat Nomor Kendaraan (Ketik untuk mencari)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={vehiclePlate} 
                    onChange={e => { 
                      setVehiclePlate(e.target.value.toUpperCase()); 
                      setShowSuggestions(true); 
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full p-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase" 
                    placeholder="e.g. B 1234 ABC" 
                  />
                  <button
                    type="button"
                    title="Scan Plat Nomor"
                    disabled={isScanning}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  </button>
                  <input 
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handleCapturePlate}
                    className="hidden"
                  />
                </div>
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {suggestions.map((v) => (
                      <div 
                        key={v.plate_number} 
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                        onClick={() => selectVehicle(v)}
                      >
                        <div className="font-semibold text-gray-900">{v.plate_number}</div>
                        <div className="text-sm text-gray-500 flex justify-between">
                          <span>{v.customer.name}</span>
                          <span>{v.model}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Kendaraan</label>
                <input type="text" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Honda Beat" />
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 text-lg mb-4 mt-8">Metode Pembayaran</h3>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map(pm => {
                const Icon = pm.icon;
                return (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex items-center justify-center gap-2 md:gap-3 p-3 md:p-4 border rounded-xl font-semibold transition-all ${
                      paymentMethod === pm.id 
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" 
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/30"
                    }`}
                  >
                    <Icon className="w-5 h-5 md:w-6 md:h-6" /> 
                    <span className="text-sm md:text-base">{pm.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[350px] bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200 h-fit shrink-0">
            <h3 className="font-semibold text-gray-900 text-lg mb-4">Ringkasan Tagihan</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.length} item)</span>
                <span className="font-medium text-gray-900">Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Diskon</span>
                <div className="flex items-center gap-2">
                  <span>- Rp</span>
                  <input type="number" value={discount || ''} onChange={e => setDiscount(Number(e.target.value))} className="w-24 p-1.5 text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium" />
                </div>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Pajak (Opsional)</span>
                <div className="flex items-center gap-2">
                  <span>+ Rp</span>
                  <input type="number" value={tax || ''} onChange={e => setTax(Number(e.target.value))} className="w-24 p-1.5 text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium" />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-900 font-bold text-lg">Total Bayar</span>
                <span className="text-blue-600 font-black text-2xl">Rp {total.toLocaleString("id-ID")}</span>
              </div>
              
              {paymentMethod === "CASH" && (
                <div className="space-y-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 text-sm font-medium">Uang Diterima</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-500">Rp</span>
                      <input 
                        type="number" 
                        value={cashReceived} 
                        onChange={e => setCashReceived(e.target.value ? Number(e.target.value) : "")}
                        className="w-28 p-1.5 text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-bold" 
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 text-sm font-medium">Kembalian</span>
                    <span className="text-green-600 font-bold text-lg">
                      Rp {change.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                disabled={loading}
                onClick={() => handleCheckout(true)}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                {loading ? <span>Memproses...</span> : (transactionId ? "Update SPK" : "Simpan SPK (Antrean)")}
              </button>

              <button
                disabled={loading}
                onClick={() => handleCheckout(false)}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                {loading ? (
                  <span>Memproses...</span>
                ) : (
                  <>
                    <Printer size={20} /> Bayar & Cetak
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
