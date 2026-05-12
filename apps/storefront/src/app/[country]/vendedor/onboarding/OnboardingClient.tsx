'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveOnboardingStepAction, submitOnboardingAction } from './actions';

export default function OnboardingClient({
  country,
  initialStep,
  initialData
}: {
  country: string;
  initialStep: string;
  initialData: any;
}) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(initialData || {});

  const STEPS = [
    'INTENT',
    'RESIDENCE',
    'BUSINESS_TYPE',
    'COMMERCIAL',
    'ADDRESS',
    'DOCUMENTS',
    'REVIEW'
  ];

  const currentStepIndex = STEPS.indexOf(step);
  const progress = Math.round(((currentStepIndex + 1) / STEPS.length) * 100);

  const handleNext = async (data: any, nextStepStr: string) => {
    setLoading(true);
    try {
      const newFormData = { ...formData, ...data };
      setFormData(newFormData);
      await saveOnboardingStepAction(step, data, nextStepStr, country);
      setStep(nextStepStr);
      window.scrollTo(0, 0);
    } catch (e) {
      console.error(e);
      alert("Error saving progress");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await submitOnboardingAction(country);
    } catch (e) {
      console.error(e);
      alert("Error submitting application");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-neutral-500 font-medium mb-2">
          <span>Paso {currentStepIndex + 1} de {STEPS.length}</span>
          <span>{progress}% Completado</span>
        </div>
        <div className="w-full bg-neutral-100 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
        
        {step === 'INTENT' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-secondary mb-4">Bienvenido a AZHON Sellers</h2>
            <p className="text-neutral mb-8">Para comenzar a vender, necesitamos configurar tu perfil. Este proceso tomará unos minutos y puedes pausarlo en cualquier momento.</p>
            <button 
              onClick={() => handleNext({ intentConfirmed: true }, 'RESIDENCE')}
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-50"
            >
              Comenzar Configuración
            </button>
          </div>
        )}

        {step === 'RESIDENCE' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-secondary mb-4">Ubicación Operativa</h2>
            <p className="text-neutral mb-6">¿Desde dónde planeas operar tu negocio?</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handleNext({ 
                residenceCountry: fd.get('residenceCountry'),
                targetCountry: fd.get('targetCountry')
              }, 'BUSINESS_TYPE');
            }}>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">País de Residencia</label>
                  <select name="residenceCountry" defaultValue={formData?.RESIDENCE?.residenceCountry || country.toUpperCase()} className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="HN">Honduras</option>
                    <option value="MX">México</option>
                    <option value="OTHER">Otro (Internacional)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">Mercado Principal de Ventas</label>
                  <select name="targetCountry" defaultValue={formData?.RESIDENCE?.targetCountry || country.toUpperCase()} className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="HN">Honduras</option>
                    <option value="MX">México</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep('INTENT')} className="w-1/3 bg-neutral-100 text-secondary font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50">Atrás</button>
                <button type="submit" disabled={loading} className="w-2/3 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-50">Siguiente</button>
              </div>
            </form>
          </div>
        )}

        {step === 'BUSINESS_TYPE' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-secondary mb-4">Tipo de Negocio</h2>
            <p className="text-neutral mb-6">Selecciona el perfil que mejor describa tu operación.</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handleNext({ businessType: fd.get('businessType') }, 'COMMERCIAL');
            }}>
              <div className="space-y-4 mb-8">
                <label className="flex items-start p-4 border border-neutral-200 rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <input type="radio" name="businessType" value="FORMAL" defaultChecked className="mt-1 text-primary focus:ring-primary" />
                  <div className="ml-3">
                    <span className="block text-sm font-bold text-secondary">Empresa Formal Registrada</span>
                    <span className="block text-sm text-neutral mt-1">Cuento con registro tributario (RTN/RFC) y puedo emitir facturas.</span>
                  </div>
                </label>
                <label className="flex items-start p-4 border border-neutral-200 rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <input type="radio" name="businessType" value="REGULARIZATION" className="mt-1 text-primary focus:ring-primary" />
                  <div className="ml-3">
                    <span className="block text-sm font-bold text-secondary">En Vías de Regularización</span>
                    <span className="block text-sm text-neutral mt-1">Soy emprendedor individual sin registro fiscal formal activo.</span>
                  </div>
                </label>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep('RESIDENCE')} className="w-1/3 bg-neutral-100 text-secondary font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50">Atrás</button>
                <button type="submit" disabled={loading} className="w-2/3 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-50">Siguiente</button>
              </div>
            </form>
          </div>
        )}

        {step === 'COMMERCIAL' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-secondary mb-4">Datos Comerciales</h2>
            <p className="text-neutral mb-6">¿Cómo conocerán los clientes a tu tienda?</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handleNext({ storeName: fd.get('storeName'), category: fd.get('category') }, 'ADDRESS');
            }}>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">Nombre de la Tienda</label>
                  <input type="text" name="storeName" required defaultValue={formData?.COMMERCIAL?.storeName || ''} placeholder="Ej. ElectroHogar, Mi Tienda HN" className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">Categoría Principal (Opcional)</label>
                  <select name="category" className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="">Selecciona una categoría</option>
                    <option value="electronics">Electrónica y Tecnología</option>
                    <option value="fashion">Moda y Accesorios</option>
                    <option value="home">Hogar y Muebles</option>
                    <option value="auto">Repuestos y Automotriz</option>
                    <option value="other">Otra</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep('BUSINESS_TYPE')} className="w-1/3 bg-neutral-100 text-secondary font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50">Atrás</button>
                <button type="submit" disabled={loading} className="w-2/3 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-50">Siguiente</button>
              </div>
            </form>
          </div>
        )}

        {step === 'ADDRESS' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-secondary mb-4">Dirección Operativa</h2>
            <p className="text-neutral mb-6">Esta información servirá para recolecciones y devoluciones logísticas.</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handleNext({ addressLine1: fd.get('addressLine1'), city: fd.get('city') }, 'DOCUMENTS');
            }}>
              <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl mb-6 text-sm flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                <span>El módulo de Address Intelligence con geolocalización está en construcción. Por ahora ingresa tu dirección manualmente.</span>
              </div>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">Ciudad / Municipio</label>
                  <input type="text" name="city" required placeholder="Ej. Tegucigalpa" className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">Dirección Completa</label>
                  <textarea name="addressLine1" required rows={3} placeholder="Colonia, Calle, Número de Casa/Local..." className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep('COMMERCIAL')} className="w-1/3 bg-neutral-100 text-secondary font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50">Atrás</button>
                <button type="submit" disabled={loading} className="w-2/3 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-50">Siguiente</button>
              </div>
            </form>
          </div>
        )}

        {step === 'DOCUMENTS' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-secondary mb-4">Verificación de Identidad</h2>
            <p className="text-neutral mb-6">Para mantener AZHON seguro, debemos verificar tu identidad comercial. (Cascarón)</p>
            <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto text-neutral-400 mb-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              <p className="text-sm font-bold text-secondary mb-1">Módulo de Carga Documental en Construcción</p>
              <p className="text-xs text-neutral">La carga cifrada de RTN/RFC e Identidad se habilitará en la próxima fase de Compliance.</p>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setStep('ADDRESS')} className="w-1/3 bg-neutral-100 text-secondary font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50">Atrás</button>
              <button type="button" onClick={() => handleNext({ docsSkipped: true }, 'REVIEW')} disabled={loading} className="w-2/3 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-50">Omitir por ahora</button>
            </div>
          </div>
        )}

        {step === 'REVIEW' && (
          <div className="animate-fade-in text-center py-4">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-secondary mb-4">Todo listo para enviar</h2>
            <p className="text-neutral mb-8 max-w-md mx-auto">Al enviar esta solicitud, tu perfil de vendedor entrará a revisión por nuestro equipo de Super Admin. Mientras tanto, tu tienda se creará en modo borrador.</p>
            
            <div className="flex gap-4">
              <button type="button" onClick={() => setStep('DOCUMENTS')} className="w-1/3 bg-neutral-100 text-secondary font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50">Revisar</button>
              <button type="button" onClick={handleSubmit} disabled={loading} className="w-2/3 bg-secondary text-white font-bold py-3.5 rounded-xl hover:bg-neutral-800 transition disabled:opacity-50">
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
