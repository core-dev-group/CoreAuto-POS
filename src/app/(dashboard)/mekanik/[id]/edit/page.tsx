import MechanicForm from "../../MechanicForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Mekanik | CoreAuto POS",
};

export default async function EditMechanicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const mechanic = await prisma.mechanic.findUnique({
    where: { id },
  });

  if (!mechanic) {
    notFound();
  }

  const branches = await prisma.branch.findMany({
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Mekanik</h1>
        <p className="text-gray-500 mt-1">Ubah informasi untuk data mekanik ini.</p>
      </div>

      <MechanicForm initialData={mechanic} branches={branches} />
    </div>
  );
}
