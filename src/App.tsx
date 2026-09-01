import { AppProvider, useApp } from '@/state/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { NewCareerPage } from '@/pages/NewCareerPage';
import { LoadCareerPage } from '@/pages/LoadCareerPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ClubsPage } from '@/pages/ClubsPage';
import { ClubDetailPage } from '@/pages/ClubDetailPage';
import { PlayerDetailPage } from '@/pages/PlayerDetailPage';

function ScreenRouter() {
  const { screen } = useApp();

  switch (screen.kind) {
    case 'home':
      // The title screen is full-bleed and does not use the management shell.
      return <HomePage />;
    case 'new-career':
      return (
        <AppLayout>
          <NewCareerPage />
        </AppLayout>
      );
    case 'load-career':
      return (
        <AppLayout>
          <LoadCareerPage />
        </AppLayout>
      );
    case 'dashboard':
      return (
        <AppLayout>
          <DashboardPage />
        </AppLayout>
      );
    case 'clubs':
      return (
        <AppLayout>
          <ClubsPage />
        </AppLayout>
      );
    case 'club-detail':
      return (
        <AppLayout>
          <ClubDetailPage clubId={screen.clubId} />
        </AppLayout>
      );
    case 'player-detail':
      return (
        <AppLayout>
          <PlayerDetailPage playerId={screen.playerId} clubId={screen.clubId} />
        </AppLayout>
      );
    default:
      return <HomePage />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <ScreenRouter />
    </AppProvider>
  );
}
