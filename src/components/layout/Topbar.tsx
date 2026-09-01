import { CalendarDays, Menu } from 'lucide-react';
import { useApp } from '@/state/AppContext';

interface TopbarProps {
  onOpenMenu: () => void;
}

/**
 * Top bar of the management shell. Shows the active career name and manager,
 * plus a hamburger menu button on mobile to open the navigation drawer.
 */
export function Topbar({ onOpenMenu }: TopbarProps) {
  const { activeCareer } = useApp();

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-chalk-800 bg-chalk-900/80 px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          className="btn-ghost p-1.5 lg:hidden"
          onClick={onOpenMenu}
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>
        {activeCareer ? (
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="truncate font-display text-sm font-semibold uppercase tracking-wide2 text-chalk-100">
              {activeCareer.name}
            </span>
            <span className="hidden text-xs text-chalk-500 sm:inline">·</span>
            <span className="hidden truncate text-xs text-chalk-400 sm:inline">
              {activeCareer.manager_name}
            </span>
          </div>
        ) : (
          <span className="truncate font-display text-sm font-semibold uppercase tracking-wide2 text-chalk-500">
            Nenhuma carreira ativa
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 text-xs text-chalk-500">
        <CalendarDays size={14} className="text-chalk-600" />
        <span className="hidden sm:inline">Temporada não iniciada</span>
      </div>
    </header>
  );
}
