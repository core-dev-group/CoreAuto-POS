import { prisma } from "@/lib/prisma";
import { LinkWithLoading as Link } from "@/components/LinkWithLoading";
import { Users, Banknote, ArrowRight } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Komisi Mekanik | CoreAuto POS",
};

export default async function CommissionPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role === "KASIR") redirect("/");

  const { branch } = await searchParams;
  const branches = await prisma.branch.findMany({ orderBy: { name: "asc" } });
  const activeBranchId = branch || (branches.length > 0 ? branches[0].id : undefined);

  // Ambil data mekanik
  const mechanics = await prisma.mechanic.findMany({
    where: activeBranchId ? { branch_id: activeBranchId, active: true } : { active: true },
    include: {
      branch: true,
      transactionItems: {
        where: {
          transaction: { 
            status: "SELESAI",
            created_at: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Awal bulan ini
            },
          },
        },
      },
      commissionPayouts: {
        where: {
          period_start: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          }
        }
      }
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Komisi Mekanik</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Estimasi komisi bulan ini & Manajemen pencairan komisi.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <form className="flex flex-col sm:flex-row gap-4">
            <CustomSelect
              name="branch"
              defaultValue={activeBranchId || ""}
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors"
            >
              Filter
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
          {mechanics.length === 0 ? (
            <div className="col-span-full p-8 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg text-sm md:text-base">
              Tidak ada mekanik aktif di cabang ini.
            </div>
          ) : (
            mechanics.map((mechanic) => {
              // Hitung estimasi komisi (Total harga jasa * presentase mekanik)
              const estimatedTotal = mechanic.transactionItems.reduce(
                (sum, item) => sum + (item.subtotal * mechanic.commission_rate / 100), 0
              );
              
              // Total yang sudah dicairkan bulan ini
              const paidTotal = mechanic.commissionPayouts.reduce(
                (sum, payout) => sum + payout.total_amount, 0
              );

              return (
                <div key={mechanic.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow transition-shadow overflow-hidden flex flex-col">
                  <div className="p-4 md:p-5 border-b border-gray-100">
                    <div className="flex items-center gap-2 md:gap-3 mb-1">
                      <div className="p-1.5 md:p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <Users className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <h3 className="font-bold text-base md:text-lg text-gray-900 truncate">{mechanic.name}</h3>
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 ml-8 md:ml-11">
                      Rate: <span className="font-semibold text-gray-700">{mechanic.commission_rate}%</span>
                    </div>
                  </div>
                  <div className="p-4 md:p-5 bg-gray-50 flex-1 space-y-3 md:space-y-4">
                    <div>
                      <div className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase mb-0.5 md:mb-1">Estimasi Komisi (Bulan Ini)</div>
                      <div className="text-lg md:text-xl font-bold text-gray-900 truncate">Rp {estimatedTotal.toLocaleString("id-ID")}</div>
                    </div>
                    <div>
                      <div className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase mb-0.5 md:mb-1">Telah Dicairkan</div>
                      <div className="text-sm md:text-base font-semibold text-green-600 truncate">Rp {paidTotal.toLocaleString("id-ID")}</div>
                    </div>
                  </div>
                  <Link 
                    href={`/finance/commission/${mechanic.id}`}
                    className="p-3 md:p-4 bg-white border-t border-gray-100 text-blue-600 font-medium text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
                  >
                    Detail & Cairkan <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
