import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, MapPin, Users, ChevronRight, FlaskConical } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { fetchClubs } from '@/services/clubRepository';
import { formatClubBudget } from '@/domain/clubs';
import type { Club } from '@/types/clubs';
import { Panel } from '@/components/ui/Panel';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Clubs listing page. Shows all clubs in the database, currently the 3 test
 * clubs from Module 02A. Clicking a club opens its detail page.
 */
export function ClubsPage() {
  const { navigate } = useApp();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchClubs();
      setClubs(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os clubes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 animate-fade-in">
      <div className="mb-5 sm:mb-6">
        <h1 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide2 text-chalk-50">
          Clubes
        </h1>
        <p className="mt-1 text-sm text-chalk-400">
          Visualize os clubes e seus elencos.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert tone="error" title="Erro ao carregar clubes">{error}</Alert>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size={22} />
        </div>
      ) : clubs.length === 0 ? (
        <Panel>
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <ShieldCheck size={32} className="text-chalk-700" />
            <p className="text-sm text-chalk-400">Nenhum clube cadastrado.</p>
          </div>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <button
              key={club.id}
              className="panel group flex cursor-pointer flex-col gap-3 p-4 text-left transition-colors hover:border-pitch-700"
              onClick={() => navigate({ kind: 'club-detail', clubId: club.id })}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-pitch-950/60 text-pitch-400 ring-1 ring-pitch-800">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-sm font-semibold uppercase tracking-wide2 text-chalk-100">
                      {club.name}
                    </h3>
                    <p className="flex items-center gap-1 text-2xs text-chalk-500">
                      <MapPin size={11} /> {club.city}, {club.state}
                    </p>
                  </div>
                </div>
                {club.is_test_data && (
                  <span className="badge shrink-0 bg-whistle-950/50 text-whistle-400" title="Dado de teste">
                    <FlaskConical size={10} /> Teste
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <ClubStat label="Força" value={club.overall_strength} />
                <ClubStat label="Reput." value={club.reputation} />
                <ClubStat label="Base" value={club.youth_level} />
              </div>

              <div className="flex items-center justify-between border-t border-chalk-800 pt-3 text-xs text-chalk-500">
                <span className="truncate">{club.stadium}</span>
                <span className="shrink-0 text-chalk-400">{formatClubBudget(club)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-pitch-400">
                <span className="flex items-center gap-1">
                  <Users size={12} /> Ver elenco
                </span>
                <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ClubStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value text-base">{value}</span>
    </div>
  );
}
