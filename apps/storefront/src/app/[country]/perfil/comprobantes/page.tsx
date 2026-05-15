import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getDictionary, defaultLocale } from '@/i18n';
import { FileText } from 'lucide-react';
import { ProfileEmptyState } from '@/components/ui/ProfileEmptyState';

export default async function ReceiptsPage({ params }: { params: Promise<{ country: string }> }) {
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
      <h1 className="text-3xl font-bold text-secondary mb-8">{bp?.receiptsEmptyTitle || 'Mis Comprobantes'}</h1>

      <ProfileEmptyState 
        icon={<FileText className="w-8 h-8 text-neutral" />}
        title={bp?.receiptsEmptyTitle || 'Mis Comprobantes'}
        description={bp?.receiptsEmptyDesc || 'Cuando tengas pedidos, tus facturas y comprobantes aparecerán aquí.'}
        primaryAction={{
          label: bp?.backToSummary || 'Volver al resumen',
          href: `/${country}/perfil`
        }}
      />
    </div>
  );
}
