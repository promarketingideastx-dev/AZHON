import Link from 'next/link';

export default function SellerPartnershipCta({ dict, country }: { dict: any, country: string }) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12 mb-12">
      <div className="bg-[#FAF8F5] rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 border border-[#E5E0D8]">
        <div className="flex-1">
          <span className="inline-block bg-white text-secondary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-6 border border-gray-200">
            PARTNERSHIP
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-secondary tracking-tight mb-6 leading-tight">
            {dict.home.partnership || 'Emprenda com a AZHON.'}
          </h2>
          <p className="text-neutral mb-8 leading-relaxed max-w-lg">
            {dict.home.partnership_desc || 'Reach millions of customers worldwide. Our platform provides the tools, logistics, and data you need to scale your business across borders.'}
          </p>
          <ul className="space-y-4 mb-10">
            <li className="flex items-center gap-3 text-sm font-bold text-secondary">
              <span className="text-primary text-lg">✓</span> {dict.home.no_upfront_fees || 'No upfront listing fees'}
            </li>
            <li className="flex items-center gap-3 text-sm font-bold text-secondary">
              <span className="text-primary text-lg">✓</span> {dict.home.global_logistics || 'Global logistics support'}
            </li>
            <li className="flex items-center gap-3 text-sm font-bold text-secondary">
              <span className="text-primary text-lg">✓</span> {dict.home.advanced_dashboard || 'Advanced seller dashboard'}
            </li>
          </ul>
          <Link href={`/${country}/vendedor`} className="inline-block bg-black text-white font-bold px-8 py-4 rounded-full hover:bg-gray-800 transition-colors shadow-xl text-sm">
            {dict.home.start_selling || 'Start Selling Today'}
          </Link>
        </div>
        <div className="flex-1 w-full relative">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop" alt="Seller Dashboard" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary rounded-full mix-blend-multiply opacity-20 blur-2xl"></div>
        </div>
      </div>
    </section>
  );
}
