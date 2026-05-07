import Link from 'next/link';

export default function HomeHero({ dict, country }: { dict: any, country: string }) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
      <div className="relative w-full rounded-3xl overflow-hidden bg-[#1A1816] min-h-[500px] flex items-center p-10 lg:p-20 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2D2824] via-[#1A1816] to-[#0A0A0A] z-0"></div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1816] via-[#1A1816]/80 to-transparent z-0"></div>

        <div className="relative z-10 max-w-2xl">
          <span className="inline-block bg-white text-orange-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-6 shadow-sm">
            {dict.home.summer_campaign || 'SUMMER CAMPAIGN 2024'}
          </span>
          <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            {dict.home.hero_title || 'Elevate Your Lifestyle Every Day.'}
          </h1>
          <p className="text-lg text-gray-300 mb-10 max-w-lg leading-relaxed font-medium">
            {dict.home.hero_desc || 'Discover curated collections from global brands. Free shipping on your first purchase over HNL 1,200. Ready. Set. Shop.'}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href={`/${country}/categorias`} className="bg-primary text-white font-bold px-8 py-4 rounded-full hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 text-sm">
              {dict.home.explore_now || 'EXPLORE NOW'}
            </Link>
            <Link href={`/${country}/ofertas`} className="bg-transparent border border-white/20 text-white font-bold px-8 py-4 rounded-full hover:bg-white/10 transition-colors text-sm">
              {dict.home.view_deals || 'VIEW DEALS'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
