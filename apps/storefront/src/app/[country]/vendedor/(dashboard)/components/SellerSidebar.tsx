'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDictionary } from '@/context/DictionaryContext';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Settings, 
  LogOut,
  Truck
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SellerSidebar({ country }: { country: string }) {
  const pathname = usePathname();
  const dict = useDictionary();
  const router = useRouter();

  const handleLogout = async () => {
    // TODO: Connect to real logout API or Supabase client when available
    console.log("Logout triggered from sidebar");
    router.push(`/${country}/login`);
  };

  const navItems = [
    { name: dict?.sellerProfile?.menu?.dashboard || 'Dashboard', href: `/${country}/vendedor`, icon: LayoutDashboard, exact: true },
    { name: dict?.sellerProfile?.menu?.products || 'Productos', href: `/${country}/vendedor/productos`, icon: Package },
    { name: dict?.sellerProfile?.menu?.inbounds || 'Ingresos', href: `/${country}/vendedor/ingresos`, icon: Truck },
    { name: dict?.sellerProfile?.menu?.variants || 'Variantes', href: `/${country}/vendedor/variantes`, icon: Tags }, // Future
    { name: dict?.sellerProfile?.menu?.settings || 'Configuración', href: `/${country}/vendedor/configuracion`, icon: Settings },
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
            {dict?.sellerProfile?.menu?.logout || 'Cerrar Sesión'}
          </button>
        </div>
      </div>
    </aside>
  );
}
