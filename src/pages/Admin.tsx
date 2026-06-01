import { useAuth, signOut } from '../utils/auth';
import { LogOut, Shield } from 'lucide-react';

/**
 * Selvadentro admin dashboard. V1 stub — full management UI lands in Phase 4.
 */
export default function Admin() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#ECE5D8] font-lexend">
      <header className="bg-brand-dark-green text-white px-4 sm:px-6 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo-selvandentro_tulum.webp"
              alt="Selvadentro"
              className="h-8 w-auto"
            />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 bg-brand-copper/20 text-brand-copper text-[11px] font-semibold uppercase tracking-wider rounded-full">
              <Shield className="w-3 h-3" />
              Admin
            </span>
          </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <h1 className="font-cardo text-4xl font-bold text-brand-dark-green mb-2">
          Panel de administración
        </h1>
        <p className="text-stone-600 mb-8">
          Bienvenido, {user?.email}. Tienes acceso completo al programa.
        </p>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
          <p className="text-stone-700">
            El leaderboard de afiliados, gestión de comisiones y panel de control
            llegan en la siguiente fase del build. Por ahora, este es solo el shell
            para confirmar que el login y la detección de admin funcionan.
          </p>
        </div>
      </main>
    </div>
  );
}
