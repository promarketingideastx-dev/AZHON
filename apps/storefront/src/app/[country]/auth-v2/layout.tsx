import { ReactNode } from 'react';

export default function AuthV2Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col justify-center items-center p-4 flex-1 h-full min-h-[calc(100vh-200px)] pt-16 bg-neutral-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
        {children}
      </div>
    </div>
  );
}
