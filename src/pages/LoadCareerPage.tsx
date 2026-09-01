import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Play, Trash2, FolderOpen, Inbox } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { fetchCareers, deleteCareer, touchCareer } from '@/services/careerRepository';
import { formatRelative, formatCurrency } from '@/domain/career';
import type { CareerWithSettings } from '@/types';
import { Panel } from '@/components/ui/Panel';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';

export function LoadCareerPage() {
  const { navigate, setActiveCareer, setLoading } = useApp();
  const [careers, setCareers] = useState<CareerWithSettings[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadingList(true);
    setLoadError(null);
    try {
      const list = await fetchCareers();
      setCareers(list);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Não foi possível carregar as carreiras.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleLoad(career: CareerWithSettings) {
    setLoading(true);
    try {
      await touchCareer(career.id);
      setActiveCareer(career);
      navigate({ kind: 'dashboard' });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Não foi possível abrir a carreira.');
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deletingId) return;
    setDeleteError(null);
    try {
      await deleteCareer(deletingId);
      setCareers((prev) => prev.filter((c) => c.id !== deletingId));
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Não foi possível excluir a carreira.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 animate-fade-in">
      <button className="btn-ghost mb-3 -ml-2" onClick={() => navigate({ kind: 'home' })}>
        <ArrowLeft size={16} /> Voltar ao início
      </button>

      <div className="mb-5 sm:mb-6">
        <h1 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide2 text-chalk-50">
          Carregar Carreira
        </h1>
        <p className="mt-1 text-sm text-chalk-400">
          Selecione um save para continuar ou exclua um save antigo.
        </p>
      </div>

      {loadError && (
        <div className="mb-4">
          <Alert tone="error" title="Erro ao carregar">{loadError}</Alert>
        </div>
      )}

      {loadingList ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size={22} />
        </div>
      ) : careers.length === 0 ? (
        <Panel>
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <Inbox size={32} className="text-chalk-700" />
            <p className="text-sm text-chalk-400">Nenhuma carreira salva ainda.</p>
            <button className="btn-primary" onClick={() => navigate({ kind: 'new-career' })}>
              <FolderOpen size={16} /> Criar primeira carreira
            </button>
          </div>
        </Panel>
      ) : (
        <Panel title="Saves disponíveis" subtitle={`${careers.length} carreira(s)`} bodyClassName="p-2">
          <ul className="flex flex-col gap-1">
            {careers.map((career) => (
              <li
                key={career.id}
                className="flex flex-col gap-3 rounded-md border border-transparent px-3 py-3 transition-colors hover:border-chalk-800 hover:bg-chalk-800/40 xs:flex-row xs:items-center xs:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-display text-sm font-semibold text-chalk-100">
                    {career.name}
                  </span>
                  <span className="truncate text-xs text-chalk-400">
                    Treinador: {career.manager_name}
                  </span>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-chalk-500">
                    <span>Último acesso: {formatRelative(career.last_played_at)}</span>
                    {career.settings && (
                      <span>Verba: {formatCurrency(career.settings.starting_balance, career.settings.currency_symbol)}</span>
                    )}
                    <span className="badge bg-chalk-800 text-chalk-400">{career.status}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 self-end xs:self-auto">
                  <button className="btn-primary h-9 px-3 text-xs" onClick={() => handleLoad(career)}>
                    <Play size={14} /> Abrir
                  </button>
                  <button
                    className="btn-ghost h-9 px-2 text-danger-400 hover:text-danger-500"
                    onClick={() => setDeletingId(career.id)}
                    aria-label="Excluir carreira"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Modal
        open={deletingId !== null}
        title="Excluir carreira"
        onClose={() => setDeletingId(null)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setDeletingId(null)}>Cancelar</button>
            <button className="btn-danger" onClick={confirmDelete}>Excluir</button>
          </>
        }
      >
        {deleteError ? (
          <Alert tone="error">{deleteError}</Alert>
        ) : (
          <p>
            Esta ação não pode ser desfeita. A carreira e todas as informações associadas
            serão permanentemente removidas.
          </p>
        )}
      </Modal>
    </div>
  );
}
