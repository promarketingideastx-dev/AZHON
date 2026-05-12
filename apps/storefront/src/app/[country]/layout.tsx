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
import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#FF4400",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "AZHON Marketplace",
    template: "%s | AZHON"
  },
  description: "Tu marketplace de confianza con soporte 24/7.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AZHON",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon-pwa-192.png",
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
import PwaRegistry from "@/components/PwaRegistry";
import { ShellWrapper } from "./ShellWrapper";

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
        <PwaRegistry />
        <DictionaryProvider dictionary={dictionary}>
          <AuthProvider user={user}>
            <ShellWrapper
              header={<Header locale={locale} country={country} />}
              footer={<Footer country={country} />}
            >
              {children}
            </ShellWrapper>
          </AuthProvider>
        </DictionaryProvider>
      </body>
    </html>
  );
}
