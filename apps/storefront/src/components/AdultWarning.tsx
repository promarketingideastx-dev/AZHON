'use client';

import { useState } from 'react';
import { useDictionary } from '@/context/DictionaryContext';

export function AdultWarning({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const dict = useDictionary();

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center bg-gray-100 rounded-3xl overflow-hidden border border-gray-200">
      {/* Blurred background preview */}
      <div className="absolute inset-0 filter blur-xl opacity-30 pointer-events-none">
        {children}
      </div>
      
      {/* Warning Dialog */}
      <div className="relative z-10 bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center border border-red-100 m-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          🔞
        </div>
        <h3 className="text-xl font-black text-secondary mb-2">
          {dict.categories.adult_warning_title}
        </h3>
        <p className="text-sm text-neutral mb-6 leading-relaxed">
          {dict.categories.adult_warning_desc}
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => setIsVerified(true)}
            className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-xl hover:bg-black transition-colors"
          >
            {dict.categories.adult_warning_confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
