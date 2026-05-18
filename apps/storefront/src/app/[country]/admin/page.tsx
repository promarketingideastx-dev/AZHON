import { prisma } from '@/lib/prisma';
import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import { Users, Store, ShieldAlert, Activity, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  // Fetch real KPIs
  const totalUsers = await prisma.user.count();
  const totalSellers = await prisma.sellerProfile.count();
  const sellersUnderReview = await prisma.sellerProfile.count({ where: { status: 'UNDER_REVIEW' } });
  const sellersActive = await prisma.sellerProfile.count({ where: { status: 'ACTIVE' } });
  const totalStores = await prisma.store.count();
  
  // Real recent events if any
  const recentEvents = await prisma.accountEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { User: { select: { email: true } } }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{dict?.adminDashboard?.title || 'Command Center'}</h1>
        <p className="text-gray-500 mt-2 text-sm">{dict?.adminDashboard?.subtitle || 'Bienvenido al panel central de operaciones de AZHON.'}</p>
      </div>

      {/* Real KPIs Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{dict?.adminDashboard?.kpis?.users || 'Usuarios Totales'}</span>
            <div className="bg-blue-50 p-2 rounded-lg"><Users className="w-4 h-4 text-blue-600" /></div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-gray-900">{totalUsers}</h3>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{dict?.adminDashboard?.kpis?.stores || 'Tiendas Creadas'}</span>
            <div className="bg-purple-50 p-2 rounded-lg"><Store className="w-4 h-4 text-purple-600" /></div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-gray-900">{totalStores}</h3>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{dict?.adminDashboard?.kpis?.sellersActive || 'Sellers Activos'}</span>
            <div className="bg-green-50 p-2 rounded-lg"><CheckCircle className="w-4 h-4 text-green-600" /></div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-gray-900">{sellersActive}</h3>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{dict?.adminDashboard?.kpis?.sellersReview || 'Sellers en Revisión'}</span>
            <div className="bg-orange-50 p-2 rounded-lg"><Clock className="w-4 h-4 text-orange-600" /></div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-gray-900">{sellersUnderReview}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Modules (Available) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">{dict?.adminDashboard?.modulesTitle || 'Módulos Operativos'}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Seller Intake Module */}
            <Link href={`/${country}/admin/sellers`} className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all block">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                   <Store className="w-6 h-6 text-orange-600 group-hover:text-white" />
                 </div>
                 <div>
                   <h3 className="font-bold text-gray-900">Seller Intake</h3>
                   <p className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded inline-block mt-1">Activo</p>
                 </div>
               </div>
               <p className="text-sm text-gray-500 line-clamp-2">{dict?.adminDashboard?.modules?.sellerIntakeDesc || 'Revisión y aprobación de solicitudes de nuevos vendedores en la plataforma.'}</p>
            </Link>

            {/* WMS Discrepancias */}
            <Link href={`/${country}/admin/bodega/discrepancias`} className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all block">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-500 transition-colors">
                   <ShieldAlert className="w-6 h-6 text-red-600 group-hover:text-white" />
                 </div>
                 <div>
                   <h3 className="font-bold text-gray-900">WMS Discrepancias</h3>
                   <p className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded inline-block mt-1">Activo</p>
                 </div>
               </div>
               <p className="text-sm text-gray-500 line-clamp-2">{dict?.adminDashboard?.modules?.wmsDesc || 'Control y resolución de discrepancias en bodega.'}</p>
            </Link>
            
            {/* Catalog Review */}
            <Link href={`/${country}/admin/productos/revision`} className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all block">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                   <Store className="w-6 h-6 text-blue-600 group-hover:text-white" />
                 </div>
                 <div>
                   <h3 className="font-bold text-gray-900">Revisión Catálogo</h3>
                   <p className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded inline-block mt-1">Activo</p>
                 </div>
               </div>
               <p className="text-sm text-gray-500 line-clamp-2">{dict?.adminDashboard?.modules?.catalogDesc || 'Aprobación de publicaciones de productos nuevos.'}</p>
            </Link>

            {/* Coming Soon Module Example */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300 opacity-70">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                   <Activity className="w-6 h-6 text-gray-400" />
                 </div>
                 <div>
                   <h3 className="font-bold text-gray-600">Finance & Sales</h3>
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{dict?.adminShell?.comingSoon}</p>
                 </div>
               </div>
               <p className="text-sm text-gray-500">{dict?.adminDashboard?.modules?.financeDesc || 'Módulo financiero desactivado hasta que existan datos transaccionales reales.'}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Activity / Audit */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900">{dict?.adminDashboard?.activityTitle || 'Actividad Reciente'}</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            {recentEvents.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">{dict?.adminDashboard?.noActivity || 'No hay eventos auditables recientes.'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEvents.map(event => (
                  <div key={event.id} className="flex gap-3 text-sm border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-orange-500 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900">{event.eventType}</p>
                      <p className="text-xs text-gray-500">{event.User?.email} • {event.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
