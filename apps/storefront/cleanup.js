import { prisma } from './src/lib/prisma';
async function run() {
    console.log("=== Búsqueda de Usuarios ===");
    try {
        const authUsers = await prisma.$queryRaw `SELECT id, email, raw_user_meta_data, created_at, last_sign_in_at FROM auth.users`;
        const publicUsers = await prisma.user.findMany();
        const testPatterns = ['test', 'prueba', 'demo', 'fake', '+'];
        const candidates = [];
        const kept = [];
        for (const au of authUsers) {
            const email = au.email?.toLowerCase() || '';
            const isTestByEmail = testPatterns.some(p => email.includes(p));
            const publicUser = publicUsers.find(u => u.id === au.id);
            let reason = [];
            if (isTestByEmail)
                reason.push('Test email pattern');
            if (!publicUser)
                reason.push('Orphan in public.User');
            if (publicUser && publicUser.role === 'BUYER' && au.raw_user_meta_data?.intent === 'seller') {
                reason.push('Failed seller intent (stuck as BUYER)');
            }
            const info = {
                id: au.id,
                email: au.email,
                created_at: au.created_at,
                role: publicUser?.role || 'MISSING_IN_PUBLIC',
                metadata: au.raw_user_meta_data,
                reason: reason.join(', ')
            };
            if (isTestByEmail || (!publicUser && email.includes('@'))) {
                candidates.push(info);
            }
            else if (email === 'soporte@azhon.shop' || email.includes('promarketingideas')) {
                kept.push(info);
            }
            else if (reason.length > 0) {
                candidates.push(info);
            }
            else {
                kept.push(info);
            }
        }
        console.log(`\nTOTAL AUTH USERS: ${authUsers.length}`);
        console.log(`TOTAL PUBLIC USERS: ${publicUsers.length}`);
        console.log("\n--- CUENTAS A CONSERVAR ---");
        kept.forEach(k => console.log(`[KEPT] ${k.email} (Role: ${k.role})`));
        console.log("\n--- CUENTAS FANTASMA / PRUEBA IDENTIFICADAS ---");
        candidates.forEach(c => console.log(`[GHOST] ${c.email} (Role: ${c.role}) - Razones: ${c.reason}`));
        if (process.argv.includes('--delete')) {
            console.log("\nEjecutando limpieza...");
            let deletedCount = 0;
            for (const c of candidates) {
                console.log(`Borrando ${c.email}...`);
                // Find if store exists
                const store = await prisma.store.findFirst({ where: { ownerId: c.id } });
                if (store) {
                    await prisma.productPublication.deleteMany({ where: { Product: { storeId: store.id } } });
                    await prisma.productMetric.deleteMany({ where: { Product: { storeId: store.id } } });
                    await prisma.productVariant.deleteMany({ where: { Product: { storeId: store.id } } });
                    await prisma.productMedia.deleteMany({ where: { Product: { storeId: store.id } } });
                    await prisma.product.deleteMany({ where: { storeId: store.id } });
                    await prisma.store.delete({ where: { id: store.id } });
                }
                // Find if user exists in public schema
                if (c.role !== 'MISSING_IN_PUBLIC') {
                    await prisma.user.delete({ where: { id: c.id } });
                }
                // Delete from auth.users via raw SQL
                await prisma.$executeRawUnsafe(`DELETE FROM auth.users WHERE id = $1`, c.id);
                deletedCount++;
            }
            console.log(`\nLIMPIEZA COMPLETADA: ${deletedCount} cuentas eliminadas.`);
        }
        else {
            console.log("\n(Modo solo auditoría. Usa --delete para eliminar)");
        }
    }
    catch (err) {
        console.error("Error:", err);
    }
    finally {
        await prisma.$disconnect();
    }
}
run();
