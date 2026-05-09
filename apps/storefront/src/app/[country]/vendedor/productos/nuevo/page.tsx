import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';

export default async function CreateProductPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${country}/login`);

  const store = await prisma.store.findFirst({
    where: { ownerId: user.id },
    include: { Tenant: true }
  });

  if (!store) redirect(`/${country}/vendedor`);

  const categories = await prisma.category.findMany({
    where: { tenantId: store.tenantId }
  });

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  async function createProductAction(formData: FormData) {
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
    
    if (!title || !basePriceStr) {
      throw new Error("Missing required fields");
    }

    // El precio debe guardarse en centavos (ej: 150.00 Lempiras = 15000 centavos)
    const basePrice = Math.round(parseFloat(basePriceStr) * 100);

    // Ejecutamos en una transacción atómica estricta (ADN Rule: Product + Variant + Metric)
    const newProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          tenantId: storeOwner.tenantId,
          storeId: storeOwner.id,
          title,
          description,
          basePrice,
          categoryId: categoryId || null,
          status: 'DRAFT', // Regla estricta: Siempre DRAFT al inicio
          fulfillmentType: 'SELLER_MANAGED',
        }
      });

      // Crear Variante Default Obligatoria (ADN Rule: Todo producto tiene mínimo 1 variante)
      await tx.productVariant.create({
        data: {
          productId: product.id,
          sku: `BASE-${Date.now().toString().slice(-6)}`,
          attributes: { isDefault: true },
          stockQty: 0,
        }
      });

      // Crear Métrica Default Inicializada a Cero (ADN Rule: No Fake Metrics)
      await tx.productMetric.create({
        data: {
          productId: product.id,
          views: 0,
          clicks: 0,
          salesCount: 0,
          favorites: 0,
        }
      });

      return product;
    });

    revalidatePath(`/${country}/vendedor/productos`);
    redirect(`/${country}/vendedor/productos/${newProduct.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${country}/vendedor/productos`} className="text-neutral hover:text-primary transition-colors">
          &larr; {dict?.sellerProfile?.back || 'Volver'}
        </Link>
        <h1 className="text-2xl font-bold text-secondary">
          {dict?.sellerProfile?.createProductTitle || 'Crear Nuevo Producto'}
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <form action={createProductAction} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">{dict?.sellerProfile?.productTitleLabel || 'Título del Producto *'}</label>
            <input 
              name="title" 
              type="text" 
              required 
              placeholder={dict?.sellerProfile?.productTitlePlaceholder || 'Ej. Tenis Deportivos Modelo X'}
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
                  required 
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">{dict?.sellerProfile?.categoryLabel || 'Categoría'}</label>
              <select 
                name="categoryId"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white"
              >
                <option value="">{dict?.sellerProfile?.selectCategory || 'Selecciona una categoría...'}</option>
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
              rows={4}
              placeholder={dict?.sellerProfile?.descriptionPlaceholder || 'Describe los detalles, materiales o características de tu producto...'}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Link 
              href={`/${country}/vendedor/productos`}
              className="px-6 py-3 rounded-full font-bold text-neutral hover:bg-gray-100 transition-colors"
            >
              {dict?.sellerProfile?.cancel || 'Cancelar'}
            </Link>
            <button 
              type="submit"
              className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all"
            >
              {dict?.sellerProfile?.saveDraft || 'Guardar Borrador'}
            </button>
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">
            {dict?.sellerProfile?.draftNote || 'El producto se guardará como DRAFT y no será visible aún.'}
          </p>
        </form>
      </div>
    </div>
  );
}
