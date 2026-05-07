import { login, signup } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const hasError = params?.error === 'true';
  const errorMsg = params?.msg ? decodeURIComponent(params.msg as string) : 'Credenciales inválidas o correo requiere confirmación.';

  return (
    <div className="min-h-screen bg-warm flex flex-col justify-center items-center p-4">
      <div className="bg-background p-10 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
        
        <div className="flex justify-center mb-8">
          <img 
            src="/logo-v2.png" 
            alt="AZHON Logo" 
            className="w-48 h-auto object-contain"
          />
        </div>

        <h1 className="text-2xl font-bold mb-2 text-center text-secondary tracking-tight">Bienvenido a AZHON</h1>
        <p className="text-sm text-neutral text-center mb-8">Ingresa a tu cuenta para continuar</p>
        
        {hasError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium text-center border border-red-100">
            {errorMsg}
          </div>
        )}
        
        <form className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-neutral mb-1.5 uppercase tracking-wide" htmlFor="email">Correo Electrónico</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-secondary bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
              placeholder="tu@email.com" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral mb-1.5 uppercase tracking-wide" htmlFor="password">Contraseña</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-secondary bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
              placeholder="••••••••" 
            />
          </div>
          
          <div className="flex flex-col gap-3 mt-4">
            <button formAction={login} className="w-full bg-secondary text-white rounded-full py-3.5 font-bold hover:bg-black transition-colors shadow-sm">
              Iniciar Sesión
            </button>
            <button formAction={signup} className="w-full bg-white text-primary border border-primary rounded-full py-3.5 font-bold hover:bg-orange-50 transition-colors">
              Crear una cuenta nueva
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
