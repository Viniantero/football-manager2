import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CareerWithSettings } from '@/types';

/**
 * Application state — the single source of truth for the active career and
 * high-level navigation. UI components consume this context instead of
 * holding their own copy of the active career.
 */

export type AppScreen =
  | { kind: 'home' }
  | { kind: 'new-career' }
  | { kind: 'load-career' }
  | { kind: 'dashboard' }
  | { kind: 'clubs' }
  | { kind: 'club-detail'; clubId: string }
  | { kind: 'player-detail'; playerId: string; clubId: string };

export interface AppState {
  screen: AppScreen;
  activeCareer: CareerWithSettings | null;
  loading: boolean;
  error: string | null;
}

export interface AppContextValue extends AppState {
  navigate: (screen: AppScreen) => void;
  setActiveCareer: (career: CareerWithSettings | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  /** Leave the active career and return to the home screen. */
  exitCareer: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<AppScreen>({ kind: 'home' });
  const [activeCareer, setActiveCareerState] = useState<CareerWithSettings | null>(null);
  const [loading, setLoadingState] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  const navigate = useCallback((next: AppScreen) => {
    setScreen(next);
  }, []);

  const setActiveCareer = useCallback((career: CareerWithSettings | null) => {
    setActiveCareerState(career);
  }, []);

  const setLoading = useCallback((value: boolean) => setLoadingState(value), []);
  const setError = useCallback((value: string | null) => setErrorState(value), []);

  const exitCareer = useCallback(() => {
    setActiveCareerState(null);
    setScreen({ kind: 'home' });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      screen,
      activeCareer,
      loading,
      error,
      navigate,
      setActiveCareer,
      setLoading,
      setError,
      exitCareer,
    }),
    [screen, activeCareer, loading, error, navigate, setActiveCareer, setLoading, setError, exitCareer]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
