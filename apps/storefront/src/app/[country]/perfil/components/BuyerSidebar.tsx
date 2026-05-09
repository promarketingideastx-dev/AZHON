'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDictionary } from '@/context/DictionaryContext';
import { 
  User, 
  Package, 
  MapPin, 
  CreditCard, 
  HelpCircle, 
  FileText, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BuyerSidebar({ country }: { country: string }) {
  const pathname = usePathname();
  const dict = useDictionary();
  const bp = dict.buyerProfile;
  const router = useRouter();

  const handleLogout = async () => {
    // TODO: Connect to real logout API or Supabase client when available
    console.log("Logout triggered from sidebar");
    // Placeholder redirect
    router.push(`/${country}/login`);
  };

  const navItems = [
    { name: bp.overview, href: `/${country}/perfil`, icon: User, exact: true },
    { name: bp.orders, href: `/${country}/perfil/ordenes`, icon: Package },
    { name: bp.addresses, href: `/${country}/perfil/direcciones`, icon: MapPin },
    { name: bp.payments, href: `/${country}/perfil/pagos`, icon: CreditCard },
    { name: bp.receipts, href: `/${country}/perfil/comprobantes`, icon: FileText },
    { name: bp.support, href: `/${country}/perfil/soporte`, icon: HelpCircle },
    { name: bp.settings, href: `/${country}/perfil/configuracion`, icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-neutral hover:bg-gray-50 hover:text-secondary'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-neutral'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            {bp.logout}
          </button>
        </div>
      </div>
    </aside>
  );
}
