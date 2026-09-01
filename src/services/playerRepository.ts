import { supabase } from '@/lib/supabase';
import type {
  Player,
  PlayerWithClub,
  Position,
  CreatePlayerInput,
  UpdatePlayerInput,
} from '@/types/clubs';

/**
 * Database access layer for players.
 *
 * The ONLY place that knows about the `players` table. UI components call these
 * functions; they never query Supabase directly.
 */

const PLAYER_SELECT = `
  id,
  club_id,
  name,
  age,
  position,
  preferred_foot,
  overall,
  potential,
  speed,
  finishing,
  passing,
  dribbling,
  defense,
  physical,
  goalkeeping,
  form,
  morale,
  fatigue,
  market_value,
  salary,
  contract_years,
  starter_status,
  is_test_data,
  created_at,
  updated_at
` as const;

const PLAYER_WITH_CLUB_SELECT = `
  ${PLAYER_SELECT},
  club:clubs!inner(name, short_name)
` as const;

type RawClubJoin = { name: string; short_name: string } | { name: string; short_name: string }[] | null;

function normalizeClubJoin(club: RawClubJoin): { name: string; short_name: string } | null {
  if (Array.isArray(club)) return club[0] ?? null;
  return club ?? null;
}

function toPlayerWithClub(row: Player & { club: RawClubJoin }): PlayerWithClub {
  const clubInfo = normalizeClubJoin(row.club);
  const { club, ...player } = row;
  return {
    ...player,
    club_name: clubInfo?.name ?? null,
    club_short_name: clubInfo?.short_name ?? null,
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function fetchPlayersByClub(clubId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select(PLAYER_SELECT)
    .eq('club_id', clubId)
    .order('overall', { ascending: false })
    .order('name', { ascending: true });

  if (error) throw error;
  return data as Player[];
}

export async function fetchPlayerById(id: string): Promise<PlayerWithClub | null> {
  const { data, error } = await supabase
    .from('players')
    .select(PLAYER_WITH_CLUB_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return toPlayerWithClub(data as Player & { club: RawClubJoin });
}

export async function fetchPlayersByPosition(position: Position): Promise<PlayerWithClub[]> {
  const { data, error } = await supabase
    .from('players')
    .select(PLAYER_WITH_CLUB_SELECT)
    .eq('position', position)
    .order('overall', { ascending: false });

  if (error) throw error;
  return (data as (Player & { club: RawClubJoin })[]).map(toPlayerWithClub);
}

export async function fetchPlayersByOverallRange(min: number, max: number): Promise<PlayerWithClub[]> {
  const { data, error } = await supabase
    .from('players')
    .select(PLAYER_WITH_CLUB_SELECT)
    .gte('overall', min)
    .lte('overall', max)
    .order('overall', { ascending: false });

  if (error) throw error;
  return (data as (Player & { club: RawClubJoin })[]).map(toPlayerWithClub);
}

export async function fetchAllPlayers(): Promise<PlayerWithClub[]> {
  const { data, error } = await supabase
    .from('players')
    .select(PLAYER_WITH_CLUB_SELECT)
    .order('overall', { ascending: false })
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as (Player & { club: RawClubJoin })[]).map(toPlayerWithClub);
}

export async function createPlayer(input: CreatePlayerInput): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .insert({
      club_id: input.club_id,
      name: input.name,
      age: input.age,
      position: input.position,
      preferred_foot: input.preferred_foot ?? 'right',
      overall: input.overall ?? 50,
      potential: input.potential ?? 50,
      speed: input.speed ?? 50,
      finishing: input.finishing ?? 50,
      passing: input.passing ?? 50,
      dribbling: input.dribbling ?? 50,
      defense: input.defense ?? 50,
      physical: input.physical ?? 50,
      goalkeeping: input.goalkeeping ?? 50,
      form: input.form ?? 70,
      morale: input.morale ?? 70,
      fatigue: input.fatigue ?? 0,
      market_value: input.market_value ?? 0,
      salary: input.salary ?? 0,
      contract_years: input.contract_years ?? 1,
      starter_status: input.starter_status ?? 'bench',
    })
    .select(PLAYER_SELECT)
    .single();

  if (error) throw error;
  return data as Player;
}

export async function updatePlayer(id: string, input: UpdatePlayerInput): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .update(input)
    .eq('id', id)
    .select(PLAYER_SELECT)
    .single();

  if (error) throw error;
  return data as Player;
}

export async function deletePlayer(id: string): Promise<void> {
  const { error } = await supabase.from('players').delete().eq('id', id);
  if (error) throw error;
}
