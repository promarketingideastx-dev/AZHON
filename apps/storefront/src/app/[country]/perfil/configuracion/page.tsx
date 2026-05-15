import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getDictionary, defaultLocale } from '@/i18n';
import { Settings } from 'lucide-react';
import { ProfileEmptyState } from '@/components/ui/ProfileEmptyState';

export default async function SettingsPage({ params }: { params: Promise<{ country: string }> }) {
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
      <h1 className="text-3xl font-bold text-secondary mb-8">{bp?.settingsEmptyTitle || 'Configuración de Cuenta'}</h1>

      <ProfileEmptyState 
        icon={<Settings className="w-8 h-8 text-neutral" />}
        title={bp?.settingsEmptyTitle || 'Configuración de Cuenta'}
        description={bp?.settingsEmptyDesc || 'Pronto podrás cambiar tu contraseña y preferencias desde aquí.'}
        primaryAction={{
          label: bp?.backToSummary || 'Volver al resumen',
          href: `/${country}/perfil`
        }}
      />
    </div>
  );
}
