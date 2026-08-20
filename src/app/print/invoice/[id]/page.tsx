import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import AutoPrint from "@/components/AutoPrint";

export const metadata = {
  title: "Cetak Struk | CoreAuto POS",
};

export default async function PrintInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      branch: true,
      cashier: true,
      items: {
        include: {
          product: true,
          service_item: true,
        }
      }
    },
  });

  if (!transaction) {
    notFound();
  }

  const hasDifference = transaction.total !== transaction.subtotal;

  return (
    <div className="bg-white min-h-screen p-4 flex justify-center font-mono text-sm text-black">
      <div className="w-[300px]">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="font-bold text-xl uppercase">{transaction.branch.name}</h1>
          <p className="text-xs mt-1">{transaction.branch.address}</p>
          {transaction.branch.phone && <p className="text-xs">Telp: {transaction.branch.phone}</p>}
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        {/* Meta Info */}
        <div className="text-xs mb-4">
          <div className="flex justify-between">
            <span>No:</span>
            <span>{transaction.invoice_number}</span>
          </div>
          <div className="flex justify-between">
            <span>Tgl:</span>
            <span>{format(new Date(transaction.created_at), "dd/MM/yyyy HH:mm", { locale: localeId })}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir:</span>
            <span>{transaction.cashier?.name || transaction.cashier_id}</span>
          </div>
          {transaction.vehicle_plate && (
             <div className="flex justify-between">
               <span>Plat:</span>
               <span>{transaction.vehicle_plate}</span>
             </div>
          )}
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        {/* Items */}
        <div className="mb-4 text-xs">
          {transaction.items.map((item) => (
            <div key={item.id} className="mb-2">
              <div className="font-semibold">{item.product_id ? item.product?.name : item.service_item?.name}</div>
              <div className="flex justify-between text-right">
                <span>{item.quantity} x {item.unit_price.toLocaleString("id-ID")}</span>
                <span>{item.subtotal.toLocaleString("id-ID")}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        {/* Totals */}
        <div className="text-xs space-y-1 mb-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{transaction.subtotal.toLocaleString("id-ID")}</span>
          </div>
          {hasDifference && (
            <div className="flex justify-between">
              <span>Penyesuaian</span>
              <span>{(transaction.total - transaction.subtotal).toLocaleString("id-ID")}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm mt-2">
            <span>TOTAL</span>
            <span>Rp {transaction.total.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span>Metode:</span>
            <span>{transaction.payment_method}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        <div className="text-center text-xs mt-4">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
        </div>
      </div>

      <AutoPrint />
    </div>
  );
}
