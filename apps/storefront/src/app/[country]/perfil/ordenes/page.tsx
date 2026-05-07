import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function OrderHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Leer órdenes reales del usuario
  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      Shipments: true,
    }
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-secondary mb-8">Mis Órdenes</h1>

      {orders.length === 0 ? (
        <div className="bg-background rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-neutral font-medium mb-4">Aún no has realizado ninguna compra.</p>
          <Link href="/" className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity">
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-background rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-mono text-neutral bg-gray-50 px-2 py-1 rounded">
                    #{order.id.split('-')[0].toUpperCase()}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-green-700 bg-green-50 px-2 py-1 rounded-md">
                    {order.status}
                  </span>
                </div>
                
                <p className="text-sm text-neutral mb-1">
                  Fecha: {new Date(order.createdAt).toLocaleDateString('es-HN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-sm text-neutral">
                  Envíos: {order.Shipments.length} paquete(s)
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-3">
                <div className="text-xl font-black text-secondary">
                  HNL {(order.grandTotal / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <Link href={`/perfil/ordenes/${order.id}`} className="text-sm font-bold text-primary hover:underline">
                  Ver Detalles &rarr;
                </Link>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
