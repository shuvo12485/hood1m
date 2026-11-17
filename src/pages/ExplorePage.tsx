import React, { useState } from 'react';
import { useTokens } from '../context/TokensContext';
import { CoinCard } from '../components/CoinCard';
import { TopPerformersTable } from '../components/TopPerformersTable';
import { LayoutGrid, List, Search } from 'lucide-react';

interface ExplorePageProps {
  navigate: (path: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

type FilterType =
  | 'new'
  | 'recent'
  | 'trending'
  | 'volume'
  | 'liquidity'
  | 'gainers'
  | 'losers'
  | 'above1m'
  | 'below1m'
  | 'above2m'
  | 'above5m'
  | 'above10m';

export const ExplorePage: React.FC<ExplorePageProps> = ({ navigate, searchQuery, setSearchQuery }) => {
  const { tokens } = useTokens();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeFilter, setActiveFilter] = useState<FilterType>('new');

  const filterList: { label: string; key: FilterType }[] = [
    { label: 'New launches', key: 'new' },
    { label: 'Recently traded', key: 'recent' },
    { label: 'Trending', key: 'trending' },
    { label: 'Highest volume', key: 'volume' },
    { label: 'Highest liquidity', key: 'liquidity' },
    { label: 'Top gainers', key: 'gainers' },
    { label: 'Top losers', key: 'losers' },
    { label: 'Above $1M', key: 'above1m' },
    { label: 'Below $1M', key: 'below1m' },
    { label: 'Above $2M', key: 'above2m' },
    { label: 'Above $5M', key: 'above5m' },
    { label: 'Above $10M', key: 'above10m' },
  ];

  const filteredTokens = tokens.filter((t) => {
    // Search query match
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        t.name.toLowerCase().includes(q) ||
        t.symbol.toLowerCase().includes(q) ||
        t.mint.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Filter type match
    if (activeFilter === 'above1m') return t.fdv >= 1_000_000;
    if (activeFilter === 'below1m') return t.fdv < 1_000_000;
    if (activeFilter === 'above2m') return t.fdv >= 2_000_000;
    if (activeFilter === 'above5m') return t.fdv >= 5_000_000;
    if (activeFilter === 'above10m') return t.fdv >= 10_000_000;
    if (activeFilter === 'gainers') return t.change24h > 0;
    if (activeFilter === 'losers') return t.change24h < 0;
    return true;
  });

  // Sort filtered tokens
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    if (activeFilter === 'new') return b.createdAt - a.createdAt;
    if (activeFilter === 'volume') return b.volume24h - a.volume24h;
    if (activeFilter === 'liquidity') return b.ethReserve - a.ethReserve;
    if (activeFilter === 'gainers') return b.change24h - a.change24h;
    if (activeFilter === 'losers') return a.change24h - b.change24h;
    if (activeFilter === 'trending') return b.volume24h * b.change24h - a.volume24h * a.change24h;
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="pt-8 pb-16">
      {/* Header and View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgb(var(--line))] pb-6">
        <div>
          <h1 className="h-display text-4xl font-bold">Explore</h1>
          <p className="font-mono text-xs text-[rgb(var(--muted))] mt-1">
            Browse all coins on the Meteora Dynamic Bonding Curve
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--card))] p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-pixel text-xs font-semibold transition ${
              viewMode === 'grid' ? 'tab-on' : 'tab'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-pixel text-xs font-semibold transition ${
              viewMode === 'table' ? 'tab-on' : 'tab'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            Table
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted))]" />
          <input
            className="input pl-10"
            placeholder="Search coin name, symbol, or mint address…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {filterList.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={activeFilter === f.key ? 'tab-on' : 'tab'}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      <div className="mt-8">
        {sortedTokens.length === 0 ? (
          <div className="panel p-12 text-center">
            <p className="font-mono text-sm text-[rgb(var(--muted))]">
              No coins found matching "{searchQuery || activeFilter}".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('new');
              }}
              className="btn-dark mt-4"
            >
              Reset filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedTokens.map((token) => (
              <CoinCard
                key={token.mint}
                token={token}
                onSelect={(mint) => navigate(`/token/${mint}`)}
              />
            ))}
          </div>
        ) : (
          <TopPerformersTable
            tokens={sortedTokens}
            onSelect={(mint) => navigate(`/token/${mint}`)}
          />
        )}
      </div>
    </div>
  );
};
