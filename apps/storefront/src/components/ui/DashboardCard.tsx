import React from 'react';

export function DashboardCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {children}
    </div>
  );
}
