import React, { useState } from 'react';
import { HeroMonitor } from '../components/HeroMonitor';
import { CoinCard } from '../components/CoinCard';
import { TopPerformersTable } from '../components/TopPerformersTable';
import { QuickLaunchCard } from '../components/QuickLaunchCard';
import { useTokens } from '../context/TokensContext';
import { Rocket, BarChart2, DollarSign, Award } from 'lucide-react';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { tokens, stats } = useTokens();
  const [clubTab, setClubTab] = useState<'1m' | '5m' | '10m'>('1m');

  const handleQuickLaunch = async (name: string, ticker: string) => {
    navigate(`/launch?name=${encodeURIComponent(name)}&ticker=${encodeURIComponent(ticker)}`);
  };

  const newMillionaires = [...tokens].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);

  const clubCoins = tokens.filter(t => {
    if (clubTab === '10m') return t.fdv >= 10_000_000;
    if (clubTab === '5m') return t.fdv >= 5_000_000;
    return t.fdv >= 1_000_000;
  });

  const formatUsd = (num: number) => {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  return (
    <div className="pt-8">
      {/* Hero Section */}
      <section className="relative text-center">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[rgb(var(--line))] bg-[rgb(var(--card))] px-3.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[rgb(var(--muted))]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00C805] animate-pulse"></span>
          Hood1M · Robinhood Web3 · Arbitrum L2 · Uniswap v3
        </div>

        <h1 className="h-display mx-auto mt-4 max-w-3xl text-[40px] min-[420px]:text-[50px] sm:text-[76px] leading-[1.05]">
          <span className="mx-auto block w-fit">Every coin starts at</span>
          <span className="mx-auto block w-fit text-[#00C805]">
            $1,000,000<span className="text-[rgb(var(--ink))]">.</span>
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-md text-lg text-[rgb(var(--muted))] leading-relaxed">
          <span className="mx-auto block w-fit">Same starting FDV for everyone.</span>
          <span className="mx-auto block w-fit">Commission-free trading on Robinhood Web3.</span>
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate('/launch')}
            className="btn-dark px-7 py-3 text-[15px]"
          >
            Create a millionaire →
          </button>
          <button
            onClick={() => navigate('/explore')}
            className="btn-light px-7 py-3 text-[15px]"
          >
            Explore coins
          </button>
        </div>

        {/* Hero Monitor Graphic */}
        <HeroMonitor />

        {/* Feature Chips */}
        <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
          <span className="chip px-3 py-1 text-[11px]">
            <span className="text-[#00C805]">↗</span> Zero platform fees
          </span>
          <span className="chip px-3 py-1 text-[11px]">
            <span className="text-[#00C805]">↗</span> $1M starting valuation
          </span>
          <span className="chip px-3 py-1 text-[11px]">
            <span className="text-[#00C805]">↗</span> Robinhood Wallet native
          </span>
          <span className="chip px-3 py-1 text-[11px]">
            <span className="text-[#00C805]">↗</span> Uniswap v3 graduation
          </span>
        </div>
      </section>

      {/* 4 Stats Cards */}
      <section className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="panel flex items-center gap-3 p-4">
          <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgb(var(--line))] text-[rgb(var(--ink))] sm:flex">
            <Rocket className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="w-fit font-pixel text-[22px] font-bold leading-none tracking-tight sm:text-[28px]">
              {stats.coinsLaunched}
            </div>
            <div className="label mt-1.5 w-fit">Coins launched</div>
          </div>
        </div>

        <div className="panel flex items-center gap-3 p-4">
          <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgb(var(--line))] text-[rgb(var(--ink))] sm:flex">
            <BarChart2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="w-fit font-pixel text-[22px] font-bold leading-none tracking-tight sm:text-[28px]">
              {formatUsd(stats.totalVolume)}
            </div>
            <div className="label mt-1.5 w-fit">Total volume</div>
          </div>
        </div>

        <div className="panel flex items-center gap-3 p-4">
          <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgb(var(--line))] text-[rgb(var(--ink))] sm:flex">
            <DollarSign className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="w-fit font-pixel text-[22px] font-bold leading-none tracking-tight sm:text-[28px]">
              {stats.coinsAbove1M}
            </div>
            <div className="label mt-1.5 w-fit">Coins above $1M</div>
          </div>
        </div>

        <div className="panel flex items-center gap-3 p-4">
          <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgb(var(--line))] text-[rgb(var(--ink))] sm:flex">
            <Award className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="w-fit font-pixel text-[22px] font-bold leading-none tracking-tight sm:text-[28px]">
              {stats.multiMillionaires}
            </div>
            <div className="label mt-1.5 w-fit">Multi-millionaires</div>
          </div>
        </div>
      </section>

      {/* Main Grid: Content + Aside */}
      <section className="mt-12 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Left Column */}
        <div className="min-w-0">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-pixel text-2xl font-bold tracking-tight sm:text-[28px]">
              New millionaires
            </h2>
            <span className="hidden text-xs sm:inline font-mono text-[rgb(var(--muted))]">
              <span className="text-[#00C805]">●</span> live on Arbitrum
            </span>
            <button
              onClick={() => navigate('/explore')}
              className="ml-auto font-pixel text-sm font-semibold link flex items-center"
            >
              View all →
            </button>
          </div>

          {/* New Coins Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {newMillionaires.map((token) => (
              <CoinCard
                key={token.mint}
                token={token}
                onSelect={(mint) => navigate(`/token/${mint}`)}
              />
            ))}
          </div>

          {/* Top Performers Table */}
          <TopPerformersTable
            tokens={tokens}
            onSelect={(mint) => navigate(`/token/${mint}`)}
          />
        </div>

        {/* Right Aside */}
        <aside className="flex flex-col gap-6">
          <QuickLaunchCard onQuickLaunch={handleQuickLaunch} />

          {/* Millionaires Club Spotlight */}
          <div className="panel p-5">
            <h3 className="w-fit font-pixel text-xl font-bold tracking-tight">
              Millionaires club
            </h3>
            <p className="w-fit text-xs text-[rgb(var(--muted))]">
              Coins that scaled past seven figures.
            </p>

            <div className="mt-3 grid grid-cols-3 gap-1">
              <button
                onClick={() => setClubTab('1m')}
                className={clubTab === '1m' ? 'tab-on' : 'tab'}
              >
                &gt; $1M
              </button>
              <button
                onClick={() => setClubTab('5m')}
                className={clubTab === '5m' ? 'tab-on' : 'tab'}
              >
                &gt; $5M
              </button>
              <button
                onClick={() => setClubTab('10m')}
                className={clubTab === '10m' ? 'tab-on' : 'tab'}
              >
                &gt; $10M
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {clubCoins.slice(0, 3).map((c) => (
                <div
                  key={c.mint}
                  onClick={() => navigate(`/token/${c.mint}`)}
                  className="flex items-center justify-between rounded-xl border border-[rgb(var(--line))] p-2.5 transition hover:bg-[rgb(var(--raised))]/60 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={c.image} alt={c.name} className="h-7 w-7 rounded-lg object-cover" />
                    <div>
                      <div className="font-pixel text-xs font-bold leading-tight">{c.name}</div>
                      <div className="font-mono text-[10px] text-[rgb(var(--muted))]">${c.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-pixel text-xs font-bold">{formatUsd(c.fdv)}</div>
                    <div className="font-mono text-[10px] text-[#00C805]">
                      +{c.change24h.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/club')}
              className="mt-3 inline-block font-pixel text-sm font-semibold link"
            >
              Full club →
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
};
