'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { login, signup, resetPassword, signInWithGoogle, resendConfirmation } from './actions';

export default function AuthClient({ dict, errorKey, msgKey, intent, defaultEmail }: { dict: any, errorKey?: string, msgKey?: string, intent?: string, defaultEmail?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [view, setView] = useState<'intent_selector' | 'login' | 'signup' | 'forgot' | 'verify'>(() => {
    return defaultEmail && msgKey === 'msg_check_email' ? 'verify' : (!intent ? 'intent_selector' : 'login');
  });

  const [currentIntent, setCurrentIntent] = useState<string>(() => {
    return intent || 'buyer';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync state with URL params after Server Action redirects (to fix UI hangs)
  useEffect(() => {
    console.log(`[AZHON_AUTH_TRACE] ui:url_params_changed, errorKey: ${errorKey}, msgKey: ${msgKey}, view: ${searchParams.get('view')}`);
    
    if (errorKey || msgKey) {
      console.log(`[AZHON_AUTH_TRACE] ui:loading_false (cleared by props)`);
      setLoading(false); // Action completed, clear loading
    }
    
    if (errorKey) {
      console.log(`[AZHON_AUTH_TRACE] ui:error_visible, errorKey: ${errorKey}`);
    }
    
    const urlView = searchParams.get('view');
    if (urlView === 'verify') {
      console.log(`[AZHON_AUTH_TRACE] ui:view_changed to verify`);
      setView('verify');
    }
  }, [errorKey, msgKey, searchParams]);

  // Extract next param to preserve destination
  const nextParam = searchParams.get('next');

  const t = dict?.auth || {};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // If the browser submits it directly without a Server Action trigger, we prevent it.
    // However, Server Actions (formAction) bypass onSubmit if triggered by a button.
    e.preventDefault();
    console.log(`[AZHON_AUTH_TRACE] ui:submit_clicked, view: ${view}`);
    console.log(`[AZHON_AUTH_TRACE] ui:loading_true`);
    setLoading(true);
  };

  const selectIntent = (selectedIntent: 'buyer' | 'seller') => {
    setCurrentIntent(selectedIntent);
    setView('login');
  };

  return (
    <div className="bg-background p-10 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
      <div className="flex justify-center mb-8">
        <img src="/logo-v2.png" alt="AZHON Logo" className="w-48 h-auto object-contain" />
      </div>

      {/* Intent Selector View - Always in DOM to prevent React mutation crashes */}
      <div className={view === 'intent_selector' ? 'block' : 'hidden'}>
        <div className="flex flex-col gap-4 animate-fade-in text-center">
          <h1 className="text-2xl font-bold mb-2 text-secondary tracking-tight">
            {t.intent_title || '¿Cómo deseas ingresar?'}
          </h1>
          <p className="text-sm text-neutral mb-6">
            {t.intent_subtitle || 'Selecciona el tipo de cuenta para continuar.'}
          </p>
          
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); selectIntent('buyer'); }}
            className="w-full bg-secondary text-white rounded-xl py-4 px-6 font-bold hover:bg-black transition-all shadow-sm flex flex-col items-center gap-1 border-2 border-transparent hover:border-gray-800"
          >
            <span className="text-lg">{t.intent_buyer || 'Quiero comprar'}</span>
            <span className="text-xs font-normal text-gray-300">{t.intent_buyer_desc || 'Explorar productos y ofertas'}</span>
          </button>

          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); selectIntent('seller'); }}
            className="w-full bg-primary text-white rounded-xl py-4 px-6 font-bold hover:bg-orange-600 transition-all shadow-sm flex flex-col items-center gap-1 border-2 border-transparent hover:border-orange-700 mt-2"
          >
            <span className="text-lg">{t.intent_seller || 'Quiero vender en AZHON'}</span>
            <span className="text-xs font-normal text-orange-200">{t.intent_seller_desc || 'Gestionar mi tienda y catálogo'}</span>
          </button>
        </div>
      </div>

      {/* Auth Form View - Always in DOM so Autofill extensions can bind safely without crashing React */}
      <div className={view !== 'intent_selector' ? 'block animate-fade-in' : 'hidden'}>
        <h1 className="text-2xl font-bold mb-2 text-center text-secondary tracking-tight">
          {view === 'login' ? (currentIntent === 'seller' ? (t.title_login_seller || 'Acceso a Vendedores') : (t.title_login || 'Bienvenido a AZHON')) :
           view === 'signup' ? (currentIntent === 'seller' ? (t.title_signup_seller || 'Registro de Vendedor') : (t.title_signup || 'Crear una cuenta')) :
           view === 'verify' ? (t.verification_title || 'Verifica tu correo') :
           (t.title_reset || 'Restablecer contraseña')}
        </h1>
        
        <p className="text-sm text-neutral text-center mb-8">
          {view === 'login' ? (currentIntent === 'seller' ? (t.subtitle_login_seller || 'Ingresa para gestionar tu operación') : (t.subtitle_login || 'Ingresa a tu cuenta para continuar')) :
           view === 'signup' ? (currentIntent === 'seller' ? (t.subtitle_signup_seller || 'Únete como comercio aliado') : (t.subtitle_signup || 'Únete a AZHON hoy mismo')) :
           view === 'verify' ? (t.verification_desc || 'Hemos enviado un enlace de confirmación a tu correo.') :
           (t.subtitle_reset || 'Ingresa tu correo para recibir instrucciones')}
        </p>

        {errorKey && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium text-center border border-red-100">
            {t[errorKey] || 'Error de autenticación.'}
          </div>
        )}

        {msgKey && !errorKey && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm font-medium text-center border border-green-100">
            {t[msgKey] || 'Operación exitosa.'}
          </div>
        )}

        {view === 'verify' ? (
          <div className="flex flex-col gap-5 items-center text-center py-4">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-secondary">
              {t.msg_check_email || 'Revisa tu bandeja de entrada para confirmar tu cuenta.'}
            </h2>
            <p className="text-sm text-neutral mt-2">
              {t.verification_note || 'Haz clic en el enlace seguro que te enviamos para activar tu cuenta de AZHON.'}
            </p>
            <div className="w-full mt-6">
              <button type="button" onClick={() => {
                setView('login');
                const params = new URLSearchParams(searchParams.toString());
                params.delete('msg');
                params.delete('view');
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
              }} className="w-full bg-white text-secondary border border-gray-200 rounded-full py-3.5 font-bold hover:bg-gray-50 transition-colors mb-3">
                {t.btn_back_login || 'Volver a iniciar sesión'}
              </button>
              {defaultEmail && (
                <form action={resendConfirmation}>
                  <input type="hidden" name="email" value={defaultEmail} />
                  <input type="hidden" name="intent" value={currentIntent} />
                  <button type="submit" className="text-sm text-primary font-bold hover:underline">
                    {t.btn_resend || 'Reenviar enlace de confirmación'}
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <input type="hidden" name="intent" value={currentIntent} />
            {nextParam && <input type="hidden" name="next" value={nextParam} />}
            
            <div>
              <label className="block text-xs font-bold text-neutral mb-1.5 uppercase tracking-wide" htmlFor="email">
                {t.email_label || 'Correo Electrónico'}
              </label>
              <input 
                id="email" name="email" type="email" required 
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-secondary bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                placeholder={t.email_placeholder || "tu@email.com"} 
              />
            </div>

            <div className={view !== 'forgot' ? 'block' : 'hidden'}>
              <label className="block text-xs font-bold text-neutral mb-1.5 uppercase tracking-wide" htmlFor="password">
                {t.password_label || 'Contraseña'}
              </label>
              <div className="relative">
                <input 
                  id="password" name="password" type={showPassword ? "text" : "password"} required={view !== 'forgot'}
                  className="w-full border border-gray-200 rounded-lg pl-4 pr-12 py-3 text-sm text-secondary bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                  placeholder={t.password_placeholder || "••••••••"} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div className={view === 'signup' ? 'block' : 'hidden'}>
              <label className="block text-xs font-bold text-neutral mb-1.5 uppercase tracking-wide" htmlFor="passwordConfirm">
                {t.password_confirm_label || 'Confirmar Contraseña'}
              </label>
              <input 
                id="passwordConfirm" name="passwordConfirm" type={showPassword ? "text" : "password"} required={view === 'signup'}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-secondary bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                placeholder={t.password_placeholder || "••••••••"} 
              />
            </div>
            
            <div className="flex flex-col gap-3 mt-4">
              {/* LOGIN BUTTONS */}
              <div className={view === 'login' ? 'flex flex-col gap-3' : 'hidden'}>
                <div className="flex justify-end mb-1 -mt-2">
                  <button type="button" onClick={() => setView('forgot')} className="text-xs text-primary font-bold hover:underline">
                    {t.link_forgot || '¿Olvidaste tu contraseña?'}
                  </button>
                </div>
                <button formAction={login} className={`w-full text-white rounded-full py-3.5 font-bold transition-colors shadow-sm disabled:opacity-50 ${currentIntent === 'seller' ? 'bg-primary hover:bg-orange-600' : 'bg-secondary hover:bg-black'}`}>
                  {loading ? '...' : (t.btn_login || 'Iniciar Sesión')}
                </button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink-0 mx-4 text-neutral text-xs">O</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <button 
                  type="button" 
                  onClick={async () => {
                    setLoading(true);
                    const fd = new FormData();
                    fd.append('intent', currentIntent);
                    if (nextParam) fd.append('next', nextParam);
                    const result = await signInWithGoogle(fd);
                    if (result?.url) {
                      window.location.href = result.url;
                    } else {
                      setLoading(false);
                    }
                  }}
                  className="w-full bg-white text-secondary border border-gray-200 rounded-full py-3.5 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                  {t.btn_google || 'Continuar con Google'}
                </button>

                <div className="text-center mt-2">
                  <button type="button" onClick={() => setView('signup')} className="text-sm text-neutral hover:text-primary font-bold transition-colors">
                    {t.link_signup || '¿No tienes cuenta? Regístrate'}
                  </button>
                </div>
              </div>

              {/* SIGNUP BUTTONS */}
              <div className={view === 'signup' ? 'flex flex-col gap-3' : 'hidden'}>
                <button formAction={signup} className={`w-full text-white rounded-full py-3.5 font-bold transition-colors shadow-sm disabled:opacity-50 ${currentIntent === 'seller' ? 'bg-primary hover:bg-orange-600' : 'bg-secondary hover:bg-black'}`}>
                  {loading ? '...' : (t.btn_signup || 'Crear Cuenta')}
                </button>
                <div className="text-center mt-2">
                  <button type="button" onClick={() => setView('login')} className="text-sm text-neutral hover:text-primary font-bold transition-colors">
                    {t.link_login || '¿Ya tienes cuenta? Inicia sesión'}
                  </button>
                </div>
              </div>

              {/* FORGOT PASSWORD BUTTONS */}
              <div className={view === 'forgot' ? 'flex flex-col gap-3' : 'hidden'}>
                <button formAction={resetPassword} className="w-full bg-secondary text-white rounded-full py-3.5 font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-50">
                  {loading ? '...' : (t.btn_reset || 'Enviar enlace')}
                </button>
                <div className="text-center mt-2">
                  <button type="button" onClick={() => setView('login')} className="text-sm text-neutral hover:text-primary font-bold transition-colors">
                    {t.btn_back_login || 'Volver al inicio'}
                  </button>
                </div>
              </div>
              
              {/* Back to Intent Selector */}
              {!intent && (
                <div className="text-center mt-4 pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => { 
                      setView('intent_selector'); 
                      setCurrentIntent('buyer');
                    }} 
                    className="text-xs text-neutral hover:text-secondary font-medium transition-colors flex items-center justify-center gap-1 mx-auto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                    {t.btn_change_intent || 'Cambiar tipo de cuenta'}
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
// Trigger Vercel Deploy
