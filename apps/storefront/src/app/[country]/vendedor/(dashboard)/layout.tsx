import { SellerSidebar } from './components/SellerSidebar';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

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

  console.log(`[AZHON_AUTH_TRACE] seller_gate_dashboard:start, user_id: ${user?.id || 'none'}`);

  if (!user) {
    console.log(`[AZHON_AUTH_TRACE] seller_gate_dashboard:no_user, redirecting to login`);
    const nextPath = encodeURIComponent(`/${country}/vendedor`);
    redirect(`/${country}/login?intent=seller&next=${nextPath}`);
  }

  const { data: dbUser } = await supabase
    .from('User')
    .select('role')
    .eq('id', user.id)
    .single();

  console.log(`[AZHON_AUTH_TRACE] seller_gate_dashboard:user_role, role: ${dbUser?.role || 'none'}`);

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: user.id }
  });

  if (dbUser?.role !== 'SUPER_ADMIN') {
    if (!profile || profile.status !== 'APPROVED') {
      console.log(`[AZHON_AUTH_TRACE] seller_gate_dashboard:redirect_to_onboarding (not approved)`);
      console.log(`[AUTH AUDIT] event: unauthorized_seller_access_attempt, user_id: ${user.id}, date: ${new Date().toISOString()}`)
      redirect(`/${country}/vendedor/onboarding`);
    }
  }

  console.log(`[AZHON_AUTH_TRACE] seller_gate_dashboard:access_granted`);

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
