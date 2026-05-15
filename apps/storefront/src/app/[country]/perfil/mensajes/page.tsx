import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getDictionary, defaultLocale } from '@/i18n';
import { MessageSquare } from 'lucide-react';
import { ProfileEmptyState } from '@/components/ui/ProfileEmptyState';

export default async function MessagesPage({ params }: { params: Promise<{ country: string }> }) {
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
      <h1 className="text-3xl font-bold text-secondary mb-8">{bp?.messagesEmptyTitle || 'Mensajes recientes'}</h1>

      <ProfileEmptyState 
        icon={<MessageSquare className="w-8 h-8 text-neutral" />}
        title={bp?.messagesEmptyTitle || 'Mensajes recientes'}
        description={bp?.messagesEmptyDesc || 'Tus mensajes con soporte o vendedores aparecerán aquí.'}
        primaryAction={{
          label: bp?.backToSummary || 'Volver al resumen',
          href: `/${country}/perfil`
        }}
      />
      <p className="mt-8 text-center text-sm text-neutral">{bp?.messagesEmptyNote || 'AZHON Care será el centro de soporte y conversaciones cuando esta función esté activa.'}</p>
    </div>
  );
}
