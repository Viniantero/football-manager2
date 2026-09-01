import { ShieldCheck, Settings2, Lock, ArrowRight } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { GAME_MODULES } from '@/types';
import {
  formatCurrency,
  formatDate,
  DIFFICULTY_OPTIONS,
  FIXTURE_DENSITY_OPTIONS,
  TRANSFER_WINDOW_OPTIONS,
} from '@/domain/career';
import { Panel } from '@/components/ui/Panel';
import { Alert } from '@/components/ui/Alert';

const DIFFICULTY_LABEL: Record<string, string> = Object.fromEntries(
  DIFFICULTY_OPTIONS.map((o) => [o.value, o.label])
);
const FIXTURE_LABEL: Record<string, string> = Object.fromEntries(
  FIXTURE_DENSITY_OPTIONS.map((o) => [o.value, o.label])
);
const TRANSFER_LABEL: Record<string, string> = Object.fromEntries(
  TRANSFER_WINDOW_OPTIONS.map((o) => [o.value, o.label])
);

export function DashboardPage() {
  const { activeCareer, navigate } = useApp();

  if (!activeCareer) {
    return (
      <div className="p-6">
        <Alert tone="warning" title="Nenhuma carreira ativa">
          Abra ou crie uma carreira para acessar o painel.
        </Alert>
        <button className="btn-primary mt-4" onClick={() => navigate({ kind: 'home' })}>
          Ir para o início
        </button>
      </div>
    );
  }

  const { settings } = activeCareer;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 animate-fade-in">
      {/* Career header */}
      <div className="mb-5 sm:mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-pitch-950/60 text-pitch-400 ring-1 ring-pitch-800 sm:h-12 sm:w-12">
            <ShieldCheck size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl sm:text-2xl font-bold uppercase tracking-wide2 text-chalk-50">
              {activeCareer.name}
            </h1>
            <p className="truncate text-sm text-chalk-400">Treinador: {activeCareer.manager_name}</p>
          </div>
        </div>
        <button className="btn-secondary self-start" onClick={() => navigate({ kind: 'load-career' })}>
          <Settings2 size={16} /> Trocar carreira
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Overview stats */}
        <Panel title="Visão geral" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
            <Stat label="Verba inicial" value={settings ? formatCurrency(settings.starting_balance, settings.currency_symbol) : '—'} />
            <Stat label="Dificuldade" value={settings ? DIFFICULTY_LABEL[settings.difficulty] ?? settings.difficulty : '—'} />
            <Stat label="Calendário" value={settings ? FIXTURE_LABEL[settings.fixture_density] ?? settings.fixture_density : '—'} />
            <Stat label="Mercado" value={settings ? TRANSFER_LABEL[settings.transfer_window_frequency] ?? settings.transfer_window_frequency : '—'} />
            <Stat label="Lesões" value={settings?.injuries_enabled ? 'Ativadas' : 'Desativadas'} />
            <Stat label="Categorias de base" value={settings?.youth_academy_enabled ? 'Ativadas' : 'Desativadas'} />
            <Stat label="Criada em" value={formatDate(activeCareer.created_at)} />
            <Stat label="Último acesso" value={formatDate(activeCareer.last_played_at)} />
          </div>
        </Panel>

        {/* Status card */}
        <Panel title="Status">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-md bg-chalk-800/50 px-3 py-2">
              <span className="text-xs text-chalk-400">Situação</span>
              <span className="badge bg-pitch-950 text-pitch-300">{activeCareer.status}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-chalk-800/50 px-3 py-2">
              <span className="text-xs text-chalk-400">Temporada</span>
              <span className="text-xs text-chalk-300">Não iniciada</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-chalk-800/50 px-3 py-2">
              <span className="text-xs text-chalk-400">Rodada</span>
              <span className="text-xs text-chalk-300">—</span>
            </div>
          </div>
        </Panel>
      </div>

      {/* Module roadmap */}
      <div className="mt-4 sm:mt-6">
        <Panel
          title="Módulos do jogo"
          subtitle="Funcionalidades que serão adicionadas nos próximos módulos"
        >
          <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 sm:grid-cols-3">
            {GAME_MODULES.map((mod) => (
              <div
                key={mod.id}
                className="flex items-center justify-between rounded-md border border-chalk-800 bg-chalk-900 px-3 py-2.5"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-2 text-sm font-medium text-chalk-300">
                    <Lock size={13} className="text-chalk-600" />
                    {mod.label}
                  </span>
                  <span className="truncate text-2xs text-chalk-600">{mod.description}</span>
                </div>
                <ArrowRight size={14} className="shrink-0 text-chalk-700" />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value text-sm">{value}</span>
    </div>
  );
}
