import Link from 'next/link';

// DEMO CONTENT CONTROL:
// The images and groupings in this component are static visual placeholders 
// meant to replicate the "Amazon Quad" layout using V1 categories.
// TODO: Connect this to a dynamic merchandising backend.
export default function CategoryQuadGrid({ dict, country }: { dict: any, country: string }) {
  const quads = [
    {
      title: dict?.categories?.computing?.title || 'Computación y Tecnología',
      link: `/${country}/categorias/computing`,
      linkText: `Explorar más en ${dict?.categories?.computing?.title || 'Computación'}`,
      items: [
        { name: dict?.categories?.computing?.laptops || 'Laptops', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=300&auto=format&fit=crop' },
        { name: dict?.categories?.computing?.desktops || 'PCs de Escritorio', img: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=300&auto=format&fit=crop' },
        { name: dict?.categories?.computing?.peripherals || 'Periféricos', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=300&auto=format&fit=crop' },
        { name: dict?.categories?.computing?.components || 'Componentes', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=300&auto=format&fit=crop' },
      ]
    },
    {
      title: dict?.categories?.beauty?.title || 'Belleza y Cuidado Personal',
      link: `/${country}/categorias/beauty`,
      linkText: `Comprar en ${dict?.categories?.beauty?.title || 'Belleza'}`,
      items: [
        { name: dict?.categories?.beauty?.makeup || 'Maquillaje', img: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?q=80&w=300&auto=format&fit=crop' },
        { name: dict?.categories?.beauty?.personal_care || 'Cuidado Personal', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=300&auto=format&fit=crop' },
        { name: dict?.categories?.beauty?.perfumes || 'Perfumes', img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=300&auto=format&fit=crop' },
        { name: 'Sets de Regalo', img: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=300&auto=format&fit=crop' },
      ]
    },
    {
      title: dict?.categories?.home?.title || 'Todo para el Hogar',
      link: `/${country}/categorias/home`,
      linkText: `Ver más en ${dict?.categories?.home?.title || 'Hogar'}`,
      items: [
        { name: dict?.categories?.home?.appliances || 'Electrodomésticos', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&auto=format&fit=crop' },
        { name: dict?.categories?.home?.furniture || 'Muebles', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=300&auto=format&fit=crop' },
        { name: dict?.categories?.home?.kitchen || 'Cocina', img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=300&auto=format&fit=crop' },
        { name: dict?.categories?.home?.decoration || 'Decoración', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop' },
      ]
    },
    {
      title: dict?.categories?.vehicles?.title || 'Vehículos y Accesorios',
      link: `/${country}/categorias/vehicles`,
      linkText: `Explorar ${dict?.categories?.vehicles?.title || 'Vehículos'}`,
      items: [
        { name: dict?.categories?.vehicles?.cars || 'Autos', img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=300&auto=format&fit=crop' },
        { name: dict?.categories?.vehicles?.motorcycles || 'Motocicletas', img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=300&auto=format&fit=crop' },
        { name: dict?.categories?.vehicles?.parts || 'Repuestos', img: 'https://images.unsplash.com/photo-1606571556947-6b4dcb833f2c?q=80&w=300&auto=format&fit=crop' },
        { name: dict?.categories?.vehicles?.accessories || 'Accesorios', img: 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=300&auto=format&fit=crop' },
      ]
    }
  ];

  return (
    <section className="bg-gray-100 py-8 w-full border-y border-gray-200 mt-12 mb-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quads.map((quad, index) => (
            <div key={index} className="bg-white p-5 flex flex-col h-full shadow-sm">
              <h3 className="text-[21px] font-bold text-gray-900 mb-4 leading-tight">{quad.title}</h3>
              
              <div className="grid grid-cols-2 gap-4 flex-1">
                {quad.items.map((item, idx) => (
                  <Link href={quad.link} key={idx} className="flex flex-col group cursor-pointer">
                    <div className="aspect-square bg-gray-50 mb-2 overflow-hidden flex items-center justify-center">
                      <img 
                        src={item.img} 
                        alt={item.name} 
                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-xs text-gray-700 font-medium group-hover:text-primary transition-colors line-clamp-1">
                      {item.name}
                    </span>
                  </Link>
                ))}
              </div>

              <Link href={quad.link} className="text-[#007185] hover:text-[#C7511F] hover:underline text-[13px] font-medium mt-6 block">
                {quad.linkText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
