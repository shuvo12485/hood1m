import React, { useState } from 'react';

interface QuickLaunchCardProps {
  onQuickLaunch: (name: string, ticker: string) => void;
}

export const QuickLaunchCard: React.FC<QuickLaunchCardProps> = ({ onQuickLaunch }) => {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ticker) return;
    onQuickLaunch(name, ticker);
  };

  return (
    <form onSubmit={handleSubmit} className="panel-dark p-5 shadow-lg">
      <h3 className="w-fit font-pixel text-xl font-bold tracking-tight">
        Launch your coin <span className="text-[rgb(var(--accent))]">↗</span>
      </h3>
      <p className="mt-1 w-fit text-xs text-[rgb(var(--muted))]">
        Start at a $1,000,000 FDV. No liquidity deposit.
      </p>

      <label className="mt-4 block w-fit text-xs font-semibold" htmlFor="ql-name">
        Token name
      </label>
      <input
        id="ql-name"
        className="input-dark mt-1"
        placeholder="e.g. Million Frog"
        maxLength={32}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <label className="mt-3 block w-fit text-xs font-semibold" htmlFor="ql-ticker">
        Ticker
      </label>
      <input
        id="ql-ticker"
        className="input-dark mt-1"
        placeholder="e.g. MFROG"
        maxLength={10}
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        required
      />

      <button type="submit" className="btn-dark mt-4 w-full justify-center">
        Launch at $1,000,000 →
      </button>

      <p className="mt-3 w-fit text-[10px] text-[rgb(var(--muted))]">
        Network: Solana mainnet · exact cost is shown before you sign
      </p>
    </form>
  );
};
