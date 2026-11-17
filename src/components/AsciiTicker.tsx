import React from 'react';
import { useTokens } from '../context/TokensContext';

export const AsciiTicker: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { tokens } = useTokens();

  const tickerItems = tokens.map(
    (t) => `▲ ${t.symbol} $${t.price.toFixed(4)} (+${t.change24h.toFixed(1)}% | FDV $${(t.fdv / 1_000_000).toFixed(2)}M)`
  );

  const fullText = `[ HOOD1M://TICKER ] ··· ` + tickerItems.join(' ··· ') + ' ··· ALL ASSETS LAUNCH AT $1,000,000 FLOOR ··· 35 ETH UNISWAP V3 GRADUATION ··· ';

  return (
    <div className={`overflow-hidden border-y border-[#00C805]/30 bg-[#070b09]/90 py-1.5 font-mono text-[11px] text-[#00FF66] ${className}`}>
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
        <span>{fullText}</span>
        <span>{fullText}</span>
      </div>
    </div>
  );
};
