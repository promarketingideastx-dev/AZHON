import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getDictionary, defaultLocale } from '@/i18n';
import { AlertCircle, CheckCircle, XCircle, ArrowLeft, Store, User as UserIcon, MapPin, Calendar, FileText } from 'lucide-react';
import { approveSellerAction, rejectSellerAction, requestSellerInfoAction } from '../actions';

export default async function AdminSellerDetailPage({
  params,
}: {
  params: Promise<{ country: string, id: string }>;
}) {
  const { country, id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${country}/login`);

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-secondary mb-2">{dict?.adminSellers?.accessDenied || 'Acceso Denegado'}</h1>
        </div>
      </div>
    );
  }

  const profile = await prisma.sellerProfile.findUnique({
    where: { id },
    include: {
      User: {
        include: {
          Stores: true
        }
      },
      OnboardingSessions: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!profile) return redirect(`/${country}/admin/sellers`);

  const events = await prisma.accountEvent.findMany({
    where: { userId: profile.userId },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  const session = profile.OnboardingSessions?.[0];
  const progressData = session?.progressData as any || {};
  const store = profile.User?.Stores?.[0];
  const addressData = progressData?.ADDRESS || {};
  const personalData = progressData?.PERSONAL || {};
  
  const isPending = profile.status === 'UNDER_REVIEW' || profile.status === 'PENDING_DOCUMENTS';

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/${country}/admin/sellers`} className="p-2 hover:bg-neutral-100 rounded-full transition text-neutral">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary">{dict?.adminSellers?.detailTitle || 'Detalle de la Solicitud'}</h1>
          <p className="text-sm text-neutral font-mono mt-1">{dict?.adminSellers?.idLabel || 'ID:'} {profile.id}</p>
        </div>
        <div className="ml-auto">
          <span className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 ${
            profile.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
            profile.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {profile.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Data */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
          <h2 className="text-lg font-bold text-secondary flex items-center gap-2 border-b border-neutral-100 pb-3">
            <UserIcon className="w-5 h-5 text-primary" /> {dict?.adminSellers?.user || 'Usuario'}
          </h2>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.emailLabel || 'Email'}</p>
            <p className="font-medium text-secondary">{profile.User?.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.phone || 'Teléfono'}</p>
            <p className="font-medium text-secondary">{profile.User?.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.personalData || 'Datos Personales'}</p>
            <p className="font-medium text-secondary text-sm">{dict?.adminSellers?.dobLabel || 'DOB:'} {personalData?.dateOfBirth || 'N/A'}</p>
            <p className="font-medium text-secondary text-sm">{dict?.adminSellers?.genderLabel || 'Gender:'} {personalData?.gender || 'N/A'}</p>
          </div>
        </div>

        {/* Store / Business Data */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
          <h2 className="text-lg font-bold text-secondary flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Store className="w-5 h-5 text-primary" /> {dict?.adminSellers?.store || 'Perfil de Tienda'}
          </h2>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.commerceName || 'Comercio'}</p>
            <p className="font-medium text-secondary">{profile.commercialName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.businessType || 'Tipo de Negocio'}</p>
            <p className="font-medium text-secondary">{profile.businessType || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.targetCategories || 'Categorías Objetivo'}</p>
            <p className="font-medium text-secondary">{profile.targetCategories.join(', ') || 'N/A'}</p>
          </div>
          {store && (
            <div className="pt-2">
              <span className="bg-neutral-100 px-2 py-1 rounded text-xs font-bold text-secondary">{dict?.adminSellers?.storeKycLabel || 'Store KYC:'} {store.kycStatus}</span>
            </div>
          )}
        </div>

        {/* Address Data */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-4 md:col-span-2">
          <h2 className="text-lg font-bold text-secondary flex items-center gap-2 border-b border-neutral-100 pb-3">
            <MapPin className="w-5 h-5 text-primary" /> {dict?.adminSellers?.address || 'Dirección y Operaciones'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.country || 'País'}</p>
              <p className="font-medium text-secondary">{addressData?.countryCode || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.department || 'Departamento'}</p>
              <p className="font-medium text-secondary">{addressData?.departmentName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.city || 'Ciudad'}</p>
              <p className="font-medium text-secondary">{addressData?.cityNameRaw || 'N/A'}</p>
            </div>
            <div className="md:col-span-3">
              <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.addressLine || 'Línea de Dirección'}</p>
              <p className="font-medium text-secondary">{addressData?.addressLine1 || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.source || 'Fuente'}</p>
              <span className="text-xs font-mono bg-neutral-100 px-2 py-1 rounded">{addressData?.citySource || 'N/A'}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.delivery || 'Delivery'}</p>
              <span className="text-xs font-mono bg-neutral-100 px-2 py-1 rounded">{addressData?.deliveryEligibility || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
        <h2 className="text-lg font-bold text-secondary flex items-center gap-2 border-b border-neutral-100 pb-3 mb-4">
          <FileText className="w-5 h-5 text-primary" /> {dict?.adminSellers?.events || 'Eventos y Registro'}
        </h2>
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-sm text-neutral">{dict?.adminSellers?.noEvents || 'No hay eventos registrados.'}</p>
          ) : (
            events.map(ev => {
              const p = ev.payload as any;
              return (
                <div key={ev.id} className="flex gap-4 text-sm">
                  <div className="w-32 flex-shrink-0 text-neutral-400 font-mono text-xs">
                    {ev.createdAt.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-bold text-secondary mr-2">{ev.eventType}</span>
                    {p?.reason && <p className="text-red-600 mt-1">{dict?.adminSellers?.reasonLabel || 'Motivo:'} {p.reason}</p>}
                    {p?.adminEmail && <p className="text-neutral-500 text-xs mt-1">{dict?.adminSellers?.byLabel || 'Por:'} {p.adminEmail}</p>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Admin Actions */}
      {isPending && (
        <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200">
          <h3 className="font-bold text-secondary mb-4">{dict?.adminSellers?.operativeActions || 'Acciones Operativas'}</h3>
          <div className="flex flex-col md:flex-row gap-4">
            
            <form action={approveSellerAction} className="flex-1">
              <input type="hidden" name="sellerId" value={profile.id} />
              <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition">
                <CheckCircle className="w-5 h-5"/> {dict?.adminSellers?.btnApprove || 'Aprobar Vendedor'}
              </button>
            </form>

            <form action={rejectSellerAction} className="flex-1 flex flex-col gap-2">
              <input type="hidden" name="sellerId" value={profile.id} />
              <input type="text" name="reason" required placeholder={dict?.adminSellers?.rejectReason || 'Motivo de rechazo...'} className="w-full px-4 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500" />
              <button type="submit" className="w-full bg-red-100 text-red-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-200 transition">
                <XCircle className="w-5 h-5"/> {dict?.adminSellers?.btnReject || 'Rechazar'}
              </button>
            </form>

            <form action={requestSellerInfoAction} className="flex-1 flex flex-col gap-2">
              <input type="hidden" name="sellerId" value={profile.id} />
              <input type="text" name="reason" required placeholder={dict?.adminSellers?.infoReason || 'Información Solicitada...'} className="w-full px-4 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-orange-500" />
              <button type="submit" className="w-full bg-orange-100 text-orange-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-200 transition">
                <AlertCircle className="w-5 h-5"/> {dict?.adminSellers?.btnRequestInfo || 'Pedir más información'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
