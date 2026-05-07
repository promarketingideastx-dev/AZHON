import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
import { createClient } from "@/utils/supabase/server";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/Header";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AZHON Marketplace",
  description: "Marketplace by AZHON",
};

import { Footer } from "@/components/Footer";
import { cookies } from "next/headers";
import { getDictionary, defaultLocale } from "@/i18n";
import { DictionaryProvider } from "@/context/DictionaryContext";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ country: string }>;
}>) {
  const { country } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dictionary = getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <DictionaryProvider dictionary={dictionary}>
          <AuthProvider user={user}>
            <Header locale={locale} country={country} />
            <main className="flex-1 flex flex-col bg-warm">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </DictionaryProvider>
      </body>
    </html>
  );
}
