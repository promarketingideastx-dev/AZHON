import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default async function ShopLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ country: string }>;
}>) {
  const { country } = await params;

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
