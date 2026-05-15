'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveOnboardingStepAction, submitOnboardingAction } from './actions';

export default function OnboardingClient({
  country,
  initialStep,
  initialData,
  dict
}: {
  country: string;
  initialStep: string;
  initialData: any;
  dict?: any;
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
          <span>{(dict?.onboarding?.step_x_of_y || 'Paso {current} de {total}').replace('{current}', String(currentStepIndex + 1)).replace('{total}', String(STEPS.length))}</span>
          <span>{(dict?.onboarding?.percent_completed || '{progress}% Completado').replace('{progress}', String(progress))}</span>
        </div>
        <div className="w-full bg-neutral-100 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
        
        {step === 'INTENT' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-secondary mb-4">{dict?.onboarding?.welcome_title || 'Bienvenido a AZHON Sellers'}</h2>
            <p className="text-neutral mb-8">{dict?.onboarding?.welcome_desc || 'Para comenzar a vender, necesitamos configurar tu perfil. Este proceso tomará unos minutos y puedes pausarlo en cualquier momento.'}</p>
            <button 
              onClick={() => handleNext({ intentConfirmed: true }, 'RESIDENCE')}
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-50"
            >
              {dict?.onboarding?.start_config || 'Comenzar Configuración'}
            </button>
          </div>
        )}

        {step === 'RESIDENCE' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-secondary mb-4">{dict?.onboarding?.location_title || 'Ubicación Operativa'}</h2>
            <p className="text-neutral mb-6">{dict?.onboarding?.location_desc || '¿Desde dónde planeas operar tu negocio?'}</p>
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
                  <label className="block text-sm font-bold text-secondary mb-2">{dict?.onboarding?.country_residence || 'País de Residencia'}</label>
                  <select name="residenceCountry" defaultValue={formData?.RESIDENCE?.residenceCountry || country.toUpperCase()} className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="HN">{dict?.onboarding?.honduras || 'Honduras'}</option>
                    <option value="MX">{dict?.onboarding?.mexico || 'México'}</option>
                    <option value="OTHER">{dict?.onboarding?.other_intl || 'Otro (Internacional)'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">{dict?.onboarding?.target_market || 'Mercado Principal de Ventas'}</label>
                  <select name="targetCountry" defaultValue={formData?.RESIDENCE?.targetCountry || country.toUpperCase()} className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="HN">{dict?.onboarding?.honduras || 'Honduras'}</option>
                    <option value="MX">{dict?.onboarding?.mexico || 'México'}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep('INTENT')} className="w-1/3 bg-neutral-100 text-secondary font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50">{dict?.onboarding?.back || 'Atrás'}</button>
                <button type="submit" disabled={loading} className="w-2/3 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-50">{dict?.onboarding?.next || 'Siguiente'}</button>
              </div>
            </form>
          </div>
        )}

        {step === 'BUSINESS_TYPE' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-secondary mb-4">{dict?.onboarding?.biz_type_title || 'Tipo de Negocio'}</h2>
            <p className="text-neutral mb-6">{dict?.onboarding?.biz_type_desc || 'Selecciona el perfil que mejor describa tu operación.'}</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handleNext({ businessType: fd.get('businessType') }, 'COMMERCIAL');
            }}>
              <div className="space-y-4 mb-8">
                <label className="flex items-start p-4 border border-neutral-200 rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <input type="radio" name="businessType" value="FORMAL" defaultChecked className="mt-1 text-primary focus:ring-primary" />
                  <div className="ml-3">
                    <span className="block text-sm font-bold text-secondary">{dict?.onboarding?.formal_biz || 'Empresa Formal Registrada'}</span>
                    <span className="block text-sm text-neutral mt-1">{dict?.onboarding?.formal_biz_desc || 'Cuento con registro tributario (RTN/RFC) y puedo emitir facturas.'}</span>
                  </div>
                </label>
                <label className="flex items-start p-4 border border-neutral-200 rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <input type="radio" name="businessType" value="REGULARIZATION" className="mt-1 text-primary focus:ring-primary" />
                  <div className="ml-3">
                    <span className="block text-sm font-bold text-secondary">{dict?.onboarding?.regularization || 'En Vías de Regularización'}</span>
                    <span className="block text-sm text-neutral mt-1">{dict?.onboarding?.regularization_desc || 'Soy emprendedor individual sin registro fiscal formal activo.'}</span>
                  </div>
                </label>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep('RESIDENCE')} className="w-1/3 bg-neutral-100 text-secondary font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50">{dict?.onboarding?.back || 'Atrás'}</button>
                <button type="submit" disabled={loading} className="w-2/3 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-50">{dict?.onboarding?.next || 'Siguiente'}</button>
              </div>
            </form>
          </div>
        )}

        {step === 'COMMERCIAL' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-secondary mb-4">{dict?.onboarding?.commercial_title || 'Datos Comerciales'}</h2>
            <p className="text-neutral mb-6">{dict?.onboarding?.commercial_desc || '¿Cómo conocerán los clientes a tu tienda?'}</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handleNext({ storeName: fd.get('storeName'), category: fd.get('category') }, 'ADDRESS');
            }}>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">{dict?.onboarding?.store_name || 'Nombre de la Tienda'}</label>
                  <input type="text" name="storeName" required defaultValue={formData?.COMMERCIAL?.storeName || ''} placeholder={dict?.onboarding?.store_name_ph || 'Ej. ElectroHogar, Mi Tienda HN'} className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">{dict?.onboarding?.main_category || 'Categoría Principal (Opcional)'}</label>
                  <select name="category" className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="">{dict?.onboarding?.select_category || 'Selecciona una categoría'}</option>
                    <option value="electronics">{dict?.onboarding?.cat_electronics || 'Electrónica y Tecnología'}</option>
                    <option value="fashion">{dict?.onboarding?.cat_fashion || 'Moda y Accesorios'}</option>
                    <option value="home">{dict?.onboarding?.cat_home || 'Hogar y Muebles'}</option>
                    <option value="auto">{dict?.onboarding?.cat_auto || 'Repuestos y Automotriz'}</option>
                    <option value="other">{dict?.onboarding?.cat_other || 'Otra'}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep('BUSINESS_TYPE')} className="w-1/3 bg-neutral-100 text-secondary font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50">{dict?.onboarding?.back || 'Atrás'}</button>
                <button type="submit" disabled={loading} className="w-2/3 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-50">{dict?.onboarding?.next || 'Siguiente'}</button>
              </div>
            </form>
          </div>
        )}

        {step === 'ADDRESS' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-secondary mb-4">{dict?.onboarding?.address_title || 'Dirección Operativa'}</h2>
            <p className="text-neutral mb-6">{dict?.onboarding?.address_desc || 'Esta información servirá para recolecciones y devoluciones logísticas.'}</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handleNext({ addressLine1: fd.get('addressLine1'), city: fd.get('city') }, 'DOCUMENTS');
            }}>
              <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl mb-6 text-sm flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                <span>{dict?.onboarding?.address_warning || 'El módulo de Address Intelligence con geolocalización está en construcción. Por ahora ingresa tu dirección manualmente.'}</span>
              </div>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">{dict?.onboarding?.city || 'Ciudad / Municipio'}</label>
                  <input type="text" name="city" required placeholder={dict?.onboarding?.city_ph || 'Ej. Tegucigalpa'} className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">{dict?.onboarding?.full_address || 'Dirección Completa'}</label>
                  <textarea name="addressLine1" required rows={3} placeholder={dict?.onboarding?.full_address_ph || 'Colonia, Calle, Número de Casa/Local...'} className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep('COMMERCIAL')} className="w-1/3 bg-neutral-100 text-secondary font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50">{dict?.onboarding?.back || 'Atrás'}</button>
                <button type="submit" disabled={loading} className="w-2/3 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-50">{dict?.onboarding?.next || 'Siguiente'}</button>
              </div>
            </form>
          </div>
        )}

        {step === 'DOCUMENTS' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-secondary mb-4">{dict?.onboarding?.id_verification_title || 'Verificación de Identidad'}</h2>
            <p className="text-neutral mb-6">{dict?.onboarding?.id_verification_desc || 'Para mantener AZHON seguro, debemos verificar tu identidad comercial. (Cascarón)'}</p>
            <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto text-neutral-400 mb-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              <p className="text-sm font-bold text-secondary mb-1">{dict?.onboarding?.doc_module_wip || 'Módulo de Carga Documental en Construcción'}</p>
              <p className="text-xs text-neutral">{dict?.onboarding?.doc_module_wip_desc || 'La carga cifrada de RTN/RFC e Identidad se habilitará en la próxima fase de Compliance.'}</p>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setStep('ADDRESS')} className="w-1/3 bg-neutral-100 text-secondary font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50">{dict?.onboarding?.back || 'Atrás'}</button>
              <button type="button" onClick={() => handleNext({ docsSkipped: true }, 'REVIEW')} disabled={loading} className="w-2/3 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-50">{dict?.onboarding?.skip || 'Omitir por ahora'}</button>
            </div>
          </div>
        )}

        {step === 'REVIEW' && (
          <div className="animate-fade-in text-center py-4">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-secondary mb-4">{dict?.onboarding?.ready_submit_title || 'Todo listo para enviar'}</h2>
            <p className="text-neutral mb-8 max-w-md mx-auto">{dict?.onboarding?.ready_submit_desc || 'Al enviar esta solicitud, tu perfil de vendedor entrará a revisión por nuestro equipo de Super Admin. Mientras tanto, tu tienda se creará en modo borrador.'}</p>
            
            <div className="flex gap-4">
              <button type="button" onClick={() => setStep('DOCUMENTS')} className="w-1/3 bg-neutral-100 text-secondary font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50">{dict?.onboarding?.review || 'Revisar'}</button>
              <button type="button" onClick={handleSubmit} disabled={loading} className="w-2/3 bg-secondary text-white font-bold py-3.5 rounded-xl hover:bg-neutral-800 transition disabled:opacity-50">
                {loading ? (dict?.onboarding?.submitting || 'Enviando...') : (dict?.onboarding?.submit_app || 'Enviar Solicitud')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
