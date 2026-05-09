'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function checkWarehouseAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  // For F1, we allow access to any authenticated user since role system is partial.
  // Real AZHON: Check WAREHOUSE role.
  return { user };
}

export async function startReceivingAction(formData: FormData) {
  const { user } = await checkWarehouseAuth();
  const inboundRequestId = formData.get('inboundRequestId') as string;
  const country = formData.get('country') as string || 'hn';

  const inbound = await prisma.inboundRequest.findFirst({
    where: { id: inboundRequestId, status: 'SUBMITTED' }
  });

  if (!inbound) throw new Error('Invalid inbound request');

  // Transición atómica: Cambiar a RECEIVING y crear OPEN Receipt
  await prisma.$transaction(async (tx) => {
    await tx.inboundRequest.update({
      where: { id: inboundRequestId },
      data: { status: 'RECEIVING' }
    });

    await tx.warehouseReceipt.create({
      data: {
        inboundRequestId: inboundRequestId,
        receiverId: user.id,
        status: 'OPEN'
      }
    });
  });

  revalidatePath(`/${country}/bodega/recepcion`);
  redirect(`/${country}/bodega/recepcion/${inboundRequestId}`);
}

export async function validateItemAction(formData: FormData) {
  const { user } = await checkWarehouseAuth();
  
  const itemId = formData.get('itemId') as string;
  const actualQtyStr = formData.get('actualQty') as string;
  const reason = formData.get('reason') as string;
  const inboundRequestId = formData.get('inboundRequestId') as string;
  const country = formData.get('country') as string || 'hn';

  const actualQty = parseInt(actualQtyStr, 10);
  if (isNaN(actualQty) || actualQty < 0) throw new Error('Invalid quantity');

  const item = await prisma.inboundItem.findUnique({
    where: { id: itemId },
    include: { InboundRequest: true }
  });

  if (!item || item.InboundRequest.status !== 'RECEIVING') {
    throw new Error('Invalid item or request state');
  }

  const isDiscrepancy = actualQty !== item.expectedQty;

  await prisma.$transaction(async (tx) => {
    // 1. Marcar item
    await tx.inboundItem.update({
      where: { id: itemId },
      data: {
        status: isDiscrepancy ? 'DISCREPANCY' : 'VERIFIED',
      }
    });

    // 2. Si hay discrepancia, registrar en la tabla de auditoría
    if (isDiscrepancy) {
      await tx.warehouseDiscrepancy.create({
        data: {
          inboundItemId: itemId,
          validatorId: user.id,
          expectedQty: item.expectedQty,
          actualQty: actualQty,
          reason: reason || 'Cantidad difiere de lo declarado',
          status: 'OPEN'
        }
      });
    }
  });

  revalidatePath(`/${country}/bodega/recepcion/${inboundRequestId}`);
}

export async function closeReceiptAction(formData: FormData) {
  const { user } = await checkWarehouseAuth();
  const inboundRequestId = formData.get('inboundRequestId') as string;
  const country = formData.get('country') as string || 'hn';

  const inbound = await prisma.inboundRequest.findUnique({
    where: { id: inboundRequestId },
    include: { 
      Items: true,
      Receipts: {
        where: { status: 'OPEN' }
      }
    }
  });

  if (!inbound || inbound.Receipts.length === 0) {
    throw new Error('No open receipt found');
  }

  // Verificar que todos los items hayan sido procesados (VERIFIED o DISCREPANCY)
  const unprocessed = inbound.Items.some(i => i.status === 'PENDING' || !i.status);
  if (unprocessed) {
    throw new Error('Debe verificar todos los ítems antes de cerrar el recibo');
  }

  const receiptId = inbound.Receipts[0].id;

  // LÓGICA CORE AZHON: Inyección de Inventario Físico (Verdades Absolutas)
  await prisma.$transaction(async (tx) => {
    for (const item of inbound.Items) {
      if (item.status === 'VERIFIED') {
        const qtyToInject = item.expectedQty; // Si es verificado, expected == actual

        // Buscar o crear InventoryLedger
        const ledger = await tx.inventoryLedger.upsert({
          where: {
            warehouseId_variantId: {
              warehouseId: inbound.warehouseId,
              variantId: item.variantId
            }
          },
          update: {
            physicalQty: { increment: qtyToInject },
            availableQty: { increment: qtyToInject }
          },
          create: {
            tenantId: inbound.tenantId,
            warehouseId: inbound.warehouseId,
            variantId: item.variantId,
            physicalQty: qtyToInject,
            availableQty: qtyToInject,
            status: 'AVAILABLE'
          }
        });

        // Registrar movimiento logístico (StockMovement)
        await tx.stockMovement.create({
          data: {
            tenantId: inbound.tenantId,
            warehouseId: inbound.warehouseId,
            variantId: item.variantId,
            movementType: 'INBOUND',
            qtyChange: qtyToInject,
            referenceId: receiptId
          }
        });
      }
      // Nota: Si es DISCREPANCY, NO se suma al ledger físico automáticamente (Cuarentena lógica temporal F1)
    }

    // Cerrar Receipt
    await tx.warehouseReceipt.update({
      where: { id: receiptId },
      data: { status: 'CLOSED' }
    });

    // Cerrar Inbound
    await tx.inboundRequest.update({
      where: { id: inboundRequestId },
      data: { status: 'COMPLETED' }
    });
  });

  revalidatePath(`/${country}/bodega/recepcion/${inboundRequestId}`);
  redirect(`/${country}/bodega/recepcion`);
}
