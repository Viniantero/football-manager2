import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ShieldCheck, MapPin, Building2 as StadiumIcon, FlaskConical } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { fetchClubById } from '@/services/clubRepository';
import { fetchPlayersByClub } from '@/services/playerRepository';
import {
  formatClubBudget,
  formatCurrency,
  overallColorClass,
  positionLabel,
  POSITION_GROUP,
  POSITION_GROUP_LABELS,
  type PositionGroup,
} from '@/domain/clubs';
import type { Club, Player } from '@/types/clubs';
import { Panel } from '@/components/ui/Panel';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Club detail page. Shows the club's information and its squad grouped by
 * position. Clicking a player opens the player detail page.
 */
export function ClubDetailPage({ clubId }: { clubId: string }) {
  const { navigate } = useApp();
  const [club, setClub] = useState<Club | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [clubData, playerData] = await Promise.all([
        fetchClubById(clubId),
        fetchPlayersByClub(clubId),
      ]);
      setClub(clubData);
      setPlayers(playerData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar o clube.');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Spinner size={22} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <Alert tone="error" title="Erro">{error}</Alert>
        <button className="btn-ghost mt-4" onClick={() => navigate({ kind: 'clubs' })}>
          <ArrowLeft size={16} /> Voltar aos clubes
        </button>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="p-4 sm:p-6">
        <Alert tone="warning" title="Clube não encontrado">O clube solicitado não existe.</Alert>
        <button className="btn-ghost mt-4" onClick={() => navigate({ kind: 'clubs' })}>
          <ArrowLeft size={16} /> Voltar aos clubes
        </button>
      </div>
    );
  }

  const grouped = groupPlayersByPosition(players);

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 animate-fade-in">
      <button className="btn-ghost mb-3 -ml-2" onClick={() => navigate({ kind: 'clubs' })}>
        <ArrowLeft size={16} /> Voltar aos clubes
      </button>

      {/* Club header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-pitch-950/60 text-pitch-400 ring-1 ring-pitch-800">
            <ShieldCheck size={24} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-display text-xl sm:text-2xl font-bold uppercase tracking-wide2 text-chalk-50">
                {club.name}
              </h1>
              {club.is_test_data && (
                <span className="badge shrink-0 bg-whistle-950/50 text-whistle-400">
                  <FlaskConical size={10} /> Teste
                </span>
              )}
            </div>
            <p className="flex items-center gap-1 text-sm text-chalk-400">
              <MapPin size={12} /> {club.city}, {club.state}
            </p>
          </div>
        </div>
      </div>

      {/* Club info */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <InfoStat label="Força Geral" value={club.overall_strength} />
        <InfoStat label="Reputação" value={club.reputation} />
        <InfoStat label="Nível da Base" value={club.youth_level} />
        <InfoStat label="Capacidade" value={club.stadium_capacity.toLocaleString('pt-BR')} />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Panel bodyClassName="p-3">
          <div className="flex items-center gap-2 text-xs text-chalk-400">
            <StadiumIcon size={14} className="text-chalk-600" /> Estádio
          </div>
          <p className="mt-1 text-sm font-medium text-chalk-100">{club.stadium}</p>
        </Panel>
        <Panel bodyClassName="p-3">
          <div className="text-xs text-chalk-400">Orçamento</div>
          <p className="mt-1 text-sm font-medium text-chalk-100">{formatClubBudget(club)}</p>
        </Panel>
        <Panel bodyClassName="p-3">
          <div className="text-xs text-chalk-400">Folha Salarial</div>
          <p className="mt-1 text-sm font-medium text-chalk-100">{formatCurrency(club.payroll)}/mês</p>
        </Panel>
      </div>

      {/* Squad */}
      <Panel
        title="Elenco"
        subtitle={`${players.length} jogador(es)`}
        bodyClassName="p-2"
      >
        {players.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-chalk-400">
            Nenhum jogador neste clube.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {POSITION_GROUPS_ORDER.map((group) => {
              const groupPlayers = grouped[group];
              if (!groupPlayers || groupPlayers.length === 0) return null;
              return (
                <div key={group}>
                  <p className="mb-1.5 px-1 text-2xs font-semibold uppercase tracking-widest2 text-chalk-600">
                    {POSITION_GROUP_LABELS[group]} ({groupPlayers.length})
                  </p>
                  <ul className="flex flex-col gap-1">
                    {groupPlayers.map((player) => (
                      <li key={player.id}>
                        <button
                          className="flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-left transition-colors hover:border-chalk-800 hover:bg-chalk-800/40"
                          onClick={() => navigate({ kind: 'player-detail', playerId: player.id, clubId: club.id })}
                        >
                          <span className={`w-9 shrink-0 text-center font-display text-lg font-bold ${overallColorClass(player.overall)}`}>
                            {player.overall}
                          </span>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-medium text-chalk-100">{player.name}</span>
                            <span className="truncate text-2xs text-chalk-500">
                              {player.age} anos · {positionLabel(player.position)}
                            </span>
                          </div>
                          <span className="hidden shrink-0 text-2xs text-chalk-500 sm:block">
                            {formatCurrency(player.market_value)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const POSITION_GROUPS_ORDER: PositionGroup[] = ['GK', 'DEF', 'MID', 'FWD'];

function groupPlayersByPosition(players: Player[]): Record<PositionGroup, Player[]> {
  const groups: Record<PositionGroup, Player[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const player of players) {
    const group = POSITION_GROUP[player.position as keyof typeof POSITION_GROUP] ?? 'MID';
    if (groups[group]) groups[group].push(player);
  }
  // Sort each group by overall descending
  (Object.keys(groups) as PositionGroup[]).forEach((g) => {
    groups[g].sort((a, b) => b.overall - a.overall);
  });
  return groups;
}

function InfoStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value text-base sm:text-lg">{value}</span>
    </div>
  );
}

