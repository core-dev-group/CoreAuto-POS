# CoreAuto POS & Workshop Management System

> 🌐 **Live Demo Application:** [https://core-auto-pos.vercel.app](https://core-auto-pos.vercel.app)  
> 🛠️ **Developed & Maintained by [Core Dev Group](https://core-dev-group.my.id)**

[![Live Demo](https://img.shields.io/badge/Live_Demo-core--auto--pos.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://core-auto-pos.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue?logo=postgresql)](https://supabase.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)

**CoreAuto POS** adalah Sistem Manajemen Operasional Bengkel & Point of Sale (POS) Multi-Cabang Enterprise. Aplikasi ini dirancang khusus untuk memenuhi kebutuhan bisnis perbengkelan modern dalam mengelola transaksi kasir, inventaris barang, mutasi stok antar cabang, komisi mekanik, hingga laporan keuangan laba-rugi secara terintegrasi dan real-time.

---

## 🔑 Akun Demo (Demo Credentials)

Coba langsung aplikasinya di **[core-auto-pos.vercel.app](https://core-auto-pos.vercel.app)** dengan akun demo di bawah ini:

| Peran (Role) | Email | Password | Akses & Wewenang |
| :--- | :--- | :--- | :--- |
| **Kepala Cabang (Pusat)** | `kepala@bengkelin.local` | `admin123` | Laporan Keuangan Pusat, Kelola Jasa & Mekanik, Approval Permintaan Stok |
| **Kepala Cabang (Sudirman)** | `kepala2@bengkelin.local` | `admin123` | Laporan Keuangan Cabang, Permintaan Barang Cabang, Shift & Transaksi |
| **Admin Gudang (Pusat)** | `gudang@bengkelin.local` | `admin123` | Kelola Barang, Stok Gudang Pusat, Pengiriman & Mutasi Barang |
| **Kasir (POS)** | `kasir@bengkelin.local` | `admin123` | Terminal Kasir (POS), Buka/Tutup Shift, Pengajuan Permintaan Barang |

> *Catatan: Akun Super Admin sengaja dinonaktifkan di halaman demo publik ini demi keamanan sistem dasar.*

---

## ✨ Fitur Unggulan

- 🛒 **Point of Sale (POS) Responsive:** Fitur kasir cepat dengan antrian transaksi, pencetakan struk/invoice, dan integrasi metode pembayaran tunai/non-tunai.
- 🏢 **Arsitektur Multi-Cabang:** Isolasi data stok dan laporan antar cabang dengan kontrol terpusat dari Gudang Pusat.
- 📦 **Alur Permintaan Barang 2-Tahap:** Mekanisme pengajuan stok dari Kasir ➔ Persetujuan Kepala Cabang ➔ Pemenuhan oleh Admin Gudang Pusat.
- 🔄 **Manajemen Mutasi Stok:** Pencatatan pergerakan barang (Masuk, Keluar, Retur, dan Afkir/Rusak) lengkap dengan log audit.
- 👨‍🔧 **Perhitungan Komisi Mekanik:** Perhitungan otomatis komisi berdasarkan porsi pekerjaan dan jasa servis per transaksi.
- 💰 **Keuangan & Cashflow:** Pencatatan arus kas operasional (Pemasukan & Pengeluaran) serta Laporan Laba/Rugi (P&L) terstruktur.
- 👥 **Pilihan Akun Cepat (Account Switcher):** Kemudahan berganti antar akun Kasir/Admin pada perangkat lokal (*Local Storage*).
- 📲 **Progressive Web App (PWA):** Dapat diinstal langsung di perangkat desktop maupun tablet/smartphone.

---

## 🛠️ Teknologi & Stack

- **Frontend & Framework:** Next.js 16 (App Router, Server Actions)
- **Styling & UI:** Tailwind CSS v4, Lucide Icons, Glassmorphism UI
- **Database & ORM:** PostgreSQL (Supabase Cloud), Prisma ORM
- **Autentikasi:** NextAuth.js (Credentials Provider, RBAC Middleware)
- **Deployment:** Vercel App Hosting

---

## 📄 Lisensi & Hak Cipta

Dikembangkan oleh **[Core Dev Group](https://core-dev-group.my.id)**. Seluruh hak cipta dilindungi undang-undang.

Kunjungi website resmi kami di [https://core-dev-group.my.id](https://core-dev-group.my.id) untuk informasi lebih lanjut mengenai layanan pengembangan perangkat lunak, sistem POS, dan solusi digital enterprise.
