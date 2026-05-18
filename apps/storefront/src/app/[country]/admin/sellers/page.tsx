import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getDictionary, defaultLocale } from '@/i18n';
import { AlertCircle, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';

export default async function AdminSellersPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
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
          <Link href={`/${country}`} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors inline-block mt-4">
            {dict?.adminSellers?.backToHome }
          </Link>
        </div>
      </div>
    );
  }

  const profiles = await prisma.sellerProfile.findMany({
    where: { 
      status: { in: ['UNDER_REVIEW', 'PENDING_DOCUMENTS', 'REJECTED', 'ACTIVE'] } 
    },
    include: {
      User: {
        include: {
          Addresses: true,
          Stores: true
        }
      },
      OnboardingSessions: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UNDER_REVIEW':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1"><Clock className="w-3 h-3"/> {dict?.adminSellers?.statusUnderReview }</span>;
      case 'ACTIVE':
        return <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1"><CheckCircle className="w-3 h-3"/> {dict?.adminSellers?.statusApproved }</span>;
      case 'REJECTED':
        return <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1"><XCircle className="w-3 h-3"/> {dict?.adminSellers?.statusRejected }</span>;
      case 'PENDING_DOCUMENTS':
        return <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {dict?.adminSellers?.statusPendingInfo }</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded-md">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">
            {dict?.adminSellers?.title }
          </h1>
        </div>
      </div>

      {profiles.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
          <CheckCircle className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral">{dict?.adminSellers?.emptyState }</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{dict?.adminSellers?.colName }</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{dict?.adminSellers?.colStore }</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{dict?.adminSellers?.statusLabel }</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{dict?.adminSellers?.colLocation }</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{dict?.adminSellerReview?.table?.colDocs }</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{dict?.adminSellers?.colDate }</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-neutral-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {profiles.map(profile => {
                const store = profile.User?.Stores?.[0];
                const session = profile.OnboardingSessions?.[0];
                const progressData = session?.progressData as any;
                const locStr = progressData?.ADDRESS?.cityNameRaw ? `${progressData.ADDRESS.cityNameRaw}, ${progressData.ADDRESS.departmentName }` : 'N/A';
                
                return (
                  <tr key={profile.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-secondary">{profile.User?.email}</div>
                      <div className="text-xs text-neutral font-mono">{profile.id.split('-')[0]}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-secondary">{store?.name || profile.commercialName }</div>
                      <div className="text-xs text-neutral">{dict?.adminSellers?.storeKycLabel } {store?.kycStatus }</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(profile.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral">
                      {locStr}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral">
                      <span className="text-xs text-neutral-400 italic">{dict?.adminSellerReview?.placeholders?.kycPendingModule }</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral">
                      {profile.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/${country}/admin/sellers/${profile.id}?tab=summary`} className="text-primary hover:text-orange-600 flex items-center justify-end gap-1 font-bold">
                        <Eye className="w-4 h-4"/> {dict?.adminSellerReview?.buttons?.audit }
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
