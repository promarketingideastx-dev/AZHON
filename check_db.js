const { PrismaClient } = require('./packages/db/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('--- USUARIOS en public.User ---');
  console.log(users.map(u => ({ id: u.id, email: u.email })));

  const orders = await prisma.order.findMany({
    include: {
      Buyer: true,
      Shipments: true,
      Transactions: true
    }
  });

  console.log('\n--- ÓRDENES (Checkout E2E) ---');
  console.log(orders.map(o => ({
    orderId: o.id,
    buyerId: o.buyerId,
    buyerEmail: o.Buyer?.email,
    shipments: o.Shipments.length,
    escrowEntries: o.Transactions.length
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
