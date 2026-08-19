import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  const branchId = isSuperAdmin ? undefined : session.user.branchId;

  const whereClause: any = {
    branch_id: branchId || undefined,
  };

  if (start && end) {
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    whereClause.created_at = {
      gte: new Date(start),
      lte: endDate
    };
  }

  const cashflows = await prisma.cashflowEntry.findMany({
    where: whereClause,
    include: {
      branch: true
    },
    orderBy: { created_at: "desc" }
  });

  // Build CSV
  const header = ["Cabang", "Tanggal", "Tipe", "Kategori", "Nominal", "Deskripsi", "Dicatat Oleh"];
  
  const rows = [header.join(",")];

  cashflows.forEach(cf => {
    const date = new Date(cf.created_at).toISOString().split('T')[0];
    const branchName = `"${cf.branch.name}"`;
    const type = `"${cf.type}"`;
    const category = `"${cf.category}"`;
    const amount = cf.amount;
    const desc = `"${cf.description || ""}"`;
    const createdBy = `"${cf.created_by}"`;

    rows.push([
      branchName,
      date,
      type,
      category,
      amount,
      desc,
      createdBy
    ].join(","));
  });

  const csv = rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="cashflow_export_${new Date().getTime()}.csv"`
    }
  });
}
