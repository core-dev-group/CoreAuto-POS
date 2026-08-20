import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi | CoreAuto POS",
  description: "Kebijakan Privasi dan perlindungan data operasional pengguna CoreAuto POS oleh Core Dev Group.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200 font-sans py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-medium mb-8 transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/10"
        >
          <ArrowLeft size={16} /> Kembali ke Halaman Utama
        </Link>

        <div className="bg-white/5 backdrop-blur-2xl p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-8">
          <div className="border-b border-white/10 pb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Kebijakan Privasi</h1>
              <p className="text-sm text-gray-400 mt-1">Terakhir diperbarui: 20 Agustus 2026 • Core Dev Group</p>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cyan-300">1. Pengumpulan Informasi</h2>
            <p className="text-gray-300 leading-relaxed text-sm">
              Kami mengumpulkan informasi yang diperlukan untuk mengoperasikan sistem POS dan Manajemen Bengkel secara efisien, meliputi: nama pengguna, alamat email terdaftar, riwayat transaksi kasir, data inventaris barang, nama pelanggan, serta nomor pelat kendaraan untuk pencetakan nota/invoice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cyan-300">2. Penggunaan Informasi</h2>
            <p className="text-gray-300 leading-relaxed text-sm">
              Data yang dikumpulkan digunakan secara eksklusif untuk:
            </p>
            <ul className="list-disc list-inside text-gray-300 text-sm space-y-2 pl-2">
              <li>Memproses transaksi pembayaran dan pencetakan invoice secara akurat.</li>
              <li>Mengelola pergerakan stok barang dan mutasi antar cabang.</li>
              <li>Menghitung besaran komisi mekanik berdasarkan jasa servis yang dikerjakan.</li>
              <li>Menyajikan laporan arus kas operasional dan Laba/Rugi bagi pengelola bisnis.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cyan-300">3. Keamanan Data & Enkripsi</h2>
            <p className="text-gray-300 leading-relaxed text-sm">
              Perlindungan data Anda adalah prioritas utama kami. Seluruh lalu lintas data dienkripsi menggunakan protokol <strong>SSL/TLS (HTTPS)</strong>. Kata sandi akun disimpan dalam bentuk <em>hash cryptographic</em> tingkat tinggi (Bcrypt) dan basis data PostgreSQL hosted terlindungi di infrastructure cloud bersertifikasi keamanan enterprise.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cyan-300">4. Penyimpanan Lokal (Local Storage)</h2>
            <p className="text-gray-300 leading-relaxed text-sm">
              Sistem menggunakan fitur <em>Local Storage</em> pada browser Anda hanya untuk menyimpan preferensi sesi login cepat (<em>Account Switcher</em>) secara lokal pada perangkat Anda agar memudahkan pergantian akun operasional kasir.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cyan-300">5. Kerahasiaan Pihak Ketiga</h2>
            <p className="text-gray-300 leading-relaxed text-sm">
              Core Dev Group <strong>tidak pernah menjual, menyewakan, atau membagikan</strong> data operasional internal bengkel Anda kepada pihak ketiga mana pun untuk tujuan komersial atau periklanan.
            </p>
          </section>

          <div className="pt-6 border-t border-white/10 text-center text-xs text-gray-400">
            Hak Cipta © 2026 Core Dev Group. Seluruh Hak Dilindungi Undang-Undang.  
            Kunjungi portal kami di <a href="https://core-dev-group.my.id" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">core-dev-group.my.id</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
