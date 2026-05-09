import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import { CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';

export default async function AdminProductAuditPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${country}/login`);

  // RBAC: Check if user is SUPER_ADMIN
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-500 mb-6">Esta sección es exclusiva para administradores del sistema.</p>
          <Link href={`/${country}`} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  // Fetch products IN_REVIEW
  const productsInReview = await prisma.product.findMany({
    where: { 
      status: 'IN_REVIEW',
      Tenant: { countryCode: country.toUpperCase() }
    },
    include: {
      Store: true,
      Category: true,
      Variants: true,
      Media: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  async function approveAction(formData: FormData) {
    'use server';
    const supabaseServer = await createClient();
    const { data: { user: authUser } } = await supabaseServer.auth.getUser();
    if (!authUser) throw new Error("Unauthorized");
    
    const adminUser = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!adminUser || adminUser.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");

    const productId = formData.get('productId') as string;
    
    await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { status: 'APPROVED', rejectionReason: null }
      }),
      // Create hidden publication entity
      prisma.productPublication.upsert({
        where: { productId },
        update: { status: 'HIDDEN' },
        create: {
          productId,
          tenantId: adminUser.tenantId,
          status: 'HIDDEN'
        }
      })
    ]);

    revalidatePath(`/${country}/admin/productos/revision`);
  }

  async function rejectAction(formData: FormData) {
    'use server';
    const supabaseServer = await createClient();
    const { data: { user: authUser } } = await supabaseServer.auth.getUser();
    if (!authUser) throw new Error("Unauthorized");
    
    const adminUser = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!adminUser || adminUser.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");

    const productId = formData.get('productId') as string;
    const reason = formData.get('reason') as string;
    
    if (!reason || reason.trim() === '') throw new Error("Reason required");

    await prisma.product.update({
      where: { id: productId },
      data: { status: 'REJECTED', rejectionReason: reason }
    });

    revalidatePath(`/${country}/admin/productos/revision`);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">
            {dict?.approval?.adminReviewTitle || 'Auditoría de Productos'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Revisa y aprueba el catálogo para habilitar su publicación.</p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
          {productsInReview.length} pendientes
        </span>
      </div>

      {productsInReview.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Todo al día</h2>
          <p className="text-gray-500">No hay productos pendientes de revisión en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {productsInReview.map(product => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
              
              {/* Product Info */}
              <div className="flex-1 flex gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                  {product.Media.length > 0 ? (
                    <img src={product.Media[0].url} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sin Imagen</div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{product.Store.name}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-xs font-bold text-gray-400">{product.Category?.name || 'Sin Categoría'}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2">{product.title}</h3>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <div><strong>Precio Base:</strong> ${(product.basePrice / 100).toFixed(2)}</div>
                    <div><strong>Variantes:</strong> {product.Variants.length}</div>
                    <div><strong>Imágenes:</strong> {product.Media.length}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full md:w-72 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                <form action={approveAction}>
                  <input type="hidden" name="productId" value={product.id} />
                  <button type="submit" className="w-full bg-green-600 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">
                    <CheckCircle className="w-5 h-5" /> {dict?.approval?.approveBtn || 'Aprobar'}
                  </button>
                </form>
                
                <form action={rejectAction} className="space-y-2">
                  <input type="hidden" name="productId" value={product.id} />
                  <input 
                    type="text" 
                    name="reason" 
                    placeholder={dict?.approval?.rejectReason || 'Motivo de rechazo...'} 
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                  <button type="submit" className="w-full bg-white border border-red-200 text-red-600 font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
                    <XCircle className="w-4 h-4" /> {dict?.approval?.rejectBtn || 'Rechazar'}
                  </button>
                </form>

                <Link href={`/${country}/producto/${product.id}`} target="_blank" className="mt-auto text-sm text-center text-blue-600 hover:underline flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4" /> Ver Preview
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
