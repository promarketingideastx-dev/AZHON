import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

type CheckItem = {
  label: string;
  status: 'valid' | 'missing' | 'pending_module';
};

export function ReviewChecklist({
  title,
  items
}: {
  title: string;
  items: CheckItem[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
      <h3 className="font-bold text-secondary mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
            {item.status === 'valid' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : item.status === 'pending_module' ? (
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <span className={`text-sm ${item.status === 'valid' ? 'text-gray-700 font-medium' : item.status === 'pending_module' ? 'text-gray-500 italic' : 'text-red-700 font-medium'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
