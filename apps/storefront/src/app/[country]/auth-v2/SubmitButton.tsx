'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton({ 
  children, 
  pendingText = 'Cargando...',
  className = "w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-full transition-colors disabled:opacity-50"
}: { 
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={className}
    >
      {pending ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {pendingText}
        </div>
      ) : children}
    </button>
  );
}
