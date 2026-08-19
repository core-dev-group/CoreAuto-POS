"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, ShoppingCart, Plus, Minus, Trash2, User, Wrench, Package, Store, Clock, X, ChevronDown, Monitor, ListOrdered, LayoutDashboard, LogOut, Menu } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import CheckoutModal from "./CheckoutModal";
import QueueTab from "./QueueTab";
import { CartItem, getTransactionById, deleteTransaction } from "./actions";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/components/ConfirmModalProvider";

type ProductType = { id: string; name: string; sku: string; sell_price: number; stock_quantity: number };
type ServiceType = { id: string; name: string; default_price: number };

interface POSClientProps {
  branches: { id: string; name: string }[];
  activeBranchId: string;
  mechanics: { id: string; name: string }[];
  services: ServiceType[];
  products: ProductType[];
  userRole?: string;
}

function CustomSelect({ value, onChange, options, placeholder, className = "", buttonClassName = "" }: { 
  value: string; 
  onChange: (val: string) => void; 
  options: {id: string, name: string}[]; 
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, placeAbove: false });
  const selectedOption = options.find(o => o.id === value);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        if (menuRef.current && menuRef.current.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleScroll() {
      if (isOpen) setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isOpen]);

  const handleOpen = () => {
    if (!isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove = spaceBelow < 240 && rect.top > 240;
      
      setCoords({
        left: rect.left,
        width: rect.width,
        top: placeAbove ? rect.top - 4 : rect.bottom + 4,
        placeAbove
      });
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={handleOpen}
        className={`w-full flex items-center justify-between text-left border border-gray-300 rounded-lg outline-none bg-white focus:border-blue-500 transition-all ${buttonClassName}`}
      >
        <span className={`block truncate ${selectedOption ? "text-gray-900 font-medium" : "text-gray-500"}`}>
          {selectedOption ? selectedOption.name : placeholder || "Pilih..."}
        </span>
        <ChevronDown size={16} className={`text-gray-500 shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={menuRef}
          className="fixed z-[9999] bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in duration-200"
          style={{
            left: coords.left,
            top: coords.placeAbove ? 'auto' : coords.top,
            bottom: coords.placeAbove ? window.innerHeight - coords.top + 8 : 'auto',
            width: coords.width,
          }}
        >
          {placeholder && (
            <div
              className="p-3 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
              onClick={() => { onChange(""); setIsOpen(false); }}
            >
              {placeholder}
            </div>
          )}
          {options.map(opt => (
            <div
              key={opt.id}
              className={`p-3 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors ${value === opt.id ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600' : 'text-gray-700 border-l-2 border-transparent'}`}
              onClick={() => { onChange(opt.id); setIsOpen(false); }}
            >
              {opt.name}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

export default function POSClient({ branches, activeBranchId, mechanics, services, products, userRole }: POSClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState("");
  const [activeMainTab, setActiveMainTab] = useState<"POS" | "ANTREAN">("POS");
  const [activeTab, setActiveTab] = useState<"BARANG" | "JASA">("BARANG");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);
  const [initialCustomerInfo, setInitialCustomerInfo] = useState<any>(null);
  const { confirm } = useConfirm();

  const handleLogout = () => {
    confirm({
      title: "Konfirmasi Keluar",
      message: "Apakah Anda yakin ingin keluar dari halaman Kasir?",
      onConfirm: () => signOut({ callbackUrl: "/login" }),
      type: "danger"
    });
  };

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on mount for barcode scanner readiness
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("branch", branchId);
    router.push(`/pos?${params.toString()}`);
    // Reset cart on branch change
    setCart([]);
    setActiveTransactionId(null);
    setInitialCustomerInfo(null);
  };

  const handleLoadTransaction = async (id: string) => {
    try {
      const tx = await getTransactionById(id);
      if (tx) {
        // Map items to cart
        const mappedCart: CartItem[] = tx.items.map((i: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          type: i.product_id ? "BARANG" : "JASA",
          item_id: i.product_id || i.service_item_id,
          name: i.product?.name || i.service_item?.name,
          sku: i.product?.sku,
          price: i.unit_price,
          quantity: i.quantity,
          mechanic_id: i.mechanic_id || undefined
        }));
        setCart(mappedCart);
        setActiveTransactionId(tx.id);
        setInitialCustomerInfo({
          customerName: tx.customer?.name || "",
          customerPhone: tx.customer?.phone || "",
          vehiclePlate: tx.vehicle_plate || "",
          vehicleModel: (tx as any).customer?.vehicles?.[0]?.model || ""
        });
        setActiveMainTab("POS");
        toast.success("Antrean berhasil dimuat");
      }
    } catch (e: any) {
      toast.error("Gagal memuat antrean");
    }
  };

  const handleBarcodeSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const sku = search.trim();
      if (!sku) return;
      
      // Look for exact SKU or Barcode match in products
      const matchedProduct = products.find(p => 
        (p.sku && p.sku.toLowerCase() === sku.toLowerCase()) || 
        (p.barcode && p.barcode.toLowerCase() === sku.toLowerCase())
      );
      if (matchedProduct) {
        addToCart(matchedProduct, "BARANG");
      } else {
        toast.error(`Barang (SKU: ${sku}) tidak ditemukan atau stok kosong di cabang ini!`);
      }
      setSearch(""); // Always clear input for the next scan
    }
  };

  const addToCart = (item: any, type: "BARANG" | "JASA") => {
    // Check stock before updating state to avoid side-effects inside state updater
    if (type === "BARANG") {
      if (item.stock_quantity <= 0) {
        toast.error("Stok kosong!");
        return;
      }
      const existing = cart.find(i => i.item_id === item.id && i.type === "BARANG");
      if (existing && existing.quantity >= item.stock_quantity) {
        toast.error(`Stok tidak cukup! Tersisa: ${item.stock_quantity}`);
        return;
      }
    }

    setCart(prev => {
      // Check if already in cart (for BARANG only, JASA can be multiple with different mechanics)
      if (type === "BARANG") {
        const existing = prev.find(i => i.item_id === item.id && i.type === "BARANG");
        if (existing) {
          return prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i);
        }
      }

      const cartItem: CartItem = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        item_id: item.id,
        name: item.name,
        sku: item.sku, // undefined for JASA
        price: type === "BARANG" ? item.sell_price : item.default_price,
        quantity: 1,
      };

      return [...prev, cartItem];
    });
    
    // Always return focus to the search bar so the barcode scanner is ready for the next item
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  const updateQuantity = (id: string, delta: number) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    
    // Stock check for BARANG outside of state updater
    if (item.type === "BARANG") {
      const p = products.find(p => p.id === item.item_id);
      if (p && newQty > p.stock_quantity) {
        toast.error(`Stok tidak cukup! Tersisa: ${p.stock_quantity}`);
        searchInputRef.current?.focus();
        return;
      }
    }

    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    searchInputRef.current?.focus();
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    searchInputRef.current?.focus();
  };

  const resetCart = () => {
    if (cart.length > 0) {
      confirm({
        title: "Kosongkan Keranjang",
        message: "Apakah Anda yakin ingin mengosongkan keranjang dan membuat transaksi baru?",
        confirmText: "Ya, Kosongkan",
        danger: true,
        onConfirm: () => {
          setCart([]);
          setActiveTransactionId(null);
          setInitialCustomerInfo(null);
          setTimeout(() => searchInputRef.current?.focus(), 0);
        }
      });
    }
  };

  const handleCancelSPK = () => {
    if (!activeTransactionId) return;
    
    confirm({
      title: "Batalkan SPK Aktif",
      message: "Perhatian: SPK ini akan dibatalkan, semua antrean dan tagihan yang tertunda akan dihapus. Stok barang akan dikembalikan.",
      confirmText: "Ya, Batalkan",
      danger: true,
      onConfirm: async () => {
        try {
          await deleteTransaction(activeTransactionId);
          toast.success("SPK berhasil dibatalkan!");
          setCart([]);
          setActiveTransactionId(null);
          setInitialCustomerInfo(null);
        } catch (error: any) {
          toast.error(error.message || "Gagal membatalkan SPK");
        }
      }
    });
  };

  const setMechanic = (id: string, mechanic_id: string) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, mechanic_id } : item));
  };

  // Filter logic
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatRole = (role?: string) => {
    if (!role) return "Kasir";
    if (role === "SUPER_ADMIN") return "Owner";
    if (role === "KEPALA_CABANG") return "Kepala Bengkel";
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="bg-gray-100 flex h-screen overflow-hidden text-gray-800 font-sans w-full">
      {/* SIDEBAR KIRI (Desktop) */}
      <aside className="hidden md:flex w-20 bg-white flex-col items-center py-6 shadow-md z-20 shrink-0">
        <div className="bg-blue-600 text-white w-12 h-12 rounded-xl mb-8 font-bold text-xl flex items-center justify-center shrink-0">
          B.
        </div>
        <nav className="flex flex-col gap-6 w-full px-4 h-full">
          <button 
            onClick={() => setActiveMainTab("POS")}
            className={`p-3 rounded-xl flex justify-center transition ${activeMainTab === "POS" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-100"}`}
            title="Kasir POS"
          >
            <Monitor className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveMainTab("ANTREAN")}
            className={`p-3 rounded-xl flex justify-center transition ${activeMainTab === "ANTREAN" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-100"}`}
            title="Antrean Servis"
          >
            <ListOrdered className="w-6 h-6" />
          </button>
          {userRole === "KASIR" ? (
            <>
              <button 
                onClick={() => router.push("/stok")}
                className="p-3 text-gray-400 rounded-xl flex justify-center hover:bg-gray-100 transition mt-auto"
                title="Stok Cabang"
              >
                <Store className="w-6 h-6" />
              </button>
              <button 
                onClick={() => router.push("/permintaan-barang")}
                className="p-3 text-gray-400 rounded-xl flex justify-center hover:bg-gray-100 transition"
                title="Permintaan Barang"
              >
                <Package className="w-6 h-6" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => router.push("/")}
              className="p-3 text-gray-400 rounded-xl flex justify-center hover:bg-gray-100 transition mt-auto"
              title="Kembali ke Dashboard"
            >
              <LayoutDashboard className="w-6 h-6" />
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="p-3 text-gray-400 rounded-xl flex justify-center hover:bg-red-50 hover:text-red-500 transition"
            title="Keluar (Logout)"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </nav>
      </aside>

      {/* AREA UTAMA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header Main */}
        <header className="bg-white px-4 py-3 md:px-8 md:py-5 flex justify-between items-center shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Nav Toggle */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-gray-600 rounded-lg hover:bg-gray-100">
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-800">Kasir Bengkel</h1>
              <p className="text-xs md:text-sm text-gray-500">Cabang: {branches.find(b => b.id === activeBranchId)?.name || "Pilih Cabang"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <span className="hidden md:inline text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
              {formatRole(userRole)}
            </span>
            <img src={`https://ui-avatars.com/api/?name=${userRole || "Kasir"}&background=0D8ABC&color=fff`} alt="User" className="w-8 h-8 md:w-10 md:h-10 rounded-full shrink-0 shadow-sm border border-gray-200" />
          </div>
        </header>

        {activeMainTab === "ANTREAN" ? (
          <div className="flex-1 overflow-hidden p-4 md:p-8 bg-gray-50">
            <QueueTab 
              branchId={activeBranchId} 
              onSelect={handleLoadTransaction} 
            />
          </div>
        ) : (
          <div className="p-4 md:p-8 flex-1 overflow-y-auto">
            {/* Input Scanner Barcode */}
            <div className="bg-white p-2 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center gap-2 mb-4 md:mb-6 border border-gray-200">
              <div className="flex-1 flex items-center">
                <Search className="text-gray-400 ml-2 md:ml-4 mr-2 md:mr-3 w-5 h-5 md:w-6 md:h-6 shrink-0" />
              <input 
                ref={searchInputRef}
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleBarcodeSearch}
                autoFocus 
                placeholder="Scan Barcode atau Cari nama di sini..." 
                className="w-full py-2 md:py-3 outline-none text-gray-700 text-base md:text-lg bg-transparent" 
              />
              </div>
              {userRole !== "KASIR" ? (
                <div className="w-full md:w-48 md:border-l border-t md:border-t-0 pt-2 md:pt-0 border-gray-200 md:pl-4 shrink-0">
                  <CustomSelect 
                    value={activeBranchId} 
                    onChange={(val) => handleBranchChange({ target: { value: val } } as any)}
                    options={branches}
                    buttonClassName="border-none shadow-none font-medium text-gray-600 p-2"
                  />
                </div>
              ) : (
                <button className="hidden md:block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition shrink-0 ml-4">
                  Cari
                </button>
              )}
            </div>

            {/* Kategori / Quick Menu */}
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => setActiveTab("BARANG")}
                className={`px-5 py-2 rounded-full font-medium text-sm transition ${activeTab === "BARANG" ? "bg-gray-800 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"}`}
              >
                Barang & Sparepart
              </button>
              <button 
                onClick={() => setActiveTab("JASA")}
                className={`px-5 py-2 rounded-full font-medium text-sm transition ${activeTab === "JASA" ? "bg-gray-800 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"}`}
              >
                Jasa Servis
              </button>
            </div>

            {/* Grid Barang */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 pb-24">
              {activeTab === "BARANG" ? (
                filteredProducts.map(p => (
                  <div key={p.id} onClick={() => addToCart(p, "BARANG")} className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition flex flex-col h-full">
                    <div className="h-24 md:h-32 bg-gray-100 rounded-lg mb-2 md:mb-3 flex items-center justify-center shrink-0">
                      <Package className="w-8 h-8 md:w-12 md:h-12 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-800 line-clamp-2 leading-snug">{p.name}</h3>
                    <p className="text-blue-600 font-bold mt-1 text-lg">Rp {p.sell_price.toLocaleString("id-ID")}</p>
                    <p className="text-xs text-gray-400 mt-auto pt-4">Stok: {p.stock_quantity}</p>
                  </div>
                ))
              ) : (
                filteredServices.map(s => (
                  <div key={s.id} onClick={() => addToCart(s, "JASA")} className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition flex flex-col h-full">
                    <div className="h-24 md:h-32 bg-blue-50 border border-blue-100 rounded-lg mb-2 md:mb-3 flex items-center justify-center shrink-0">
                      <Wrench className="w-8 h-8 md:w-12 md:h-12 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-gray-800 line-clamp-2 leading-snug">{s.name}</h3>
                    <p className="text-blue-600 font-bold mt-1 text-lg mt-auto pt-4">Rp {s.default_price.toLocaleString("id-ID")}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* AREA KERANJANG (KANAN) */}
      <aside className={`w-full md:w-96 bg-white shadow-[-4px_0_15px_rgba(0,0,0,0.05)] flex flex-col z-20 ${isMobileCartOpen ? "fixed inset-0" : "hidden md:flex"}`}>
        {/* Header Cart */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <h2 className="text-xl font-bold text-gray-800">
            {activeTransactionId ? "Workspace SPK" : "Pesanan Baru"}
          </h2>
          <div className="flex items-center gap-2">
            {activeTransactionId ? (
              <button onClick={handleCancelSPK} className="text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm font-medium transition" title="Batal SPK">
                <Trash2 size={18} />
              </button>
            ) : cart.length > 0 && (
              <button onClick={resetCart} className="text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm font-medium transition" title="Kosongkan">
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={() => setIsMobileCartOpen(false)} className="md:hidden text-gray-500 hover:bg-gray-100 p-2 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        {activeTransactionId && (
          <div className="bg-yellow-50 px-6 py-3 text-sm font-medium text-yellow-800 border-b border-yellow-200 flex justify-between shrink-0">
            <span>Edit SPK Aktif:</span>
            <span className="font-bold">{initialCustomerInfo?.vehiclePlate || ""}</span>
          </div>
        )}

        {/* List Item di Keranjang */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart size={48} className="mb-4 opacity-30" />
              <p>Keranjang kosong</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <h4 className="font-semibold text-sm text-gray-800 leading-tight">{item.name}</h4>
                    <p className={`text-xs mt-1 ${item.type === "JASA" ? "text-blue-500 font-medium" : "text-gray-500"}`}>
                      Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 shrink-0">
                    <X size={16} />
                  </button>
                </div>
                
                {item.type === "JASA" ? (
                  <div className="mt-1">
                    <CustomSelect
                      value={item.mechanic_id || ""}
                      onChange={(val) => setMechanic(item.id, val)}
                      options={mechanics}
                      placeholder="Mekanik: Pilih Nanti"
                      buttonClassName="py-1.5 text-xs bg-white text-blue-600 border-blue-200"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mt-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 bg-white rounded border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 transition">-</button>
                    <span className="font-medium text-sm w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 bg-white rounded border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 transition">+</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Total & Tombol Bayar */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 shrink-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium text-gray-800">Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500">Pajak (0%)</span>
            <span className="font-medium text-gray-800">Rp 0</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <span className="text-2xl font-bold text-blue-600">Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          
          <button 
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={20} /> Proses Pembayaran
          </button>
        </div>
      </aside>

      {/* Mobile Floating Cart Toggle */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-10">
         <button
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg flex justify-between items-center px-6"
         >
            <span>{cart.reduce((a, b) => a + b.quantity, 0)} Item</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
         </button>
      </div>


      {isCheckoutOpen && (
        <CheckoutModal 
          cart={cart}
          subtotal={subtotal}
          branchId={activeBranchId}
          transactionId={activeTransactionId || undefined}
          initialCustomerInfo={initialCustomerInfo}
          onClose={(isDraftSaved) => {
            setIsCheckoutOpen(false);
            
            // Check if it's explicitly a boolean true (not a MouseEvent from the X button)
            const wasSuccessful = typeof isDraftSaved === "boolean" ? isDraftSaved : false;
            
            if (wasSuccessful) {
              setCart([]);
              setActiveTransactionId(null);
              setInitialCustomerInfo(null);
              setIsMobileCartOpen(false);
              setActiveMainTab("ANTREAN");
            }
          }}
        />
      )}

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
          {/* Sidebar */}
          <div className="relative w-64 bg-white h-full flex flex-col shadow-xl animate-in slide-in-from-left">
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-xl font-bold flex items-center justify-center">B.</div>
                <span className="font-bold text-gray-800">Menu Kasir</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <nav className="flex flex-col gap-2 p-4">
              <button 
                onClick={() => { setActiveMainTab("POS"); setIsMobileMenuOpen(false); }}
                className={`p-4 rounded-xl flex items-center gap-4 transition font-medium ${activeMainTab === "POS" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <Monitor className="w-5 h-5" /> Kasir POS
              </button>
              <button 
                onClick={() => { setActiveMainTab("ANTREAN"); setIsMobileMenuOpen(false); }}
                className={`p-4 rounded-xl flex items-center gap-4 transition font-medium ${activeMainTab === "ANTREAN" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <ListOrdered className="w-5 h-5" /> Daftar Antrean
              </button>
            </nav>
            <div className="mt-auto p-4 border-t border-gray-100 flex flex-col gap-2">
              {userRole === "KASIR" ? (
                <>
                  <button 
                    onClick={() => router.push("/stok")}
                    className="p-4 text-gray-600 rounded-xl flex items-center gap-4 hover:bg-gray-50 transition font-medium"
                  >
                    <Store className="w-5 h-5" /> Stok Cabang
                  </button>
                  <button 
                    onClick={() => router.push("/permintaan-barang")}
                    className="p-4 text-gray-600 rounded-xl flex items-center gap-4 hover:bg-gray-50 transition font-medium"
                  >
                    <Package className="w-5 h-5" /> Permintaan Barang
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => router.push("/")}
                  className="p-4 text-gray-600 rounded-xl flex items-center gap-4 hover:bg-gray-50 transition font-medium"
                >
                  <LayoutDashboard className="w-5 h-5" /> Ke Dashboard
                </button>
              )}
              <button 
                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                className="p-4 text-red-600 rounded-xl flex items-center gap-4 hover:bg-red-50 transition font-medium"
              >
                <LogOut className="w-5 h-5" /> Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
