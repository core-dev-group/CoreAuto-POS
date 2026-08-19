import BranchForm from "../../BranchForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Cabang | CoreAuto POS",
};

export default async function EditBranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const branch = await prisma.branch.findUnique({
    where: { id },
  });

  if (!branch) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Cabang</h1>
        <p className="text-gray-500 mt-1">Ubah informasi untuk cabang bengkel ini.</p>
      </div>

      <BranchForm initialData={branch} />
    </div>
  );
}
