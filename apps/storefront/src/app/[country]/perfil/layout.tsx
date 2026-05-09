import { ReactNode } from 'react';
import { BuyerSidebar } from './components/BuyerSidebar';

export default async function BuyerProfileLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <BuyerSidebar country={country} />
        
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
