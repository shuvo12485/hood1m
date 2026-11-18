import React, { useState } from 'react';
import { useTokens } from '../context/TokensContext';
import { Crown, Sparkles, Award } from 'lucide-react';

interface ClubPageProps {
  navigate: (path: string) => void;
}

export const ClubPage: React.FC<ClubPageProps> = ({ navigate }) => {
  const { tokens } = useTokens();
  const [tier, setTier] = useState<'1m' | '5m' | '10m'>('1m');

  const filtered = tokens.filter((t) => {
    if (tier === '10m') return t.fdv >= 10_000_000;
    if (tier === '5m') return t.fdv >= 5_000_000;
    return t.fdv >= 1_000_000;
  });

  const formatUsd = (num: number) => {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  return (
    <div className="pt-8 pb-16">
      <div className="border-b border-[rgb(var(--line))] pb-6">
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-[rgb(var(--accent))]" />
          <h1 className="h-display text-4xl font-bold">Millionaires Club</h1>
        </div>
        <p className="font-mono text-xs text-[rgb(var(--muted))] mt-1">
          An exclusive pantheon honoring coins that held the line and scaled beyond seven figures
        </p>

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setTier('1m')}
            className={`flex items-center gap-1.5 ${tier === '1m' ? 'tab-on' : 'tab'}`}
          >
            <Sparkles className="h-3.5 w-3.5" /> &gt; $1,000,000 Milestone
          </button>
          <button
            onClick={() => setTier('5m')}
            className={`flex items-center gap-1.5 ${tier === '5m' ? 'tab-on' : 'tab'}`}
          >
            <Award className="h-3.5 w-3.5" /> &gt; $5,000,000 Multi-Millionaire
          </button>
          <button
            onClick={() => setTier('10m')}
            className={`flex items-center gap-1.5 ${tier === '10m' ? 'tab-on' : 'tab'}`}
          >
            <Crown className="h-3.5 w-3.5 text-amber-500" /> &gt; $10,000,000 Legend Club
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="panel p-12 mt-8 text-center font-mono">
          <p className="font-pixel text-xl font-bold text-[rgb(var(--ink))]">No coins in this milestone tier yet</p>
          <p className="mt-2 text-xs text-[rgb(var(--muted))]">
            Every coin on Hood1M launches at $1,000,000 FDV. Buy on the curve to push a coin into the multi-millionaire tiers!
          </p>
          <button
            onClick={() => navigate('/launch')}
            className="btn-dark mt-5 text-xs font-bold"
          >
            Create a Millionaire →
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
          <div
            key={t.mint}
            onClick={() => navigate(`/token/${t.mint}`)}
            className="panel group cursor-pointer p-5 transition duration-150 hover:-translate-y-1 hover:border-[rgb(var(--ink))] shadow-xs"
          >
            <div className="flex items-start gap-4">
              <img src={t.image} alt={t.name} className="h-16 w-16 rounded-2xl object-cover border border-[rgb(var(--line))]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-pixel text-lg font-bold truncate group-hover:text-[rgb(var(--accent))]">
                    {t.name}
                  </h3>
                  <span className="font-mono text-xs text-[rgb(var(--muted))]">${t.symbol}</span>
                </div>

                <div className="mt-1 font-pixel text-2xl font-bold text-[rgb(var(--ink))]">
                  {formatUsd(t.fdv)}
                </div>

                <div className="mt-1 font-mono text-xs text-[rgb(var(--up))] font-bold">
                  +{t.change24h.toFixed(1)}% 24h
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-[rgb(var(--muted))] line-clamp-2">
              {t.description}
            </p>

            <div className="mt-4 border-t border-[rgb(var(--line))] pt-3 flex items-center justify-between font-mono text-xs">
              <span className="text-[rgb(var(--muted))]">Reserve: {t.ethReserve.toFixed(1)} ETH</span>
              <span className="font-bold text-[#00C805]">
                {t.graduated ? '🏆 Uniswap v4 Pool' : '⚡ On Curve'}
              </span>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
