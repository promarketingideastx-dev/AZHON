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

  // 4.1 Categorías Base
  const categoryCoffee = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: TENANT_ID, slug: 'cafe-y-bebidas' } },
    update: {},
    create: {
      tenantId: TENANT_ID,
      slug: 'cafe-y-bebidas',
      name: 'Café y Bebidas',
    }
  });
  const categoryBags = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: TENANT_ID, slug: 'moda-y-accesorios' } },
    update: {},
    create: { tenantId: TENANT_ID, slug: 'moda-y-accesorios', name: 'Moda y Accesorios' }
  });

  const categoryElectronics = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: TENANT_ID, slug: 'electronica' } },
    update: {},
    create: { tenantId: TENANT_ID, slug: 'electronica', name: 'Electrónica' }
  });

  console.log(`✅ Categorías Creadas`);

  // 5. Catálogo (Productos y Variantes)
  // Comentado para no romper órdenes existentes por constraints de llaves foráneas
  /*
  await prisma.productMedia.deleteMany({
    where: { Product: { storeId: STORE_ID } }
  });
  await prisma.productMetric.deleteMany({
    where: { Product: { storeId: STORE_ID } }
  });
  await prisma.productVariant.deleteMany({
    where: { Product: { storeId: STORE_ID } }
  });
  await prisma.product.deleteMany({
    where: { storeId: STORE_ID }
  });
  */

  const product1 = await prisma.product.create({
    data: {
      tenantId: TENANT_ID,
      storeId: STORE_ID,
      title: 'Café Hondureño Premium de Especialidad',
      description: 'Café tostado 100% puro de exportación. Cultivado a 1500m de altura en la región de Marcala. Notas de chocolate, caramelo y cítricos. Tueste medio-oscuro ideal para espresso o métodos de filtrado.',
      basePrice: 15000, // L. 150.00
      fulfillmentType: 'SELLER_MANAGED',
      status: 'PUBLISHED',
      categoryId: categoryCoffee.id,
      Variants: {
        create: [
          { sku: 'CF-HN-01', attributes: { weight: '500g', roast: 'Dark' }, stockQty: 50 },
          { sku: 'CF-HN-02', attributes: { weight: '1kg', roast: 'Medium' }, stockQty: 30 }
        ]
      }
    }
  });

  await prisma.productMedia.createMany({
    data: [
      { productId: product1.id, position: 0, url: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800&auto=format&fit=crop' },
      { productId: product1.id, position: 1, url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop' },
      { productId: product1.id, position: 2, url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop' },
      { productId: product1.id, position: 3, url: 'https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=800&auto=format&fit=crop' },
    ]
  });

  await prisma.productMetric.create({
    data: { productId: product1.id, views: 1250, salesCount: 342, favorites: 85 }
  });

  // PRODUCTO 2: Bolso de Cuero
  const product2 = await prisma.product.create({
    data: {
      tenantId: TENANT_ID,
      storeId: STORE_ID,
      title: 'Bolso de Cuero Genuino Artesanal',
      description: 'Bolso de cuero 100% natural hecho a mano por artesanos locales. Diseño minimalista y elegante, con costuras reforzadas y compartimentos interiores. Ideal para uso diario o profesional.',
      basePrice: 120000, // L. 1200.00
      fulfillmentType: 'SELLER_MANAGED',
      status: 'PUBLISHED',
      categoryId: categoryBags.id,
      Variants: {
        create: [
          { sku: 'BG-LT-BR', attributes: { color: 'Brown', size: 'Large' }, stockQty: 15 },
          { sku: 'BG-LT-BK', attributes: { color: 'Black', size: 'Large' }, stockQty: 8 }
        ]
      }
    }
  });

  await prisma.productMedia.createMany({
    data: [
      { productId: product2.id, position: 0, url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop' },
      { productId: product2.id, position: 1, url: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop' },
      { productId: product2.id, position: 2, url: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800&auto=format&fit=crop' },
      { productId: product2.id, position: 3, url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop' },
    ]
  });

  await prisma.productMetric.create({
    data: { productId: product2.id, views: 840, salesCount: 56, favorites: 120 }
  });

  // PRODUCTO 3: Auriculares Inalámbricos
  const product3 = await prisma.product.create({
    data: {
      tenantId: TENANT_ID,
      storeId: STORE_ID,
      title: 'Auriculares Inalámbricos Studio Pro con Cancelación de Ruido',
      description: 'Experiencia de sonido inmersiva con cancelación activa de ruido (ANC). Batería de 40 horas, carga rápida y conexión Bluetooth 5.3 multipunto. Almohadillas de memory foam premium.',
      basePrice: 350000, // L. 3500.00
      fulfillmentType: 'SELLER_MANAGED',
      status: 'PUBLISHED',
      categoryId: categoryElectronics.id,
      Variants: {
        create: [
          { sku: 'HP-ANC-BK', attributes: { color: 'Matte Black' }, stockQty: 120 },
        ]
      }
    }
  });

  await prisma.productMedia.createMany({
    data: [
      { productId: product3.id, position: 0, url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop' },
      { productId: product3.id, position: 1, url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop' },
      { productId: product3.id, position: 2, url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop' },
      { productId: product3.id, position: 3, url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop' },
    ]
  });

  await prisma.productMetric.create({
    data: { productId: product3.id, views: 3200, salesCount: 890, favorites: 450 }
  });

  console.log(`✅ Productos Semilla Creados con Galerías de Alta Calidad.`);

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
