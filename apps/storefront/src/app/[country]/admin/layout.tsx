import { AdminSidebar } from './components/AdminSidebar';
import { AdminTopbar } from './components/AdminTopbar';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AlertCircle } from 'lucide-react';
import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function AdminLayout({
  children,
  params,
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

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 w-full">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md text-center w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">{dict?.adminSellers?.accessDenied || 'Acceso Denegado'}</h1>
          <Link href={`/${country}`} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors inline-block mt-4">
            {dict?.adminShell?.backToHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-gray-50 w-full">
      <AdminSidebar country={country} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        <AdminTopbar country={country} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
