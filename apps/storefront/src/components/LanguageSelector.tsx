'use client';

import { useState, useRef, useEffect } from 'react';
import { setLanguage } from '@/app/actions/i18n';

const LOCALES = [
  { code: 'es', label: 'ES', flag: '🇪🇸' },
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'pt-BR', label: 'PT', flag: '🇧🇷' }
];

export function LanguageSelector({ currentLocale }: { currentLocale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = LOCALES.find(l => l.code === currentLocale) || LOCALES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (code: string) => {
    setIsOpen(false);
    if (code !== currentLocale) {
      await setLanguage(code);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="hidden sm:flex items-center gap-1 cursor-pointer text-sm font-bold text-secondary hover:bg-gray-100 px-2 py-1 rounded transition-colors"
      >
        <span>🌐</span> {current.label}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
          {LOCALES.map((loc) => (
            <button
              key={loc.code}
              onClick={() => handleSelect(loc.code)}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${loc.code === currentLocale ? 'font-bold text-primary bg-orange-50/50' : 'text-neutral'}`}
            >
              <span>{loc.flag}</span>
              {loc.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
