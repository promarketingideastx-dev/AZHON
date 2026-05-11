import { Truck, ShieldCheck, Globe, CreditCard } from 'lucide-react';

export default function BenefitStrip({ dict }: { dict: any }) {
  const benefits = [
    {
      icon: Truck,
      title: dict?.home?.benefits_free_shipping || 'Envío Global',
      desc: 'En tu primera compra',
    },
    {
      icon: ShieldCheck,
      title: dict?.home?.benefits_buyer_protection || 'Protección al Comprador',
      desc: 'Garantía de reembolso de 30 días',
    },
    {
      icon: CreditCard,
      title: dict?.home?.benefits_secure_payments || 'Pagos 100% Seguros',
      desc: 'Transacciones cifradas',
    },
    {
      icon: Globe,
      title: dict?.home?.benefits_global_logistics || 'Logística Acelerada',
      desc: 'Entregas prioritarias disponibles',
    },
  ];

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 border-b border-gray-100">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-gray-100">
        {benefits.map((benefit, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-2">
            <benefit.icon className="w-6 h-6 text-gray-400 mb-3" strokeWidth={1.5} />
            <h4 className="text-sm font-bold text-gray-900 mb-1">{benefit.title}</h4>
            <p className="text-xs text-gray-500">{benefit.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
