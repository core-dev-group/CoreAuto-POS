import ProductForm from "../../ProductForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Barang | CoreAuto POS",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Barang</h1>
        <p className="text-gray-500 mt-1">Ubah informasi untuk sparepart ini.</p>
      </div>

      <ProductForm initialData={product} />
    </div>
  );
}
