import ServiceForm from "../../ServiceForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Jasa Servis | CoreAuto POS",
};

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const service = await prisma.serviceItem.findUnique({
    where: { id },
  });

  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Jasa Servis</h1>
        <p className="text-gray-500 mt-1">Ubah informasi untuk layanan jasa servis ini.</p>
      </div>

      <ServiceForm initialData={service} />
    </div>
  );
}
