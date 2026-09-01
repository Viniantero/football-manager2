import { supabase } from '@/lib/supabase';
import type {
  Career,
  CareerWithSettings,
  CreateCareerInput,
  UpdateCareerInput,
  UpdateCareerSettingsInput,
  CareerSettings,
} from '@/types';

/**
 * Database access layer for careers.
 *
 * This module is the ONLY place that knows about the `careers` and
 * `career_settings` tables. Components and pages never call supabase
 * directly — they go through these repository functions so that query
 * details stay in one place and can evolve independently of the UI.
 */

const CAREER_SELECT = `
  id,
  user_id,
  name,
  manager_name,
  status,
  last_played_at,
  created_at,
  updated_at,
  settings:career_settings(
    id,
    career_id,
    starting_balance,
    difficulty,
    currency_symbol,
    fixture_density,
    transfer_window_frequency,
    injuries_enabled,
    youth_academy_enabled,
    created_at,
    updated_at
  )
` as const;

// Supabase returns a 1:1 nested join as a single-element array, so accept
// both shapes and normalize to a single settings object.
type RawSettingsRow = CareerSettings | CareerSettings[] | null;
type CareerSelectRow = Omit<Career, never> & {
  settings: RawSettingsRow;
};

function toCareerWithSettings(row: CareerSelectRow): CareerWithSettings {
  const { settings, ...career } = row;
  const settingsObj = Array.isArray(settings) ? settings[0] ?? null : settings ?? null;
  return { ...career, settings: settingsObj };
}

export async function fetchCareers(): Promise<CareerWithSettings[]> {
  const { data, error } = await supabase
    .from('careers')
    .select(CAREER_SELECT)
    .order('last_played_at', { ascending: false });

  if (error) throw error;
  return (data as CareerSelectRow[]).map(toCareerWithSettings);
}

export async function fetchCareerById(id: string): Promise<CareerWithSettings | null> {
  const { data, error } = await supabase
    .from('careers')
    .select(CAREER_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return toCareerWithSettings(data as CareerSelectRow);
}

export async function createCareer(input: CreateCareerInput): Promise<CareerWithSettings> {
  // Insert the career row; user_id is defaulted server-side via auth.uid().
  const { data: careerRow, error: careerError } = await supabase
    .from('careers')
    .insert({
      name: input.name,
      manager_name: input.manager_name,
      status: 'active',
    })
    .select('id, name, manager_name, status, user_id, last_played_at, created_at, updated_at')
    .single();

  if (careerError) throw careerError;

  const career = careerRow as Career;

  // Insert the associated settings row (1:1).
  const { data: settingsRow, error: settingsError } = await supabase
    .from('career_settings')
    .insert({
      career_id: career.id,
      starting_balance: input.settings?.starting_balance ?? 5_000_000,
      difficulty: input.settings?.difficulty ?? 'normal',
      currency_symbol: input.settings?.currency_symbol ?? 'R$',
      fixture_density: input.settings?.fixture_density ?? 'balanced',
      transfer_window_frequency: input.settings?.transfer_window_frequency ?? 'seasonal',
      injuries_enabled: input.settings?.injuries_enabled ?? true,
      youth_academy_enabled: input.settings?.youth_academy_enabled ?? true,
    })
    .select('*')
    .single();

  if (settingsError) throw settingsError;

  return { ...career, settings: settingsRow as CareerSettings };
}

export async function updateCareer(
  id: string,
  input: UpdateCareerInput
): Promise<Career> {
  const { data, error } = await supabase
    .from('careers')
    .update(input)
    .eq('id', id)
    .select('id, name, manager_name, status, user_id, last_played_at, created_at, updated_at')
    .single();

  if (error) throw error;
  return data as Career;
}

export async function touchCareer(id: string): Promise<void> {
  const { error } = await supabase
    .from('careers')
    .update({ last_played_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function updateCareerSettings(
  careerId: string,
  input: UpdateCareerSettingsInput
): Promise<CareerSettings> {
  const { data, error } = await supabase
    .from('career_settings')
    .update(input)
    .eq('career_id', careerId)
    .select('*')
    .single();

  if (error) throw error;
  return data as CareerSettings;
}

export async function deleteCareer(id: string): Promise<void> {
  const { error } = await supabase.from('careers').delete().eq('id', id);
  if (error) throw error;
}
