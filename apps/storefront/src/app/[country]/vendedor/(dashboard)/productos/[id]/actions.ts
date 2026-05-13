'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function uploadProductMediaAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    const productId = formData.get('productId') as string;
    const file = formData.get('file') as File;
    const country = formData.get('country') as string;

    if (!productId || !file || !country) {
      return { success: false, error: 'MISSING_FIELDS' };
    }

    // Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'INVALID_TYPE' };
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return { success: false, error: 'FILE_TOO_LARGE' };
    }

    const store = await prisma.store.findFirst({ where: { ownerId: user.id } });
    if (!store) {
      return { success: false, error: 'STORE_NOT_FOUND' };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId, storeId: store.id },
      include: { Media: true }
    });

    if (!product) {
      return { success: false, error: 'PRODUCT_NOT_FOUND' };
    }

    if (product.Media.length >= 8) {
      return { success: false, error: 'MAX_IMAGES_REACHED' };
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${store.id}/${productId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('product-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { success: false, error: 'UPLOAD_FAILED' };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('product-media')
      .getPublicUrl(filePath);

    // Save to Prisma
    await prisma.productMedia.create({
      data: {
        productId,
        url: publicUrlData.publicUrl,
        position: product.Media.length,
        mediaType: 'IMAGE'
      }
    });

    revalidatePath(`/${country}/vendedor/productos/${productId}`);
    return { success: true };

  } catch (error) {
    console.error('Media upload action error:', error);
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}

export async function deleteProductMediaAction(mediaId: string, productId: string, country: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'UNAUTHORIZED' };

    const store = await prisma.store.findFirst({ where: { ownerId: user.id } });
    if (!store) return { success: false, error: 'STORE_NOT_FOUND' };

    const media = await prisma.productMedia.findUnique({
      where: { id: mediaId },
      include: { Product: true }
    });

    if (!media || media.Product.storeId !== store.id || media.productId !== productId) {
      return { success: false, error: 'NOT_FOUND_OR_UNAUTHORIZED' };
    }

    // Extract filePath from URL
    const urlObj = new URL(media.url);
    const pathParts = urlObj.pathname.split('/product-media/');
    if (pathParts.length > 1) {
      const filePath = pathParts[1];
      await supabase.storage.from('product-media').remove([filePath]);
    }

    await prisma.productMedia.delete({ where: { id: mediaId } });

    revalidatePath(`/${country}/vendedor/productos/${productId}`);
    return { success: true };

  } catch (error) {
    console.error('Delete media action error:', error);
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}

export async function setPrimaryProductMediaAction(mediaId: string, productId: string, country: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'UNAUTHORIZED' };

    const store = await prisma.store.findFirst({ where: { ownerId: user.id } });
    if (!store) return { success: false, error: 'STORE_NOT_FOUND' };

    const media = await prisma.productMedia.findUnique({
      where: { id: mediaId },
      include: { Product: true }
    });

    if (!media || media.Product.storeId !== store.id || media.productId !== productId) {
      return { success: false, error: 'NOT_FOUND_OR_UNAUTHORIZED' };
    }

    // Transaction to update positions
    await prisma.$transaction([
      // Move all media up by 1 position to make room at position 0
      prisma.productMedia.updateMany({
        where: { productId, id: { not: mediaId } },
        data: { position: { increment: 1 } }
      }),
      // Set the selected media to position 0
      prisma.productMedia.update({
        where: { id: mediaId },
        data: { position: 0 }
      })
    ]);

    revalidatePath(`/${country}/vendedor/productos/${productId}`);
    return { success: true };

  } catch (error) {
    console.error('Set primary media action error:', error);
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}
