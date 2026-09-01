import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, Minus, FlaskConical } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { fetchPlayerById } from '@/services/playerRepository';
import {
  positionLabel,
  overallColorClass,
  formatPlayerValue,
  formatPlayerSalary,
  FOOT_LABELS,
  STARTER_STATUS_LABELS,
  SKILL_ATTRIBUTES,
  type PlayerAttributes,
} from '@/domain/clubs';
import { POSITION_LABELS } from '@/types/clubs';
import type { PlayerWithClub } from '@/types/clubs';
import { Panel } from '@/components/ui/Panel';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';

const ATTRIBUTE_LABELS: Record<keyof PlayerAttributes, string> = {
  speed: 'Velocidade',
  finishing: 'Finalização',
  passing: 'Passe',
  dribbling: 'Drible',
  defense: 'Defesa',
  physical: 'Físico',
  goalkeeping: 'Goleiro',
};

/**
 * Player detail page. Shows a player's core data and skill attributes.
 * The attribute bars give a visual sense of the player's profile.
 */
export function PlayerDetailPage({ playerId, clubId }: { playerId: string; clubId: string }) {
  const { navigate } = useApp();
  const [player, setPlayer] = useState<PlayerWithClub | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPlayerById(playerId);
      setPlayer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar o jogador.');
    } finally {
      setLoading(false);
    }
  }, [playerId]);

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
        <button className="btn-ghost mt-4" onClick={() => navigate({ kind: 'club-detail', clubId })}>
          <ArrowLeft size={16} /> Voltar ao clube
        </button>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="p-4 sm:p-6">
        <Alert tone="warning" title="Jogador não encontrado">O jogador solicitado não existe.</Alert>
        <button className="btn-ghost mt-4" onClick={() => navigate({ kind: 'club-detail', clubId })}>
          <ArrowLeft size={16} /> Voltar ao clube
        </button>
      </div>
    );
  }

  const potentialVsOverall = player.potential - player.overall;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 animate-fade-in">
      <button className="btn-ghost mb-3 -ml-2" onClick={() => navigate({ kind: 'club-detail', clubId })}>
        <ArrowLeft size={16} /> Voltar ao elenco
      </button>

      {/* Player header */}
      <div className="mb-5 flex items-start gap-4">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-chalk-900 font-display text-3xl font-bold ring-1 ring-chalk-800 ${overallColorClass(player.overall)}`}>
          {player.overall}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate font-display text-xl sm:text-2xl font-bold uppercase tracking-wide2 text-chalk-50">
              {player.name}
            </h1>
            {player.is_test_data && (
              <span className="badge shrink-0 bg-whistle-950/50 text-whistle-400">
                <FlaskConical size={10} /> Teste
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-chalk-400">
            <span>{player.age} anos</span>
            <span className="text-chalk-600">·</span>
            <span>{positionLabel(player.position)}</span>
            <span className="text-chalk-600">·</span>
            <span>{FOOT_LABELS[player.preferred_foot]}</span>
            {player.club_name && (
              <>
                <span className="text-chalk-600">·</span>
                <span className="truncate text-pitch-400">{player.club_name}</span>
              </>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            <span className="badge bg-chalk-800 text-chalk-300">
              {STARTER_STATUS_LABELS[player.starter_status]}
            </span>
            {potentialVsOverall > 0 && (
              <span className="flex items-center gap-0.5 text-2xs text-pitch-400">
                <TrendingUp size={11} /> Potencial: {player.potential} (+{potentialVsOverall})
              </span>
            )}
            {potentialVsOverall === 0 && (
              <span className="flex items-center gap-0.5 text-2xs text-chalk-500">
                <Minus size={11} /> Potencial: {player.potential}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Key stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KeyStat label="Valor de Mercado" value={formatPlayerValue(player.market_value)} />
        <KeyStat label="Salário" value={formatPlayerSalary(player.salary)} />
        <KeyStat label="Contrato" value={`${player.contract_years} ano(s)`} />
        <KeyStat label="Forma" value={`${player.form}/100`} />
      </div>

      {/* Condition */}
      <Panel title="Condição" className="mb-5">
        <div className="grid grid-cols-3 gap-4">
          <ConditionBar label="Forma" value={player.form} colorClass="bg-pitch-500" />
          <ConditionBar label="Moral" value={player.morale} colorClass="bg-whistle-500" />
          <ConditionBar label="Fadiga" value={player.fatigue} colorClass="bg-danger-500" />
        </div>
      </Panel>

      {/* Skill attributes */}
      <Panel title="Atributos" subtitle="Habilidades técnicas e físicas (1-100)">
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {SKILL_ATTRIBUTES.map((attr) => (
            <AttributeBar
              key={attr}
              label={ATTRIBUTE_LABELS[attr]}
              value={player[attr]}
            />
          ))}
        </div>
      </Panel>

      {/* Position reference */}
      <div className="mt-5">
        <Panel bodyClassName="p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-chalk-400">Posição detalhada</span>
            <span className="font-medium text-chalk-100">
              {POSITION_LABELS[player.position]}
            </span>
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KeyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value text-sm sm:text-base">{value}</span>
    </div>
  );
}

function AttributeBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? 'bg-pitch-500' : value >= 65 ? 'bg-whistle-500' : value >= 50 ? 'bg-chalk-500' : 'bg-danger-500';
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-chalk-300">{label}</span>
        <span className={`font-mono font-semibold ${overallColorClass(value)}`}>{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-chalk-800">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ConditionBar({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-chalk-400">{label}</span>
        <span className="font-mono font-semibold text-chalk-200">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-chalk-800">
        <div className={`h-full rounded-full transition-all ${colorClass}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

