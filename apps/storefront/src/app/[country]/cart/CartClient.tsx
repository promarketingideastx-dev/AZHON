'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartClient({ initialItems, dict, user, country, currencyCode, locale }: any) {
  const [items, setItems] = useState<any[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateQty = (index: number, delta: number) => {
    const newItems = [...items];
    const newQty = newItems[index].qty + delta;
    if (newQty > 0) {
      newItems[index].qty = newQty;
      setItems(newItems);
      // Actualizar cookie
      document.cookie = `azhon_cart=${encodeURIComponent(JSON.stringify(newItems))}; path=/`;
    }
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    document.cookie = `azhon_cart=${encodeURIComponent(JSON.stringify(newItems))}; path=/`;
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount / 100);
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push(`/${country}/checkout`);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-secondary mb-4">{dict.cart.empty_cart}</h2>
        <button onClick={() => router.push('/')} className="bg-primary text-white px-8 py-3 rounded-full font-bold">
          {dict.cart.back_to_shop}
        </button>
      </div>
    );
  }

  // Cálculos de totales (Frontend Truth Alignment)
  // El backend es la única fuente de verdad transaccional final.
  const subtotal = items.reduce((acc, item) => acc + (item.variant.Product.basePrice * item.qty), 0);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      
      {/* Columna Izquierda: Ítems */}
      <div className="flex-1 w-full space-y-4">
        {items.map((item, index) => {
          // Add a default nice image if it's missing in DB
          const imageUrl = item.variant.Product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop";

          return (
            <div key={item.variantId} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 border border-gray-50">
              {/* Imagen */}
              <div className="w-full sm:w-32 h-32 bg-[#FCF9F6] rounded-xl flex items-center justify-center p-3 shrink-0 overflow-hidden">
                <img src={imageUrl} alt={item.variant.Product.title} className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              
              {/* Detalles */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mb-1">
                    {dict.cart.sold_by} AZHON OFICIAL
                  </div>
                  <h3 className="text-lg font-bold text-secondary leading-tight mb-1">{item.variant.Product.title}</h3>
                  <p className="text-sm text-neutral mb-3">Variante | ID: {item.variant.id.slice(0,8)}</p>
                  <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold">
                    <span>✓</span> {dict.cart.in_stock}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-4 bg-gray-50 rounded-full px-1 py-1 border border-gray-100">
                    <button onClick={() => updateQty(index, -1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-neutral font-medium">
                      -
                    </button>
                    <span className="font-bold text-secondary text-sm w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(index, 1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-neutral font-medium">
                      +
                    </button>
                  </div>
                  
                  {/* Acciones */}
                  <div className="flex items-center gap-4 text-sm font-medium text-neutral">
                    <button className="flex items-center gap-1 hover:text-secondary transition-colors">
                      <span>♡</span> {dict.cart.save}
                    </button>
                    <button onClick={() => removeItem(index)} className="flex items-center gap-1 hover:text-red-500 transition-colors">
                      <span>🗑</span> {dict.cart.delete}
                    </button>
                  </div>
                </div>
              </div>

              {/* Precio Unitario */}
              <div className="text-right flex flex-col justify-between sm:w-32 shrink-0">
                <div>
                  <div className="text-xl font-black text-secondary">
                    {formatPrice(item.variant.Product.basePrice)}
                  </div>
                  <div className="text-[10px] text-neutral mt-1">Precio unitario</div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Upsell section removed for honesty - pending real data implementation */}
      </div>

      {/* Columna Derecha: Resumen */}
      <div className="w-full lg:w-[400px] shrink-0 sticky top-24">
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100/50 border border-gray-50">
          <h2 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
            <span>🧾</span> {dict.cart.order_summary}
          </h2>

          <div className="space-y-4 mb-6 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-neutral">{dict.cart.subtotal.replace('{qty}', items.reduce((a: any,i: any)=>a+i.qty,0).toString())}</span>
              <span className="font-medium text-secondary">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral flex items-center gap-1">
                {dict.cart.estimated_shipping} <span className="text-gray-300">ⓘ</span>
              </span>
              <span className="font-medium text-neutral italic">Calculado en Checkout</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral">{dict.cart.taxes}</span>
              <span className="font-medium text-neutral italic">Calculado en Checkout</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mb-8">
            <div className="text-[10px] font-bold text-neutral uppercase tracking-widest mb-1">
              Subtotal Estimado
            </div>
            <div className="text-4xl font-black text-secondary">
              {formatPrice(subtotal)}
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-primary hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Proceder al Checkout'}
            {!loading && <span className="group-hover:translate-x-1 transition-transform">➔</span>}
          </button>
          
          <p className="text-[10px] text-center text-neutral mt-4 leading-relaxed px-4">
            {dict.cart.terms_acceptance}
          </p>

          {/* Banners Auxiliares */}
          <div className="mt-8 space-y-4">
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 flex gap-3">
              <div className="text-primary text-xl mt-0.5">🚚</div>
              <div>
                <h4 className="text-xs font-bold text-secondary mb-1">{dict.cart.premium_shipping_title}</h4>
                <p className="text-[10px] text-neutral leading-relaxed">
                  {dict.cart.premium_shipping_desc}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 text-center">
              <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3">
                {dict.cart.secure_payments}
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400 font-bold">VISA</div>
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400 font-bold">MC</div>
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400 font-bold">AMEX</div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
