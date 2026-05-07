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
    <section className="max-w-[1440px] mx-auto w-full px-4 sm:px-8 lg:px-12 2xl:px-16 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-secondary tracking-tight">{dict.home.explore_categories}</h2>
          <p className="text-neutral text-sm mt-1">{dict.home.browse_department}</p>
        </div>
        <Link href={`/${country}/categorias`} className="text-primary font-bold text-sm hover:underline">{dict.home.see_all} {'>'}</Link>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar">
        {topCategories.map((cat, i) => {
          const catName = resolvePath(dict, cat.i18nKey) || cat.id;
          return (
            <Link href={`/${country}/categorias/${cat.id}`} key={i} className="min-w-[160px] bg-white border border-gray-100 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:border-primary hover:shadow-lg transition-all cursor-pointer group">
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-4xl group-hover:bg-orange-50 transition-colors shadow-inner">
                {cat.icon}
              </div>
              <span className="text-xs font-bold text-secondary text-center line-clamp-2">{catName}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
