'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function checkSellerAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const store = await prisma.store.findFirst({
    where: { ownerId: user.id }
  });
  if (!store) throw new Error('Not a seller');

  return { user, store };
}

export async function createInboundAction(formData: FormData) {
  const { store } = await checkSellerAuth();
  
  const warehouseId = formData.get('warehouseId') as string;
  const expectedAt = formData.get('expectedAt') as string;

  // Validation
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: warehouseId }
  });

  if (!warehouse || warehouse.tenantId !== store.tenantId) {
    throw new Error('Invalid warehouse destination');
  }

  const newInbound = await prisma.inboundRequest.create({
    data: {
      tenantId: store.tenantId,
      storeId: store.id,
      warehouseId,
      expectedAt: expectedAt ? new Date(expectedAt) : null,
      status: 'DRAFT'
    }
  });

  const country = formData.get('country') as string || (store.tenantId.toLowerCase() === 'hnl' ? 'hn' : 'mx'); 
  
  redirect(`/${country}/vendedor/ingresos/${newInbound.id}`);
}

export async function addInboundItemAction(formData: FormData) {
  const { store } = await checkSellerAuth();
  
  const inboundRequestId = formData.get('inboundRequestId') as string;
  const variantId = formData.get('variantId') as string;
  const expectedQty = parseInt(formData.get('expectedQty') as string, 10);
  const country = formData.get('country') as string || 'hn';

  if (!expectedQty || expectedQty <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  // Verify ownership and status
  const inbound = await prisma.inboundRequest.findUnique({
    where: { id: inboundRequestId }
  });

  if (!inbound || inbound.storeId !== store.id) {
    throw new Error('Unauthorized');
  }

  if (inbound.status !== 'DRAFT') {
    throw new Error('Cannot modify submitted inbounds');
  }

  // Verify variant ownership
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { Product: true }
  });

  if (!variant || variant.Product.storeId !== store.id) {
    throw new Error('Invalid variant');
  }

  await prisma.inboundItem.create({
    data: {
      inboundRequestId,
      variantId,
      expectedQty,
      status: 'PENDING'
    }
  });

  revalidatePath(`/${country}/vendedor/ingresos/${inboundRequestId}`);
}

export async function removeInboundItemAction(formData: FormData) {
  const { store } = await checkSellerAuth();
  const itemId = formData.get('itemId') as string;
  const inboundRequestId = formData.get('inboundRequestId') as string;
  const country = formData.get('country') as string || 'hn';

  const inbound = await prisma.inboundRequest.findUnique({
    where: { id: inboundRequestId }
  });

  if (!inbound || inbound.storeId !== store.id || inbound.status !== 'DRAFT') {
    throw new Error('Unauthorized or invalid state');
  }

  await prisma.inboundItem.delete({
    where: { id: itemId }
  });

  revalidatePath(`/${country}/vendedor/ingresos/${inboundRequestId}`);
}

export async function submitInboundAction(formData: FormData) {
  const { store } = await checkSellerAuth();
  const inboundRequestId = formData.get('inboundRequestId') as string;
  const country = formData.get('country') as string || 'hn';

  const inbound = await prisma.inboundRequest.findUnique({
    where: { id: inboundRequestId },
    include: { Items: true }
  });

  if (!inbound || inbound.storeId !== store.id) {
    throw new Error('Unauthorized');
  }

  if (inbound.status !== 'DRAFT') {
    throw new Error('Already submitted');
  }

  if (inbound.Items.length === 0) {
    throw new Error('Cannot submit empty inbound request');
  }

  await prisma.inboundRequest.update({
    where: { id: inboundRequestId },
    data: { status: 'SUBMITTED' }
  });

  revalidatePath(`/${country}/vendedor/ingresos/${inboundRequestId}`);
  redirect(`/${country}/vendedor/ingresos`);
}
