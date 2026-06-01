import { useAuth, signOut } from '../utils/auth';
import { LogOut } from 'lucide-react';

/**
 * Affiliate dashboard. V1 stub — full stats UI lands in Phase 3.
 */
export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#ECE5D8] font-lexend">
      <header className="bg-brand-dark-green text-white px-4 sm:px-6 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <img
            src="/logo-selvandentro_tulum.webp"
            alt="Selvadentro"
            className="h-8 w-auto"
          />
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/80 hidden sm:inline">{user?.email}</span>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-sm text-white/85 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <h1 className="font-cardo text-4xl font-bold text-brand-dark-green mb-2">
          Tu dashboard
        </h1>
        <p className="text-stone-600 mb-8">
          Bienvenido, {user?.email}.
        </p>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
          <p className="text-stone-700">
            Tu dashboard de estadísticas estará listo en la próxima fase del build.
            Por ahora, este es solo el shell para confirmar que el login funciona.
          </p>
        </div>
      </main>
    </div>
  );
}
