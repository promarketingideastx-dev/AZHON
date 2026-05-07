import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando inyección del catálogo semilla AZHON...');

  // 1. Usar el Tenant Global HN existente
  const tenant = await prisma.tenant.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      countryCode: 'HN',
      currencyCode: 'HNL',
      taxRate: 15,
    },
  });

  // 2. Asegurar que existe un usuario "Owner" para la tienda
  const storeOwner = await prisma.user.upsert({
    where: { 
      tenantId_email: { tenantId: tenant.id, email: 'admin@azhon.com' } 
    },
    update: {},
    create: {
      id: 'azhon-seed-admin-id',
      tenantId: tenant.id,
      email: 'admin@azhon.com',
      role: 'SUPER_ADMIN',
    },
  });

  // 3. Crear la Tienda Oficial (Store)
  const store = await prisma.store.upsert({
    where: { id: 'store-azhon-tech' },
    update: {},
    create: {
      id: 'store-azhon-tech',
      tenantId: tenant.id,
      ownerId: storeOwner.id,
      name: 'AZHON Tech Official',
    },
  });

  // 4. Limpiar productos anteriores de prueba si los hubiera
  await prisma.productVariant.deleteMany({
    where: { Product: { storeId: store.id } }
  });
  await prisma.product.deleteMany({
    where: { storeId: store.id }
  });

  // 5. Inyectar Productos Premium
  console.log('📦 Inyectando productos...');

  // Producto 1: iPhone
  const iphone = await prisma.product.create({
    data: {
      tenantId: tenant.id,
      storeId: store.id,
      title: 'Apple iPhone 15 Pro - 256GB',
      description: 'Cuerpo de titanio, chip A17 Pro y un sistema de cámaras más avanzado. El iPhone más potente hasta la fecha.',
      basePrice: 3100000, // 31,000 HNL en centavos
      imageUrl: '/products/iphone.svg',
      fulfillmentType: 'AZHON_FULFILLED',
      Variants: {
        create: {
          sku: 'APL-IP15P-256',
          attributes: { color: 'Titanio Natural', capacity: '256GB' },
          stockQty: 15,
        }
      }
    }
  });

  // Producto 2: Sony Headphones
  const sony = await prisma.product.create({
    data: {
      tenantId: tenant.id,
      storeId: store.id,
      title: 'Sony WH-1000XM5 Audífonos Inalámbricos',
      description: 'Cancelación de ruido líder en la industria, sonido premium y hasta 30 horas de batería.',
      basePrice: 950000, // 9,500 HNL en centavos
      imageUrl: '/products/sony.svg',
      fulfillmentType: 'SELLER_MANAGED',
      Variants: {
        create: {
          sku: 'SNY-WH1000XM5-BLK',
          attributes: { color: 'Negro' },
          stockQty: 8,
        }
      }
    }
  });

  // Producto 3: DJI Drone
  const dji = await prisma.product.create({
    data: {
      tenantId: tenant.id,
      storeId: store.id,
      title: 'DJI Mini 4 Pro Dron',
      description: 'Dron con cámara de menos de 249g. Grabación en 4K/60fps HDR, detección de obstáculos omnidireccional.',
      basePrice: 2400000, // 24,000 HNL en centavos
      imageUrl: '/products/dji.svg',
      fulfillmentType: 'AZHON_FULFILLED',
      Variants: {
        create: {
          sku: 'DJI-M4PRO-STD',
          attributes: { combo: 'Standard' },
          stockQty: 3,
        }
      }
    }
  });

  console.log('✅ Catálogo semilla inyectado con éxito.');
  console.log('Productos creados:');
  console.log(`- ${iphone.title}`);
  console.log(`- ${sony.title}`);
  console.log(`- ${dji.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
