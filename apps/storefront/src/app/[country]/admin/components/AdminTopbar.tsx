'use client';

import { useDictionary } from '@/context/DictionaryContext';
import { LogOut, Globe, Menu } from 'lucide-react';
import { logout } from '@/app/[country]/login/actions';
export function AdminTopbar({ country }: { country: string }) {
  const dict = useDictionary();
  const handleLogout = async () => {
    await logout(country);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shadow-sm">
       <div className="flex items-center gap-4">
         <button className="hidden p-2 text-gray-500 hover:text-gray-800">
            <Menu className="w-5 h-5" />
         </button>
         <div className="hidden lg:flex items-center gap-3">
           <span className="font-bold text-gray-800 tracking-tight">{dict?.adminShell?.topbar?.title || 'System Dashboard'}</span>
         </div>
       </div>
       <div className="flex items-center gap-4">
         <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
           <Globe className="w-4 h-4 text-gray-500" />
           <span className="text-xs font-bold text-gray-700 uppercase">{country}</span>
         </div>
         <div className="flex items-center gap-2">
           <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">SUPER_ADMIN</span>
         </div>
         <div className="w-px h-6 bg-gray-200 mx-1"></div>
         <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 p-2 flex items-center gap-2 rounded-lg hover:bg-red-50 transition-colors">
           <LogOut className="w-4 h-4" />
           <span className="text-sm font-medium hidden sm:block">{dict?.adminShell?.topbar?.logout || 'Salir'}</span>
         </button>
       </div>
    </header>
  );
}
