import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function forceCreateUser() {
  const email = 'compra@azhon.com';
  const password = 'Password123!';
  const tenantId = '00000000-0000-0000-0000-000000000001';

  console.log(`Intentando forzar creación de usuario: ${email}`);

  try {
    // 1. Insertar directamente en auth.users
    // Supabase usa auth.users para el login. Al insertarlo, su trigger replicará a public.User
    await prisma.$executeRawUnsafe(`
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, 
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
        created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', 
        gen_random_uuid(), 
        'authenticated', 
        'authenticated', 
        '${email}', 
        crypt('${password}', gen_salt('bf')), 
        now(), 
        '{"provider":"email","providers":["email"]}', 
        '{}', 
        now(), 
        now(), 
        '', 
        '', 
        '', 
        ''
      );
    `);

    console.log(`✅ Usuario ${email} insertado en auth.users con éxito.`);

    // 2. Darle un par de segundos al trigger de Supabase para crear public.User
    await new Promise(r => setTimeout(r, 2000));

    // 3. Verificar si el trigger funcionó, si no, lo forzamos manual
    const authUser: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM auth.users WHERE email = '${email}'`);
    if (authUser.length > 0) {
      const uid = authUser[0].id;
      
      // Intentar actualizar el tenantId en public.User por si el trigger no lo puso
      try {
        await prisma.user.upsert({
          where: { id: uid },
          update: { tenantId: tenantId, role: 'BUYER' },
          create: {
            id: uid,
            email: email,
            tenantId: tenantId,
            role: 'BUYER'
          }
        });
        console.log(`✅ Usuario sincronizado en public.User con tenantId HN.`);
      } catch (e: any) {
         console.log("Error sincronizando public.User:", e.message);
      }
    }

    console.log('\n=======================================');
    console.log('🎉 CUENTA CREADA POR FUERZA BRUTA 🎉');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('=======================================');
    console.log('Ve a http://localhost:3000/login, ignora el rate limit y dale a "Iniciar Sesión" (NO a crear nueva).');

  } catch (error: any) {
    console.error('❌ Error forzando la creación:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

forceCreateUser();
