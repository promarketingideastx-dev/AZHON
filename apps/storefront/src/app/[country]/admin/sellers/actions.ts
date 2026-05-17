'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");
  return { dbUser, user };
}

export async function approveSellerAction(formData: FormData) {
  const { dbUser } = await requireSuperAdmin();
  
  const sellerId = formData.get('sellerId') as string;
  if (!sellerId) throw new Error("Seller ID is required");

  const profile = await prisma.sellerProfile.findUnique({ where: { id: sellerId } });
  if (!profile) throw new Error("Seller not found");

  await prisma.$transaction(async (tx) => {
    // 1. Update Profile
    await tx.sellerProfile.update({
      where: { id: sellerId },
      data: { status: 'ACTIVE' }
    });

    // 2. Update Store if it exists
    const store = await tx.store.findFirst({ where: { ownerId: profile.userId } });
    if (store) {
      await tx.store.update({
        where: { id: store.id },
        data: { kycStatus: 'APPROVED' }
      });
    }

    // 3. Create Event
    await tx.accountEvent.create({
      data: {
        userId: profile.userId,
        eventType: 'seller_approved',
        payload: { 
          adminId: dbUser.id,
          adminEmail: dbUser.email
        }
      }
    });
  });
  revalidatePath('/', 'layout');
}

export async function rejectSellerAction(formData: FormData) {
  const { dbUser } = await requireSuperAdmin();
  
  const sellerId = formData.get('sellerId') as string;
  const reason = formData.get('reason') as string;
  if (!sellerId || !reason || reason.trim() === '') {
    throw new Error("Seller ID and Reason are required");
  }

  const profile = await prisma.sellerProfile.findUnique({ where: { id: sellerId } });
  if (!profile) throw new Error("Seller not found");

  await prisma.$transaction(async (tx) => {
    // 1. Update Profile
    await tx.sellerProfile.update({
      where: { id: sellerId },
      data: { status: 'REJECTED' }
    });

    // 2. Create Event
    await tx.accountEvent.create({
      data: {
        userId: profile.userId,
        eventType: 'seller_rejected',
        payload: { 
          reason,
          adminId: dbUser.id,
          adminEmail: dbUser.email
        }
      }
    });
  });
  revalidatePath('/', 'layout');
}

export async function requestSellerInfoAction(formData: FormData) {
  const { dbUser } = await requireSuperAdmin();
  
  const sellerId = formData.get('sellerId') as string;
  const reason = formData.get('reason') as string;
  if (!sellerId || !reason || reason.trim() === '') {
    throw new Error("Seller ID and Reason are required");
  }

  const profile = await prisma.sellerProfile.findUnique({ where: { id: sellerId } });
  if (!profile) throw new Error("Seller not found");

  await prisma.$transaction(async (tx) => {
    // 1. Update Profile
    await tx.sellerProfile.update({
      where: { id: sellerId },
      data: { status: 'PENDING_DOCUMENTS' }
    });

    // 2. Create Event
    await tx.accountEvent.create({
      data: {
        userId: profile.userId,
        eventType: 'seller_more_info_requested',
        payload: { 
          reason,
          adminId: dbUser.id,
          adminEmail: dbUser.email
        }
      }
    });
  });
  revalidatePath('/', 'layout');
}

