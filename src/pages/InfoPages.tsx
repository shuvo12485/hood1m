import React from 'react';
import { useTokens } from '../context/TokensContext';
import { DollarSign, ShieldAlert, FileText, BarChart3 } from 'lucide-react';

interface InfoPageProps {
  navigate: (path: string) => void;
  type: 'fees' | 'risks' | 'docs' | 'stats';
}

export const InfoPages: React.FC<InfoPageProps> = ({ type }) => {
  const { stats } = useTokens();

  if (type === 'fees') {
    return (
      <div className="pt-8 pb-16 max-w-3xl mx-auto">
        <div className="border-b border-[rgb(var(--line))] pb-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-[#00C805]" />
            <h1 className="h-display text-4xl font-bold">Hood1M Fee Structure</h1>
          </div>
          <p className="font-mono text-xs text-[rgb(var(--muted))] mt-1">
            Zero commission trading powered by Arbitrum Layer 2
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="panel p-6">
            <h3 className="font-pixel text-lg font-bold">Token Creation</h3>
            <p className="text-sm text-[rgb(var(--muted))] mt-2">
              <strong>$0.00 Platform Fee</strong>. You only pay standard Arbitrum L2 gas (~0.005 ETH)
              to deploy the ERC-20 contract and initialize the bonding curve.
            </p>
          </div>

          <div className="panel p-6">
            <h3 className="font-pixel text-lg font-bold">Trading Swaps</h3>
            <p className="text-sm text-[rgb(var(--muted))] mt-2">
              <strong>$0.00 Platform Commission</strong>. Every trade on the bonding curve incurs a standard
              1.0% liquidity curve fee to reward liquidity buildup prior to migration.
            </p>
          </div>

          <div className="panel p-6">
            <h3 className="font-pixel text-lg font-bold">Uniswap v3 Pool Migration</h3>
            <p className="text-sm text-[rgb(var(--muted))] mt-2">
              Once a coin hits 35 ETH and graduates to Uniswap v3, 100% of the LP is permanently locked and unruggable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'risks') {
    return (
      <div className="pt-8 pb-16 max-w-3xl mx-auto">
        <div className="border-b border-[rgb(var(--line))] pb-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-[rgb(var(--down))]" />
            <h1 className="h-display text-4xl font-bold">Risk Disclosure</h1>
          </div>
          <p className="font-mono text-xs text-[rgb(var(--muted))] mt-1">
            Understanding cryptocurrency volatility and bonding curve mechanics
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="panel p-6 border-[rgb(var(--warn))]/30">
            <h3 className="font-pixel text-lg font-bold text-[rgb(var(--warn))]">
              Configured FDV vs Actual Deposited Liquidity
            </h3>
            <p className="text-sm text-[rgb(var(--muted))] mt-2 leading-relaxed">
              The starting $1,000,000 Fully Diluted Valuation is a <strong>mathematical pricing configuration</strong>,
              not $1,000,000 of cash in an account. If no one buys a coin, its liquidity
              is zero. Sellers can only withdraw funds that previous buyers deposited.
            </p>
          </div>

          <div className="panel p-6">
            <h3 className="font-pixel text-lg font-bold">Capital Volatility</h3>
            <p className="text-sm text-[rgb(var(--muted))] mt-2 leading-relaxed">
              Meme tokens and launchpad assets are speculative. Prices can fluctuate rapidly.
              Never deposit or trade with funds you cannot afford to lose entirely.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className="pt-8 pb-16 max-w-3xl mx-auto">
        <div className="border-b border-[rgb(var(--line))] pb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[#00C805]" />
            <h1 className="h-display text-4xl font-bold">Network Metrics</h1>
          </div>
          <p className="font-mono text-xs text-[rgb(var(--muted))] mt-1">
            Real-time aggregate Arbitrum network statistics
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="panel p-5">
            <span className="label block">Total Coins Launched</span>
            <span className="font-pixel text-3xl font-bold mt-2 block">{stats.coinsLaunched}</span>
          </div>
          <div className="panel p-5">
            <span className="label block">Total Trading Volume</span>
            <span className="font-pixel text-3xl font-bold mt-2 block">${(stats.totalVolume / 1_000_000).toFixed(2)}M</span>
          </div>
          <div className="panel p-5">
            <span className="label block">Coins Above $1M FDV</span>
            <span className="font-pixel text-3xl font-bold mt-2 block">{stats.coinsAbove1M}</span>
          </div>
          <div className="panel p-5">
            <span className="label block">Multi-Millionaires (&gt; $2M)</span>
            <span className="font-pixel text-3xl font-bold mt-2 block">{stats.multiMillionaires}</span>
          </div>
        </div>
      </div>
    );
  }

  // Docs
  return (
    <div className="pt-8 pb-16 max-w-3xl mx-auto">
      <div className="border-b border-[rgb(var(--line))] pb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-[#00C805]" />
          <h1 className="h-display text-4xl font-bold">Robinhood Web3 Docs</h1>
        </div>
        <p className="font-mono text-xs text-[rgb(var(--muted))] mt-1">
          Smart contracts and Arbitrum integration specifications
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="panel p-6">
          <h3 className="font-pixel text-lg font-bold">Contract Architecture</h3>
          <p className="text-sm text-[rgb(var(--muted))] mt-2 font-mono">
            Network: Arbitrum One (L2 rollup)<br />
            Token Standard: ERC-20 (Fixed 1,000,000,000 supply, 18 decimals)<br />
            Curve Program: Arbitrum Dynamic Bonding Curve (DBC)<br />
            Graduation Target: 35 ETH (~$108.5K real liquidity) migrating to Uniswap v3
          </p>
        </div>

        <div className="panel p-6">
          <h3 className="font-pixel text-lg font-bold">Wallet Connectivity</h3>
          <p className="text-sm text-[rgb(var(--muted))] mt-2">
            Fully compatible with the <strong>Robinhood Wallet</strong> app (iOS/Android/Browser extension),
            MetaMask, Coinbase Wallet, and all EIP-1193 / WalletConnect providers.
          </p>
        </div>
      </div>
    </div>
  );
};
