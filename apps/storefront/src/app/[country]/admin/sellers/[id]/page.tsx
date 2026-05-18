import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getDictionary, defaultLocale } from '@/i18n';
import { AlertCircle, ArrowLeft, Store, User as UserIcon, List, Clock } from 'lucide-react';
import { Business360Tabs } from '../components/Business360Tabs';
import { ReviewChecklist } from '../components/ReviewChecklist';
import { DecisionPanel } from '../components/DecisionPanel';
import { AddressOperativeCard } from '../components/AddressOperativeCard';
import { HonestPlaceholder } from '../components/HonestPlaceholder';
import { DataSourceBadge } from '../components/DataSourceBadge';

export default async function AdminSellerDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ country: string, id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { country, id } = await params;
  const { tab } = await searchParams;
  const currentTab = tab || 'summary';
  
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
          <h1 className="text-xl font-bold text-secondary mb-2">{dict?.adminSellers?.accessDenied }</h1>
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

  const tabs = [
    { id: 'summary', label: dict?.adminSellerReview?.tabs?.summary  },
    { id: 'identity', label: dict?.adminSellerReview?.tabs?.identity  },
    { id: 'business', label: dict?.adminSellerReview?.tabs?.business  },
    { id: 'categories', label: dict?.adminSellerReview?.tabs?.categories  },
    { id: 'address', label: dict?.adminSellerReview?.tabs?.address  },
    { id: 'kyc', label: dict?.adminSellerReview?.tabs?.kyc  },
    { id: 'crm', label: dict?.adminSellerReview?.tabs?.crm  },
    { id: 'audit', label: dict?.adminSellerReview?.tabs?.audit  },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href={`/${country}/admin/sellers`} className="p-2 hover:bg-neutral-100 rounded-full transition text-neutral">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary">{dict?.adminSellerReview?.title }</h1>
          <p className="text-sm text-neutral font-mono mt-1">{dict?.adminSellers?.idLabel } {profile.id}</p>
        </div>
        <div className="ml-auto">
          <span className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${
            profile.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
            profile.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {profile.status}
          </span>
        </div>
      </div>

      <Business360Tabs currentTab={currentTab} country={country} profileId={profile.id} tabs={tabs} />

      <div className="mt-6">
        {currentTab === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReviewChecklist 
              title={dict?.adminSellerReview?.checklist?.title }
              items={[
                { label: dict?.adminSellerReview?.checklist?.userCheck , status: profile.User ? 'valid' : 'missing' },
                { label: dict?.adminSellerReview?.checklist?.profileCheck , status: profile ? 'valid' : 'missing' },
                { label: dict?.adminSellerReview?.checklist?.storeCheck , status: store ? 'valid' : 'missing' },
                { label: dict?.adminSellerReview?.checklist?.onboardingCheck , status: session ? 'valid' : 'missing' },
                { label: dict?.adminSellerReview?.checklist?.addressCheck , status: Object.keys(addressData).length > 0 ? 'valid' : 'missing' },
                { label: dict?.adminSellerReview?.checklist?.categoriesCheck , status: profile.targetCategories.length > 0 ? 'valid' : 'missing' },
                { label: dict?.adminSellerReview?.checklist?.eventCheck , status: events.length > 0 ? 'valid' : 'missing' },
                { label: dict?.adminSellerReview?.checklist?.kycCheck , status: 'pending_module' }
              ]}
            />
            <DecisionPanel profileId={profile.id} currentStatus={profile.status} dict={dict} />
          </div>
        )}

        {currentTab === 'identity' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-secondary flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" /> {dict?.adminSellerReview?.tabs?.identity }
              </h2>
              <DataSourceBadge source="User" label="User Auth & progressData" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.emailLabel }</p>
                <p className="font-medium text-secondary">{profile.User?.email }</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.phone }</p>
                <p className="font-medium text-secondary">{profile.User?.phone }</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.dobLabel }</p>
                <p className="font-medium text-secondary">{personalData?.dateOfBirth }</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.genderLabel }</p>
                <p className="font-medium text-secondary">{personalData?.gender }</p>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'business' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-secondary flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" /> {dict?.adminSellerReview?.tabs?.business }
              </h2>
              <DataSourceBadge source="Store" label="Store DB" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.commerceName }</p>
                <p className="font-medium text-secondary">{profile.commercialName || store?.name }</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.businessType }</p>
                <p className="font-medium text-secondary">{profile.businessType }</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellers?.storeKycLabel }</p>
                <p className="font-medium text-secondary">{store?.kycStatus }</p>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'categories' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-secondary flex items-center gap-2">
                <List className="w-5 h-5 text-primary" /> {dict?.adminSellerReview?.tabs?.categories }
              </h2>
              <DataSourceBadge source="SellerProfile" label="SellerProfile targetCategories" />
            </div>

            <div className="bg-orange-50 text-orange-800 text-sm p-4 rounded-xl border border-orange-200 font-medium">
              {dict?.adminSellerReview?.warnings?.categoriesUnverified }
            </div>
            
            <div className="flex flex-wrap gap-2">
              {profile.targetCategories && profile.targetCategories.length > 0 ? (
                profile.targetCategories.map((cat, i) => (
                  <span key={i} className="bg-neutral-100 border border-neutral-200 text-secondary px-3 py-1.5 rounded-lg text-sm font-medium">
                    {cat}
                  </span>
                ))
              ) : (
                <p className="text-sm text-neutral-500 italic">{dict?.adminSellerReview?.emptyStates?.noCategories }</p>
              )}
            </div>
          </div>
        )}

        {currentTab === 'address' && (
          <AddressOperativeCard addressData={addressData} dict={dict} />
        )}

        {currentTab === 'kyc' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-secondary flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" /> {dict?.adminSellerReview?.tabs?.kyc }
              </h2>
              <DataSourceBadge source="System" label="Pending Infrastructure" />
            </div>
            <HonestPlaceholder 
              title={dict?.adminSellerReview?.placeholders?.kycTitle }
              description={dict?.adminSellerReview?.placeholders?.kycDesc }
            />
          </div>
        )}

        {currentTab === 'crm' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-secondary flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> {dict?.adminSellerReview?.tabs?.crm }
              </h2>
              <DataSourceBadge source="System" label="Pending Module" />
            </div>
            <HonestPlaceholder 
              title={dict?.adminSellerReview?.placeholders?.crmTitle }
              description={dict?.adminSellerReview?.placeholders?.crmDesc }
            />
          </div>
        )}

        {currentTab === 'audit' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-secondary flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> {dict?.adminSellerReview?.tabs?.audit }
              </h2>
              <DataSourceBadge source="AccountEvent" label="System Audit" />
            </div>
            
            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-sm text-neutral">{dict?.adminSellers?.noEvents }</p>
              ) : (
                events.map(ev => {
                  const p = ev.payload as any;
                  return (
                    <div key={ev.id} className="flex gap-4 text-sm bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                      <div className="w-32 flex-shrink-0 text-neutral-500 font-mono text-xs">
                        {ev.createdAt.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-bold text-secondary mr-2">{ev.eventType}</span>
                        {p?.reason && <p className="text-red-600 mt-1">{dict?.adminSellers?.reasonLabel } {p.reason}</p>}
                        {p?.adminEmail && <p className="text-neutral-500 text-xs mt-1">{dict?.adminSellers?.byLabel } {p.adminEmail}</p>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
