import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
const envFile = fs.readFileSync('../../apps/storefront/.env.local', 'utf8');
const dbUrl = envFile.split('\n').find(l => l.startsWith('DATABASE_URL='))?.split('=')[1]?.replace(/['"]/g, '');
process.env.DATABASE_URL = dbUrl;

const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    where: { email: { contains: 'rivipro' } },
    include: { BuyerProfile: true, SellerProfile: true, Events: true }
  });
  console.log(JSON.stringify(users, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
