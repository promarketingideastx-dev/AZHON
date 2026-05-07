import { cookies } from "next/headers";
import { getDictionary, defaultLocale } from "@/i18n";
import { CATALOG_CATEGORIES } from "@/config/categories";
import { AdultWarning } from "@/components/AdultWarning";
import Link from "next/link";

// Helper para resolver paths tipo "categories.cell_phones.title" en el objeto dict
function resolvePath(obj: any, path: string) {
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj);
}

export default async function CategoriesPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  return (
    <div className="w-full bg-warm min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-secondary text-white py-16 px-4">
        <div className="max-w-[1440px] mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            {dict.categories.title}
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Explora nuestro catálogo completo con miles de productos en todas nuestras categorías principales.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATALOG_CATEGORIES.map((cat) => {
            const title = resolvePath(dict, cat.i18nKey) || cat.id;
            
            const content = (
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
                <div className="h-48 w-full relative overflow-hidden bg-gray-100">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                  <img src={cat.image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-full text-2xl shadow-lg z-20">
                    {cat.icon}
                  </div>
                </div>
                
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <h2 className="text-2xl font-black text-secondary tracking-tight mb-6">
                    {title}
                  </h2>
                  
                  <ul className="space-y-3 flex-1">
                    {cat.subcategories.map((sub) => {
                      const subTitle = resolvePath(dict, sub.i18nKey) || sub.id;
                      return (
                        <li key={sub.id}>
                          <Link href={`#`} className="text-neutral font-medium hover:text-primary hover:underline flex items-center gap-2 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                            {subTitle}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <Link href={`#`} className="text-primary font-bold hover:text-orange-700 flex items-center gap-2 group/link">
                      {dict.home.see_all} {title}
                      <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            );

            return (
              <div key={cat.id}>
                {cat.requires18Plus ? (
                  <AdultWarning>{content}</AdultWarning>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
