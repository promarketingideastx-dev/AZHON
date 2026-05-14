import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ShoppingBag, Store } from 'lucide-react'; // Asumiendo lucide-react basado en Next.js standard

export default async function IntentGatePage({
  params,
  searchParams,
}: {
  params: Promise<{ country: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { country } = await params;
  const sParams = await searchParams;
  const next = sParams?.next as string;
  const intent = sParams?.intent as string; // Optional if already preselected but landed here

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  // Helper to build query strings securely
  const buildQuery = (newIntent: string) => {
    const qs = new URLSearchParams();
    qs.append('intent', newIntent);
    if (next) qs.append('next', next);
    return `?${qs.toString()}`;
  };

  const loginQuery = next ? `?next=${encodeURIComponent(next)}` : '';

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-8 w-full text-center">
        <h1 className="text-3xl font-bold text-secondary mb-2">{dict.auth.gate_title}</h1>
        <p className="text-base text-neutral">
          {dict.auth.gate_subtitle}
        </p>
      </div>

      <div className="w-full space-y-4 mb-8">
        <Link
          href={`/${country}/auth-v2/signup${buildQuery('buyer')}`}
          className="w-full flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-teal-50 transition-all group"
        >
          <div className="flex-shrink-0 bg-gray-100 p-3 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <ShoppingBag className="w-6 h-6 text-gray-500 group-hover:text-primary" />
          </div>
          <div className="ml-4 text-left">
            <h3 className="text-lg font-bold text-secondary group-hover:text-primary transition-colors">
              {dict.auth.gate_buyerTitle}
            </h3>
            <p className="text-sm text-neutral">
              {dict.auth.gate_buyerDesc}
            </p>
          </div>
        </Link>

        <Link
          href={`/${country}/auth-v2/signup${buildQuery('seller')}`}
          className="w-full flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-teal-50 transition-all group"
        >
          <div className="flex-shrink-0 bg-gray-100 p-3 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <Store className="w-6 h-6 text-gray-500 group-hover:text-primary" />
          </div>
          <div className="ml-4 text-left">
            <h3 className="text-lg font-bold text-secondary group-hover:text-primary transition-colors">
              {dict.auth.gate_sellerTitle}
            </h3>
            <p className="text-sm text-neutral">
              {dict.auth.gate_sellerDesc}
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-4 text-center w-full">
        <p className="text-sm text-neutral">
          {dict.auth.gate_loginPrompt}{' '}
          <Link 
            href={`/${country}/auth-v2/login${loginQuery}`}
            className="text-primary font-bold hover:underline"
          >
            {dict.auth.gate_loginLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
