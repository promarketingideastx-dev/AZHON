// DEMO CONTENT CONTROL:
// The banners in this component are static visual placeholders.
// TODO: Connect this to the 'Campaigns' backend table when available.
export default function CommercialBanners({ dict }: { dict: any }) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-[#2B323A] to-[#4B525A] rounded-3xl p-10 flex flex-col justify-center min-h-[220px] text-white relative overflow-hidden group cursor-pointer shadow-lg">
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-2">{dict.home.step_into_style || 'Pisa con Estilo'}</h2>
            <p className="text-gray-300 text-sm">{dict.home.sneaker_discount || '20% extra en sneakers'}</p>
          </div>
          <div className="absolute right-0 bottom-0 w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-50 group-hover:opacity-70 transition-opacity"></div>
        </div>

        <div className="bg-[#6B4423] rounded-3xl p-10 flex flex-col justify-center min-h-[220px] text-white relative overflow-hidden group cursor-pointer shadow-lg">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558769132-cb1fac08b401?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40 group-hover:scale-105 transition-transform duration-700"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-2">{dict.home.boutique_collection || 'La Colección Boutique'}</h2>
            <p className="text-gray-300 text-sm">{dict.home.artisan_exclusives || 'Descubre exclusivas artesanales'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
