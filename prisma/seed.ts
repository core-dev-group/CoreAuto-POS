import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with professional workshop data...");

  // 1. Create Branches
  const pusat = await prisma.branch.create({
    data: {
      name: "Cabang Pusat Jakarta",
      address: "Jl. Sudirman No. 1, Jakarta Pusat",
      phone: "08123456789",
    },
  });

  const sudirman = await prisma.branch.create({
    data: {
      name: "Cabang Sudirman",
      address: "Jl. Jend. Sudirman Kav 21, Jakarta Selatan",
      phone: "08198765432",
    },
  });
  console.log("Branches created.");

  // 2. Create Users
  const defaultPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "Owner / Super Admin",
        email: "admin@bengkelin.local",
        password_hash: defaultPassword,
        role: "SUPER_ADMIN",
        branch_id: pusat.id,
      },
      {
        name: "Budi (Kepala Pusat)",
        email: "kepala@bengkelin.local",
        password_hash: defaultPassword,
        role: "KEPALA_CABANG",
        branch_id: pusat.id,
      },
      {
        name: "Siti (Admin Gudang)",
        email: "gudang@bengkelin.local",
        password_hash: defaultPassword,
        role: "ADMIN_GUDANG",
        branch_id: pusat.id,
      },
      {
        name: "Ayu (Kasir)",
        email: "kasir@bengkelin.local",
        password_hash: defaultPassword,
        role: "KASIR",
        branch_id: pusat.id,
      },
      {
        name: "Andi (Kepala Sudirman)",
        email: "kepala2@bengkelin.local",
        password_hash: defaultPassword,
        role: "KEPALA_CABANG",
        branch_id: sudirman.id,
      },
    ],
  });
  console.log("Users created.");

  // 3. Create Mechanics
  const mechanicsData = [
    { name: "Joko", branch_id: pusat.id, commission_rate: 10, phone: "0811111" },
    { name: "Tarjo", branch_id: pusat.id, commission_rate: 15, phone: "0811112" },
    { name: "Slamet", branch_id: sudirman.id, commission_rate: 12, phone: "0811113" },
    { name: "Ucup", branch_id: sudirman.id, commission_rate: 10, phone: "0811114" },
  ];
  await prisma.mechanic.createMany({ data: mechanicsData });
  console.log("Mechanics created.");

  // 4. Create Service Master
  const services = [
    { name: "Servis Ringan Motor Matic", default_price: 65000, commission_rate_override: 15 },
    { name: "Servis Ringan Motor Bebek", default_price: 55000, commission_rate_override: 15 },
    { name: "Ganti Oli Mesin", default_price: 15000, commission_rate_override: 5 },
    { name: "Tune Up Injeksi", default_price: 120000, commission_rate_override: 20 },
    { name: "Servis CVT", default_price: 85000, commission_rate_override: 20 },
    { name: "Turun Mesin (Overhaul)", default_price: 450000, commission_rate_override: 30 },
  ];
  await prisma.serviceItem.createMany({ data: services });
  console.log("Services created.");

  // 5. Create Products
  const products = [
    { sku: "OLI-SH-ADV-01", barcode: "899123456001", name: "Shell Advance AX7 10W-40 0.8L", category: "Oli", purchase_price: 45000, sell_price: 55000, min_stock_threshold_default: 10 },
    { sku: "OLI-MT-SC-01", barcode: "899123456002", name: "Motul Scooter Expert LE 10W-30 0.8L", category: "Oli", purchase_price: 65000, sell_price: 80000, min_stock_threshold_default: 10 },
    { sku: "OLI-YM-SL-01", barcode: "899123456003", name: "Yamalube Super Matic 10W-40 1L", category: "Oli", purchase_price: 55000, sell_price: 70000, min_stock_threshold_default: 15 },
    { sku: "PRT-NGK-CPR9", barcode: "899123456004", name: "Busi NGK CPR9EA-9", category: "Sparepart", purchase_price: 15000, sell_price: 25000, min_stock_threshold_default: 20 },
    { sku: "PRT-KMP-DPN", barcode: "899123456005", name: "Kampas Rem Cakram Depan Honda Original", category: "Sparepart", purchase_price: 40000, sell_price: 55000, min_stock_threshold_default: 10 },
    { sku: "PRT-VBLT-MIO", barcode: "899123456006", name: "V-Belt Yamaha Mio J Original", category: "Sparepart", purchase_price: 85000, sell_price: 110000, min_stock_threshold_default: 5 },
    { sku: "BAN-MCH-CGRIP", barcode: "899123456007", name: "Ban Michelin City Grip Pro 90/90-14 Tubeless", category: "Ban", purchase_price: 280000, sell_price: 330000, min_stock_threshold_default: 4 },
    { sku: "BAN-IRC-NF66", barcode: "899123456008", name: "Ban IRC NF66 80/90-14 Tubeless", category: "Ban", purchase_price: 180000, sell_price: 215000, min_stock_threshold_default: 5 },
  ];
  
  for (const prod of products) {
    await prisma.product.create({
      data: {
        ...prod,
        branchStocks: {
          create: [
            { branch_id: pusat.id, quantity: Math.floor(Math.random() * 50) + 20 },
            { branch_id: sudirman.id, quantity: Math.floor(Math.random() * 50) + 10 },
          ]
        }
      }
    });
  }
  console.log("Products and Stock created.");

  // 6. Create Customers & Vehicles
  const customers = [
    { name: "Bapak Budi Hartono", phone: "08122334455", vehicles: [{ plate_number: "B 1234 ABC", model: "Honda Vario 150" }, { plate_number: "B 5678 DEF", model: "Toyota Avanza" }] },
    { name: "Ibu Siti", phone: "08133445566", vehicles: [{ plate_number: "D 9999 XYZ", model: "Yamaha NMAX" }] },
    { name: "Agus Motor", phone: "085566778899", vehicles: [{ plate_number: "F 4321 GHI", model: "Honda BeAT" }] },
    { name: "Bambang", phone: null, vehicles: [{ plate_number: "B 7777 LMN", model: "Suzuki Satria" }] },
  ];

  for (const c of customers) {
    const cust = await prisma.customer.create({
      data: { name: c.name, phone: c.phone }
    });
    for (const v of c.vehicles) {
      await prisma.vehicle.create({
        data: { plate_number: v.plate_number, model: v.model, customer_id: cust.id }
      });
    }
  }
  console.log("Customers and Vehicles created.");
  
  console.log("Seeding finished completely.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
