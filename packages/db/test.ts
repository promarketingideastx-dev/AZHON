import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient(); async function x() { const t = await prisma.tenant.findMany(); console.log(t); } x();
