// Domain type definitions for the football manager game.
// This file defines the core entities for Module 01 (users, careers, settings)
// and reserved placeholders for future modules.

// ---------------------------------------------------------------------------
// Users / profiles
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Careers
// ---------------------------------------------------------------------------

export type CareerStatus = 'active' | 'archived';

export interface Career {
  id: string;
  user_id: string;
  name: string;
  manager_name: string;
  status: CareerStatus;
  last_played_at: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Career settings
// ---------------------------------------------------------------------------

export type Difficulty = 'easy' | 'normal' | 'hard';
export type FixtureDensity = 'light' | 'balanced' | 'intense';
export type TransferWindowFrequency = 'seasonal' | 'monthly' | 'open';

export interface CareerSettings {
  id: string;
  career_id: string;
  starting_balance: number;
  difficulty: Difficulty;
  currency_symbol: string;
  fixture_density: FixtureDensity;
  transfer_window_frequency: TransferWindowFrequency;
  injuries_enabled: boolean;
  youth_academy_enabled: boolean;
  created_at: string;
  updated_at: string;
}

/** A career joined with its settings — the composite used by the UI. */
export interface CareerWithSettings extends Career {
  settings: CareerSettings | null;
}

// ---------------------------------------------------------------------------
// Database row types (raw shapes returned by Supabase)
// ---------------------------------------------------------------------------

export type CareerRow = Career;
export type CareerSettingsRow = CareerSettings;
export type UserRow = User;

// ---------------------------------------------------------------------------
// Input DTOs (shapes accepted by the persistence layer)
// ---------------------------------------------------------------------------

export interface CreateCareerInput {
  name: string;
  manager_name: string;
  settings?: Partial<Omit<CareerSettings, 'id' | 'career_id' | 'created_at' | 'updated_at'>>;
}

export interface UpdateCareerInput {
  name?: string;
  manager_name?: string;
  status?: CareerStatus;
}

export interface UpdateCareerSettingsInput {
  starting_balance?: number;
  difficulty?: Difficulty;
  currency_symbol?: string;
  fixture_density?: FixtureDensity;
  transfer_window_frequency?: TransferWindowFrequency;
  injuries_enabled?: boolean;
  youth_academy_enabled?: boolean;
}

// ---------------------------------------------------------------------------
// Reserved placeholders for future modules.
// These constants keep the navigation architecture stable across modules and
// make it obvious which modules are not yet implemented.
// ---------------------------------------------------------------------------

export type GameModuleId =
  | 'squad'
  | 'clubs'
  | 'competitions'
  | 'calendar'
  | 'matches'
  | 'simulation'
  | 'standings'
  | 'training'
  | 'transfers'
  | 'contracts'
  | 'finances'
  | 'season';

export interface GameModuleDescriptor {
  id: GameModuleId;
  label: string;
  description: string;
  /** Whether this module is implemented in the current build. */
  available: boolean;
}

export const GAME_MODULES: GameModuleDescriptor[] = [
  { id: 'squad', label: 'Elenco', description: 'Gerenciar jogadores do clube', available: false },
  { id: 'clubs', label: 'Clubes', description: 'Visualizar clubes e adversários', available: true },
  { id: 'competitions', label: 'Campeonatos', description: 'Competições e divisões', available: false },
  { id: 'calendar', label: 'Calendário', description: 'Agenda da temporada', available: false },
  { id: 'matches', label: 'Partidas', description: 'Próximos jogos e resultados', available: false },
  { id: 'simulation', label: 'Simulação', description: 'Simular rodadas', available: false },
  { id: 'standings', label: 'Classificação', description: 'Tabela de classificação', available: false },
  { id: 'training', label: 'Treinamento', description: 'Rotina e evolução do elenco', available: false },
  { id: 'transfers', label: 'Transferências', description: 'Mercado de jogadores', available: false },
  { id: 'contracts', label: 'Contratos', description: 'Renovações e salários', available: false },
  { id: 'finances', label: 'Finanças', description: 'Balanço financeiro do clube', available: false },
  { id: 'season', label: 'Temporada', description: 'Resumo e progresso da temporada', available: false },
];
