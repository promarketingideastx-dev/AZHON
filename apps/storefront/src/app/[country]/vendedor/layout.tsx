import { SellerSidebar } from './components/SellerSidebar';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function SellerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const { country } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${country}/login`);
  }

  const { data: dbUser } = await supabase
    .from('User')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!dbUser || (dbUser.role !== 'SELLER' && dbUser.role !== 'SUPER_ADMIN')) {
    // AuthAudit Base: unauthorized_seller_access_attempt
    console.log(`[AUTH AUDIT] event: unauthorized_seller_access_attempt, user_id: ${user.id}, date: ${new Date().toISOString()}`)
    redirect(`/${country}/perfil`);
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-8 flex flex-col lg:flex-row gap-8">
        <SellerSidebar country={country} />
        
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
