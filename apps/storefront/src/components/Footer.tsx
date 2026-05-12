import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getProtectedHref } from '@/lib/auth/accessBuilder';

export async function Footer({ country = 'hn' }: { country?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <footer className="bg-white border-t border-gray-200 mt-20 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black tracking-tighter text-secondary mb-4">AZHON</h2>
            <p className="text-sm text-neutral mb-6 max-w-xs leading-relaxed">
              The global destination for curated marketplace excellence. Connecting quality products with discerning customers worldwide.
            </p>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-neutral hover:bg-primary hover:text-white transition-colors cursor-pointer">
                in
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-neutral hover:bg-primary hover:text-white transition-colors cursor-pointer">
                tw
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-neutral hover:bg-primary hover:text-white transition-colors cursor-pointer">
                fb
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-secondary mb-6">Company</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-neutral hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-neutral hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-neutral hover:text-primary transition-colors">Press Center</a></li>
              <li><a href="#" className="text-sm text-neutral hover:text-primary transition-colors">AZHON Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-secondary mb-6">Support</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-neutral hover:text-primary transition-colors">Contact Support</a></li>
              <li><Link href={getProtectedHref({ targetPath: `/${country}/perfil/soporte`, intent: 'buyer', user, country })} className="text-sm text-neutral hover:text-primary transition-colors">Help Center</Link></li>
              <li><a href="#" className="text-sm text-neutral hover:text-primary transition-colors">Shipping & Delivery</a></li>
              <li><a href="#" className="text-sm text-neutral hover:text-primary transition-colors">Returns & Refunds</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-secondary mb-6">Legal</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-neutral hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-neutral hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-neutral hover:text-primary transition-colors">Cookie Settings</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} AZHON Marketplace. All rights reserved.
          </p>
          <div className="flex gap-4">
            {/* Dummy Payment Methods */}
            <div className="h-6 w-10 bg-gray-200 rounded"></div>
            <div className="h-6 w-10 bg-gray-200 rounded"></div>
            <div className="h-6 w-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
