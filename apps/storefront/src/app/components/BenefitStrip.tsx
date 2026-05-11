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
      desc: 'Garantía de reembolso',
    },
    {
      icon: CreditCard,
      title: dict?.home?.benefits_secure_payments || 'Pagos 100% Seguros',
      desc: 'Transacciones cifradas',
    },
    {
      icon: Globe,
      title: dict?.home?.benefits_global_logistics || 'Logística Acelerada',
      desc: 'Entregas prioritarias',
    },
  ];

  return (
    <section className="w-full bg-orange-50/40 border-y border-orange-100/50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-orange-200/50">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-2 group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                <benefit.icon className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h4 className="text-sm font-black text-gray-900 mb-1">{benefit.title}</h4>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
