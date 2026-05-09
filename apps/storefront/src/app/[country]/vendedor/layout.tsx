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

  // TODO: Check if user.role === 'SELLER' or 'SUPER_ADMIN', otherwise redirect to /perfil
  // For this foundation, we just ensure auth.

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
