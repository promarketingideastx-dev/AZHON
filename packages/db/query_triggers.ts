import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const triggers = await prisma.$queryRaw`
    SELECT tgname as trigger_name, 
           t.relname as table_name,
           n.nspname as schema_name,
           p.proname as function_name,
           pg_get_triggerdef(trg.oid) as definition
    FROM pg_trigger trg
    JOIN pg_class t ON trg.tgrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    JOIN pg_proc p ON trg.tgfoid = p.oid
    WHERE n.nspname IN ('public', 'auth') AND trg.tgisinternal = false;
  `
  console.log(JSON.stringify(triggers, null, 2))
}
main().catch(console.error).finally(() => prisma.$disconnect())
