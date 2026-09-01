import type {
  Position,
  PlayerAttributes,
  PreferredFoot,
  StarterStatus,
  Club,
  Player,
  CreateClubInput,
  CreatePlayerInput,
  UpdateClubInput,
  UpdatePlayerInput,
} from '@/types/clubs';
import { POSITIONS, POSITION_LABELS } from '@/types/clubs';
import { formatCurrency } from './career';

/**
 * Domain logic for clubs and players.
 *
 * Pure functions only — no Supabase, no React. These encode the rules:
 * attribute ranges, position grouping, and the overall calculation (placeholder).
 */

// ---------------------------------------------------------------------------
// Constants & ranges
// ---------------------------------------------------------------------------

export const SKILL_MIN = 1;
export const SKILL_MAX = 100;
export const CONDITION_MIN = 0;
export const CONDITION_MAX = 100;
export const AGE_MIN = 15;
export const AGE_MAX = 45;
export const REPUTATION_MIN = 1;
export const REPUTATION_MAX = 100;
export const YOUTH_LEVEL_MIN = 1;
export const YOUTH_LEVEL_MAX = 5;
export const CONTRACT_YEARS_MIN = 0;
export const CONTRACT_YEARS_MAX = 10;

export const SKILL_ATTRIBUTES: (keyof PlayerAttributes)[] = [
  'speed',
  'finishing',
  'passing',
  'dribbling',
  'defense',
  'physical',
  'goalkeeping',
];

// ---------------------------------------------------------------------------
// Position groups
// ---------------------------------------------------------------------------

export type PositionGroup = 'GK' | 'DEF' | 'MID' | 'FWD';

export const POSITION_GROUP: Record<Position, PositionGroup> = {
  GOL: 'GK',
  ZAG: 'DEF',
  LAT: 'DEF',
  VOL: 'MID',
  MC: 'MID',
  MEI: 'MID',
  PE: 'FWD',
  PD: 'FWD',
  ATA: 'FWD',
};

export const POSITION_GROUP_LABELS: Record<PositionGroup, string> = {
  GK: 'Goleiros',
  DEF: 'Defensores',
  MID: 'Meio-Campo',
  FWD: 'Atacantes',
};

