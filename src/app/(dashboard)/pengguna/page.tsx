import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { UserActionButtons } from "./UserActionButtons";

import { Pagination } from "@/components/ui/Pagination";

export const metadata = {
  title: "Kelola Pengguna | CoreAuto POS",
};

export default async function PenggunaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/"); // Only SUPER_ADMIN can access
  }

  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const limit = 10;
  const skip = (currentPage - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      include: { branch: true },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Kelola Pengguna</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Daftar staf, kasir, dan administrator sistem.</p>
        </div>
        <Link
          href="/pengguna/create"
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
        >
          <Plus size={18} /> Tambah Pengguna
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 text-xs md:text-sm">
              <tr>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Nama Lengkap</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Email</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Role</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold">Cabang Tugas</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 md:px-4 py-2 md:py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600">{u.email}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <span className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold ${
                      u.role === "SUPER_ADMIN" ? "bg-purple-100 text-purple-700" :
                      u.role === "KEPALA_CABANG" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {u.role === "SUPER_ADMIN" ? "Owner" : 
                       u.role === "KEPALA_CABANG" ? "Kepala Bengkel" : 
                       u.role === "ADMIN_GUDANG" ? "Admin Gudang" :
                       u.role === "KASIR" ? "Kasir" : u.role}
                    </span>
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600">{u.branch?.name || "Semua Cabang (Global)"}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-right">
                    <UserActionButtons user={u} currentUserId={session.user.id} />
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 md:px-4 py-8 text-center text-gray-500">
                    Belum ada data pengguna.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
