'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function checkSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== 'SUPER_ADMIN') throw new Error('Unauthorized');

  return { user: dbUser };
}

export async function resolveDiscrepancyAction(formData: FormData) {
  const { user } = await checkSuperAdmin();
  const discrepancyId = formData.get('discrepancyId') as string;
  const approvedQtyStr = formData.get('approvedQty') as string;
  const auditNotes = formData.get('auditNotes') as string;
  const country = formData.get('country') as string || 'hn';

  const approvedQty = parseInt(approvedQtyStr, 10);
  if (isNaN(approvedQty) || approvedQty < 0) throw new Error('Invalid quantity');

  const discrepancy = await prisma.warehouseDiscrepancy.findUnique({
    where: { id: discrepancyId, status: 'OPEN' },
    include: {
      InboundItem: {
        include: {
          InboundRequest: true
        }
      }
    }
  });

  if (!discrepancy) throw new Error('Discrepancy not found or already closed');

  const inbound = discrepancy.InboundItem.InboundRequest;

  await prisma.$transaction(async (tx) => {
    // 1. Inyectar el stock aprobado explícitamente en el Ledger (si approvedQty > 0)
    if (approvedQty > 0) {
      await tx.inventoryLedger.upsert({
        where: {
          warehouseId_variantId: {
            warehouseId: inbound.warehouseId,
            variantId: discrepancy.InboundItem.variantId
          }
        },
        update: {
          physicalQty: { increment: approvedQty },
          availableQty: { increment: approvedQty }
        },
        create: {
          tenantId: inbound.tenantId,
          warehouseId: inbound.warehouseId,
          variantId: discrepancy.InboundItem.variantId,
          physicalQty: approvedQty,
          availableQty: approvedQty,
          status: 'AVAILABLE'
        }
      });

      // 2. Registrar movimiento logístico de ajuste/resolución
      await tx.stockMovement.create({
        data: {
          tenantId: inbound.tenantId,
          warehouseId: inbound.warehouseId,
          variantId: discrepancy.InboundItem.variantId,
          movementType: 'ADJUSTMENT', // Ajuste por auditoría de discrepancia
          qtyChange: approvedQty,
          referenceId: discrepancy.id // Referencia directa al ticket de discrepancia
        }
      });
    }

    // 3. Marcar InboundItem como VERIFIED (Auditado)
    await tx.inboundItem.update({
      where: { id: discrepancy.InboundItem.id },
      data: { status: 'VERIFIED' }
    });

    // 4. Cerrar la discrepancia con status RESOLVED
    await tx.warehouseDiscrepancy.update({
      where: { id: discrepancyId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        reason: auditNotes ? `${discrepancy.reason || ''} | Audit: ${auditNotes}` : discrepancy.reason,
        // No tenemos un campo 'approvedQty' en la tabla de discrepancia, pero
        // el stock real inyectado queda auditado en StockMovement.
      }
    });
  });

  revalidatePath(`/${country}/admin/bodega/discrepancias`);
  redirect(`/${country}/admin/bodega/discrepancias`);
}

export async function rejectDiscrepancyAction(formData: FormData) {
  await checkSuperAdmin(); // Verify admin
  const discrepancyId = formData.get('discrepancyId') as string;
  const auditNotes = formData.get('auditNotes') as string;
  const country = formData.get('country') as string || 'hn';

  if (!auditNotes || auditNotes.trim() === '') {
    throw new Error('Audit notes required for rejection');
  }

  const discrepancy = await prisma.warehouseDiscrepancy.findUnique({
    where: { id: discrepancyId, status: 'OPEN' }
  });

  if (!discrepancy) throw new Error('Discrepancy not found or already closed');

  await prisma.$transaction(async (tx) => {
    // 1. Cerrar la discrepancia con status REJECTED (Sin tocar inventario)
    await tx.warehouseDiscrepancy.update({
      where: { id: discrepancyId },
      data: {
        status: 'REJECTED',
        resolvedAt: new Date(),
        reason: `${discrepancy.reason || ''} | Rejection Audit: ${auditNotes}`
      }
    });
    
    // No inyectamos nada, el stock queda rechazado y no se mueve al ledger.
  });

  revalidatePath(`/${country}/admin/bodega/discrepancias`);
  redirect(`/${country}/admin/bodega/discrepancias`);
}
