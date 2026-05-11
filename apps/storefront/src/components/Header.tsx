'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LanguageSelector } from './LanguageSelector';
import { useDictionary } from '@/context/DictionaryContext';

import { usePathname } from 'next/navigation';

export function Header({ locale = 'es', country = 'hn' }: { locale?: string, country?: string }) {
  const { user } = useAuth();
  const dict = useDictionary();
  const pathname = usePathname() || `/${country}`;

  const isActive = (path: string, exact = false) => {
    if (exact) return pathname === path || pathname === `${path}/`;
    return pathname.startsWith(path);
  };

  const activeClass = "text-sm font-bold text-primary border-b-2 border-primary pb-1";
  const inactiveClass = "text-sm font-medium text-neutral hover:text-secondary transition-colors";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm w-full pt-[env(safe-area-inset-top)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2 lg:py-3 flex flex-col gap-2 lg:gap-3">
        
        {/* ========================================= */}
        {/* ROW 1: Logo + Huge Search + Account/Cart */}
        {/* ========================================= */}
        <div className="flex items-center justify-between gap-6 lg:gap-12">
          
          {/* Logo Zone */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Hamburger Menu (Mobile Only) */}
            <button className="lg:hidden text-2xl text-secondary p-1">
              ☰
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img 
                src="/logo-v2.png" 
                alt="AZHON" 
                className="h-9 w-auto object-contain scale-[1.4] origin-left"
              />
            </Link>
          </div>

          {/* Huge Search Bar (Desktop) - Takes up the center like Mercado Libre */}
          <div className="flex-1 hidden md:flex items-center max-w-4xl mx-auto">
            <div className="flex w-full rounded-full border border-gray-300 overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 bg-gray-50 hover:bg-white transition-all shadow-inner">
              <input 
                type="text" 
                placeholder={dict.header.search_placeholder || "Buscar productos, marcas y más..."} 
                className="flex-1 px-6 py-3 text-sm outline-none bg-transparent text-gray-900 placeholder-gray-500"
              />
              <button className="bg-primary text-white px-10 font-black text-sm hover:bg-orange-600 transition-colors tracking-wide">
                {dict.header.search_button || "Buscar"}
              </button>
            </div>
          </div>

          {/* Right Actions Zone */}
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            {/* Language Selector */}
            <LanguageSelector currentLocale={locale} />

            {/* User Account / Auth */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                href={`/${country}/perfil`} 
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors relative cursor-pointer" title="Ver Perfil"
              >
                <span className="text-base sm:text-lg">👤</span>
              </Link>
              {user && (
                <button 
                  onClick={() => {
                    import('@/app/[country]/login/actions').then(m => m.logout())
                  }}
                  className="text-[10px] sm:text-xs font-bold text-neutral hover:text-secondary transition-colors uppercase tracking-wider hidden sm:block"
                >
                  {dict.header.logout}
                </button>
              )}
            </div>

            {/* Cart Dummy */}
            <Link href={`/${country}/cart`} className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors relative cursor-pointer">
              <span className="text-base sm:text-lg text-gray-700">🛒</span>
              {/* Optional: Add a subtle badge if there are items */}
              {/* <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span> */}
            </Link>
          </div>
        </div>

        {/* ========================================= */}
        {/* ROW 2: Navigation Links (Desktop Only)    */}
        {/* ========================================= */}
        <nav className="hidden lg:flex items-center gap-6 pl-0 pb-1">
          <Link href={`/${country}`} className={isActive(`/${country}`, true) ? activeClass : inactiveClass}>{dict.header.home}</Link>
          <Link href={`/${country}/categorias`} className={isActive(`/${country}/categorias`) ? activeClass : inactiveClass}>{dict.header.categories}</Link>
          <Link href={`/${country}/ofertas`} className={isActive(`/${country}/ofertas`) ? activeClass : inactiveClass}>{dict.header.deals}</Link>
          <Link href={`/${country}/vendedor`} className={isActive(`/${country}/vendedor`) ? activeClass : inactiveClass}>{dict.header.sell}</Link>
          <Link href={`/${country}/perfil/soporte`} className={isActive(`/${country}/perfil/soporte`) ? activeClass : inactiveClass}>{dict.header.help}</Link>
        </nav>

        {/* ========================================= */}
        {/* ROW 3: Mobile Search (Mobile Only)        */}
        {/* ========================================= */}
        <div className="flex md:hidden w-full rounded-full border border-gray-300 overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 bg-gray-50 transition-all mt-1">
          <input 
            type="text" 
            placeholder={dict.header.search_placeholder || "Buscar productos..."} 
            className="flex-1 px-4 py-2.5 text-sm outline-none bg-transparent"
          />
          <button className="bg-primary text-white px-5 font-bold text-sm hover:bg-orange-600 transition-colors">
            🔍
          </button>
        </div>

      </div>
    </header>
  );
}
