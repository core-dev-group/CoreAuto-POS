import { getProducts, deleteProduct } from "./actions";
import { Plus, Edit2, Trash2, Tag, Barcode } from "lucide-react";
import { LinkWithLoading as Link } from "@/components/LinkWithLoading";
import DeleteButton from "./DeleteButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

import { Pagination } from "@/components/ui/Pagination";

export const metadata = {
  title: "Manajemen Barang | CoreAuto POS",
};

export default async function BarangPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role === "KASIR") redirect("/");

  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const { data: products, totalPages } = await getProducts(currentPage);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Manajemen Barang</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Kelola data sparepart dan inventaris barang Anda.</p>
        </div>
        <Link 
          href="/barang/new" 
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex justify-center items-center gap-2 transition-all shadow-sm hover:shadow text-sm"
        >
          <Plus size={18} />
          Tambah Barang
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs md:text-sm">
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">SKU / Nama Barang</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Kategori</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold text-center">Total Stok</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Harga Beli</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Harga Jual</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 md:px-4 py-8 text-center text-gray-500">
                    Belum ada data barang.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <div className="font-medium text-gray-900 truncate max-w-[200px]" title={product.name}>{product.name}</div>
                      <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-500 mt-1">
                        <Barcode className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 shrink-0" />
                        <span className="truncate">{product.sku} {product.barcode ? `| ${product.barcode}` : ""}</span>
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <Tag className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{product.category || "-"}</span>
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-center">
                      <span className={`font-semibold ${product.totalStock > 0 ? "text-green-600" : "text-gray-400"}`}>
                        {product.totalStock}
                      </span>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600">
                      Rp {product.purchase_price.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-900 font-medium">
                      Rp {product.sell_price.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link 
                          href={`/barang/${product.id}/edit`}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                        </Link>
                        <DeleteButton id={product.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
