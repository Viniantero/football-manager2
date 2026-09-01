import { useState } from 'react';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import {
  defaultCareerFormValues,
  validateCareerForm,
  formValuesToCreateInput,
  DIFFICULTY_OPTIONS,
  FIXTURE_DENSITY_OPTIONS,
  TRANSFER_WINDOW_OPTIONS,
  formatCurrency,
  type CareerFormValues,
  type CareerFormErrors,
} from '@/domain/career';
import { createCareer } from '@/services/careerRepository';
import { Panel } from '@/components/ui/Panel';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Extracts the real error message from a Supabase error, a JS Error, or any
 * thrown value. Supabase PostgrestError is NOT an instanceof Error, so the
 * generic fallback must inspect the shape rather than relying on instanceof.
 */
function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === 'string' && obj.message.length > 0) {
      return obj.message;
    }
    if (typeof obj.error === 'string' && obj.error.length > 0) {
      return obj.error;
    }
  }
  if (typeof err === 'string' && err.length > 0) {
    return err;
  }
  return 'Não foi possível criar a carreira.';
}

export function NewCareerPage() {
  const { navigate, setActiveCareer, setLoading, setError } = useApp();
  const [values, setValues] = useState<CareerFormValues>(defaultCareerFormValues);
  const [errors, setErrors] = useState<CareerFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update<K extends keyof CareerFormValues>(key: K, value: CareerFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const validation = validateCareerForm(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    setLoading(true);
    try {
      const career = await createCareer(formValuesToCreateInput(values));
      setActiveCareer(career);
      navigate({ kind: 'dashboard' });
    } catch (err) {
      const message = extractErrorMessage(err);
      setSubmitError(message);
      setError(message);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 animate-fade-in">
      <button className="btn-ghost mb-3 -ml-2" onClick={() => navigate({ kind: 'home' })}>
        <ArrowLeft size={16} /> Voltar ao início
      </button>

      <div className="mb-5 sm:mb-6">
        <h1 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide2 text-chalk-50">
          Nova Carreira
        </h1>
        <p className="mt-1 text-sm text-chalk-400">
          Configure os dados iniciais do seu save antes de entrar no jogo.
        </p>
      </div>

      {submitError && (
        <div className="mb-4">
          <Alert tone="error" title="Erro ao criar carreira">
            {submitError}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Panel title="Identificação" subtitle="Informações básicas do save">
          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
            <div>
              <label className="label" htmlFor="career-name">Nome da carreira</label>
              <input
                id="career-name"
                className="input"
                placeholder="Ex: Save 2026"
                maxLength={60}
                value={values.name}
                onChange={(e) => update('name', e.target.value)}
                aria-invalid={!!errors.name}
              />
              {errors.name && <FieldError message={errors.name} />}
            </div>
            <div>
              <label className="label" htmlFor="manager-name">Nome do treinador</label>
              <input
                id="manager-name"
                className="input"
                placeholder="Ex: Carlos Silva"
                maxLength={60}
                value={values.manager_name}
                onChange={(e) => update('manager_name', e.target.value)}
                aria-invalid={!!errors.manager_name}
              />
              {errors.manager_name && <FieldError message={errors.manager_name} />}
            </div>
          </div>
        </Panel>

        <Panel title="Configuração" subtitle="Regras e parâmetros da carreira">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Dificuldade</label>
              <div className="grid grid-cols-1 gap-2 xs:grid-cols-3">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    hint={opt.hint}
                    selected={values.difficulty === opt.value}
                    onClick={() => update('difficulty', opt.value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="label">Densidade do calendário</label>
              <div className="grid grid-cols-1 gap-2 xs:grid-cols-3">
                {FIXTURE_DENSITY_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    hint={opt.hint}
                    selected={values.fixture_density === opt.value}
                    onClick={() => update('fixture_density', opt.value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="label">Janela de transferências</label>
              <div className="grid grid-cols-1 gap-2 xs:grid-cols-3">
                {TRANSFER_WINDOW_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    hint={opt.hint}
                    selected={values.transfer_window_frequency === opt.value}
                    onClick={() => update('transfer_window_frequency', opt.value)}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
              <div>
                <label className="label" htmlFor="balance">Verba inicial</label>
                <input
                  id="balance"
                  type="number"
                  className="input font-mono"
                  min={0}
                  step={100000}
                  value={values.starting_balance}
                  onChange={(e) => update('starting_balance', Number(e.target.value))}
                  aria-invalid={!!errors.starting_balance}
                />
                {errors.starting_balance ? (
                  <FieldError message={errors.starting_balance} />
                ) : (
                  <p className="mt-1 text-2xs text-chalk-500">
                    {formatCurrency(values.starting_balance, values.currency_symbol)}
                  </p>
                )}
              </div>
              <div>
                <label className="label" htmlFor="currency">Símbolo monetário</label>
                <input
                  id="currency"
                  className="input"
                  maxLength={5}
                  value={values.currency_symbol}
                  onChange={(e) => update('currency_symbol', e.target.value)}
                  aria-invalid={!!errors.currency_symbol}
                />
                {errors.currency_symbol && <FieldError message={errors.currency_symbol} />}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ToggleRow
              label="Lesões ativadas"
              description="Jogadores podem se machucar durante a temporada"
              checked={values.injuries_enabled}
              onChange={(v) => update('injuries_enabled', v)}
            />
            <ToggleRow
              label="Categorias de base"
              description="Permite promover jovens da academia"
              checked={values.youth_academy_enabled}
              onChange={(v) => update('youth_academy_enabled', v)}
            />
          </div>
        </Panel>

        <div className="flex flex-col-reverse gap-3 xs:flex-row xs:items-center xs:justify-end xs:gap-3">
          <button type="button" className="btn-secondary h-11 xs:h-auto" onClick={() => navigate({ kind: 'home' })} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary h-11 xs:h-auto" disabled={submitting}>
            {submitting ? <Spinner size={16} /> : <Save size={16} />}
            {submitting ? 'Criando…' : 'Criar carreira'}
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-1 flex items-center gap-1 text-2xs text-danger-400">
      <AlertCircle size={12} /> {message}
    </p>
  );
}

interface OptionCardProps {
  label: string;
  hint: string;
  selected: boolean;
  onClick: () => void;
}

function OptionCard({ label, hint, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-0.5 rounded-md border px-3 py-2 text-left transition-colors ${
        selected
          ? 'border-pitch-500 bg-pitch-950/40 text-chalk-100'
          : 'border-chalk-700 bg-chalk-900 text-chalk-400 hover:border-chalk-600 hover:text-chalk-200'
      }`}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-2xs text-chalk-500">{hint}</span>
    </button>
  );
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-md border border-chalk-800 bg-chalk-900 px-3 py-2.5 text-left transition-colors hover:border-chalk-700"
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium text-chalk-100">{label}</span>
        <span className="text-2xs text-chalk-500">{description}</span>
      </div>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-pitch-600' : 'bg-chalk-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}
