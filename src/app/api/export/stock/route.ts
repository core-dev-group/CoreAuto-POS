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
  const branchFilter = searchParams.get("branch");

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  const branchId = isSuperAdmin ? branchFilter : session.user.branchId;

  const whereClause: any = {};
  if (branchId) {
    whereClause.branch_id = branchId;
  }

  const stocks = await prisma.branchStock.findMany({
    where: whereClause,
    include: {
      branch: true,
      product: true
    },
    orderBy: { product: { name: "asc" } }
  });

  // Build CSV
  const header = ["Cabang", "SKU", "Barcode", "Nama Barang", "Kategori", "Harga Jual", "Harga Beli", "Stok Saat Ini", "Minimum Stok"];
  
  const rows = [header.join(",")];

  stocks.forEach(st => {
    const branchName = `"${st.branch.name}"`;
    const sku = `"${st.product.sku}"`;
    const barcode = `"${st.product.barcode || ""}"`;
    const productName = `"${st.product.name}"`;
    const category = `"${st.product.category || ""}"`;
    
    rows.push([
      branchName,
      sku,
      barcode,
      productName,
      category,
      st.product.sell_price,
      st.product.purchase_price,
      st.quantity,
      st.min_stock_threshold ?? st.product.min_stock_threshold_default
    ].join(","));
  });

  const csv = rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="stok_export_${new Date().getTime()}.csv"`
    }
  });
}
