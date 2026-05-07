import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeder para AZHON (Honduras)...');

  // IDs fijos para relaciones consistentes
  const TENANT_ID = '00000000-0000-0000-0000-000000000001';
  const ADMIN_ID = '11111111-1111-1111-1111-111111111111';
  const SELLER_ID = '22222222-2222-2222-2222-222222222222';
  const BUYER_ID = '33333333-3333-3333-3333-333333333333';
  const STORE_ID = '44444444-4444-4444-4444-444444444444';

  // 1. Tenant (Honduras)
  const tenantHN = await prisma.tenant.upsert({
    where: { countryCode: 'HN' },
    update: {},
    create: {
      id: TENANT_ID,
      countryCode: 'HN',
      currencyCode: 'HNL',
      taxRate: 15.00,
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Tenant Creado: ${tenantHN.countryCode}`);

  // 2. Usuarios Base
  await prisma.user.upsert({
    where: { id: ADMIN_ID },
    update: {},
    create: {
      id: ADMIN_ID,
      tenantId: TENANT_ID,
      email: 'admin@azhon.hn',
      role: 'SUPER_ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { id: SELLER_ID },
    update: {},
    create: {
      id: SELLER_ID,
      tenantId: TENANT_ID,
      email: 'seller@tiendahn.com',
      role: 'SELLER',
    },
  });

  await prisma.user.upsert({
    where: { id: BUYER_ID },
    update: {},
    create: {
      id: BUYER_ID,
      tenantId: TENANT_ID,
      email: 'buyer@test.hn',
      role: 'BUYER',
    },
  });
  console.log(`✅ Usuarios Creados (Admin, Seller, Buyer)`);

  // 3. Tienda (Store)
  const store = await prisma.store.upsert({
    where: { id: STORE_ID },
    update: {},
    create: {
      id: STORE_ID,
      tenantId: TENANT_ID,
      ownerId: SELLER_ID,
      name: 'Tienda Honduras HN',
      planType: 'STANDARD',
      kycStatus: 'APPROVED',
    },
  });
  console.log(`✅ Tienda Creada: ${store.name}`);

  // 4. Zona de Riesgo (RiskZone)
  // Como Prisma no tiene soporte puro nativo directo para el insert de geometría PostGIS,
  // aquí deberíamos usar un insert raw o dejarlo NULL e insertarlo más adelante.
  // Por ahora lo insertamos nulo para probar estructura.
  await prisma.riskZone.createMany({
    data: [
      {
        tenantId: TENANT_ID,
        name: 'SPS Centro (Segura)',
        riskLevel: 'NORMAL',
      }
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Zona de Riesgo Creada (SPS - Sin Polígono aún)`);

  // 5. Catálogo (Producto y Variante)
  // Limpiamos el producto si existía para evitar conflictos
  await prisma.productVariant.deleteMany({
    where: { Product: { storeId: STORE_ID } }
  });
  await prisma.product.deleteMany({
    where: { storeId: STORE_ID }
  });

  const product = await prisma.product.create({
    data: {
      tenantId: TENANT_ID,
      storeId: STORE_ID,
      title: 'Café Hondureño Premium',
      description: 'Café tostado 100% puro de exportación.',
      basePrice: 15000, // L. 150.00 en centavos
      fulfillmentType: 'SELLER_MANAGED',
      Variants: {
        create: {
          sku: 'CF-HN-01',
          attributes: { weight: '500g', roast: 'Dark' },
          stockQty: 50,
        }
      }
    }
  });
  console.log(`✅ Producto Creado: ${product.title} (Precio en centavos: ${product.basePrice})`);

  console.log('🚀 Seeding finalizado con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
