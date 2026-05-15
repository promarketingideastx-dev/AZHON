'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDictionary } from '@/context/DictionaryContext';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutGrid, 
  Package, 
  MapPin, 
  CreditCard, 
  Truck,
  Heart,
  MessageSquare,
  HelpCircle,
  LogOut 
} from 'lucide-react';

export function BuyerSidebar({ country }: { country: string }) {
  const pathname = usePathname();
  const dict = useDictionary();
  const bp = dict.buyerProfile;
  const { user } = useAuth();

  const handleLogout = async () => {
    import('@/app/[country]/login/actions').then(m => m.logout(country));
  };

  const navItems = [
    { name: bp.overview || 'Dashboard', href: `/${country}/perfil`, icon: LayoutGrid, exact: true },
    { name: bp.orders || 'Pedidos', href: `/${country}/perfil/ordenes`, icon: Package },
    { name: bp.addresses || 'Direcciones', href: `/${country}/perfil/direcciones`, icon: MapPin },
    { name: bp.payments || 'Pagos', href: `/${country}/perfil/pagos`, icon: CreditCard },
    { name: bp.sidebarShipping || 'Seguimiento', href: `/${country}/perfil/seguimiento`, icon: Truck },
    { name: bp.favorites || 'Favoritos', href: `/${country}/perfil/favoritos`, icon: Heart },
    { name: bp.recentMessages || 'Mensajes', href: `/${country}/perfil/mensajes`, icon: MessageSquare },
    { name: bp.support || 'Soporte', href: `/${country}/perfil/soporte`, icon: HelpCircle },
  ];

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  return (
    <aside className="w-full lg:w-[280px] flex-shrink-0">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
        
        {/* Profile Block EXACT copy */}
        <div className="flex flex-col mb-8">
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <div className="w-[52px] h-[52px] rounded-full overflow-hidden flex-shrink-0">
              <img 
                src={`https://ui-avatars.com/api/?name=${displayName || 'User'}&background=FCE4D6&color=D97706`} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
            {/* Text */}
            <div className="flex flex-col">
              <h3 className="font-bold text-[15px] text-gray-900 leading-tight">{displayName || bp.buyerAccountDefaultName || 'Comprador AZHON'}</h3>
              <p className="text-[13px] text-gray-500">{bp.buyerAccount || 'Cuenta de Comprador'}</p>
            </div>
          </div>
          
          <button className="w-full bg-[#F28522] text-white font-bold py-2.5 rounded-xl text-[14px] hover:bg-[#e07b1f] transition-colors shadow-sm">
            {bp.viewDetails || 'Ver detalles'}
          </button>
        </div>

        {/* Navigation EXACT copy */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors font-medium text-[14px] ${
                  isActive 
                    ? 'border border-gray-100 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#F28522]' : 'text-gray-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className={isActive ? 'text-gray-900 font-bold' : ''}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Separator and Logout area */}
        <div className="mt-8 pt-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-xl transition-colors font-medium text-[14px] text-gray-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="w-5 h-5 text-gray-400" strokeWidth={2} />
            {bp.logout || 'Cerrar sesión'}
          </button>
        </div>

      </div>
    </aside>
  );
}
