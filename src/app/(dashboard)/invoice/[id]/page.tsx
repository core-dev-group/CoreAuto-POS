import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft, Printer, MapPin, Package, Wrench, XCircle } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { VoidTransactionButton } from "@/components/VoidTransactionButton";

export const metadata = {
  title: "Detail Invoice | CoreAuto POS",
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      branch: true,
      items: {
        include: {
          mechanic: true,
          product: true,
          service_item: true,
        },
      },
    },
  });

  if (!transaction) {
    notFound();
  }

  // Calculate discount and tax back since it wasn't saved in Transaction explicitly
  // Transaction only has subtotal and total. Wait, total = subtotal - discount + tax.
  // We can't know the exact split if both discount and tax are there, but for display we can just show total and subtotal.
  const hasDifference = transaction.total !== transaction.subtotal;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link 
            href="/invoice"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Detail Transaksi</h1>
            <p className="text-gray-500 mt-1">{transaction.invoice_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {transaction.status !== "DIBATALKAN" && (session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "KEPALA_CABANG") && (
            <VoidTransactionButton transactionId={transaction.id} />
          )}
          <Link 
            href={`/print/invoice/${transaction.id}`}
            target="_blank"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow"
          >
            <Printer size={20} />
            Cetak Struk
          </Link>
        </div>
      </div>

      {transaction.status === "DIBATALKAN" && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex gap-3 items-start">
          <XCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold">Transaksi ini telah dibatalkan</h3>
            <p className="text-sm mt-1">Oleh: {transaction.cancelled_by} pada {format(new Date(transaction.cancelled_at!), "dd MMM yyyy HH:mm", { locale: localeId })}</p>
            <p className="text-sm">Alasan: {transaction.cancellation_reason}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Info */}
        <div className="p-6 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 text-sm">
          <div>
            <div className="text-gray-500 mb-1">Tanggal Transaksi</div>
            <div className="font-semibold text-gray-900">
              {format(new Date(transaction.created_at), "dd MMM yyyy, HH:mm", { locale: localeId })}
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Cabang Bengkel</div>
            <div className="font-semibold text-gray-900 flex items-center gap-1.5">
              <MapPin size={14} className="text-gray-400" /> {transaction.branch.name}
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Kasir ID</div>
            <div className="font-semibold text-gray-900">{transaction.cashier_id}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Metode Pembayaran</div>
            <div className="font-semibold text-gray-900">{transaction.payment_method}</div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pelanggan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 mb-1">Plat Nomor</div>
              <div className="font-medium text-gray-900">{transaction.vehicle_plate || "-"}</div>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rincian Pembelian</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                  <th className="p-3 font-semibold">Tipe</th>
                  <th className="p-3 font-semibold">Item</th>
                  <th className="p-3 font-semibold text-right">Harga</th>
                  <th className="p-3 font-semibold text-center">Qty</th>
                  <th className="p-3 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transaction.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3">
                      {item.product_id ? (
                         <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                           <Package size={12} /> Barang
                         </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-md">
                           <Wrench size={12} /> Jasa
                         </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-900">
                        {item.product_id ? item.product?.name : item.service_item?.name}
                      </div>
                      {item.product_id && <div className="text-xs text-gray-500">{item.product?.sku}</div>}
                      {item.mechanic && (
                        <div className="text-xs text-gray-500 mt-1">
                          Mekanik: {item.mechanic.name}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right text-gray-900">
                      Rp {item.unit_price.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 text-center text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="p-3 text-right font-medium text-gray-900">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">Rp {transaction.subtotal.toLocaleString("id-ID")}</span>
            </div>
            {hasDifference && (
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Penyesuaian (Diskon/Pajak)</span>
                <span className="font-medium text-gray-900">Rp {(transaction.total - transaction.subtotal).toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-xl font-black text-blue-600">Rp {transaction.total.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
