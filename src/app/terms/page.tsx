import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText } from "lucide-react";

export const metadata = {
  title: "Syarat & Ketentuan | CoreAuto POS",
  description: "Syarat dan Ketentuan Penggunaan Sistem Manajemen Operasional CoreAuto POS oleh Core Dev Group.",
};

export default function TermsPage() {
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
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Syarat & Ketentuan Layanan</h1>
              <p className="text-sm text-gray-400 mt-1">Terakhir diperbarui: 20 Agustus 2026 • Core Dev Group</p>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cyan-300">1. Ketentuan Umum</h2>
            <p className="text-gray-300 leading-relaxed text-sm">
              Dengan mengakses dan menggunakan sistem **CoreAuto POS** ("Layanan"), Anda menyatakan telah membaca, memahami, dan menyetujui seluruh Syarat dan Ketentuan yang ditetapkan oleh **Core Dev Group**. Jika Anda tidak menyetujui salah satu ketentuan ini, Anda tidak diperkenankan menggunakan Layanan.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cyan-300">2. Lisensi & Hak Penggunaan</h2>
            <p className="text-gray-300 leading-relaxed text-sm">
              CoreAuto POS memberikan lisensi terbatas, non-eksklusif, dan tidak dapat dipindahtangankan kepada pengguna terdaftar untuk mengoperasikan sistem Point of Sale, manajemen stok cabang, dan pelaporan keuangan sesuai dengan peran (*role*) hak akses yang diberikan oleh administrator sistem.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cyan-300">3. Keamanan Akun & Kredensial</h2>
            <p className="text-gray-300 leading-relaxed text-sm">
              Pengguna bertanggung jawab penuh atas kerahasiaan kata sandi dan akses akun masing-masing (termasuk peran Kepala Cabang, Admin Gudang, dan Kasir). Setiap transaksi atau aktivitas yang terjadi di bawah kredensial akun dianggap sebagai tindakan sah pengguna bersangkutan.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cyan-300">4. Integritas Data Transaksi & Stok</h2>
            <p className="text-gray-300 leading-relaxed text-sm">
              Seluruh pergerakan barang, permintaan stok antar cabang, komisi mekanik, dan laporan transaksi pencatatan kasir akan dicatat dalam sistem log audit. Pengguna dilarang melakukan manipulasi data transaksi atau mengunggah data ilegal yang berpotensi merusak integritas database.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cyan-300">5. Pembatasan Tanggung Jawab</h2>
            <p className="text-gray-300 leading-relaxed text-sm">
              Core Dev Group berupaya menjaga keandalan sistem hingga 99.9% uptime. Namun, kami tidak bertanggung jawab atas kerugian tidak langsung yang disebabkan oleh gangguan koneksi internet lokal pengguna, kesalahan pemutakhiran data manusia (*human error*), atau kendala pihak ketiga di luar kendali teknis kami.
            </p>
          </section>

          <div className="pt-6 border-t border-white/10 text-center text-xs text-gray-400">
            Hak Cipta © 2026 Core Dev Group. Seluruh Hak Dilindungi Undang-Undang.  
            Pertanyaan seputar lisensi dapat dikirimkan ke <a href="https://core-dev-group.my.id" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">core-dev-group.my.id</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
