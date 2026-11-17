import React from 'react';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="mt-16 border-t border-[rgb(var(--line))] bg-[rgb(var(--card))]/60">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-4 py-7 text-xs sm:px-8 md:flex-row md:items-center">
        {/* Brand */}
        <div className="flex items-center gap-2 font-pixel text-base font-bold tracking-tight">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black border border-white/10 shadow-sm">
            <BrandLogo variant="feather-arrow" size={18} />
          </div>
          Hood<span className="text-[#00C805]">1M</span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 font-medium">
          <button onClick={() => navigate('/how-it-works')} className="text-[rgb(var(--muted))] transition hover:text-[#00C805]">
            How it works
          </button>
          <button onClick={() => navigate('/fees')} className="text-[rgb(var(--muted))] transition hover:text-[#00C805]">
            Fees
          </button>
          <button onClick={() => navigate('/risks')} className="text-[rgb(var(--muted))] transition hover:text-[#00C805]">
            Risks
          </button>
          <button onClick={() => navigate('/docs')} className="text-[rgb(var(--muted))] transition hover:text-[#00C805]">
            Docs
          </button>
          <button onClick={() => navigate('/stats')} className="text-[rgb(var(--muted))] transition hover:text-[#00C805]">
            Stats
          </button>
          <button onClick={() => navigate('/how-it-works')} className="text-[rgb(var(--muted))] transition hover:text-[#00C805]">
            Terms
          </button>
          <button onClick={() => navigate('/how-it-works')} className="text-[rgb(var(--muted))] transition hover:text-[#00C805]">
            Privacy
          </button>
        </div>

        {/* Note */}
        <div className="max-w-sm font-mono text-[11px] text-[rgb(var(--muted))] md:ml-auto md:text-right">
          $1M is a configured starting FDV, not money in the pool. Powered by Hood1M · Arbitrum L2 · Uniswap v3.
        </div>
      </div>
    </footer>
  );
};
