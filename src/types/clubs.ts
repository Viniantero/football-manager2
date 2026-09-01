// Domain type definitions for clubs and players (Module 02A).
// These extend the core types from Module 01.

// ---------------------------------------------------------------------------
// Positions
// ---------------------------------------------------------------------------

export type Position = 'GOL' | 'ZAG' | 'LAT' | 'VOL' | 'MC' | 'MEI' | 'PE' | 'PD' | 'ATA';

export const POSITIONS: Position[] = ['GOL', 'ZAG', 'LAT', 'VOL', 'MC', 'MEI', 'PE', 'PD', 'ATA'];

export const POSITION_LABELS: Record<Position, string> = {
  GOL: 'Goleiro',
  ZAG: 'Zagueiro',
  LAT: 'Lateral',
  VOL: 'Volante',
  MC: 'Meio-Campo',
  MEI: 'Meia-Atacante',
  PE: 'Ponta Esquerda',
  PD: 'Ponta Direita',
  ATA: 'Atacante',
};

export const POSITION_SHORT: Record<Position, string> = {
  GOL: 'GOL',
  ZAG: 'ZAG',
  LAT: 'LAT',
  VOL: 'VOL',
  MC: 'MC',
  MEI: 'MEI',
  PE: 'PE',
  PD: 'PD',
  ATA: 'ATA',
};

// ---------------------------------------------------------------------------
// Preferred foot
// ---------------------------------------------------------------------------

export type PreferredFoot = 'left' | 'right' | 'both';

export const FOOT_LABELS: Record<PreferredFoot, string> = {
  left: 'Canhoto',
  right: 'Destro',
  both: 'Ambidestro',
};

// ---------------------------------------------------------------------------
// Starter status
// ---------------------------------------------------------------------------

export type StarterStatus = 'starter' | 'bench' | 'prospect';

export const STARTER_STATUS_LABELS: Record<StarterStatus, string> = {
  starter: 'Titular',
  bench: 'Banco',
  prospect: 'Promessa',
};

// ---------------------------------------------------------------------------
// Clubs
// ---------------------------------------------------------------------------

export interface Club {
  id: string;
  name: string;
  short_name: string;
  city: string;
  state: string;
  stadium: string;
  stadium_capacity: number;
  reputation: number;
  overall_strength: number;
  budget: number;
  payroll: number;
  youth_level: number;
  is_test_data: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateClubInput {
  name: string;
  short_name: string;
  city: string;
  state: string;
  stadium: string;
  stadium_capacity?: number;
  reputation?: number;
  overall_strength?: number;
  budget?: number;
  payroll?: number;
  youth_level?: number;
}

export interface UpdateClubInput {
  name?: string;
  short_name?: string;
  city?: string;
  state?: string;
  stadium?: string;
  stadium_capacity?: number;
  reputation?: number;
  overall_strength?: number;
  budget?: number;
  payroll?: number;
  youth_level?: number;
}

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

/** Skill attributes constrained to 1..100 integers. */
export interface PlayerAttributes {
  speed: number;
  finishing: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
  goalkeeping: number;
}

export interface Player {
  id: string;
  club_id: string;
  name: string;
  age: number;
  position: Position;
  preferred_foot: PreferredFoot;
  overall: number;
  potential: number;
  speed: number;
  finishing: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
  goalkeeping: number;
  form: number;
  morale: number;
  fatigue: number;
  market_value: number;
  salary: number;
  contract_years: number;
  starter_status: StarterStatus;
  is_test_data: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePlayerInput {
  club_id: string;
  name: string;
  age: number;
  position: Position;
  preferred_foot?: PreferredFoot;
  overall?: number;
  potential?: number;
  speed?: number;
  finishing?: number;
  passing?: number;
  dribbling?: number;
  defense?: number;
  physical?: number;
  goalkeeping?: number;
  form?: number;
  morale?: number;
  fatigue?: number;
  market_value?: number;
  salary?: number;
  contract_years?: number;
  starter_status?: StarterStatus;
}

export interface UpdatePlayerInput {
  name?: string;
  age?: number;
  position?: Position;
  preferred_foot?: PreferredFoot;
  overall?: number;
  potential?: number;
  speed?: number;
  finishing?: number;
  passing?: number;
  dribbling?: number;
  defense?: number;
  physical?: number;
  goalkeeping?: number;
  form?: number;
  morale?: number;
  fatigue?: number;
  market_value?: number;
  salary?: number;
  contract_years?: number;
  starter_status?: StarterStatus;
}

/** A player joined with its club name — used in list views. */
export interface PlayerWithClub extends Player {
  club_name: string | null;
  club_short_name: string | null;
}
