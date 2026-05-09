'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// 24 hours in ms
const DEDUPLICATION_WINDOW = 24 * 60 * 60 * 1000;

export async function trackProductViewAction(productId: string) {
  try {
    const cookieStore = await cookies();
    const viewsCookie = cookieStore.get('azhon_viewed_products')?.value;
    
    let viewedProducts: { id: string, ts: number }[] = [];
    if (viewsCookie) {
      try {
        viewedProducts = JSON.parse(viewsCookie);
      } catch (e) {
        // ignore invalid cookie
      }
    }

    const now = Date.now();
    // Filter out expired tracking
    viewedProducts = viewedProducts.filter(item => (now - item.ts) < DEDUPLICATION_WINDOW);

    // If already viewed in the window, do nothing
    if (viewedProducts.some(item => item.id === productId)) {
      return { success: true, duplicated: true };
    }

    // Add to tracking
    viewedProducts.push({ id: productId, ts: now });

    // Update DB
    await prisma.productMetric.upsert({
      where: { productId },
      update: { views: { increment: 1 } },
      create: {
        productId,
        views: 1,
        clicks: 0,
        favorites: 0,
        salesCount: 0
      }
    });

    // Set cookie
    cookieStore.set('azhon_viewed_products', JSON.stringify(viewedProducts), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return { success: true, duplicated: false };
  } catch (error) {
    console.error('Failed to track product view:', error);
    return { success: false, error: 'Tracking failed' };
  }
}

export async function trackProductClickAction(productId: string) {
  try {
    const cookieStore = await cookies();
    const clicksCookie = cookieStore.get('azhon_clicked_products')?.value;
    
    let clickedProducts: { id: string, ts: number }[] = [];
    if (clicksCookie) {
      try {
        clickedProducts = JSON.parse(clicksCookie);
      } catch (e) {
        // ignore invalid cookie
      }
    }

    const now = Date.now();
    clickedProducts = clickedProducts.filter(item => (now - item.ts) < DEDUPLICATION_WINDOW);

    if (clickedProducts.some(item => item.id === productId)) {
      return { success: true, duplicated: true };
    }

    clickedProducts.push({ id: productId, ts: now });

    await prisma.productMetric.upsert({
      where: { productId },
      update: { clicks: { increment: 1 } },
      create: {
        productId,
        views: 0,
        clicks: 1,
        favorites: 0,
        salesCount: 0
      }
    });

    cookieStore.set('azhon_clicked_products', JSON.stringify(clickedProducts), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24
    });

    return { success: true, duplicated: false };
  } catch (error) {
    console.error('Failed to track product click:', error);
    return { success: false, error: 'Tracking failed' };
  }
}
