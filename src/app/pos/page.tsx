import { prisma } from "@/lib/prisma";
import POSClient from "./POSClient";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ClientRedirect from "./ClientRedirect";

export const metadata = {
  title: "Kasir (POS) | CoreAuto POS",
};

export default async function Page(props: {
  searchParams: Promise<{ branch?: string }>;
}) {
  const [{ branch: branchIdParam }, session] = await Promise.all([
    props.searchParams,
    getServerSession(authOptions)
  ]);

  if (!session?.user) {
    return <ClientRedirect to="/login" />;
  }
  const userRole = session.user.role;
  const userBranchId = session.user.branchId;

  // Enforce Shift Check for everyone accessing POS
  const shift = await prisma.cashierShift.findFirst({
    where: {
      user_id: session.user.id,
      branch_id: session.user.branchId || undefined,
      status: "OPEN"
    }
  });

  if (!shift) {
    return <ClientRedirect to="/pos/shift" />;
  }

  // Fetch Branches
  const branches = await prisma.branch.findMany({
    orderBy: { name: "asc" },
  });

  let activeBranchId = branches[0]?.id;
  if (userRole === "KASIR" && userBranchId) {
    activeBranchId = userBranchId;
  } else if (branchIdParam) {
    activeBranchId = branchIdParam;
  }

  // Fetch Master Data
  const mechanics = await prisma.mechanic.findMany({
    where: {
      active: true,
      branch_id: activeBranchId,
    },
    orderBy: { name: "asc" },
  });

  const services = await prisma.serviceItem.findMany({
    orderBy: { name: "asc" },
  });

  // Fetch Products with Stock for the active branch
  const branchStocks = await prisma.branchStock.findMany({
    where: { branch_id: activeBranchId },
    include: { product: true },
  });

  const products = branchStocks.map((bs) => ({
    ...bs.product,
    stock_quantity: bs.quantity,
  }));

  return (
    <div className="h-full w-full bg-gray-50 flex flex-col">
      <POSClient 
        branches={branches}
        activeBranchId={activeBranchId}
        mechanics={mechanics}
        services={services}
        products={products}
        userRole={userRole}
      />
    </div>
  );
}
