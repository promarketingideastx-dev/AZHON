import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres.rwajopzpypvicnpnevmk:AzhonMasterKey%212026@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'
});
async function main() {
  await client.connect();
  const res = await client.query(`
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
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  
  const funcRes = await client.query(`
    SELECT proname, prosrc 
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' AND proname LIKE '%user%';
  `);
  console.log(JSON.stringify(funcRes.rows, null, 2));

  await client.end();
}
main().catch(console.error);
