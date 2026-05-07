import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function CheckoutReturnPage({ 
  params,
  searchParams
}: { 
  params: { country: string },
  searchParams: { tx?: string, orderId?: string }
}) {
  const { country } = await params;
  const { tx, orderId } = await searchParams;

  const referenceId = tx || orderId;

  if (!referenceId) {
    redirect(`/${country}`);
  }

  // Buscar transacción real (NO MUTAMOS ESTADO, SOLO LEEMOS)
  const transaction = await prisma.transaction.findFirst({
    where: { OR: [{ id: referenceId }, { orderId: referenceId }] },
    include: { Order: true }
  });

  if (!transaction) {
    redirect(`/${country}`);
  }

  // Frontend Status Mapping (Seguro, ya que la verdad es el webhook)
  const isPaid = transaction.Order.status === 'PAID';
  const isPending = transaction.Order.status === 'AWAITING_PAYMENT';
  const isFailed = transaction.Order.status === 'PAYMENT_FAILED' || transaction.Order.status === 'PAYMENT_EXPIRED';

  return (
    <div className="min-h-screen bg-[#FCF9F6] pt-24 pb-12 px-6">
      <div className="max-w-[600px] mx-auto bg-white p-12 rounded-3xl shadow-sm text-center">
        
        {isPaid && (
          <>
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-3xl font-bold text-secondary mb-4">¡Pago Confirmado!</h1>
            <p className="text-neutral mb-8">
              Hemos recibido la confirmación de tu banco. Tu orden #{transaction.orderId.split('-')[0]} está siendo preparada.
            </p>
          </>
        )}

        {isPending && (
          <>
            <div className="text-6xl mb-6 animate-pulse">⏳</div>
            <h1 className="text-3xl font-bold text-secondary mb-4">Procesando Pago...</h1>
            <p className="text-neutral mb-8">
              Tu banco aún está procesando la transacción. Recibirás un correo cuando se confirme. 
              Puedes revisar el estado en tu perfil.
            </p>
          </>
        )}

        {isFailed && (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-3xl font-bold text-secondary mb-4">Pago Declinado</h1>
            <p className="text-neutral mb-8">
              Tu proveedor rechazó el pago o la sesión expiró. El inventario ha sido liberado.
              Para intentar nuevamente, deberás realizar una nueva orden.
            </p>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {isFailed ? (
            <form action={async () => {
              "use server";
              const { rebuildCartAndRedirect } = await import('@/app/actions/checkout');
              await rebuildCartAndRedirect(transaction.orderId, country);
            }}>
              <button 
                type="submit"
                className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-orange-600 transition-colors w-full sm:w-auto"
              >
                Recrear Carrito y Reintentar
              </button>
            </form>
          ) : (
            <Link 
              href={`/${country}/perfil/ordenes/${transaction.orderId}`}
              className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-orange-600 transition-colors"
            >
              Ver Detalles de la Orden
            </Link>
          )}

          <Link 
            href={`/${country}`}
            className="bg-gray-100 text-secondary font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors"
          >
            Volver a la Tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
