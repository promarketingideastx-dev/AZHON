import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getDictionary, defaultLocale } from '@/i18n';
import { Heart } from 'lucide-react';
import { ProfileEmptyState } from '@/components/ui/ProfileEmptyState';

export default async function FavoritesPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${country}/login`);
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);
  const bp = dict.buyerProfile;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-secondary mb-8">{bp?.favoritesEmptyTitle || 'Favoritos'}</h1>

      <ProfileEmptyState 
        icon={<Heart className="w-8 h-8 text-neutral" />}
        title={bp?.favoritesEmptyTitle || 'Favoritos'}
        description={bp?.favoritesEmptyDesc || 'Tus productos favoritos aparecerán aquí.'}
        primaryAction={{
          label: bp?.exploreProducts || 'Explorar productos',
          href: `/${country}/categorias`
        }}
      />
    </div>
  );
}
