import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { updateUser } from "./actions";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { CustomSelect } from "@/components/ui/CustomSelect";

export const metadata = {
  title: "Edit Pengguna | CoreAuto POS",
};

export default async function EditPenggunaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/"); 
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) notFound();

  const branches = await prisma.branch.findMany();

  const updateUserWithId = updateUser.bind(null, id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Pengguna</h1>
        <p className="text-gray-500 mt-1">Perbarui data staf, admin, atau kasir.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <form action={updateUserWithId} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input 
              name="name" 
              type="text" 
              required
              defaultValue={user.name}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Cth: Budi Santoso"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              name="email" 
              type="email" 
              required
              defaultValue={user.email}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Cth: budi@bengkelin.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role / Jabatan</label>
              <CustomSelect 
                name="role" 
                options={[
                  { value: "KASIR", label: "Kasir (POS)" },
                  { value: "ADMIN_GUDANG", label: "Admin Gudang (Cabang)" },
                  { value: "KEPALA_CABANG", label: "Kepala Bengkel" },
                  { value: "ADMIN_GUDANG_PUSAT", label: "Admin Gudang (Pusat)" },
                  { value: "SUPER_ADMIN", label: "Owner" }
                ]}
                placeholder="Pilih Jabatan"
                defaultValue={user.role}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cabang Penugasan</label>
              <CustomSelect 
                name="branch_id" 
                options={[
                  { value: "", label: "-- Semua Cabang (Global) --" },
                  ...branches.map(b => ({ value: b.id, label: b.name }))
                ]}
                placeholder="-- Semua Cabang (Global) --"
                defaultValue={user.branch_id || ""}
              />
              <p className="text-xs text-gray-500 mt-1">Kosongkan untuk Super Admin</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru (Opsional)</label>
            <input 
              name="password" 
              type="password" 
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Biarkan kosong jika tidak ingin mengubah password"
              minLength={6}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <a href="/pengguna" className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm">
              Batal
            </a>
            <ConfirmSubmitButton 
              confirmTitle="Simpan Perubahan"
              confirmMessage="Apakah Anda yakin ingin memperbarui data pengguna ini?"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow flex items-center gap-2 transition-all disabled:bg-blue-400 text-sm"
            >
              Simpan Perubahan
            </ConfirmSubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
