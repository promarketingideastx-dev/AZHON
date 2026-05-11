import Link from 'next/link';
import { CATALOG_CATEGORIES } from '@/config/categories';

export default function ExploreCategories({ dict, country }: { dict: any, country: string }) {
  // Use the real catalog taxonomy to drive the visual grid
  // We filter by isFeaturedOnHome to get exactly the top categories for the Home page
  const topCategories = CATALOG_CATEGORIES.filter(c => c.isFeaturedOnHome);

  // Helper function to resolve i18n paths
  const resolvePath = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  };

  return (
    <section className="max-w-[1440px] mx-auto w-full px-4 sm:px-8 lg:px-12 2xl:px-16 py-10">
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-8 bg-orange-500 rounded-full"></div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{dict.home.explore_categories}</h2>
            <p className="text-gray-500 text-sm mt-1">{dict.home.browse_department}</p>
          </div>
        </div>
        <Link href={`/${country}/categorias`} className="text-orange-600 font-bold text-sm hover:underline flex items-center gap-1">
          {dict.home.see_all} <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      <div className="flex overflow-x-auto pb-6 gap-4 hide-scrollbar snap-x snap-mandatory">
        {topCategories.map((cat, i) => {
          const catName = resolvePath(dict, cat.i18nKey) || cat.id;
          return (
            <Link href={`/${country}/categorias/${cat.id}`} key={i} className="snap-start min-w-[72px] md:min-w-[130px] flex flex-col items-center justify-start gap-1.5 md:gap-3 group shrink-0">
              <div className="w-[64px] h-[64px] md:w-[100px] md:h-[100px] rounded-full bg-gray-50 flex items-center justify-center text-2xl md:text-4xl group-hover:bg-orange-50 group-hover:-translate-y-1 group-hover:shadow-[0_8px_20px_-4px_rgba(255,85,0,0.15)] group-hover:scale-105 transition-all duration-300 border border-gray-100 group-hover:border-orange-200">
                <span className="group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{cat.icon}</span>
              </div>
              <span className="text-[10px] md:text-xs font-bold text-gray-700 text-center line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors px-0.5 md:px-1">
                {catName}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
