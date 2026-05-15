import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getDictionary, defaultLocale } from '@/i18n';

export default async function OrderDetailPage({ params }: { params: Promise<{ country: string, orderId: string }> }) {
  const { country, orderId } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${country}/login`);
  }

  const tenant = await prisma.tenant.findUnique({
    where: { countryCode: country.toUpperCase() }
  });

  if (!tenant) redirect('/');

  const order = await prisma.order.findUnique({
    where: { 
      id: orderId,
      buyerId: user.id, // Seguridad: Asegurar que la orden pertenece al usuario
    },
    include: {
      OrderLines: {
        include: {
          Variant: {
            include: {
              Product: true
            }
          },
          Store: true
        }
      },
      Shipments: true
    }
  });

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);
  const bp = dict.buyerProfile;

  if (!order) {
    return (
      <div className="w-full max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold text-secondary mb-4">{bp?.orderNotFound || 'Orden no encontrada'}</h1>
          <Link href={`/${country}/perfil/ordenes`} className="text-primary hover:underline font-bold">{bp?.backToOrders || 'Volver a mis órdenes'}</Link>
      </div>
    );
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es', { style: 'currency', currency: tenant.currencyCode }).format(amount / 100);
  };

  const isFailed = order.status === 'PAYMENT_FAILED' || order.status === 'PAYMENT_EXPIRED';
  const isPending = order.status === 'AWAITING_PAYMENT';
  const isPaid = order.status === 'PAID';

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href={`/${country}/perfil/ordenes`} className="text-sm font-bold text-neutral hover:text-primary transition-colors">
          {bp?.backToOrdersArrow || '← Volver a Mis Órdenes'}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">
            {bp?.orderDetail || 'Detalle de Orden'} <span className="text-primary">#{order.id.split('-')[0].toUpperCase()}</span>
          </h1>
          <p className="text-neutral text-sm">
            {bp?.placedOn || 'Realizada el'} {new Date(order.createdAt).toLocaleDateString(locale === 'es' ? 'es-HN' : locale === 'pt' ? 'pt-BR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-sm border 
          ${isPaid ? 'bg-green-50 text-green-700 border-green-100' : ''}
          ${isPending ? 'bg-orange-50 text-orange-700 border-orange-100' : ''}
          ${isFailed ? 'bg-red-50 text-red-700 border-red-100' : ''}
        `}>
          {isPaid ? (bp?.statusPaid || 'PAGADA') : isPending ? (bp?.statusPending || 'ESPERANDO PAGO') : (bp?.statusFailed || 'DECLINADA / EXPIRADA')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resumen Logístico */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-background rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-secondary mb-4">{bp?.items || 'Artículos'} ({order.OrderLines.length})</h2>
            
            <div className="space-y-4 divide-y divide-gray-50">
              {order.OrderLines.map((line) => (
                <div key={line.id} className="pt-4 first:pt-0 flex gap-4">
                  <div className="w-20 h-20 bg-[#FCF9F6] rounded-xl flex items-center justify-center p-2 shrink-0">
                    {line.Variant.Product.imageUrl ? (
                      <img src={line.Variant.Product.imageUrl} alt={line.Variant.Product.title} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <span className="text-[10px] text-neutral">IMG</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-secondary text-sm mb-1">{line.Variant.Product.title}</p>
                    <p className="text-xs text-neutral mb-2">{bp?.soldBy || 'Vendido por:'} {line.Store.name}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-secondary">{bp?.qty || 'Cant:'} {line.qty}</span>
                      <span className="font-bold text-secondary">
                        {formatPrice(line.unitPriceSnap * line.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-background rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-secondary mb-4">{bp?.packageStatus || 'Estado de Paquetes'} ({order.Shipments.length})</h2>
            <div className="space-y-3">
              {order.Shipments.map((shipment, index) => (
                <div key={shipment.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-sm font-bold text-secondary">{bp?.package || 'Paquete'} {index + 1}</p>
                    <p className="text-xs text-neutral font-mono">ID: {shipment.id.split('-')[0]}</p>
                  </div>
                  <span className="text-xs font-bold bg-white px-2 py-1 rounded shadow-sm text-primary uppercase tracking-wider">
                    {shipment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen Financiero */}
        <div className="space-y-6">
          <div className="bg-background rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-secondary mb-4">{bp?.paymentSummary || 'Resumen de Pago'}</h2>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-neutral">{bp?.subtotal || 'Subtotal'}</span>
                <span className="font-medium text-secondary">{formatPrice(order.baseTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral">{bp?.taxes || 'Impuestos'}</span>
                <span className="font-medium text-secondary">{formatPrice(order.taxTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral">{bp?.shipping || 'Envío'}</span>
                <span className="font-medium text-secondary">{formatPrice(order.shippingTotal)}</span>
              </div>
              
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="font-bold text-secondary">{isPaid ? (bp?.totalPaid || 'Total Pagado') : (bp?.totalToPay || 'Total a Pagar')}</span>
                <span className="text-xl font-black text-secondary">{formatPrice(order.grandTotal)}</span>
              </div>
            </div>
            
            {isPaid ? (
              <div className="bg-green-50 rounded-lg p-4 text-xs text-green-700 leading-relaxed border border-green-100">
                {bp?.paymentSecured || 'Tu pago está asegurado por AZHON. Los fondos no serán liberados al vendedor hasta que confirmes la entrega.'}
              </div>
            ) : isPending ? (
              <div className="bg-orange-50 rounded-lg p-4 text-xs text-orange-700 leading-relaxed border border-orange-100">
                {bp?.paymentWaiting || 'Estamos esperando la confirmación del banco. Te notificaremos cuando se procese.'}
              </div>
            ) : (
              <div className="bg-red-50 rounded-lg p-4 text-xs text-red-700 leading-relaxed border border-red-100">
                {bp?.paymentDeclined || 'El pago fue declinado o la sesión expiró. Por favor intenta realizar la compra nuevamente desde la tienda.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
