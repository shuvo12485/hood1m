import React, { useState } from 'react';
import { Token } from '../types';

interface TopPerformersTableProps {
  tokens: Token[];
  onSelect: (mint: string) => void;
}

export const TopPerformersTable: React.FC<TopPerformersTableProps> = ({ tokens, onSelect }) => {
  const [tab, setTab] = useState<'24h' | 'all'>('24h');

  const sorted = [...tokens].sort((a, b) => {
    if (tab === '24h') return b.change24h - a.change24h;
    return b.fdv - a.fdv;
  });

  const formatUsd = (num: number) => {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  if (tokens.length === 0) {
    return (
      <div className="panel p-8 mt-12 text-center font-mono text-xs text-[rgb(var(--muted))]">
        <p className="font-pixel text-base font-bold text-[rgb(var(--ink))]">No tokens launched yet on Arbitrum One</p>
        <p className="mt-1">Be the pioneer to launch a token at $1,000,000 FDV floor!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 mt-12 flex flex-wrap items-center gap-3">
        <h2 className="font-pixel text-2xl font-bold tracking-tight sm:text-[28px] text-[rgb(var(--ink))]">
          Top performers
        </h2>
        <button
          onClick={() => setTab('24h')}
          className={tab === '24h' ? 'tab-on' : 'tab'}
        >
          24H
        </button>
        <button
          onClick={() => setTab('all')}
          className={tab === 'all' ? 'tab-on' : 'tab'}
        >
          All
        </button>
      </div>

      <div className="panel p-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-xs">
            <thead>
              <tr className="border-b border-[rgb(var(--line))] text-left">
                <th className="label px-3 py-2.5 font-normal">#</th>
                <th className="label px-3 py-2.5 font-normal">Asset</th>
                <th className="label px-3 py-2.5 font-normal">FDV</th>
                <th className="label px-3 py-2.5 font-normal">Circ. MC</th>
                <th className="label px-3 py-2.5 font-normal">Price</th>
                <th className="label px-3 py-2.5 font-normal">24h %</th>
                <th className="label px-3 py-2.5 font-normal">Volume 24h</th>
                <th className="label px-3 py-2.5 font-normal">Holders</th>
                <th className="label px-3 py-2.5 font-normal">Progress</th>
                <th className="label px-3 py-2.5 font-normal">Status</th>
                <th className="label px-3 py-2.5 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--line))]/60">
              {sorted.map((t, idx) => (
                <tr
                  key={t.mint}
                  onClick={() => onSelect(t.mint)}
                  className="group cursor-pointer transition hover:bg-[rgb(var(--raised))]/60"
                >
                  <td className="px-3 py-3 font-mono font-semibold text-[rgb(var(--muted))]">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <img src={t.image} alt={t.name} className="h-8 w-8 rounded-lg object-cover" />
                      <div>
                        <div className="font-pixel font-bold text-[rgb(var(--ink))] group-hover:text-[#00C805]">
                          {t.name}
                        </div>
                        <div className="font-mono text-[10px] text-[rgb(var(--muted))]">
                          ${t.symbol}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-pixel font-bold text-[rgb(var(--ink))]">
                    {formatUsd(t.fdv)}
                  </td>
                  <td className="px-3 py-3 font-mono text-[rgb(var(--muted))]">
                    {formatUsd(t.circulatingMarketCap)}
                  </td>
                  <td className="px-3 py-3 font-mono font-semibold text-[rgb(var(--ink))]">
                    ${t.price.toFixed(5)}
                  </td>
                  <td
                    className={`px-3 py-3 font-mono font-bold ${
                      t.change24h >= 0 ? 'text-[#00C805]' : 'text-[rgb(var(--down))]'
                    }`}
                  >
                    {t.change24h >= 0 ? '+' : ''}{t.change24h.toFixed(1)}%
                  </td>
                  <td className="px-3 py-3 font-mono text-[rgb(var(--muted))]">
                    {formatUsd(t.volume24h)}
                  </td>
                  <td className="px-3 py-3 font-mono text-[rgb(var(--muted))]">
                    {t.holders.toLocaleString()}
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[rgb(var(--raised))]">
                      <div
                        className="h-full bg-[#00C805]"
                        style={{ width: `${Math.min(100, (t.ethReserve / 35) * 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {t.graduated ? (
                      <span className="rounded-full bg-[rgb(var(--strong))] px-2 py-0.5 font-mono text-[10px] font-bold text-[rgb(var(--strong-ink))]">
                        UNISWAP v4
                      </span>
                    ) : (
                      <span className="rounded-full border border-[#00C805] bg-[#00C805]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#00C805]">
                        BONDING
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(t.mint);
                      }}
                      className="btn-dark px-3 py-1 text-xs"
                    >
                      Trade
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
