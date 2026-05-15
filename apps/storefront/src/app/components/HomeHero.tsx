import Link from 'next/link';
import SeasonEffectRenderer from './effects/SeasonEffectRenderer';
import ActiveSeasonBadge from './ActiveSeasonBadge';

export default function HomeHero({ dict, country, currencyCode = 'USD' }: { dict: any, country: string, currencyCode?: string }) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-4 pb-2">
      <div className="relative w-full rounded-3xl overflow-hidden bg-[#1A1816] min-h-[320px] md:min-h-[400px] lg:min-h-[500px] flex items-center p-5 md:p-10 lg:p-20 shadow-[0_20px_50px_-15px_rgba(255,85,0,0.15)] border border-[#FF5500]/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1816] via-[#1A1816] to-transparent z-0"></div>
        <div className="absolute right-0 top-0 bottom-0 w-[80%] md:w-2/3 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-70 md:opacity-80 z-0" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 60%)', maskImage: 'linear-gradient(to right, transparent, black 60%)' }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1816] via-[#1A1816]/90 md:via-[#1A1816]/80 to-transparent z-0"></div>

        {/* Global Season Effect Renderer */}
        <SeasonEffectRenderer zone="homeHero" />

        <div className="relative z-10 max-w-[280px] sm:max-w-md md:max-w-xl lg:max-w-2xl mt-2 sm:mt-0">
          <ActiveSeasonBadge dict={dict} />
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-3 md:mb-6 tracking-tight drop-shadow-md">
            {dict?.home?.hero_title || 'Elevate Your Lifestyle Every Day.'}
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-300 mb-5 md:mb-10 max-w-lg leading-relaxed font-medium drop-shadow-md">
            {dict?.home?.hero_desc || `Discover curated collections from global brands. Free shipping on your first purchase over ${currencyCode} 1,200. Ready. Set. Shop.`}
          </p>
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <Link href={`/${country}/categorias`} className="bg-primary text-white font-bold px-6 md:px-8 py-3 md:py-4 rounded-full hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 text-xs md:text-sm">
              {dict.home.explore_now || 'EXPLORE NOW'}
            </Link>
            <Link href={`/${country}/#flash-deals`} className="bg-transparent border border-white/20 text-white font-bold px-6 md:px-8 py-3 md:py-4 rounded-full hover:bg-white/10 transition-colors text-xs md:text-sm">
              {dict.home.view_deals || 'VIEW DEALS'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
