// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load the root .env to ensure we have DATABASE_URL and SUPABASE_SERVICE_ROLE_KEY
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("FATAL: Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY). Needed to wipe auth.users.");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log("⚠️ STARTING AZHON TOTAL CLEANUP ⚠️");
  console.log("Rules: Wipe ALL human data. Preserve ONLY structural configuration.");

  // 1. Delete all Supabase Auth Users
  console.log("\n[1/3] Fetching and deleting Supabase auth.users...");
  let hasMore = true;
  let deletedAuthUsersCount = 0;
  
  while (hasMore) {
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
    if (listError) throw listError;
    
    if (!usersData || usersData.users.length === 0) {
      hasMore = false;
      break;
    }
    
    for (const u of usersData.users) {
      const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(u.id);
      if (delError) {
        console.error(`Failed to delete auth user ${u.id}:`, delError);
      } else {
        deletedAuthUsersCount++;
      }
    }
  }
  console.log(`✅ Deleted ${deletedAuthUsersCount} users from Supabase auth.users`);

  // 2. Delete Prisma App Data
  console.log("\n[2/3] Wiping Prisma App Data in strict Cascade Order...");
  
  await prisma.$transaction([
    // A. Ancillary & Metrics
    prisma.productMetric.deleteMany(),
    prisma.productMedia.deleteMany(),
    prisma.productPublication.deleteMany(),

    // B. Logistics & Finance
    prisma.deliveryEvent.deleteMany(),
    prisma.shipmentItem.deleteMany(),
    prisma.shipment.deleteMany(),
    prisma.escrowLedger.deleteMany(),
    prisma.transaction.deleteMany(),

    // C. Orders
    prisma.orderLine.deleteMany(),
    prisma.stockReservation.deleteMany(),
    prisma.order.deleteMany(),

    // D. Inbound & Inventory
    prisma.warehouseDiscrepancy.deleteMany(),
    prisma.warehouseReceipt.deleteMany(),
    prisma.inboundItem.deleteMany(),
    prisma.inboundRequest.deleteMany(),
    prisma.stockMovement.deleteMany(),
    prisma.inventoryLedger.deleteMany(),

    // E. Catalog
    prisma.productVariant.deleteMany(),
    prisma.product.deleteMany(),

    // F. Stores & Users (All Users wiped)
    prisma.store.deleteMany(),
    prisma.user.deleteMany()
  ]);
  
  console.log("✅ Wiped all Prisma human/operational data.");

  // 3. Verify Structural Data Survived
  console.log("\n[3/3] Verifying Structural Data Survival...");
  const tenants = await prisma.tenant.count();
  const categories = await prisma.category.count();
  const warehouses = await prisma.warehouse.count();
  const riskZones = await prisma.riskZone.count();

  console.log(`✅ Survived Structure -> Tenants: ${tenants}, Categories: ${categories}, Warehouses: ${warehouses}, RiskZones: ${riskZones}`);
  
  if (tenants === 0 || categories === 0) {
    console.error("❌ CRITICAL ALARM: Structural data was unexpectedly lost! Restore from backup.");
  } else {
    console.log("\n🎉 CLEANUP COMPLETE. AZHON IS STRUCTURALLY CLEAN. 🎉");
  }
}

main()
  .catch(e => {
    console.error("FATAL ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
