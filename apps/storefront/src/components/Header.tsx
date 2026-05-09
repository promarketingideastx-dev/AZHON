'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LanguageSelector } from './LanguageSelector';
import { useDictionary } from '@/context/DictionaryContext';

export function Header({ locale = 'es', country = 'hn' }: { locale?: string, country?: string }) {
  const { user } = useAuth();
  const dict = useDictionary();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3">
        {/* Top Row */}
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          
          <div className="flex items-center gap-4">
            {/* Hamburger Menu (Mobile Only) */}
            <button className="lg:hidden text-2xl text-secondary p-1">
              ☰
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <img 
                src="/logo-v2.png" 
                alt="AZHON" 
                className="h-6 w-auto object-contain scale-[1.5] origin-left"
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link href={`/${country}`} className="text-sm font-bold text-primary border-b-2 border-primary pb-1">{dict.header.home}</Link>
            <Link href={`/${country}/categorias`} className="text-sm font-medium text-neutral hover:text-secondary transition-colors">{dict.header.categories}</Link>
            <Link href={`/${country}/categorias`} className="text-sm font-medium text-neutral hover:text-secondary transition-colors">{dict.header.deals}</Link>
            <Link href={`/${country}/vendedor`} className="text-sm font-medium text-neutral hover:text-secondary transition-colors">{dict.header.sell}</Link>
            <Link href={`/${country}/perfil/soporte`} className="text-sm font-medium text-neutral hover:text-secondary transition-colors">{dict.header.help}</Link>
          </nav>

          {/* Search Bar (Desktop) */}
          <div className="flex-1 max-w-2xl hidden md:flex items-center ml-4">
            <div className="flex w-full rounded-full border border-gray-300 overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <input 
                type="text" 
                placeholder={dict.header.search_placeholder} 
                className="flex-1 px-5 py-2.5 text-sm outline-none bg-transparent"
              />
              <button className="bg-primary text-white px-8 font-bold text-sm hover:bg-orange-600 transition-colors">
                {dict.header.search_button}
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 sm:gap-6 ml-auto">
            {/* Language Selector */}
            <LanguageSelector currentLocale={locale} />

            {/* User Account / Auth */}
            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link href={`/${country}/perfil`} className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors relative cursor-pointer" title="Ver Perfil">
                  <span className="text-base sm:text-lg">👤</span>
                </Link>
                <button 
                  onClick={() => {
                    import('@/app/[country]/login/actions').then(m => m.logout())
                  }}
                  className="text-[10px] sm:text-xs font-bold text-neutral hover:text-secondary transition-colors uppercase tracking-wider"
                >
                  {dict.header.logout}
                </button>
              </div>
            ) : (
              <Link 
                href={`/${country}/login`} 
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors relative cursor-pointer"
              >
                <span className="text-base sm:text-lg">👤</span>
              </Link>
            )}

            {/* Cart Dummy */}
            <Link href={`/${country}/cart`} className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors relative cursor-pointer">
              <span className="text-base sm:text-lg">🛒</span>
            </Link>
          </div>
        </div>

        {/* Search Bar (Mobile Only) */}
        <div className="flex md:hidden w-full rounded-full border border-gray-300 overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all mt-1">
          <input 
            type="text" 
            placeholder={dict.header.search_placeholder} 
            className="flex-1 px-4 py-2 text-sm outline-none bg-transparent"
          />
          <button className="bg-primary text-white px-5 font-bold text-sm hover:bg-orange-600 transition-colors">
            🔍
          </button>
        </div>
      </div>
    </header>
  );
}
