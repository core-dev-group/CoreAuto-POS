import MutationForm from "../MutationForm";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Catat Mutasi Stok | CoreAuto POS",
};

export default async function NewMutationPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role === "KASIR") redirect("/");

  const branches = await prisma.branch.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const products = await prisma.product.findMany({
    select: { id: true, name: true, sku: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Catat Mutasi Stok</h1>
        <p className="text-gray-500 mt-1">Rekam arus masuk dan keluar barang ke dalam cabang tertentu.</p>
      </div>

      <MutationForm branches={branches} products={products} />
    </div>
  );
}
