import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getDictionary } from '@/i18n';
import CartClient from './CartClient';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function CartPage({ params }: { params: { country: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { country } = await params;
  const countryCode = country.toUpperCase();
  const tenant = await prisma.tenant.findUnique({ where: { countryCode } });

  if (!user) {
    const nextPath = encodeURIComponent(`/${country}/cart`);
    redirect(`/${country}/login?intent=buyer&next=${nextPath}`);
  }

  const cookieStore = await cookies();
  const cartCookie = cookieStore.get('azhon_cart');
  let cartItems = [];
  
  if (cartCookie) {
    try {
      cartItems = JSON.parse(decodeURIComponent(cartCookie.value));
    } catch(e) {}
  }

  const variantIds = cartItems.map((item: any) => item.variantId);
  
  let fullCartItems: any[] = [];
  
  if (variantIds.length > 0) {
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { Product: true }
    });

    fullCartItems = cartItems.map((item: any) => {
      const v = variants.find((v: any) => v.id === item.variantId);
      return {
        ...item,
        variant: v,
      };
    }).filter((i: any) => i.variant != null);
  }

  // Use cookie locale or fallback
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'es';
  const dict = getDictionary(locale);

  return (
    <div className="bg-[#FCF9F6] min-h-screen pb-24">
      <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-12">
        <div className="text-xs text-neutral mb-6 flex items-center gap-2 font-medium tracking-wide">
          <span>{dict.cart?.breadcrumb_home || 'INICIO'}</span>
          <span className="text-gray-300">›</span>
          <span className="text-secondary font-bold">{dict.cart?.breadcrumb_cart || 'CARRITO DE COMPRAS'}</span>
        </div>
        
        <h1 className="text-4xl font-bold text-secondary mb-10 tracking-tight">
          {dict.cart.title} <span className="text-primary font-medium">({fullCartItems.length})</span>
        </h1>
        
        <CartClient 
          initialItems={fullCartItems} 
          dict={dict} 
          user={user} 
          country={country}
          currencyCode={tenant?.currencyCode || 'USD'}
          locale={locale}
        />
      </div>
    </div>
  );
}
