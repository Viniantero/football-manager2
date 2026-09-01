import { Plus, FolderOpen, ShieldCheck } from 'lucide-react';
import { useApp } from '@/state/AppContext';

/**
 * Home / title screen. The primary entry point showing the game title and the
 * two main actions: start a new career or load an existing one.
 */
export function HomePage() {
  const { navigate } = useApp();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-chalk-950 px-4 py-12">
      {/* Decorative pitch line backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 64px, #10b981 64px, #10b981 65px), repeating-linear-gradient(0deg, transparent, transparent 64px, #10b981 64px, #10b981 65px)',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pitch-600 via-pitch-400 to-pitch-600" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 text-pitch-400">
            <ShieldCheck size={36} strokeWidth={2.25} />
          </div>
          <h1 className="font-display text-5xl font-bold uppercase tracking-widest2 text-chalk-50 sm:text-6xl">
            Football
            <span className="block text-pitch-400">Manager</span>
          </h1>
          <p className="text-sm text-chalk-500">
            Gerenciamento esportivo single-player
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <button
            className="btn-primary group h-16 w-full text-base"
            onClick={() => navigate({ kind: 'new-career' })}
          >
            <Plus size={20} className="transition-transform group-hover:scale-110" />
            Nova Carreira
          </button>
          <button
            className="btn-secondary group h-16 w-full text-base"
            onClick={() => navigate({ kind: 'load-career' })}
          >
            <FolderOpen size={20} className="transition-transform group-hover:scale-110" />
            Carregar Carreira
          </button>
        </div>

        <p className="text-2xs text-center text-chalk-600">
          Módulo 01 — Fundação técnica
        </p>
      </div>
    </div>
  );
}
