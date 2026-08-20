# Implementasi Menyeluruh Audit Log untuk Semua Aksi

Berdasarkan permintaan Anda, saya telah menelusuri seluruh *source code* dan menemukan bahwa fungsi `createAuditLog` sebenarnya sudah ada di `src/lib/audit.ts`, tetapi **belum digunakan sama sekali** di halaman mana pun selain Arus Kas yang baru saja saya tambahkan. 

Oleh karena itu, saya akan menyuntikkan fungsi pencatatan *Audit Log* ke seluruh *server actions* yang memodifikasi data (Create, Update, Delete) di sistem.

## Rencana Perubahan

Saya akan memperbarui file `src/lib/audit.ts` agar menerima aksi dinamis, kemudian saya akan memodifikasi file-file berikut untuk mencatat ke *Audit Log*:

### Pengguna & Cabang (Master Data)
- `[MODIFY]` `src/app/(dashboard)/pengguna/create/actions.ts`: Log penambahan pengguna baru.
- `[MODIFY]` `src/app/(dashboard)/pengguna/[id]/edit/actions.ts`: Log pembaruan dan penghapusan pengguna.
- `[MODIFY]` `src/app/(dashboard)/cabang/actions.ts`: Log tambah, ubah, dan hapus cabang.

### Produk & Layanan (Master Data)
- `[MODIFY]` `src/app/(dashboard)/barang/actions.ts`: Log tambah, ubah, dan hapus barang/sparepart.
- `[MODIFY]` `src/app/(dashboard)/servis/actions.ts`: Log tambah, ubah, dan hapus jasa servis.
- `[MODIFY]` `src/app/(dashboard)/mekanik/actions.ts`: Log tambah, ubah, dan hapus mekanik.

### Transaksi & POS
- `[MODIFY]` `src/app/pos/actions.ts`: Log transaksi baru (checkout).
- `[MODIFY]` `src/app/(dashboard)/invoice/[id]/actions.ts`: Log pembatalan transaksi (*void invoice*).
- `[MODIFY]` `src/app/(dashboard)/pos/shift/actions.ts`: Log buka, tutup, dan ubah catatan *shift* kasir.

### Keuangan & Stok
- `[MODIFY]` `src/app/(dashboard)/mutasi/actions.ts`: Log mutasi stok masuk/keluar.
- `[MODIFY]` `src/app/(dashboard)/permintaan-barang/actions.ts`: Log permintaan stok, persetujuan, penolakan, dan penerimaan antar cabang.
- `[MODIFY]` `src/app/(dashboard)/finance/commission/actions.ts`: Log pencairan komisi mekanik.
- `[MODIFY]` `src/app/(dashboard)/finance/cashflow/actions.ts`: Refaktor untuk menggunakan utilitas standar `createAuditLog`.

## User Review Required

> [!IMPORTANT]
> **Persetujuan Diperlukan**
> Perubahan ini menyentuh **13 file core** yang menangani logika utama aplikasi. Mohon konfirmasi apakah Anda setuju dengan rencana pencatatan *Audit Log* di atas agar saya bisa langsung mengeksekusinya. Jika ada modul lain yang menurut Anda terlewat, silakan beri tahu saya.

## Open Questions
- Apakah log penghapusan data master (seperti hapus barang atau mekanik) juga perlu menyimpan detail data sebelum dihapus (di dalam JSON *details* log), atau sekadar ID-nya saja?
