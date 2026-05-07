'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { processCheckout } from '@/app/actions/checkout';

export default function CheckoutClient({ initialItems, user, country, currencyCode, locale, tenantId }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Address State
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [department, setDepartment] = useState('');
  const [notes, setNotes] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('BAC_HN');

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount / 100);
  };

  const subtotal = initialItems.reduce((acc: number, item: any) => acc + (item.variant.Product.basePrice * item.qty), 0);
  const taxes = subtotal * 0.15; // TODO: read from tenant.taxRate
  const shipping = 0; // TODO: Delivery Intelligence
  const grandTotal = subtotal + taxes + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !department) {
      setError('Por favor completa todos los campos de dirección.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await processCheckout({
        tenantId: tenantId,
        deliveryAddress: { street, city, department, notes, country },
        paymentMethod: paymentMethod, // We pass this now
        items: initialItems.map((i: any) => ({ variantId: i.variantId, qty: i.qty }))
      });
      
      if (res.success && res.orderId) {
        // Limpiar carrito
        document.cookie = `azhon_cart=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        
        // Redirigir a la pasarela de pago (mock)
        if (res.paymentUrl) {
          router.push(res.paymentUrl);
        } else {
          router.push(`/${country}/perfil/ordenes/${res.orderId}`);
        }
      } else {
        setError(res.error || "Ocurrió un error procesando el pago.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (initialItems.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-secondary mb-4">Tu carrito está vacío</h2>
        <button onClick={() => router.push(`/${country}`)} className="bg-primary text-white px-8 py-3 rounded-full font-bold">
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Columna Izquierda: Formulario */}
      <div className="flex-1 w-full space-y-6">
        
        {/* Dirección de Envío */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
          <h2 className="text-xl font-bold text-secondary mb-4">1. Dirección de Entrega</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral mb-1">Departamento</label>
                <input 
                  type="text" 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Ej: Cortés"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral mb-1">Ciudad</label>
                <input 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej: San Pedro Sula"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral mb-1">Dirección Exacta</label>
              <input 
                type="text" 
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Calle, Avenida, Bloque, Número de casa..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral mb-1">Notas de Entrega (Opcional)</label>
              <input 
                type="text" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Indicaciones para el repartidor..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </form>
        </div>

        {/* Método de Pago */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
          <h2 className="text-xl font-bold text-secondary mb-4">2. Método de Pago</h2>
          <div className="space-y-3">
            <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'BAC_HN' ? 'border-primary bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input 
                type="radio" 
                name="payment" 
                value="BAC_HN"
                checked={paymentMethod === 'BAC_HN'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 text-primary focus:ring-primary" 
              />
              <div>
                <div className="font-bold text-secondary">BAC Credomatic (Honduras)</div>
                <div className="text-xs text-neutral">Tarjetas de crédito o débito Visa/Mastercard</div>
              </div>
            </label>
            
            <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'PAGADITO_HN' ? 'border-primary bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input 
                type="radio" 
                name="payment" 
                value="PAGADITO_HN"
                checked={paymentMethod === 'PAGADITO_HN'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 text-primary focus:ring-primary" 
              />
              <div>
                <div className="font-bold text-secondary">Pagadito (Honduras)</div>
                <div className="text-xs text-neutral">Pago seguro con pasarela regional</div>
              </div>
            </label>

            {process.env.NODE_ENV !== 'production' && (
              <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'AZHON_SANDBOX' ? 'border-primary bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="AZHON_SANDBOX"
                  checked={paymentMethod === 'AZHON_SANDBOX'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-primary focus:ring-primary" 
                />
                <div>
                  <div className="font-bold text-secondary">⚙️ Internal Sandbox (Dev Only)</div>
                  <div className="text-xs text-neutral">Simula un pago exitoso, fallido o expirado sin API externa.</div>
                </div>
              </label>
            )}
          </div>
        </div>

      </div>

      {/* Columna Derecha: Resumen */}
      <div className="w-full lg:w-[400px] shrink-0 sticky top-24">
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100/50 border border-gray-50">
          <h2 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
            <span>🧾</span> Resumen de Compra
          </h2>

          {/* Items Preview */}
          <div className="space-y-3 mb-6">
            {initialItems.map((item: any) => (
              <div key={item.variantId} className="flex gap-3 items-center">
                <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                  <img src={item.variant.Product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=100&auto=format&fit=crop"} alt={item.variant.Product.title} className="w-full h-full object-cover mix-blend-multiply" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-secondary truncate">{item.variant.Product.title}</h4>
                  <p className="text-[10px] text-neutral">Cant: {item.qty}</p>
                </div>
                <div className="text-sm font-bold text-secondary shrink-0">
                  {formatPrice(item.variant.Product.basePrice * item.qty)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 mb-6 text-sm border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center">
              <span className="text-neutral">Subtotal ({initialItems.reduce((a: any,i: any)=>a+i.qty,0)} items)</span>
              <span className="font-medium text-secondary">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral">Envío Estimado</span>
              <span className="font-medium text-neutral italic">Por calcular...</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral">Impuestos</span>
              <span className="font-medium text-secondary">{formatPrice(taxes)}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mb-8">
            <div className="text-[10px] font-bold text-neutral uppercase tracking-widest mb-1">
              Total a Pagar
            </div>
            <div className="text-3xl font-black text-secondary">
              {formatPrice(grandTotal)}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg text-center">
              {error}
            </div>
          )}

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Preparando Transacción...' : 'Ir a Pagar de Forma Segura'}
            {!loading && <span className="group-hover:translate-x-1 transition-transform">➔</span>}
          </button>
          
          <p className="text-[10px] text-center text-neutral mt-4 leading-relaxed px-4">
            Al confirmar, serás redirigido a la pasarela segura. Tu orden quedará en estado pendiente y el inventario reservado hasta que se confirme el cobro.
          </p>
        </div>
      </div>
    </div>
  );
}
