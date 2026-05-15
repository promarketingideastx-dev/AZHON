'use client';

import { useState } from 'react';
import { processCheckout } from '@/app/actions/checkout';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { getProtectedHref } from '@/lib/auth/accessBuilder';

type CheckoutButtonProps = {
  tenantId: string;
  variantId: string;
  dict?: any;
};

export default function CheckoutButton({ tenantId, variantId, dict }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const country = params?.country as string;

  const handleCheckout = () => {
    if (!user) {
      router.push(getProtectedHref({ targetPath: `/${country || 'hn'}/cart`, intent: 'buyer', user, country: country || 'hn' }));
      return;
    }

    setLoading(true);
    
    try {
      // 1. Leer carrito actual
      let currentCart: any[] = [];
      const match = document.cookie.match(new RegExp('(^| )azhon_cart=([^;]+)'));
      if (match) {
        try {
          currentCart = JSON.parse(decodeURIComponent(match[2]));
        } catch(e) {}
      }

      // 2. Hacer merge: incrementar si existe, agregar si es nuevo
      const existingItemIndex = currentCart.findIndex((i: any) => i.variantId === variantId);
      if (existingItemIndex !== -1) {
        currentCart[existingItemIndex].qty += 1;
      } else {
        currentCart.push({ variantId, tenantId, qty: 1 });
      }

      // 3. Guardar en cookie
      document.cookie = `azhon_cart=${encodeURIComponent(JSON.stringify(currentCart))}; path=/`;
      
      // 4. Redirigir al Cart
      router.push(`/${country || 'hn'}/cart`);
    } catch (err: any) {
      setResult({ success: false, error: err.message });
      setLoading(false);
    }
  };

  return (
    <div className="pt-2">
      <button 
        onClick={handleCheckout} 
        disabled={loading}
        className={`w-full text-white py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm flex items-center justify-center h-full ${user ? 'bg-secondary hover:bg-black' : 'bg-primary hover:opacity-90'}`}
      >
        {loading ? (dict?.cart?.processing || 'Añadiendo...') : (!user ? (dict?.header?.login || 'Inicia Sesión') : (dict?.cart?.add_to_cart || 'Añadir'))}
      </button>

      {result && (
        <div className="mt-4 p-4 rounded-xl text-sm overflow-auto max-h-48 bg-red-50 text-red-800 border border-red-200">
          <p className="font-bold mb-2">❌ Error al añadir al carrito</p>
          <pre className="whitespace-pre-wrap font-mono text-[10px]">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
