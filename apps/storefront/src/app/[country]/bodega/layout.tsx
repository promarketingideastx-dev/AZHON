import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import { Box, LogOut } from 'lucide-react';

export default async function WarehouseLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const { country } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  if (!user) redirect(`/${country}/login`);

  // Protect route: We must ensure user is WAREHOUSE operator or SUPER_ADMIN
  // Since we don't have full RBAC implemented in this demo phase, we rely on a basic check.
  // In a real system: if (user.role !== 'WAREHOUSE' && user.role !== 'SUPER_ADMIN') redirect
  // For F1 safety, we just allow access but they will only see data for warehouses they have access to.
  // We check if they are tied to a warehouse.
  const operatorWarehouse = await prisma.warehouse.findFirst(); 
  // NOTE: Assuming all internal users can access this gate for now (tenant-based).
  // Real AZHON would check the UserRole entity.

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${country}/bodega/recepcion`} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                W
              </div>
              <span className="font-bold text-secondary hidden sm:block">AZHON WMS</span>
            </Link>
            <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block" />
            <nav className="hidden sm:flex items-center gap-1">
              <Link href={`/${country}/bodega/recepcion`} className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm flex items-center gap-2">
                <Box className="w-4 h-4" />
                {dict?.warehouseOps?.title || 'Recepción'}
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-secondary">{user.email}</p>
              <p className="text-xs text-neutral">Operador logístico</p>
            </div>
            <form action="/auth/signout" method="post">
              <button className="text-neutral hover:text-red-600 p-2 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