export function positionsByGroup(group: PositionGroup): Position[] {
  return POSITIONS.filter((p) => POSITION_GROUP[p] === group);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function isSkillValid(value: number): boolean {
  return Number.isInteger(value) && value >= SKILL_MIN && value <= SKILL_MAX;
}

export function isConditionValid(value: number): boolean {
  return Number.isInteger(value) && value >= CONDITION_MIN && value <= CONDITION_MAX;
}

export function isAgeValid(value: number): boolean {
  return Number.isInteger(value) && value >= AGE_MIN && value <= AGE_MAX;
}

export function isReputationValid(value: number): boolean {
  return Number.isInteger(value) && value >= REPUTATION_MIN && value <= REPUTATION_MAX;
}

export function isYouthLevelValid(value: number): boolean {
  return Number.isInteger(value) && value >= YOUTH_LEVEL_MIN && value <= YOUTH_LEVEL_MAX;
}

export function isContractYearsValid(value: number): boolean {
  return Number.isInteger(value) && value >= CONTRACT_YEARS_MIN && value <= CONTRACT_YEARS_MAX;
}

export function clampSkill(value: number): number {
  return Math.max(SKILL_MIN, Math.min(SKILL_MAX, Math.round(value)));
}

export function clampCondition(value: number): number {
  return Math.max(CONDITION_MIN, Math.min(CONDITION_MAX, Math.round(value)));
}

export interface PlayerValidationErrors {
  name?: string;
  age?: string;
  position?: string;
  preferred_foot?: string;
  overall?: string;
  potential?: string;
  speed?: string;
  finishing?: string;
  passing?: string;
  dribbling?: string;
  defense?: string;
  physical?: string;
  goalkeeping?: string;
  form?: string;
  morale?: string;
  fatigue?: string;
  contract_years?: string;
  starter_status?: string;
}

/**
 * Validates all skill attributes (1..100 integers).
 * Returns a map of field → error message for invalid fields.
 */
export function validatePlayerAttributes(attrs: PlayerAttributes): Partial<Record<keyof PlayerAttributes, string>> {
  const errors: Partial<Record<keyof PlayerAttributes, string>> = {};
  for (const key of SKILL_ATTRIBUTES) {
    if (!isSkillValid(attrs[key])) {
      errors[key] = `${key} deve ser um inteiro entre ${SKILL_MIN} e ${SKILL_MAX}.`;
    }
  }
  return errors;
}

export function validatePlayer(player: Player): PlayerValidationErrors {
  const errors: PlayerValidationErrors = {};

  if (!player.name.trim()) errors.name = 'Nome é obrigatório.';
  if (!isAgeValid(player.age)) errors.age = `Idade deve ser entre ${AGE_MIN} e ${AGE_MAX}.`;
  if (!POSITIONS.includes(player.position)) errors.position = 'Posição inválida.';
  if (!['left', 'right', 'both'].includes(player.preferred_foot)) errors.preferred_foot = 'Pé preferido inválido.';
  if (!isSkillValid(player.overall)) errors.overall = `Overall deve ser entre ${SKILL_MIN} e ${SKILL_MAX}.`;
  if (!isSkillValid(player.potential)) errors.potential = `Potencial deve ser entre ${SKILL_MIN} e ${SKILL_MAX}.`;

  const attrErrors = validatePlayerAttributes(player);
  Object.assign(errors, attrErrors);

  if (!isConditionValid(player.form)) errors.form = `Forma deve ser entre ${CONDITION_MIN} e ${CONDITION_MAX}.`;
  if (!isConditionValid(player.morale)) errors.morale = `Moral deve ser entre ${CONDITION_MIN} e ${CONDITION_MAX}.`;
  if (!isConditionValid(player.fatigue)) errors.fatigue = `Fadiga deve ser entre ${CONDITION_MIN} e ${CONDITION_MAX}.`;
  if (!isContractYearsValid(player.contract_years))
    errors.contract_years = `Anos de contrato devem ser entre ${CONTRACT_YEARS_MIN} e ${CONTRACT_YEARS_MAX}.`;
  if (!['starter', 'bench', 'prospect'].includes(player.starter_status))
    errors.starter_status = 'Status de titularidade inválido.';

  return errors;
}

// ---------------------------------------------------------------------------
// Overall calculation (PLACEHOLDER — not the definitive algorithm)
// ---------------------------------------------------------------------------

/**
 * Calculates the overall rating for a player based on their position and
 * relevant attributes.
 *
 * NOTE: This is a PLACEHOLDER. The definitive algorithm will be implemented
 * in a later module. For now it uses a simple weighted average of the
 * attributes most relevant to each position group.
 */
export function calculateOverall(position: Position, attrs: PlayerAttributes): number {
  const group = POSITION_GROUP[position];

  let weights: Partial<Record<keyof PlayerAttributes, number>>;

  switch (group) {
    case 'GK':
      weights = { goalkeeping: 0.6, physical: 0.15, defense: 0.1, speed: 0.05, passing: 0.1 };
      break;
    case 'DEF':
      weights = { defense: 0.35, physical: 0.25, speed: 0.15, passing: 0.1, finishing: 0.05, dribbling: 0.1 };
      break;
    case 'MID':
      weights = { passing: 0.3, dribbling: 0.2, physical: 0.15, defense: 0.15, speed: 0.1, finishing: 0.1 };
      break;
    case 'FWD':
      weights = { finishing: 0.35, dribbling: 0.25, speed: 0.2, physical: 0.1, passing: 0.1 };
      break;
    default:
      weights = { speed: 0.2, finishing: 0.2, passing: 0.2, dribbling: 0.2, defense: 0.2 };
  }

  let sum = 0;
  let weightTotal = 0;
  for (const key of SKILL_ATTRIBUTES) {
    const w = weights[key] ?? 0;
    sum += attrs[key] * w;
    weightTotal += w;
  }

  return clampSkill(weightTotal > 0 ? Math.round(sum / weightTotal) : 50);
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function formatClubBudget(club: Pick<Club, 'budget'>): string {
  return formatCurrency(club.budget);
}

export function formatPlayerValue(value: number): string {
  return formatCurrency(value);
}

export function formatPlayerSalary(salary: number): string {
  return `${formatCurrency(salary)}/mês`;
}

export function overallColorClass(overall: number): string {
  if (overall >= 85) return 'text-pitch-400';
  if (overall >= 75) return 'text-whistle-400';
  if (overall >= 65) return 'text-chalk-200';
  if (overall >= 55) return 'text-chalk-400';
  return 'text-danger-400';
}

export function positionLabel(pos: Position): string {
  return POSITION_LABELS[pos] ?? pos;
}

// Re-export labels for convenience in UI
export {
  POSITIONS,
  POSITION_LABELS,
  POSITION_SHORT,
  FOOT_LABELS,
  STARTER_STATUS_LABELS,
} from '@/types/clubs';
export type { Position, PreferredFoot, StarterStatus, Club, Player, PlayerAttributes } from '@/types/clubs';

export { formatCurrency } from './career';
