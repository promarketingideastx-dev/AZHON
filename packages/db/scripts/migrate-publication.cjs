const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration script for Publication Foundation...');

  const publishedProducts = await prisma.product.findMany({
    where: { status: 'PUBLISHED' },
    include: { Variants: true }
  });

  console.log(`Found ${publishedProducts.length} products currently marked as PUBLISHED.`);

  let migratedCount = 0;
  let hiddenCount = 0;

  for (const product of publishedProducts) {
    const hasVariants = product.Variants && product.Variants.length > 0;
    const hasValidPrice = product.basePrice > 0;
    
    // We check if it is valid for publication
    if (hasVariants && hasValidPrice) {
      console.log(`Migrating product ${product.id} to APPROVED + PUBLISHED...`);
      await prisma.$transaction([
        prisma.product.update({
          where: { id: product.id },
          data: { status: 'APPROVED' }
        }),
        prisma.productPublication.create({
          data: {
            productId: product.id,
            tenantId: product.tenantId,
            status: 'PUBLISHED',
            publishedAt: new Date()
          }
        })
      ]);
      migratedCount++;
    } else {
      console.log(`Product ${product.id} lacks variants or price. Demoting to DRAFT...`);
      await prisma.product.update({
        where: { id: product.id },
        data: { status: 'DRAFT' }
      });
      hiddenCount++;
    }
  }

  // Also migrate any products in 'REVIEW' status to 'IN_REVIEW'
  const reviewProducts = await prisma.product.updateMany({
    where: { status: 'REVIEW' },
    data: { status: 'IN_REVIEW' }
  });

  console.log(`Migrated ${reviewProducts.count} products from REVIEW to IN_REVIEW.`);
  console.log(`Successfully migrated ${migratedCount} products to Publication.`);
  console.log(`Demoted ${hiddenCount} products to DRAFT due to missing requirements.`);
  console.log('Migration completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
