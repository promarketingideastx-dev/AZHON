import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      Buyer: true
    }
  });

  console.log('--- USERS ---');
  console.log(JSON.stringify(users, null, 2));
  console.log('--- RECENT ORDERS ---');
  console.log(JSON.stringify(orders.map(o => ({ id: o.id, buyerId: o.buyerId, buyerEmail: o.Buyer.email, status: o.status, grandTotal: o.grandTotal })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
