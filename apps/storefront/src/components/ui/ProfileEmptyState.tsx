import React from 'react';
import Link from 'next/link';

interface ProfileEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href: string;
  };
}

export function ProfileEmptyState({ icon, title, description, primaryAction }: ProfileEmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-secondary mb-2">{title}</h2>
      <p className="text-neutral font-medium max-w-md mx-auto mb-6">
        {description}
      </p>
      {primaryAction && (
        <Link 
          href={primaryAction.href}
          className="inline-flex items-center justify-center bg-gray-100 text-secondary font-bold px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-sm"
        >
          {primaryAction.label}
        </Link>
      )}
    </div>
  );
}
