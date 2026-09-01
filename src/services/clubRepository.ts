import { supabase } from '@/lib/supabase';
import type { Club, CreateClubInput, UpdateClubInput } from '@/types/clubs';

/**
 * Database access layer for clubs.
 *
 * The ONLY place that knows about the `clubs` table. UI components call these
 * functions; they never query Supabase directly.
 */

const CLUB_SELECT = `
  id,
  name,
  short_name,
  city,
  state,
  stadium,
  stadium_capacity,
  reputation,
  overall_strength,
  budget,
  payroll,
  youth_level,
  is_test_data,
  created_at,
  updated_at
` as const;

export async function fetchClubs(): Promise<Club[]> {
  const { data, error } = await supabase
    .from('clubs')
    .select(CLUB_SELECT)
    .order('name', { ascending: true });

  if (error) throw error;
  return data as Club[];
}

export async function fetchClubById(id: string): Promise<Club | null> {
  const { data, error } = await supabase
    .from('clubs')
    .select(CLUB_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return (data as Club) ?? null;
}

export async function createClub(input: CreateClubInput): Promise<Club> {
  const { data, error } = await supabase
    .from('clubs')
    .insert({
      name: input.name,
      short_name: input.short_name,
      city: input.city,
      state: input.state,
      stadium: input.stadium,
      stadium_capacity: input.stadium_capacity ?? 0,
      reputation: input.reputation ?? 50,
      overall_strength: input.overall_strength ?? 50,
      budget: input.budget ?? 0,
      payroll: input.payroll ?? 0,
      youth_level: input.youth_level ?? 3,
    })
    .select(CLUB_SELECT)
    .single();

  if (error) throw error;
  return data as Club;
}

export async function updateClub(id: string, input: UpdateClubInput): Promise<Club> {
  const { data, error } = await supabase
    .from('clubs')
    .update(input)
    .eq('id', id)
    .select(CLUB_SELECT)
    .single();

  if (error) throw error;
  return data as Club;
}

export async function deleteClub(id: string): Promise<void> {
  const { error } = await supabase.from('clubs').delete().eq('id', id);
  if (error) throw error;
}
