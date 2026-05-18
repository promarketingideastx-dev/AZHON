import { AlertCircle } from 'lucide-react';

export function HonestPlaceholder({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300 opacity-80 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-gray-500" />
      </div>
      <h3 className="font-bold text-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm">{description}</p>
    </div>
  );
}
