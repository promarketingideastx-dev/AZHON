import React from 'react';

interface ProfileEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function ProfileEmptyState({ icon, title, description }: ProfileEmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-secondary mb-2">{title}</h2>
      <p className="text-neutral font-medium max-w-md mx-auto">
        {description}
      </p>
    </div>
  );
}
