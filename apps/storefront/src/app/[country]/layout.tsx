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

import { getSiteUrl } from "@/utils/url";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "AZHON Marketplace",
    template: "%s | AZHON"
  },
  description: "Tu marketplace de confianza con soporte 24/7.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/app-icon.png",
  },
  openGraph: {
    title: "AZHON Marketplace",
    description: "Tu marketplace de confianza con soporte 24/7.",
    url: getSiteUrl(),
    siteName: "AZHON",
    images: [
      {
        url: "/logo-horizontal.png",
        width: 1200,
        height: 630,
        alt: "AZHON Marketplace",
      },
    ],
    locale: "es_HN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AZHON Marketplace",
    description: "Tu marketplace de confianza con soporte 24/7.",
    images: ["/logo-horizontal.png"],
  },
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
            <Footer country={country} />
          </AuthProvider>
        </DictionaryProvider>
      </body>
    </html>
  );
}
