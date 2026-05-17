'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveOnboardingStepAction, submitOnboardingAction } from './actions';
import { SUPPORTED_SELLER_COUNTRIES, MASTER_GEO_CATALOG } from '@/config/geo';

export default function OnboardingClient({
  country,
  initialStep,
  initialData,
  dict,
  categories
}: {
  country: string;
  initialStep: string;
  initialData: any;
  dict?: any;
  categories?: { id: string, slug: string, name: string }[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(initialData || {});

  // Geo states for ADDRESS step
  const [selectedDepartmentCode, setSelectedDepartmentCode] = useState<string>(
    initialData?.ADDRESS?.departmentCode || ''
  );
  const [isCityManual, setIsCityManual] = useState<boolean>(
    initialData?.ADDRESS?.citySource === 'manual_request'
  );

  const STEPS = [
    'INTENT',
    'RESIDENCE',
    'PERSONAL',
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
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Error submitting application");
      setLoading(false);
    }
  };

  const getActiveCountryCatalog = () => {
    const code = formData?.RESIDENCE?.targetCountry || country.toUpperCase();
    return MASTER_GEO_CATALOG[code];
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
              const target = fd.get('targetCountry') as string;
              const catalog = MASTER_GEO_CATALOG[target];
              if (catalog?.status === 'upcoming') {
                alert((dict?.onboarding?.upcoming_country_blocked || 'AZHON Sellers estará disponible en {country} próximamente. Por ahora, no puedes completar el registro operativo.').replace('{country}', catalog.name));
                return;
              }
              handleNext({ 
                residenceCountry: fd.get('residenceCountry'),
                targetCountry: target
              }, 'PERSONAL');
            }}>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">{dict?.onboarding?.country_residence || 'País de Residencia'}</label>
                  <select name="residenceCountry" defaultValue={formData?.RESIDENCE?.residenceCountry || country.toUpperCase()} className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    {SUPPORTED_SELLER_COUNTRIES.map(code => (
                      <option key={`res-${code}`} value={code}>{MASTER_GEO_CATALOG[code].name}</option>
                    ))}
                    <option value="OTHER">{dict?.onboarding?.other_intl || 'Otro (Internacional)'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">{dict?.onboarding?.target_market || 'Mercado Principal de Ventas'}</label>
                  <select name="targetCountry" defaultValue={formData?.RESIDENCE?.targetCountry || country.toUpperCase()} className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    {SUPPORTED_SELLER_COUNTRIES.map(code => (
                      <option key={`tgt-${code}`} value={code}>
                        {MASTER_GEO_CATALOG[code].name} {MASTER_GEO_CATALOG[code].status === 'upcoming' ? '(Próximamente)' : ''}
                      </option>
                    ))}
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

        {step === 'PERSONAL' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-secondary mb-4">{dict?.onboarding?.personal_title || 'Información Personal'}</h2>
            <p className="text-neutral mb-6">{dict?.onboarding?.personal_desc || 'Datos necesarios para verificar tu identidad.'}</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const dob = fd.get('dateOfBirth') as string;
              
              if (!dob) {
                alert(dict?.onboarding?.err_dob_required || 'La fecha de nacimiento es obligatoria.');
                return;
              }

              const birthDate = new Date(dob);
              const today = new Date();
              let age = today.getFullYear() - birthDate.getFullYear();
              const m = today.getMonth() - birthDate.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                  age--;
              }

              if (age < 18) {
                alert(dict?.onboarding?.err_under_18 || 'Debes ser mayor de 18 años para ser vendedor.');
                return;
              }

              handleNext({ dateOfBirth: dob, gender: fd.get('gender') }, 'BUSINESS_TYPE');
            }}>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">{dict?.onboarding?.dateOfBirth || 'Fecha de Nacimiento'}</label>
                  <input type="date" name="dateOfBirth" required defaultValue={formData?.PERSONAL?.dateOfBirth || ''} className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">{dict?.onboarding?.gender || 'Género'}</label>
                  <select name="gender" required defaultValue={formData?.PERSONAL?.gender || ''} className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="">{dict?.onboarding?.select_category || 'Selecciona una opción'}</option>
                    <option value="male">{dict?.onboarding?.gender_male || 'Masculino'}</option>
                    <option value="female">{dict?.onboarding?.gender_female || 'Femenino'}</option>
                    <option value="other">{dict?.onboarding?.gender_other || 'Otro'}</option>
                    <option value="prefer_not_to_say">{dict?.onboarding?.gender_prefer_not_to_say || 'Prefiero no decirlo'}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep('RESIDENCE')} className="w-1/3 bg-neutral-100 text-secondary font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50">{dict?.onboarding?.back || 'Atrás'}</button>
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
                  <input type="radio" name="businessType" value="FORMAL" defaultChecked={formData?.BUSINESS_TYPE?.businessType !== 'REGULARIZATION'} className="mt-1 text-primary focus:ring-primary" />
                  <div className="ml-3">
                    <span className="block text-sm font-bold text-secondary">{dict?.onboarding?.formal_biz || 'Empresa Formal Registrada'}</span>
                    <span className="block text-sm text-neutral mt-1">{dict?.onboarding?.formal_biz_desc || 'Cuento con registro tributario (RTN/RFC) y puedo emitir facturas.'}</span>
                  </div>
                </label>
                <label className="flex items-start p-4 border border-neutral-200 rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <input type="radio" name="businessType" value="REGULARIZATION" defaultChecked={formData?.BUSINESS_TYPE?.businessType === 'REGULARIZATION'} className="mt-1 text-primary focus:ring-primary" />
                  <div className="ml-3">
                    <span className="block text-sm font-bold text-secondary">{dict?.onboarding?.regularization || 'En Vías de Regularización'}</span>
                    <span className="block text-sm text-neutral mt-1">{dict?.onboarding?.regularization_desc || 'Soy emprendedor individual sin registro fiscal formal activo.'}</span>
                  </div>
                </label>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep('PERSONAL')} className="w-1/3 bg-neutral-100 text-secondary font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50">{dict?.onboarding?.back || 'Atrás'}</button>
                <button type="submit" disabled={loading} className="w-2/3 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-50">{dict?.onboarding?.next || 'Siguiente'}</button>
              </div>
            </form>
          </div>
        )}

        {step === 'COMMERCIAL' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-secondary mb-4">{dict?.onboarding?.commercial_title || 'Datos Comerciales'}</h2>
            <p className="text-neutral mb-6">{dict?.onboarding?.commercial_desc || '¿Cómo conocerán los clientes a tu tienda?'}</p>
            {(!categories || categories.length === 0) ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
                {dict?.onboarding?.err_no_categories_loaded || 'No se pudieron cargar las categorías. Por favor, intenta más tarde.'}
              </div>
            ) : (
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
                  <select name="category" defaultValue={formData?.COMMERCIAL?.category || ''} className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="">{dict?.onboarding?.select_category || 'Selecciona una categoría'}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep('BUSINESS_TYPE')} className="w-1/3 bg-neutral-100 text-secondary font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50">{dict?.onboarding?.back || 'Atrás'}</button>
                <button type="submit" disabled={loading} className="w-2/3 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-50">{dict?.onboarding?.next || 'Siguiente'}</button>
              </div>
            </form>
            )}
          </div>
        )}

        {step === 'ADDRESS' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-secondary mb-4">{dict?.onboarding?.address_title || 'Dirección Operativa'}</h2>
            <p className="text-neutral mb-6">{dict?.onboarding?.address_desc || 'Esta información servirá para recolecciones y devoluciones logísticas.'}</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const addrLine = fd.get('addressLine1') as string;
              
              let payload: any = { addressLine1: addrLine };
              
              if (isCityManual) {
                const cityName = fd.get('cityNameRaw') as string;
                if (!cityName) {
                  alert(dict?.onboarding?.err_city_required || 'La ciudad es obligatoria.');
                  return;
                }
                const catalog = getActiveCountryCatalog();
                const dName = selectedDepartmentCode && catalog ? catalog.departments.find(d => d.departmentCode === selectedDepartmentCode)?.name : '';
                payload = {
                  ...payload,
                  citySource: 'manual_request',
                  cityNameRaw: cityName,
                  departmentCode: selectedDepartmentCode || null,
                  departmentName: dName || cityName,
                  cityCode: null,
                  geoStatus: 'pending_review',
                  coverageStatus: 'pending_review',
                  deliveryEligibility: 'pending_review'
                };
              } else {
                const depCode = fd.get('departmentCode') as string;
                const citCode = fd.get('cityCode') as string;
                if (!depCode) {
                  alert(dict?.onboarding?.err_department_required || 'El departamento es obligatorio.');
                  return;
                }
                if (!citCode) {
                  alert(dict?.onboarding?.err_city_required || 'La ciudad es obligatoria.');
                  return;
                }
                
                const catalog = getActiveCountryCatalog();
                const dep = catalog?.departments.find(d => d.departmentCode === depCode);
                const cit = dep?.cities.find(c => c.cityCode === citCode);
                
                payload = {
                  ...payload,
                  citySource: 'catalog',
                  departmentCode: depCode,
                  departmentName: dep?.name,
                  cityCode: citCode,
                  cityNameRaw: cit?.name,
                  geoStatus: cit?.geoStatus || 'pending_review',
                  coverageStatus: cit?.coverageStatus || 'pending_review',
                  deliveryEligibility: cit?.deliveryEligibility || 'pending_review'
                };
              }

              handleNext(payload, 'DOCUMENTS');
            }}>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">{dict?.onboarding?.department || 'Departamento / Estado'}</label>
                  <select 
                    name="departmentCode" 
                    value={selectedDepartmentCode}
                    onChange={(e) => {
                      setSelectedDepartmentCode(e.target.value);
                      if (!isCityManual) {
                        const cityCodeSelect = document.querySelector('select[name="cityCode"]') as HTMLSelectElement;
                        if (cityCodeSelect) cityCodeSelect.value = '';
                      }
                    }}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">{dict?.onboarding?.select_department || 'Selecciona un departamento'}</option>
                    {getActiveCountryCatalog()?.departments.map(d => (
                      <option key={d.departmentCode} value={d.departmentCode}>{d.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2 my-2">
                  <input 
                    type="checkbox" 
                    id="manualCityToggle" 
                    checked={isCityManual}
                    onChange={(e) => setIsCityManual(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-5 h-5"
                  />
                  <label htmlFor="manualCityToggle" className="text-sm font-medium text-neutral-600 cursor-pointer">
                    {dict?.onboarding?.manual_city_checkbox || 'No encuentro mi ciudad'}
                  </label>
                </div>

                {isCityManual ? (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-bold text-secondary mb-2">{dict?.onboarding?.manual_city_input || 'Escribe el nombre de tu ciudad'}</label>
                    <input type="text" name="cityNameRaw" defaultValue={formData?.ADDRESS?.cityNameRaw || ''} placeholder="Ej. Tegucigalpa" className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-bold text-secondary mb-2">{dict?.onboarding?.city || 'Ciudad / Municipio'}</label>
                    <select name="cityCode" defaultValue={formData?.ADDRESS?.cityCode || ''} className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option value="">{dict?.onboarding?.select_city || 'Selecciona una ciudad'}</option>
                      {selectedDepartmentCode && getActiveCountryCatalog()?.departments.find(d => d.departmentCode === selectedDepartmentCode)?.cities.map(c => (
                        <option key={c.cityCode} value={c.cityCode}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">{dict?.onboarding?.full_address || 'Dirección Completa'}</label>
                  <textarea name="addressLine1" required defaultValue={formData?.ADDRESS?.addressLine1 || ''} rows={3} placeholder={dict?.onboarding?.full_address_ph || 'Colonia, Calle, Número de Casa/Local...'} className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
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
