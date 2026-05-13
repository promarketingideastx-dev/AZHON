import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import { MediaUploader } from '../../components/MediaUploader';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ country: string, id: string }>;
}) {
  const { country, id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${country}/login`);

  const store = await prisma.store.findFirst({
    where: { ownerId: user.id },
    include: { Tenant: true }
  });

  if (!store) redirect(`/${country}/vendedor`);

  const product = await prisma.product.findUnique({
    where: { id, storeId: store.id },
    include: {
      Category: true,
      Variants: true,
      Media: { orderBy: { position: 'asc' } },
      Publication: true
    }
  });

  if (!product) redirect(`/${country}/vendedor/productos`);

  const categories = await prisma.category.findMany({
    where: { tenantId: store.tenantId }
  });

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  async function updateProductAction(formData: FormData) {
    'use server';
    const supabaseServer = await createClient();
    const { data: { user: authUser } } = await supabaseServer.auth.getUser();
    if (!authUser) throw new Error("Unauthorized");

    const storeOwner = await prisma.store.findFirst({ where: { ownerId: authUser.id } });
    if (!storeOwner) throw new Error("Store not found");

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const basePriceStr = formData.get('basePrice') as string;
    const categoryId = formData.get('categoryId') as string;
    const action = formData.get('action') as string;
    const newMediaUrl = formData.get('newMediaUrl') as string;
    
    if (!title || !basePriceStr) throw new Error("Missing required fields");

    const basePrice = Math.round(parseFloat(basePriceStr) * 100);

    const currentProduct = await prisma.product.findUnique({ where: { id, storeId: storeOwner.id } });
    if (!currentProduct) throw new Error("Product not found");

    let newStatus = currentProduct.status;
    if (action === 'DRAFT') newStatus = 'DRAFT';
    if (action === 'IN_REVIEW') newStatus = 'IN_REVIEW';

    // Update base product
    await prisma.product.update({
      where: { id, storeId: storeOwner.id },
      data: {
        title,
        description,
        basePrice,
        categoryId: categoryId || null,
        status: newStatus,
      }
    });

    // Handle new media URL if provided
    if (newMediaUrl && newMediaUrl.startsWith('http')) {
      await prisma.productMedia.create({
        data: {
          productId: id,
          url: newMediaUrl,
          position: product?.Media ? product.Media.length : 0
        }
      });
    }

    revalidatePath(`/${country}/vendedor/productos`);
    revalidatePath(`/${country}/vendedor/productos/${id}`);
    redirect(`/${country}/vendedor/productos`);
  }

  async function publicationAction(formData: FormData) {
    'use server';
    const supabaseServer = await createClient();
    const { data: { user: authUser } } = await supabaseServer.auth.getUser();
    if (!authUser) throw new Error("Unauthorized");
    
    const storeOwner = await prisma.store.findFirst({ where: { ownerId: authUser.id } });
    if (!storeOwner) throw new Error("Store not found");

    const action = formData.get('action') as string;
    const currentProduct = await prisma.product.findUnique({ 
      where: { id, storeId: storeOwner.id },
      include: { Publication: true }
    });

    if (!currentProduct || currentProduct.status !== 'APPROVED') {
      throw new Error("Invalid state for publication");
    }

    if (action === 'PUBLISH') {
      if (currentProduct.Publication) {
        await prisma.productPublication.update({
          where: { productId: id },
          data: { status: 'PUBLISHED', publishedAt: new Date() }
        });
      } else {
        await prisma.productPublication.create({
          data: {
            productId: id,
            tenantId: currentProduct.tenantId,
            status: 'PUBLISHED',
            publishedAt: new Date()
          }
        });
      }
    } else if (action === 'PAUSE' && currentProduct.Publication) {
      await prisma.productPublication.update({
        where: { productId: id },
        data: { status: 'PAUSED' }
      });
    }

    revalidatePath(`/${country}/vendedor/productos/${id}`);
  }

  const basePriceFormatted = (product.basePrice / 100).toFixed(2);
  const isStorageConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const hasVariants = product.Variants && product.Variants.length > 0;
  const hasBasePrice = product.basePrice > 0;
  const hasMedia = product.Media && product.Media.length > 0;
  const isReadyForReview = hasVariants && hasBasePrice && hasMedia;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/${country}/vendedor/productos`} className="text-neutral hover:text-primary transition-colors">
            &larr; {dict?.sellerProfile?.back || 'Volver'}
          </Link>
          <h1 className="text-2xl font-bold text-secondary">
            {dict?.sellerProfile?.editProductTitle || 'Editar Producto'}
          </h1>
        </div>
        <div className="bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">
          <span className="text-xs font-mono text-gray-500">ID: {product.id.split('-')[0]}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-secondary mb-4">{dict?.sellerProfile?.generalInfo || 'Información General'}</h2>
            <form action={updateProductAction} className="space-y-5" id="edit-product-form">
              <div>
                <label className="block text-sm font-bold text-secondary mb-2">{dict?.sellerProfile?.productTitleLabel || 'Título del Producto *'}</label>
                <input 
                  name="title" 
                  type="text" 
                  defaultValue={product.title}
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">{dict?.sellerProfile?.basePriceLabel || 'Precio Base *'}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm font-medium">{store.Tenant?.currencyCode || ''}</span>
                    </div>
                    <input 
                      name="basePrice" 
                      type="number" 
                      step="0.01"
                      defaultValue={basePriceFormatted}
                      required 
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">{dict?.sellerProfile?.categoryLabel || 'Categoría'}</label>
                  <select 
                    name="categoryId"
                    defaultValue={product.categoryId || ''}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white"
                  >
                    <option value="">{dict?.sellerProfile?.noCategoryOption || 'Sin categoría...'}</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-secondary mb-2">{dict?.sellerProfile?.descriptionLabel || 'Descripción'}</label>
                <textarea 
                  name="description" 
                  rows={6}
                  defaultValue={product.description || ''}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-secondary">{dict?.sellerProfile?.statusLabel || 'Estado:'}</label>
                  <span className={`px-3 py-1.5 rounded-lg border text-sm font-bold uppercase tracking-wider ${
                    product.status === 'APPROVED' ? 'bg-green-50 border-green-200 text-green-700' :
                    product.status === 'IN_REVIEW' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    product.status === 'REJECTED' ? 'bg-red-50 border-red-200 text-red-700' :
                    'bg-gray-50 border-gray-200 text-gray-700'
                  }`}>
                    {dict?.approval?.[product.status === 'IN_REVIEW' ? 'inReview' : product.status.toLowerCase()] || product.status}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    type="submit"
                    name="action"
                    value="DRAFT"
                    className="bg-white border border-gray-200 text-neutral px-6 py-3 rounded-full font-bold shadow-sm hover:bg-gray-50 transition-all"
                  >
                    {dict?.sellerProfile?.saveDraft || 'Guardar Borrador'}
                  </button>
                  <button 
                    type="submit"
                    name="action"
                    value="IN_REVIEW"
                    disabled={!isReadyForReview || product.status === 'IN_REVIEW'}
                    className="bg-primary text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {dict?.sellerProfile?.submitReview || 'Enviar a Revisión'}
                  </button>
                </div>
              </div>

              {/* Readiness Checklist */}
              {!isReadyForReview && product.status !== 'APPROVED' && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-sm text-red-700">
                  <p className="font-bold mb-2">Para enviar a revisión necesitas:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {!hasVariants && <li>Crear al menos una variante (Talla/Color/SKU)</li>}
                    {!hasBasePrice && <li>Establecer un precio base válido</li>}
                    {!hasMedia && <li>Subir al menos una imagen del producto</li>}
                  </ul>
                </div>
              )}
              
              {/* Rejection Reason */}
              {product.status === 'REJECTED' && product.rejectionReason && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-sm text-red-700 mt-4">
                  <p className="font-bold mb-1">Motivo de rechazo:</p>
                  <p>{product.rejectionReason}</p>
                </div>
              )}
            </form>
          </div>

          {/* Publication Panel if Approved */}
          {product.status === 'APPROVED' && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-green-900">{dict?.approval?.publicationReadiness || 'Estado de Publicación'}</h2>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  product.Publication?.status === 'PUBLISHED' ? 'bg-green-600 text-white' : 
                  product.Publication?.status === 'PAUSED' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {product.Publication?.status ? dict?.approval?.[product.Publication.status.toLowerCase() as keyof typeof dict.approval] : (dict?.approval?.hidden || 'OCULTO')}
                </span>
              </div>
              
              <p className="text-sm text-green-800 mb-6">
                Este producto ha sido auditado y aprobado. Puedes publicarlo en la tienda cuando desees.
              </p>

              <form action={publicationAction} className="flex gap-3">
                {product.Publication?.status !== 'PUBLISHED' ? (
                  <button 
                    type="submit" 
                    name="action" 
                    value="PUBLISH"
                    className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-green-700 transition-colors flex-1"
                  >
                    {dict?.approval?.publish || 'Publicar Ahora'}
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    name="action" 
                    value="PAUSE"
                    className="bg-white border border-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex-1"
                  >
                    {dict?.approval?.pause || 'Pausar Publicación'}
                  </button>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          {/* Media Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-secondary mb-4">{dict?.mediaManager?.title || 'Galería del Producto'}</h2>
            
            <MediaUploader 
              productId={product.id}
              country={country}
              dict={dict}
              storageReady={isStorageConfigured}
              existingMedia={product.Media || []}
            />

            {/* Provisional manual URL input since we don't have S3 integration yet */}
            <div className="pt-6 mt-6 border-t border-gray-100">
              <label className="block text-xs font-bold text-neutral mb-1">{dict?.sellerProfile?.addImageUrl || 'Añadir Imagen (URL provisional)'}</label>
              <input 
                type="url" 
                name="newMediaUrl"
                form="edit-product-form"
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* Variants Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-secondary">{dict?.sellerProfile?.variantsTitle || 'Variantes'}</h2>
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{product.Variants.length}</span>
            </div>
            
            {product.Variants.length === 0 ? (
              <p className="text-sm text-neutral italic">{dict?.sellerProfile?.noVariants || 'Este producto no tiene variantes.'}</p>
            ) : (
              <ul className="space-y-3">
                {product.Variants.map(v => (
                  <li key={v.id} className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="font-bold text-secondary mb-1">SKU: {v.sku}</div>
                    <div className="flex justify-between text-neutral text-xs">
                      <span>{dict?.sellerProfile?.stockLabel || 'Stock:'} {v.stockQty}</span>
                      <Link href="#" className="text-primary hover:underline">{dict?.sellerProfile?.edit || 'Editar'}</Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            <button className="w-full mt-4 bg-white border border-gray-200 text-secondary font-bold text-sm py-2 rounded-xl hover:bg-gray-50 transition-colors">
              {dict?.sellerProfile?.addVariant || '+ Añadir Variante'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
