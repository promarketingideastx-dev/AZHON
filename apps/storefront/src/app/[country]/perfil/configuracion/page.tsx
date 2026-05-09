import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getDictionary, defaultLocale } from '@/i18n';
import { Settings } from 'lucide-react';
import { ProfileEmptyState } from '@/components/ui/ProfileEmptyState';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);
  const bp = dict.buyerProfile;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-secondary mb-8">{bp?.settings || 'Configuración'}</h1>

      <ProfileEmptyState 
        icon={<Settings className="w-8 h-8 text-neutral" />}
        title={bp?.coming_soon || 'Próximamente'}
        description={bp?.coming_soon_desc || 'Esta sección estará disponible muy pronto.'}
      />
    </div>
  );
}
