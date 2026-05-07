import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

/**
 * Payment Handoff Page
 * Renderiza el payload de seguridad preparado por el servidor y ejecuta la transferencia al banco.
 */
export default async function PaymentHandoffPage({ 
  params,
  searchParams 
}: { 
  params: { provider: string },
  searchParams: { [key: string]: string | undefined }
}) {
  const { provider } = await params;
  const query = await searchParams;
  const txId = query.tx;

  if (!txId) return redirect('/');

  // HARDENING: Validar que el intent es legítimo, existe, y está PENDING.
  const transaction = await prisma.transaction.findUnique({
    where: { id: txId },
    include: { Order: true }
  });

  if (!transaction || transaction.status !== 'PENDING' || transaction.Order.status !== 'AWAITING_PAYMENT') {
    // Protección contra reuso de intents viejos, expirados o ya pagados
    return (
      <div className="min-h-screen bg-[#FCF9F6] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md w-full border border-red-100">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-secondary mb-2">Enlace de Pago Inválido o Expirado</h1>
          <p className="text-neutral text-sm mb-6">Esta intención de pago ya fue procesada, ha expirado, o no existe.</p>
          <a href="/" className="bg-primary text-white font-bold py-3 px-8 rounded-full inline-block">Volver a la Tienda</a>
        </div>
      </div>
    );
  }

  if (provider === 'bac') {
    // BAC Credomatic Integration (Simulated Server-to-Server / POST Handoff)
    const { tx, amt, cur, ts, sig } = query;
    if (!tx || !sig) return redirect('/');

    return (
      <div className="min-h-screen bg-[#FCF9F6] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-secondary mb-2">Conectando con BAC Credomatic...</h1>
          <p className="text-neutral text-sm mb-6">Por favor no cierres esta ventana. Serás redirigido a la pasarela segura.</p>
          
          {/* POST Automático al banco */}
          <form id="bac-handoff-form" action="https://sandbox.baccredomatic.com/payment" method="POST">
            <input type="hidden" name="transactionId" value={tx} />
            <input type="hidden" name="amount" value={amt} />
            <input type="hidden" name="currency" value={cur} />
            <input type="hidden" name="timestamp" value={ts} />
            <input type="hidden" name="signature" value={sig} />
            <input type="hidden" name="returnUrl" value={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/hn/checkout/return?tx=${tx}`} />
          </form>

          <script dangerouslySetInnerHTML={{
            __html: `
              // Simulamos la redirección ya que este endpoint de sandbox no existe realmente
              setTimeout(() => {
                console.log("Submitting secure payload to BAC...");
                // document.getElementById('bac-handoff-form').submit();
                alert("Simulación: Redirigiendo a entorno bancario. (Form Submit bloqueado intencionalmente)");
              }, 2000);
            `
          }} />
        </div>
      </div>
    );
  }

  if (provider === 'pagadito') {
    // Pagadito Integration (Token Handoff / Hosted Checkout)
    const { token } = query;
    if (!token) return redirect('/');

    return (
      <div className="min-h-screen bg-[#FCF9F6] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-secondary mb-2">Conectando con Pagadito...</h1>
          <p className="text-neutral text-sm mb-6">Preparando entorno seguro.</p>
          
          <script dangerouslySetInnerHTML={{
            __html: `
              setTimeout(() => {
                console.log("Redirecting to Pagadito hosted page with token: ${token}");
                alert("Simulación: Transfiriendo a Hosted Page de Pagadito con token seguro.");
              }, 2000);
            `
          }} />
        </div>
      </div>
    );
  }

  if (provider === 'sandbox') {
    // Modo Sandbox Interno
    const { token, tx } = query;
    if (!token || !tx) return redirect('/');

    return (
      <div className="min-h-screen bg-[#FCF9F6] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md w-full border-2 border-dashed border-orange-300">
          <div className="text-4xl mb-4">⚙️</div>
          <h1 className="text-2xl font-bold text-secondary mb-2">Internal Sandbox</h1>
          <p className="text-neutral text-sm mb-6">Simula una respuesta de la pasarela para la transacción <span className="font-mono bg-gray-100 px-1 rounded">{tx.slice(0,8)}...</span></p>
          
          <div className="space-y-3">
            <form action="/api/webhooks/payment?provider=AZHON_SANDBOX" method="POST">
              <input type="hidden" name="transactionId" value={tx} />
              <input type="hidden" name="status" value="SUCCESS" />
              <input type="hidden" name="secret" value="azhon_internal_dev_secret" />
              <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl">
                Simular Pago Exitoso
              </button>
            </form>

            <form action="/api/webhooks/payment?provider=AZHON_SANDBOX" method="POST">
              <input type="hidden" name="transactionId" value={tx} />
              <input type="hidden" name="status" value="FAILED" />
              <input type="hidden" name="secret" value="azhon_internal_dev_secret" />
              <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl">
                Simular Tarjeta Declinada
              </button>
            </form>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100 text-[10px] text-gray-400">
            * Al hacer clic, se ejecutará el webhook en backend.
            <br />
            <a href={`/hn/checkout/return?tx=${tx}`} className="text-blue-500 underline mt-2 inline-block">Simular retorno del usuario a AZHON</a>
          </div>
        </div>
      </div>
    );
  }

  // Provider desconocido
  redirect('/');
}
