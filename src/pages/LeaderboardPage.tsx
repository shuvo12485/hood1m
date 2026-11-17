import React, { useState } from 'react';
import { useTokens } from '../context/TokensContext';
import { Trophy, TrendingUp, DollarSign, Award } from 'lucide-react';

interface LeaderboardPageProps {
  navigate: (path: string) => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ navigate }) => {
  const { tokens } = useTokens();
  const [tab, setTab] = useState<'fdv' | 'volume' | 'gainers'>('fdv');

  const sorted = [...tokens].sort((a, b) => {
    if (tab === 'volume') return b.volume24h - a.volume24h;
    if (tab === 'gainers') return b.change24h - a.change24h;
    return b.fdv - a.fdv;
  });

  const formatUsd = (num: number) => {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="pt-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgb(var(--line))] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[rgb(var(--accent))]" />
            <h1 className="h-display text-4xl font-bold">Leaderboard</h1>
          </div>
          <p className="font-mono text-xs text-[rgb(var(--muted))] mt-1">
            Top performing coins ranked across Meteora Dynamic Bonding Curves
          </p>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setTab('fdv')}
            className={tab === 'fdv' ? 'tab-on' : 'tab'}
          >
            Highest FDV
          </button>
          <button
            onClick={() => setTab('volume')}
            className={tab === 'volume' ? 'tab-on' : 'tab'}
          >
            Volume 24h
          </button>
          <button
            onClick={() => setTab('gainers')}
            className={tab === 'gainers' ? 'tab-on' : 'tab'}
          >
            Gainers 24h
          </button>
        </div>
      </div>

      <div className="mt-8 panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[rgb(var(--line))] bg-[rgb(var(--raised))]/40 text-left">
                <th className="label px-4 py-3 font-normal">Rank</th>
                <th className="label px-4 py-3 font-normal">Coin</th>
                <th className="label px-4 py-3 font-normal">FDV</th>
                <th className="label px-4 py-3 font-normal">Price</th>
                <th className="label px-4 py-3 font-normal">24h Gain</th>
                <th className="label px-4 py-3 font-normal">Volume 24h</th>
                <th className="label px-4 py-3 font-normal">Reserve ETH</th>
                <th className="label px-4 py-3 font-normal">Status</th>
                <th className="label px-4 py-3 font-normal text-right">Trade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--line))]/60">
              {sorted.map((t, idx) => (
                <tr
                  key={t.mint}
                  onClick={() => navigate(`/token/${t.mint}`)}
                  className="group cursor-pointer transition hover:bg-[rgb(var(--raised))]/60"
                >
                  <td className="px-4 py-3.5 font-pixel text-sm font-bold">
                    {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={t.image} alt={t.name} className="h-9 w-9 rounded-xl object-cover" />
                      <div>
                        <div className="font-pixel font-bold text-sm text-[rgb(var(--ink))] group-hover:text-[rgb(var(--accent))]">
                          {t.name}
                        </div>
                        <div className="font-mono text-[10px] text-[rgb(var(--muted))]">${t.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-pixel text-base font-bold text-[rgb(var(--ink))]">
                    {formatUsd(t.fdv)}
                  </td>
                  <td className="px-4 py-3.5 font-mono font-semibold text-[rgb(var(--ink))]">
                    ${t.price.toFixed(5)}
                  </td>
                  <td
                    className={`px-4 py-3.5 font-mono font-bold ${
                      t.change24h >= 0 ? 'text-[rgb(var(--up))]' : 'text-[rgb(var(--down))]'
                    }`}
                  >
                    {t.change24h >= 0 ? '+' : ''}{t.change24h.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[rgb(var(--muted))]">
                    {formatUsd(t.volume24h)}
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-[rgb(var(--ink))]">
                    {t.ethReserve.toFixed(1)} ETH
                  </td>
                  <td className="px-4 py-3.5">
                    {t.graduated ? (
                      <span className="rounded-full bg-[rgb(var(--strong))] px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
                        GRADUATED
                      </span>
                    ) : (
                      <span className="rounded-full border border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[rgb(var(--accent))]">
                        BONDING
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button className="btn-dark px-3.5 py-1 text-xs">
                      Trade →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
