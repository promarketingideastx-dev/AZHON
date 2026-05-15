import { User } from '@supabase/supabase-js';

type Intent = 'buyer' | 'seller';

interface ProtectedRouteConfig {
  targetPath: string;
  intent: Intent;
  user: User | null;
  country: string;
}

/**
 * Generates a safe URL for public entrypoints that point to protected routes.
 * If the user is authenticated, it returns the target path directly.
 * If the user is not authenticated, it routes them to the login page with
 * intent and next parameters, preventing server-side redirection loops (Route Flapping).
 */
export function getProtectedHref({ targetPath, intent, user, country }: ProtectedRouteConfig): string {
  // Always ensure paths are absolute relative paths for Next.js router
  const safeTarget = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
  const safeCountry = country || 'hn';

  if (user) {
    return safeTarget;
  }

  // Build the login URL preserving intent and next destination
  const loginBase = `/${safeCountry}/auth-v2/start`;
  const nextParam = encodeURIComponent(safeTarget);
  
  return `${loginBase}?intent=${intent}&next=${nextParam}`;
}
