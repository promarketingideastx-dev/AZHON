'use client';

import { useState } from 'react';
import { useDictionary } from '@/context/DictionaryContext';
import { ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AdultWarning({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const dict = useDictionary();
  const router = useRouter();

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full min-h-[600px] flex items-center justify-center bg-gray-50 rounded-3xl overflow-hidden border border-gray-200">
      {/* Secure solid background instead of blurred DOM to prevent data leakage */}
      <div className="absolute inset-0 bg-gray-100 pointer-events-none"></div>
      
      {/* Verification Dialog */}
      <div className="relative z-10 bg-white p-8 md:p-10 rounded-2xl shadow-2xl max-w-md text-center border border-gray-100 m-4">
        <div className="w-16 h-16 bg-gray-50 text-secondary rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
          <ShieldAlert className="w-8 h-8 opacity-80" />
        </div>
        
        <h3 className="text-xl md:text-2xl font-black text-secondary mb-3 tracking-tight">
          {dict.categories.adult_warning_title}
        </h3>
        
        <p className="text-sm text-neutral mb-8 leading-relaxed px-2">
          {dict.categories.adult_warning_desc}
        </p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => setIsVerified(true)}
            className="w-full bg-secondary text-white font-bold py-3.5 px-4 rounded-xl hover:bg-black transition-colors shadow-md"
          >
            {dict.categories.adult_warning_confirm}
          </button>
          
          <button 
            onClick={() => router.back()}
            className="w-full bg-white text-neutral font-bold py-3.5 px-4 rounded-xl hover:bg-gray-50 border border-gray-200 transition-colors"
          >
            {dict.categories.adult_warning_cancel || 'Volver'}
          </button>
        </div>

        <p className="text-[10px] text-gray-400 mt-8 leading-relaxed max-w-[280px] mx-auto">
          {dict.categories.adult_warning_legal}
        </p>
      </div>
    </div>
  );
}
