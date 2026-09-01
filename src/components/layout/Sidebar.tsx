import { Home, Plus, FolderOpen, ChevronLeft, Lock, ShieldCheck } from 'lucide-react';
import { GAME_MODULES, type GameModuleDescriptor } from '@/types';
import { useApp } from '@/state/AppContext';

interface SidebarProps {
  /** Called after a navigation action — used by the mobile drawer to close. */
  onNavigate?: () => void;
}

/**
 * Left navigation sidebar. Shows the primary destinations (home, new career,
 * load career) plus the reserved game modules that will arrive in later
 * builds. Unimplemented modules are shown but locked, keeping the navigation
 * architecture stable across modules.
 */
export function Sidebar({ onNavigate }: SidebarProps) {
  const { screen, activeCareer, navigate, exitCareer } = useApp();
  const onHome = screen.kind === 'home';

  const go = (kind: Parameters<typeof navigate>[0]) => {
    navigate(kind);
    onNavigate?.();
  };

  const handleExit = () => {
    exitCareer();
    onNavigate?.();
  };

  const clubsModule = GAME_MODULES.find((m) => m.id === 'clubs');

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-chalk-800 bg-chalk-900/95">
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-chalk-800">
        <span className="font-display text-sm font-bold uppercase tracking-widest2 text-pitch-400">
          FM
        </span>
        <span className="text-2xs font-semibold uppercase tracking-widest2 text-chalk-600">
          Football Manager
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <NavItem
          icon={<Home size={16} />}
          label="Início"
          active={onHome}
          onClick={() => go({ kind: 'home' })}
        />
        <NavItem
          icon={<Plus size={16} />}
          label="Nova Carreira"
          active={screen.kind === 'new-career'}
          onClick={() => go({ kind: 'new-career' })}
        />
        <NavItem
          icon={<FolderOpen size={16} />}
          label="Carregar Carreira"
          active={screen.kind === 'load-career'}
          onClick={() => go({ kind: 'load-career' })}
        />

        {activeCareer && (
          <>
            <SectionDivider label="Carreira" />
            <NavItem
              icon={<ChevronLeft size={16} className="rotate-180" />}
              label="Painel"
              active={screen.kind === 'dashboard'}
              onClick={() => go({ kind: 'dashboard' })}
            />
          </>
        )}

        <SectionDivider label="Módulos do Jogo" />

        {/* Clubs — available in Module 02A */}
        {clubsModule?.available && (
          <NavItem
            icon={<ShieldCheck size={16} />}
            label="Clubes"
            active={screen.kind === 'clubs' || screen.kind === 'club-detail' || screen.kind === 'player-detail'}
            onClick={() => go({ kind: 'clubs' })}
          />
        )}

        {GAME_MODULES.filter((m) => !m.available).map((mod) => (
          <ModuleNavItem key={mod.id} module={mod} />
        ))}
      </nav>

      {activeCareer && (
        <div className="border-t border-chalk-800 p-3">
          <button className="btn-ghost w-full justify-start text-xs" onClick={handleExit}>
            <ChevronLeft size={14} /> Sair da carreira
          </button>
        </div>
      )}
    </aside>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <p className="mt-4 mb-1 px-3 text-2xs font-semibold uppercase tracking-widest2 text-chalk-600">
      {label}
    </p>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, active, disabled, onClick }: NavItemProps) {
  return (
    <button
      className={`nav-item ${active ? 'nav-item-active' : ''} ${disabled ? 'nav-item-disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function ModuleNavItem({ module }: { module: GameModuleDescriptor }) {
  return (
    <div className="nav-item nav-item-disabled" title={module.description}>
      <span className="shrink-0">
        <Lock size={14} className="text-chalk-600" />
      </span>
      <span className="truncate">{module.label}</span>
    </div>
  );
}
