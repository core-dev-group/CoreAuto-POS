# CoreAuto POS

> Powered by **[Core Dev Group](https://core-dev-group.my.id)**

Sistem Point of Sale (POS) & Manajemen Inventori Multi-Cabang Modern untuk Bengkel.

## Fitur

- **POS (Point of Sale)** — Transaksi barang & jasa, draft/antrian, cetak invoice
- **Manajemen Stok** — Mutasi masuk/keluar/rusak/retur per cabang
- **Multi-Cabang** — Kelola stok & transaksi tiap cabang terpisah
- **Mekanik & Komisi** — Tracking komisi mekanik per servis
- **Cashflow** — Pencatatan arus kas masuk/keluar
- **Laporan P&L** — Omzet, HPP, laba rugi per periode
- **Export CSV** — Export data transaksi, stok, cashflow
- **Role-based Access** — Super Admin, Kepala Cabang, Admin Gudang, Kasir
- **PWA** — Installable di mobile/desktop

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** SQLite + Prisma ORM
- **Auth:** NextAuth.js (Credentials)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Validation:** Zod

## Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd bengkelin
npm install
```

### 2. Environment

Buat file `.env`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<random-string>"
```

Generate secret:
```bash
openssl rand -base64 32
```

### 3. Database

```bash
npx prisma migrate dev
npx tsx prisma/seed.ts
```

### 4. Run

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Default Login (Seed)

| Email | Password | Role |
|-------|----------|------|
| `admin@bengkelin.com` | `password123` | Super Admin |

> Cek `prisma/seed.ts` untuk akun lainnya.

## Struktur Project

```
src/
├── app/
│   ├── (dashboard)/     # Admin UI (barang, cabang, mekanik, dll)
│   ├── pos/             # Kasir POS
│   ├── api/             # Auth & Export routes
│   ├── login/           # Login page
│   └── print/           # Invoice print
├── components/          # Shared components
├── lib/
│   ├── auth.ts          # NextAuth config
│   ├── prisma.ts        # Prisma client
│   └── validations/     # Zod schemas
└── middleware.ts        # Auth & route protection
```

## Scripts

| Command | Keterangan |
|---------|------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production |
| `npm run lint` | ESLint check |
