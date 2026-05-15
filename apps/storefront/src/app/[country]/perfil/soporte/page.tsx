import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getDictionary, defaultLocale } from '@/i18n';
import { 
  Search, 
  Truck, 
  CreditCard, 
  RotateCcw, 
  ChevronRight,
  Ticket,
  MessageSquare,
  Headphones
} from 'lucide-react';
import Link from 'next/link';

export default async function SupportPage({ params }: { params: Promise<{ country: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Soporte es público por ahora para evitar el rebote de login

  const { country } = await params;
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);
  const bp = dict.buyerProfile;

  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || '';

  return (
    <div className="w-full max-w-5xl mx-auto pb-12 pt-4">
      {/* Header Area */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-[32px] font-bold text-gray-900 mb-3 tracking-tight">
          {bp?.supportTitle ? bp.supportTitle.replace('{name}', displayName) : `¿En qué podemos ayudarte, ${displayName}?`}
        </h1>
        <p className="text-gray-500 text-[15px]">
          {bp?.supportSubtitle || 'Encuentra soluciones rápidas o contacta con nuestro equipo de expertos.'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto mb-14">
        <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm p-1.5 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
          <Search className="w-[18px] h-[18px] text-gray-400 ml-4 mr-3" />
          <input 
            type="text" 
            placeholder={bp?.searchHelp || "Escribe tu problema (ej. 'reembolso de pedido')"}
            className="flex-1 py-2 px-2 outline-none text-gray-700 bg-transparent text-[14px]"
          />
          <button className="bg-[#F28522] text-white font-bold px-8 py-2.5 rounded-full hover:bg-[#e07b1f] transition-colors text-[14px] shadow-sm">
            {bp?.searchBtn || 'Buscar'}
          </button>
        </div>
      </div>

      {/* Main Categories (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Shipping Card */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-5">
            <Truck className="w-[22px] h-[22px] text-[#F28522]" strokeWidth={2} />
          </div>
          <h3 className="text-[17px] font-bold text-gray-900 mb-2 leading-snug">{bp?.shipping || 'Envíos y Entregas'}</h3>
          <p className="text-gray-500 text-[13px] mb-6 flex-1 leading-relaxed">
            {bp?.shippingDesc || 'Rastrea tu pedido, cambia la dirección de entrega o reporta retrasos.'}
          </p>
          <div className="space-y-3 mt-auto">
            <Link href={`/${country}/perfil/ordenes`} className="flex items-center text-[#F28522] font-semibold text-[13px] hover:underline group">
              {bp?.viewOrderStatus || 'Ver estado del pedido'} <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
            <button className="flex items-center text-[#F28522] font-semibold text-[13px] hover:underline group w-full text-left">
              {bp?.shippingPolicies || 'Políticas de envío'} <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Payments Card */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-5">
            <CreditCard className="w-[22px] h-[22px] text-[#F28522]" strokeWidth={2} />
          </div>
          <h3 className="text-[17px] font-bold text-gray-900 mb-2 leading-snug">{bp?.billing || 'Pagos y Facturación'}</h3>
          <p className="text-gray-500 text-[13px] mb-6 flex-1 leading-relaxed">
            {bp?.billingDesc || 'Gestiona tus métodos de pago, descarga facturas o consulta cargos.'}
          </p>
          <div className="space-y-3 mt-auto">
            <Link href={`/${country}/perfil/pagos`} className="flex items-center text-[#F28522] font-semibold text-[13px] hover:underline group">
              {bp?.manageMethods || 'Gestionar métodos'} <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
            <button className="flex items-center text-[#F28522] font-semibold text-[13px] hover:underline group w-full text-left">
              {bp?.paymentIssues || 'Problemas con el pago'} <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Returns Card */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-5">
            <RotateCcw className="w-[22px] h-[22px] text-[#F28522]" strokeWidth={2} />
          </div>
          <h3 className="text-[17px] font-bold text-gray-900 mb-2 leading-snug">{bp?.returns || 'Devoluciones'}</h3>
          <p className="text-gray-500 text-[13px] mb-6 flex-1 leading-relaxed">
            {bp?.returnsDesc || 'Inicia una devolución, consulta el estado de un reembolso o garantía.'}
          </p>
          <div className="space-y-3 mt-auto">
            <Link href={`/${country}/perfil/ordenes`} className="flex items-center text-[#F28522] font-semibold text-[13px] hover:underline group">
              {bp?.startReturn || 'Iniciar devolución'} <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
            <button className="flex items-center text-[#F28522] font-semibold text-[13px] hover:underline group w-full text-left">
              {bp?.refundStatus || 'Estado de reembolso'} <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tickets Block */}
        <div className="bg-white rounded-[24px] p-7 shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Ticket className="w-[22px] h-[22px] text-[#F28522]" strokeWidth={2.5} />
              <h3 className="text-[20px] font-bold text-gray-900 tracking-tight">{bp?.openTickets || 'Tickets Abiertos'}</h3>
            </div>
            <span className="bg-orange-50 text-[#F28522] text-[11px] font-bold px-3 py-1 rounded-full">
              0 {bp?.active || 'Activos'}
            </span>
          </div>
          
          {/* Honest Empty State for Tickets */}
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <p className="text-gray-500 text-[14px] mb-2">{bp?.noTickets || 'No tienes tickets activos en este momento.'}</p>
          </div>

          <button className="mt-auto w-full border border-dashed border-gray-300 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors text-[14px]">
            {bp?.newTicket || 'Crear nuevo Ticket'}
          </button>
        </div>

        {/* Messages Block */}
        <div className="bg-white rounded-[24px] p-7 shadow-sm border border-gray-100 flex flex-col h-full relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-[22px] h-[22px] text-[#F28522]" strokeWidth={2.5} />
              <h3 className="text-[20px] font-bold text-gray-900 tracking-tight">{bp?.recentMessages || 'Mensajes Recientes'}</h3>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div>
          </div>
          
          {/* Honest Empty State for Messages */}
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <p className="text-gray-500 text-[14px] mb-2">{bp?.noMessages || 'No hay mensajes recientes con soporte.'}</p>
          </div>

          <button className="mt-auto w-full bg-[#111111] text-white font-bold py-3.5 rounded-xl hover:bg-black transition-colors text-[14px] flex items-center justify-center gap-2 shadow-sm">
            <MessageSquare className="w-[18px] h-[18px]" strokeWidth={2.5} />
            {bp?.startChat || 'Iniciar Chat en Vivo'}
          </button>

          {/* Floating Orange Headset Icon */}
          <div className="absolute -right-3 bottom-12 w-[52px] h-[52px] bg-[#F28522] rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
            <Headphones className="w-6 h-6 text-white" />
          </div>
        </div>

      </div>

    </div>
  );
}
