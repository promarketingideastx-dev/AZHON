'use client';

import { createContext, useContext, ReactNode } from 'react';

const DictionaryContext = createContext<any>(null);

export function DictionaryProvider({ dictionary, children }: { dictionary: any, children: ReactNode }) {
  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return context;
}
