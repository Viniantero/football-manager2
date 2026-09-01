import type {
  CreateCareerInput,
  Difficulty,
  FixtureDensity,
  TransferWindowFrequency,
} from '@/types';

/**
 * Domain logic for careers.
 *
 * Pure functions only — no Supabase, no React. These encode the rules and
 * defaults of the game so that UI components stay free of business logic.
 */

export const DEFAULT_STARTING_BALANCE = 5_000_000;
export const DEFAULT_CURRENCY_SYMBOL = 'R$';
export const DEFAULT_DIFFICULTY: Difficulty = 'normal';
export const DEFAULT_FIXTURE_DENSITY: FixtureDensity = 'balanced';
export const DEFAULT_TRANSFER_WINDOW: TransferWindowFrequency = 'seasonal';

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; hint: string }[] = [
  { value: 'easy', label: 'Fácil', hint: 'Verba maior, menos lesões' },
  { value: 'normal', label: 'Normal', hint: 'Experiência equilibrada' },
  { value: 'hard', label: 'Difícil', hint: 'Verba menor, mais lesões' },
];

export const FIXTURE_DENSITY_OPTIONS: { value: FixtureDensity; label: string; hint: string }[] = [
  { value: 'light', label: 'Leve', hint: 'Menos jogos por mês' },
  { value: 'balanced', label: 'Equilibrado', hint: 'Calendário padrão' },
  { value: 'intense', label: 'Intenso', hint: 'Calendário cheio' },
];

export const TRANSFER_WINDOW_OPTIONS: {
  value: TransferWindowFrequency;
  label: string;
  hint: string;
}[] = [
  { value: 'seasonal', label: 'Sazonal', hint: 'Janelas de verão e inverno' },
  { value: 'monthly', label: 'Mensal', hint: 'Janela aberta todo mês' },
  { value: 'open', label: 'Aberto', hint: 'Mercado sempre disponível' },
];

export interface CareerFormValues {
  name: string;
  manager_name: string;
  difficulty: Difficulty;
  starting_balance: number;
  currency_symbol: string;
  fixture_density: FixtureDensity;
  transfer_window_frequency: TransferWindowFrequency;
  injuries_enabled: boolean;
  youth_academy_enabled: boolean;
}

export function defaultCareerFormValues(): CareerFormValues {
  return {
    name: '',
    manager_name: '',
    difficulty: DEFAULT_DIFFICULTY,
    starting_balance: DEFAULT_STARTING_BALANCE,
    currency_symbol: DEFAULT_CURRENCY_SYMBOL,
    fixture_density: DEFAULT_FIXTURE_DENSITY,
    transfer_window_frequency: DEFAULT_TRANSFER_WINDOW,
    injuries_enabled: true,
    youth_academy_enabled: true,
  };
}

export interface CareerFormErrors {
  name?: string;
  manager_name?: string;
  starting_balance?: string;
  currency_symbol?: string;
}

export function validateCareerForm(values: CareerFormValues): CareerFormErrors {
  const errors: CareerFormErrors = {};

  const name = values.name.trim();
  if (name.length === 0) {
    errors.name = 'Informe um nome para a carreira.';
  } else if (name.length > 60) {
    errors.name = 'O nome deve ter no máximo 60 caracteres.';
  }

  const manager = values.manager_name.trim();
  if (manager.length === 0) {
    errors.manager_name = 'Informe o nome do treinador.';
  } else if (manager.length > 60) {
    errors.manager_name = 'O nome do treinador deve ter no máximo 60 caracteres.';
  }

  if (
    !Number.isFinite(values.starting_balance) ||
    values.starting_balance < 0 ||
    values.starting_balance > 1_000_000_000
  ) {
    errors.starting_balance = 'Informe um valor entre 0 e 1.000.000.000.';
  }

  const symbol = values.currency_symbol.trim();
  if (symbol.length === 0) {
    errors.currency_symbol = 'Informe um símbolo monetário.';
  } else if (symbol.length > 5) {
    errors.currency_symbol = 'O símbolo deve ter no máximo 5 caracteres.';
  }

  return errors;
}

export function formValuesToCreateInput(
  values: CareerFormValues
): CreateCareerInput {
  return {
    name: values.name.trim(),
    manager_name: values.manager_name.trim(),
    settings: {
      starting_balance: Math.round(values.starting_balance),
      difficulty: values.difficulty,
      currency_symbol: values.currency_symbol.trim(),
      fixture_density: values.fixture_density,
      transfer_window_frequency: values.transfer_window_frequency,
      injuries_enabled: values.injuries_enabled,
      youth_academy_enabled: values.youth_academy_enabled,
    },
  };
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function formatCurrency(amount: number, symbol = DEFAULT_CURRENCY_SYMBOL): string {
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${symbol} ${formatted}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'agora mesmo';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days}d`;
  return formatDate(iso);
}
