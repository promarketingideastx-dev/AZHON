import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import CheckoutClient from './CheckoutClient';
import { getDictionary } from '@/i18n';

export default async function CheckoutPage({ params }: { params: { country: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { country } = await params;
  const countryCode = country.toUpperCase();
  const tenant = await prisma.tenant.findUnique({ where: { countryCode } });

  if (!user) {
    const nextPath = encodeURIComponent(`/${country}/checkout`);
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

  if (fullCartItems.length === 0) {
    redirect(`/${country}/cart`);
  }

  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'es';

  return (
    <div className="bg-[#FCF9F6] min-h-screen pb-24">
      <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-12">
        <h1 className="text-4xl font-bold text-secondary mb-10 tracking-tight">
          Checkout Transaccional
        </h1>
        
        <CheckoutClient 
          initialItems={fullCartItems} 
          user={user} 
          country={country}
          currencyCode={tenant?.currencyCode || 'HNL'}
          locale={locale}
          tenantId={tenant?.id}
        />
      </div>
    </div>
  );
}
