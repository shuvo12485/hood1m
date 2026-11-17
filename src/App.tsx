import React, { useState, useEffect } from 'react';
import { WalletProvider } from './context/WalletContext';
import { TokensProvider } from './context/TokensContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CyberBackground } from './components/CyberBackground';
import { WalletModal } from './components/WalletModal';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { LaunchPage } from './pages/LaunchPage';
import { TokenPage } from './pages/TokenPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ClubPage } from './pages/ClubPage';
import { DashboardPage } from './pages/DashboardPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { InfoPages } from './pages/InfoPages';

export function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Handle client-side routing
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route parser
  const renderRoute = () => {
    if (currentPath === '/' || currentPath === '') {
      return <HomePage navigate={navigate} />;
    }
    if (currentPath === '/explore') {
      return (
        <ExplorePage
          navigate={navigate}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      );
    }
    if (currentPath.startsWith('/launch')) {
      const params = new URLSearchParams(window.location.search);
      return (
        <LaunchPage
          navigate={navigate}
          initialName={params.get('name') || ''}
          initialTicker={params.get('ticker') || ''}
        />
      );
    }
    if (currentPath.startsWith('/token/')) {
      const mint = currentPath.replace('/token/', '');
      return <TokenPage mint={mint} navigate={navigate} />;
    }
    if (currentPath === '/leaderboard') {
      return <LeaderboardPage navigate={navigate} />;
    }
    if (currentPath === '/club') {
      return <ClubPage navigate={navigate} />;
    }
    if (currentPath === '/dashboard') {
      return <DashboardPage navigate={navigate} />;
    }
    if (currentPath === '/how-it-works') {
      return <HowItWorksPage navigate={navigate} />;
    }
    if (currentPath === '/fees') {
      return <InfoPages navigate={navigate} type="fees" />;
    }
    if (currentPath === '/risks') {
      return <InfoPages navigate={navigate} type="risks" />;
    }
    if (currentPath === '/docs') {
      return <InfoPages navigate={navigate} type="docs" />;
    }
    if (currentPath === '/stats') {
      return <InfoPages navigate={navigate} type="stats" />;
    }

    return <HomePage navigate={navigate} />;
  };

  return (
    <div className="relative min-h-screen bg-[rgb(var(--paper))] text-[rgb(var(--ink))]">
      {/* Dynamic Cyber Aurora & Grid Background */}
      <CyberBackground />
      {/* Desktop Fixed Left Navigation */}
      <Sidebar
        currentPath={currentPath}
        navigate={navigate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Mobile Top Header */}
      <Header currentPath={currentPath} navigate={navigate} />

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-col lg:pl-[272px]">
        <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 sm:px-8">
          {renderRoute()}
        </main>
        <Footer navigate={navigate} />
      </div>

      {/* Global Wallet Selection Modal */}
      <WalletModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <TokensProvider>
          <AppContent />
        </TokensProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
