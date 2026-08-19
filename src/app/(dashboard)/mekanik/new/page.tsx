import MechanicForm from "../MechanicForm";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Tambah Mekanik | CoreAuto POS",
};

export default async function NewMechanicPage() {
  const branches = await prisma.branch.findMany({
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tambah Mekanik</h1>
        <p className="text-gray-500 mt-1">Daftarkan mekanik baru ke dalam sistem bengkel.</p>
      </div>

      <MechanicForm branches={branches} />
    </div>
  );
}
