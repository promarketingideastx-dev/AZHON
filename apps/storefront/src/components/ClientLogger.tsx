'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function ClientLogger({ componentName }: { componentName: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mountCount = useRef(0);

  useEffect(() => {
    mountCount.current += 1;
    console.log(`[🔍 AZHON-AUDIT] [${componentName}] 🟢 MOUNTED (Mount Count: ${mountCount.current}) | Pathname: ${pathname} | SearchParams: ${searchParams.toString()}`);

    return () => {
      console.log(`[🔍 AZHON-AUDIT] [${componentName}] 🔴 UNMOUNTED | Pathname was: ${pathname}`);
    };
  }, []);

  useEffect(() => {
    console.log(`[🔍 AZHON-AUDIT] [${componentName}] 🗺️ ROUTE STATE DETECTED | Pathname: ${pathname} | SearchParams: ${searchParams.toString()}`);
  }, [pathname, searchParams]);

  return null;
}
