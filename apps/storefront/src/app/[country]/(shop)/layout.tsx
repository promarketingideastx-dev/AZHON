import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ShopLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { country: string };
}>) {
  // Access params if needed, but since it's just passing it along, we can just use it
  const country = params?.country || 'hn';

  return (
    <>
      <Header country={country} />
      <main className="flex-1 flex flex-col bg-warm" id="global-main-container">
        {children}
      </main>
      <Footer country={country} />
    </>
  );
}
