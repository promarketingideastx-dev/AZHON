import { Database, ShieldAlert, FileText, UserCircle, Activity } from 'lucide-react';

export function DataSourceBadge({
  source,
  label
}: {
  source: 'User' | 'SellerProfile' | 'Store' | 'progressData' | 'AccountEvent' | 'System';
  label: string;
}) {
  let color = "bg-gray-100 text-gray-700";
  let Icon = Database;

  switch (source) {
    case 'User':
    case 'SellerProfile':
      color = "bg-blue-100 text-blue-700";
      Icon = UserCircle;
      break;
    case 'Store':
      color = "bg-purple-100 text-purple-700";
      break;
    case 'progressData':
      color = "bg-yellow-100 text-yellow-800";
      Icon = FileText;
      break;
    case 'AccountEvent':
      color = "bg-green-100 text-green-800";
      Icon = Activity;
      break;
    case 'System':
      color = "bg-red-100 text-red-800";
      Icon = ShieldAlert;
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-black/5 ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}
