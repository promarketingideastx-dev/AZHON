// DEMO CONTENT CONTROL:
// The products and featured items in this component are static visual placeholders.
// TODO: Connect this to the 'FeaturedProducts' or 'Campaigns' backend tables when available.
export default function FeaturedProductsGrid({ dict }: { dict: any }) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* New Arrivals */}
        <div className="lg:col-span-7">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-black text-secondary tracking-tight">{dict.home.new_arrivals || 'New Arrivals'}</h2>
            <span className="text-[10px] font-bold bg-orange-100 text-primary px-2 py-1 rounded text-orange-600 uppercase">
              {dict.home.new_arrivals || 'New'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="group cursor-pointer">
              <div className="bg-gray-50 rounded-2xl aspect-[4/3] overflow-hidden mb-4 relative">
                <span className="absolute top-4 right-4 bg-black text-white text-[10px] font-bold px-2 py-1 rounded z-10">NEW</span>
                <img src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop" alt="Sunglasses" className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="font-bold text-secondary text-sm">Premium Sunglasses</h3>
              <p className="text-primary font-black mt-1">HNL 1,200.00</p>
            </div>
            
            <div className="group cursor-pointer">
              <div className="bg-gray-50 rounded-2xl aspect-[4/3] overflow-hidden mb-4 relative">
                <span className="absolute top-4 right-4 bg-black text-white text-[10px] font-bold px-2 py-1 rounded z-10">NEW</span>
                <img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop" alt="Bag" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="font-bold text-secondary text-sm">Designer Leather Bag</h3>
              <p className="text-primary font-black mt-1">HNL 2,500.00</p>
            </div>
          </div>
        </div>

        {/* Trending & Solo para Ti */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Mais Vendidos */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-black text-secondary tracking-tight mb-6">{dict.home.best_sellers || 'Más Vendidos'}</h2>
            <div className="space-y-4">
              {[
                { title: "Latest Smartphone", price: "HNL 15,000.00", img: "https://images.unsplash.com/photo-1610945265064-3234eb3640f4?q=80&w=200&auto=format&fit=crop" },
                { title: "Running Shoes", price: "HNL 2,100.00", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop", active: true },
                { title: "Wireless Headphones", price: "HNL 4,500.00", img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=200&auto=format&fit=crop" }
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer ${item.active ? 'bg-orange-50 border border-orange-100' : 'hover:bg-gray-50'}`}>
                  <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                    <img src={item.img} className="w-full h-full object-cover rounded" />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary text-xs">{item.title}</h4>
                    <p className="text-primary font-black text-[10px] mt-0.5">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 text-primary font-bold text-[10px] uppercase tracking-widest hover:underline text-center">
              {dict.home.view_trending || 'Ver Tendencias'}
            </button>
          </div>

          {/* Solo para Ti */}
          <div className="bg-[#1A1A1A] rounded-3xl p-6 relative overflow-hidden text-white flex flex-col justify-between group cursor-pointer shadow-xl">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558089687-f282ffcbc126?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40 group-hover:opacity-50 transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            
            <div className="relative z-10">
              <h2 className="text-lg font-black mb-1 leading-tight">{dict.home.just_for_you || 'Solo para Ti'}</h2>
              <p className="text-[9px] text-gray-400">{dict.home.personalized_recs || 'Recomendaciones basadas en tu actividad'}</p>
            </div>

            <div className="relative z-10 mt-16">
              <span className="text-orange-500 text-[9px] font-black uppercase tracking-widest mb-1 block">
                {dict.home.pick_of_the_day || 'Selección del día'}
              </span>
              <h3 className="text-sm font-bold mb-3">Smart Home Hub</h3>
              <button className="w-full bg-white text-black font-bold py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-xs">
                {dict.home.add_to_cart || 'Agregar al Carrito'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
