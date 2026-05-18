'use client';

import { usePathname } from 'next/navigation';

export function ShellWrapper({ 
  children, 
  header, 
  footer 
}: { 
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.includes('/login') || pathname?.includes('/reset-password') || pathname?.includes('/auth-v2');
  const isAdminRoute = pathname?.includes('/admin');

  if (isAdminRoute) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 w-full min-h-screen">
        {children}
      </div>
    );
  }

  if (isAuthRoute) {
    // Isolated minimalist shell for auth routes
    return (
      <main className="flex-1 flex flex-col bg-warm w-full relative">
        {/* Simple Top Left Logo for Context */}
        <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
          <a href="/">
            <img src="/logo-v2.png" alt="AZHON" className="h-8 md:h-12 w-auto object-contain" />
          </a>
        </div>
        {children}
      </main>
    );
  }

  // Standard marketplace shell
  return (
    <>
      {header}
      <main className="flex-1 flex flex-col bg-warm" id="global-main-container">
        {children}
      </main>
      {footer}
    </>
  );
}
