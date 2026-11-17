import React from 'react';
import { Token } from '../types';
import { GRADUATION_ETH_THRESHOLD } from '../utils/bondingCurve';

interface CoinCardProps {
  token: Token;
  onSelect: (mint: string) => void;
}

export const CoinCard: React.FC<CoinCardProps> = ({ token, onSelect }) => {
  const progressPercent = Math.min(100, Math.round((token.ethReserve / GRADUATION_ETH_THRESHOLD) * 100));

  const formatUsd = (num: number) => {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div
      onClick={() => onSelect(token.mint)}
      className="panel group flex cursor-pointer flex-col p-4.5 transition-all duration-150 hover:-translate-y-1 hover:border-[#00C805]/50 hover:bg-[#131A26] bg-[#0F141D] border border-[#1F2735]"
    >
      <div className="flex items-start gap-3.5">
        <img
          src={token.image}
          alt={token.name}
          className="h-14 w-14 rounded-xl object-cover border border-[rgb(var(--line))] transition group-hover:scale-105"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h3 className="truncate font-pixel text-base font-bold text-[rgb(var(--ink))] group-hover:text-[#00C805]">
              {token.name}
            </h3>
            <span className="font-mono text-xs font-semibold text-[rgb(var(--muted))]">
              ${token.symbol}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span className="font-pixel text-lg font-bold text-[rgb(var(--ink))]">
              {formatUsd(token.fdv)}
            </span>
            <span
              className={`font-mono text-xs font-bold ${
                token.change24h >= 0 ? 'text-[#00C805]' : 'text-[rgb(var(--down))]'
              }`}
            >
              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-xs text-[rgb(var(--muted))] leading-relaxed">
        {token.description}
      </p>

      {/* Graduation Progress Bar */}
      <div className="mt-4 border-t border-[rgb(var(--line))] pt-3">
        <div className="flex items-center justify-between font-mono text-[11px] text-[rgb(var(--muted))]">
          <span>Graduation ({token.ethReserve.toFixed(1)} / {GRADUATION_ETH_THRESHOLD} ETH)</span>
          <span className="font-bold text-[rgb(var(--ink))]">{progressPercent}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-black/50 p-0.5 border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              token.graduated
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                : 'bg-gradient-to-r from-[#00C805] to-[#00FF88] shadow-[0_0_8px_#00C805]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-[rgb(var(--muted))]">
        <span>Vol: {formatUsd(token.volume24h)}</span>
        <span className="text-[rgb(var(--ink))] font-medium">
          {token.graduated ? '🎓 Uniswap v3' : '⚡ Arbitrum DBC'}
        </span>
      </div>
    </div>
  );
};
