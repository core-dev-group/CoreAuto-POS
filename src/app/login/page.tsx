"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, ShoppingCart, Plus, X, ArrowLeft, KeyRound, Eye, EyeOff, Wrench } from "lucide-react";

interface SavedAccount {
  email: string;
  type?: "admin" | "pos";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"admin" | "pos">("admin");
  
  // Account Switcher State
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [view, setView] = useState<"loading" | "chooser" | "saved_login" | "login">("loading");
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("bengkelin_saved_accounts") || "[]");
    if (saved.length > 0) {
      setSavedAccounts(saved);
      setView("chooser");
    } else {
      setView("login");
    }
  }, []);

  const saveAccount = (newEmail: string, type: "admin" | "pos") => {
    const saved = JSON.parse(localStorage.getItem("bengkelin_saved_accounts") || "[]");
    const existing = saved.find((s: any) => s.email === newEmail);
    if (!existing) {
      const updated = [...saved, { email: newEmail, type }];
      localStorage.setItem("bengkelin_saved_accounts", JSON.stringify(updated));
      setSavedAccounts(updated);
    } else if (existing.type !== type) {
      const updated = saved.map((s: any) => s.email === newEmail ? { ...s, type } : s);
      localStorage.setItem("bengkelin_saved_accounts", JSON.stringify(updated));
      setSavedAccounts(updated);
    }
  };

  const removeAccount = (emailToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const saved = savedAccounts.filter(acc => acc.email !== emailToRemove);
    localStorage.setItem("bengkelin_saved_accounts", JSON.stringify(saved));
    setSavedAccounts(saved);
    if (saved.length === 0) setView("login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setLoading(false);
      setError("Email atau password salah");
    } else {
      saveAccount(email, activeTab);
      if (activeTab === "pos") {
        router.push("/pos");
      } else {
        router.push("/");
      }
      router.refresh();
    }
  };

  const handleSelectAccount = (acc: SavedAccount) => {
    setEmail(acc.email);
    setSelectedAccount(acc.email);
    setActiveTab(acc.type || "admin");
    setView("saved_login");
    setError("");
    setPassword("");
  };

  const getInitials = (emailStr: string) => {
    return emailStr.substring(0, 2).toUpperCase();
  };

  if (view === "loading") {
    return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] relative overflow-hidden font-sans py-10 px-4">
      
      {/* Dynamic Background Elements (Safely Clipped) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[150px] mix-blend-screen" style={{ animation: "pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-cyan-900/10 blur-[100px]" />
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-md my-auto relative z-10">
        
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center justify-center mb-6 sm:mb-8 text-center">
          <div className="relative group mb-3">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-2xl border-2 border-white/20 flex items-center justify-center overflow-hidden">
              <Wrench className="w-8 h-8 text-white absolute shrink-0" />
              <img 
                src="/logo.png" 
                alt="CoreAuto POS Logo" 
                className="relative z-10 w-full h-full rounded-[14px] object-cover bg-gray-900" 
                onError={(e) => {
                  (e.target as HTMLElement).style.opacity = '0';
                }}
              />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-400 tracking-tight drop-shadow-md">
            CoreAuto POS
          </h1>
          <p className="text-xs sm:text-sm text-cyan-400/90 font-semibold tracking-widest uppercase mt-1">
            Workshop Management System
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl border border-white/10 relative overflow-hidden ring-1 ring-white/5">
          
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          {/* Header Text */}
          <div className="text-center mb-8 relative">
            <p className="text-gray-400 font-medium tracking-wide">
              {view === "chooser" ? "Pilih Akun Tersimpan" : view === "saved_login" ? "Masuk ke Akun" : "Akses Sistem Manajemen"}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl mb-6 text-sm font-medium border border-red-500/20 flex items-center animate-in fade-in slide-in-from-top-2 backdrop-blur-md relative z-20">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mr-3 shrink-0">
                <X className="w-4 h-4 text-red-400" />
              </div>
              {error}
            </div>
          )}

          {/* VIEW: CHOOSER */}
          {view === "chooser" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 relative z-20">
              {savedAccounts.map((acc) => (
                <div 
                  key={acc.email}
                  onClick={() => handleSelectAccount(acc)}
                  className="group flex items-center p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-blue-500/50 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] transition-all duration-300 relative overflow-hidden"
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${acc.type === "pos" ? "from-indigo-500 to-purple-600" : "from-blue-500 to-indigo-600"} text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl shrink-0 shadow-inner ring-2 ring-white/20 group-hover:scale-105 transition-transform`}>
                    {getInitials(acc.email)}
                  </div>
                  <div className="ml-3 sm:ml-4 overflow-hidden flex-1">
                    <p className="text-white font-bold truncate text-base sm:text-lg">{acc.email}</p>
                    <p className={`${acc.type === "pos" ? "text-indigo-300/80" : "text-blue-300/80"} text-xs sm:text-sm truncate font-medium`}>
                      {acc.type === "pos" ? "Akun Kasir (POS)" : "Akun Admin Dashboard"}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => removeAccount(acc.email, e)}
                    className="p-2.5 text-gray-500 hover:text-white hover:bg-red-500/80 rounded-xl transition-all duration-300 ml-2 opacity-0 group-hover:opacity-100 hover:shadow-lg hover:shadow-red-500/20"
                    title="Hapus akun"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => { setView("login"); setEmail(""); setPassword(""); setError(""); }}
                className="w-full flex items-center justify-center gap-3 p-4 bg-transparent border-2 border-dashed border-white/20 rounded-2xl hover:bg-white/5 hover:border-white/40 transition-all text-gray-300 group mt-6"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Plus size={20} className="text-gray-300 group-hover:text-white" />
                </div>
                <span className="font-semibold group-hover:text-white">Masuk ke akun lain</span>
              </button>
            </div>
          )}

          {/* VIEW: SAVED LOGIN */}
          {view === "saved_login" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative z-20">
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 blur-xl opacity-40 rounded-full" />
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-3xl shadow-xl ring-4 ring-white/10 relative z-10">
                    {getInitials(selectedAccount || "")}
                  </div>
                </div>
                <p className="text-white font-bold text-xl mt-5">{selectedAccount}</p>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${activeTab === "pos" ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-blue-500/20 text-blue-300 border-blue-500/30"} text-xs font-semibold mt-2 border`}>
                  {activeTab === "pos" ? <ShoppingCart size={12} /> : <Store size={12} />}
                  {activeTab === "pos" ? "Akses POS Kasir" : "Akses Admin Dashboard"}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 p-4 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:bg-black/40 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                    placeholder="Masukkan Kata Sandi"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-bold py-4 px-4 rounded-2xl transition-all relative overflow-hidden group disabled:opacity-70"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-transform group-hover:scale-[1.02]" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative text-white text-lg tracking-wide shadow-sm">
                    {loading ? "Memverifikasi..." : "Lanjutkan"}
                  </span>
                </button>
              </form>

              <button 
                onClick={() => { setView("chooser"); setError(""); setPassword(""); }}
                className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-white w-full transition-colors group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                Ganti Akun
              </button>
            </div>
          )}

          {/* VIEW: STANDARD LOGIN */}
          {view === "login" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative z-20">
              
              {/* Custom Animated Tabs */}
              <div className="flex relative p-1.5 bg-black/20 rounded-2xl mb-8 border border-white/5">
                {/* Active Indicator */}
                <div 
                  className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/10 shadow-lg transition-transform duration-300 ease-out backdrop-blur-md"
                  style={{ transform: activeTab === "pos" ? "translateX(100%)" : "translateX(0)" }}
                />
                
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl transition-colors relative z-10 ${
                    activeTab === "admin" ? "text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <Store size={16} className={`sm:w-[18px] sm:h-[18px] ${activeTab === "admin" ? "text-blue-400" : ""}`} /> 
                  <span className="hidden min-[360px]:inline">Dashboard</span>
                  <span className="min-[360px]:hidden">Admin</span>
                </button>
                
                <button
                  onClick={() => setActiveTab("pos")}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl transition-colors relative z-10 ${
                    activeTab === "pos" ? "text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <ShoppingCart size={16} className={`sm:w-[18px] sm:h-[18px] ${activeTab === "pos" ? "text-indigo-400" : ""}`} /> 
                  Kasir <span className="hidden min-[380px]:inline">(POS)</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Alamat Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3.5 sm:p-4 bg-black/20 border border-white/10 rounded-xl sm:rounded-2xl text-white placeholder-gray-600 focus:bg-black/40 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
                    placeholder={activeTab === "pos" ? "kasir@bengkelin.local" : "admin@bengkelin.local"}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Kata Sandi</label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-4 pr-12 p-3.5 sm:p-4 bg-black/20 border border-white/10 rounded-xl sm:rounded-2xl text-white placeholder-gray-600 focus:bg-black/40 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white focus:outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-bold py-4 px-4 rounded-2xl transition-all relative overflow-hidden group disabled:opacity-70 mt-4"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r transition-transform group-hover:scale-[1.02] ${
                    activeTab === "pos" ? "from-indigo-600 to-purple-600" : "from-blue-600 to-indigo-600"
                  }`} />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative text-white text-lg tracking-wide shadow-sm flex items-center justify-center gap-2">
                    {loading ? "Memverifikasi..." : `Masuk ke ${activeTab === "pos" ? "Kasir" : "Sistem"}`}
                  </span>
                </button>
              </form>

              {savedAccounts.length > 0 && (
                <button 
                  onClick={() => { setView("chooser"); setError(""); }}
                  className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-white w-full transition-colors group"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                  Lihat Akun Tersimpan
                </button>
              )}
            </div>
          )}

        </div>
        <div className="mt-6 text-center text-xs text-gray-500 font-medium tracking-wide space-y-2">
          <div>
            Powered by <a href="https://core-dev-group.my.id" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white font-bold underline decoration-dotted transition-colors">Core Dev Group</a>
          </div>
          <div className="flex items-center justify-center gap-3 text-[11px] text-gray-400">
            <Link href="/terms" className="hover:text-cyan-400 transition-colors underline decoration-dotted">Syarat & Ketentuan</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-cyan-400 transition-colors underline decoration-dotted">Kebijakan Privasi</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
