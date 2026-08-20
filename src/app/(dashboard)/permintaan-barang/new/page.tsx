import { prisma } from "@/lib/prisma";
import { LinkWithLoading as Link } from "@/components/LinkWithLoading";
import { ArrowLeft } from "lucide-react";
import RequestForm from "./RequestForm";

export const metadata = {
  title: "Buat Permintaan Barang | CoreAuto POS",
};

export default async function NewRequestPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Link 
          href="/permintaan-barang"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ajukan Permintaan Barang</h1>
          <p className="text-sm text-gray-500 mt-1">Isi formulir di bawah untuk meminta stok ke Gudang Pusat.</p>
        </div>
      </div>

      <RequestForm products={products} />
    </div>
  );
}
