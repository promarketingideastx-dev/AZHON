'use client';

import { useState } from 'react';
import { updatePassword } from './actions';

export default function ResetPasswordClient({ dict, errorKey, msgKey }: { dict: any, errorKey?: string, msgKey?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = dict?.auth || {};

  const handleSubmit = async () => {
    setLoading(true);
  };

  return (
    <div className="bg-background p-10 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
      <div className="flex justify-center mb-8">
        <img src="/logo-v2.png" alt="AZHON Logo" className="w-48 h-auto object-contain" />
      </div>

      <h1 className="text-2xl font-bold mb-2 text-center text-secondary tracking-tight">
        {t.title_update_password || 'Establecer nueva contraseña'}
      </h1>
      
      <p className="text-sm text-neutral text-center mb-8">
        {t.subtitle_update_password || 'Ingresa tu nueva contraseña para tu cuenta.'}
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

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} action={updatePassword}>
        <div>
          <label className="block text-xs font-bold text-neutral mb-1.5 uppercase tracking-wide" htmlFor="password">
            {t.password_new_label || 'Nueva Contraseña'}
          </label>
          <div className="relative">
            <input 
              id="password" name="password" type={showPassword ? "text" : "password"} required 
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

        <div>
          <label className="block text-xs font-bold text-neutral mb-1.5 uppercase tracking-wide" htmlFor="passwordConfirm">
            {t.password_confirm_label || 'Confirmar Contraseña'}
          </label>
          <input 
            id="passwordConfirm" name="passwordConfirm" type={showPassword ? "text" : "password"} required 
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-secondary bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
            placeholder={t.password_placeholder || "••••••••"} 
          />
        </div>

        <button type="submit" className="w-full bg-secondary text-white rounded-full py-3.5 font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-50 mt-4">
          {loading ? '...' : (t.btn_update_password || 'Actualizar Contraseña')}
        </button>
      </form>
    </div>
  );
}
