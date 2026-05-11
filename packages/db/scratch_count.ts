import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const models = [
    'tenant', 'user', 'category', 'store', 'product', 
    'productVariant', 'productMedia', 'productMetric', 'productPublication',
    'order', 'orderLine', 'riskZone', 'shipment', 'shipmentItem', 'deliveryEvent',
    'transaction', 'escrowLedger', 'warehouse', 'inboundRequest', 'inboundItem',
    'warehouseReceipt', 'warehouseDiscrepancy', 'inventoryLedger', 'stockMovement', 'stockReservation'
  ]
  
  const results: any = {}
  for (const m of models) {
    try {
      results[m] = await (prisma as any)[m].count()
    } catch(e) {
      results[m] = 'ERROR'
    }
  }
  
  console.log(JSON.stringify(results, null, 2))
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
