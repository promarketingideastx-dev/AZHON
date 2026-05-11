// DEMO CONTENT CONTROL:
// The banners in this component are static visual placeholders.
// TODO: Connect this to the 'Campaigns' backend table when available.
export default function CommercialBanners({ dict }: { dict: any }) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-[#2B323A] to-[#1A1F24] rounded-3xl p-10 flex flex-col justify-center min-h-[260px] text-white relative overflow-hidden group cursor-pointer shadow-xl border border-gray-800">
          <div className="relative z-10 flex flex-col items-start">
            <h2 className="text-3xl md:text-4xl font-black mb-3 drop-shadow-md">{dict.home.step_into_style || 'Pisa con Estilo'}</h2>
            <p className="text-gray-300 text-sm md:text-base font-medium mb-6 max-w-[60%]">{dict.home.sneaker_discount || '20% extra en sneakers limitados'}</p>
            <span className="bg-white text-gray-900 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider group-hover:bg-orange-500 group-hover:text-white transition-colors shadow-lg">
              {dict?.home?.view_collection || 'Ver Colección'}
            </span>
          </div>
          <div className="absolute right-0 bottom-0 w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"></div>
        </div>

        <div className="bg-gradient-to-r from-[#6B4423] to-[#4A2D15] rounded-3xl p-10 flex flex-col justify-center min-h-[260px] text-white relative overflow-hidden group cursor-pointer shadow-xl border border-[#3A2210]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558769132-cb1fac08b401?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30 group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="relative z-10 flex flex-col items-start">
            <h2 className="text-3xl md:text-4xl font-black mb-3 drop-shadow-md">{dict.home.boutique_collection || 'La Colección Boutique'}</h2>
            <p className="text-orange-100 text-sm md:text-base font-medium mb-6 max-w-[60%]">{dict.home.artisan_exclusives || 'Descubre exclusivas artesanales'}</p>
            <span className="bg-orange-500 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider group-hover:bg-white group-hover:text-orange-600 transition-colors shadow-lg shadow-orange-500/20">
              {dict?.home?.view_collection || 'Ver Colección'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
