import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function OfertasPage({ params }: { params: { country: string } }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  return (
    <div className="w-full bg-[#FCF9F6] min-h-[calc(100vh-80px)]">
      <div className="bg-[#FF5500] text-white py-12 px-4 shadow-inner">
        <div className="max-w-[1440px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight italic uppercase drop-shadow-sm">
            {dict.header?.deals || 'OFERTAS'}
          </h1>
          <p className="text-orange-50 font-medium">
            Encuentra las mejores oportunidades en AZHON.
          </p>
        </div>
      </div>
      
      <div className="max-w-[1440px] mx-auto py-24 text-center px-4">
        <div className="text-6xl mb-6 opacity-80">⚡</div>
        <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Preparando nuevas ofertas</h3>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
          Nuestros vendedores están preparando las mejores promociones y descuentos. Regresa muy pronto para aprovecharlas.
        </p>
      </div>
    </div>
  );
}
