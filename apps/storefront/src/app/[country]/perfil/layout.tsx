import { ReactNode } from 'react';
import { BuyerSidebar } from './components/BuyerSidebar';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function BuyerProfileLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  
  // Early Auth Guard to prevent layout flicker
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const nextPath = encodeURIComponent(`/${country}/perfil`);
    redirect(`/${country}/login?intent=buyer&next=${nextPath}`);
  }

  return (
    <div className="w-full bg-[#FCF9F6] min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <BuyerSidebar country={country} />
          
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
