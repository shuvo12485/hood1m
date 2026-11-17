import React from 'react';
import { HelpCircle } from 'lucide-react';

interface HowItWorksPageProps {
  navigate: (path: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ navigate }) => {
  return (
    <div className="pt-8 pb-16">
      <div className="mx-auto max-w-3xl">
        <div className="border-b border-[rgb(var(--line))] pb-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-[#00C805]" />
            <h1 className="h-display text-4xl font-bold">How it works</h1>
          </div>
          <p className="mt-3 text-base text-[rgb(var(--muted))] leading-relaxed">
            Every Hood1M token starts at a configured $1,000,000 fully diluted valuation (FDV)
            on Arbitrum L2 without anyone depositing $1,000,000 upfront. Here is exactly how.
          </p>
        </div>

        <div className="mt-8 space-y-8">
          {/* Step 1 */}
          <section className="panel p-6">
            <h2 className="font-pixel text-xl font-bold text-[rgb(var(--ink))]">
              1. A starting price, not an upfront deposit
            </h2>
            <p className="mt-3 text-sm text-[rgb(var(--muted))] leading-relaxed">
              Each coin has a fixed supply of <strong>1,000,000,000 ERC-20 tokens</strong>. The launch sets
              its initial trading price to <strong>$0.001</strong>, so FDV = 1,000,000,000 × $0.001 ={' '}
              <strong>$1,000,000</strong>. The valuation is priced against live USD and ETH. No creator or trader has to deposit $1M in cash.
            </p>
          </section>

          {/* Step 2 */}
          <section className="panel p-6">
            <h2 className="font-pixel text-xl font-bold text-[rgb(var(--ink))]">
              2. Dynamic Bonding Curve on Arbitrum L2
            </h2>
            <p className="mt-3 text-sm text-[rgb(var(--muted))] leading-relaxed">
              Trading runs on an audited <strong>Dynamic Bonding Curve (DBC)</strong> smart contract deployed on{' '}
              <strong>Arbitrum</strong> (the default L2 network powering Robinhood Wallet swaps).
              The curve is calibrated so that{' '}
              <strong>approximately 5 ETH of buying moves a coin from $1M to $2M FDV</strong>.
            </p>
            <p className="mt-2 font-mono text-xs text-[rgb(var(--muted))]">
              Simulated with precise integer math at a 1% liquidity fee. Zero platform commission.
            </p>
          </section>

          {/* Step 3 */}
          <section className="panel p-6">
            <h2 className="font-pixel text-xl font-bold text-[rgb(var(--ink))]">
              3. Retail Buying and Selling
            </h2>
            <p className="mt-3 text-sm text-[rgb(var(--muted))] leading-relaxed">
              Traders can buy with dollars (USD) or ETH directly from their Robinhood Wallet.
              A buy sends liquidity into the curve and distributes tokens; the price rises. A sell returns tokens
              and receives ETH/USD back along the exact same curve. Sellers can only withdraw funds that buyers actually deposited.
            </p>
          </section>

          {/* Step 4 */}
          <section className="panel p-6">
            <h2 className="font-pixel text-xl font-bold text-[rgb(var(--ink))]">
              4. Graduation to Uniswap v3 Pool
            </h2>
            <p className="mt-3 text-sm text-[rgb(var(--muted))] leading-relaxed">
              When <strong>35 ETH</strong> (~$108,500 real liquidity) is deposited into the curve (hitting{' '}
              <strong>$11.4M FDV</strong>), the protocol automatically migrates all liquidity to a permanent{' '}
              <strong>Uniswap v3 pool</strong> on Arbitrum. <strong>100% of that LP is permanently locked and unruggable</strong>.
              All unsold bonding tokens are sent to a burn address (0x000...dead).
            </p>
          </section>

          {/* Step 5 */}
          <section className="panel p-6">
            <h2 className="font-pixel text-xl font-bold text-[rgb(var(--ink))]">
              5. FDV vs Circulating Market Cap
            </h2>
            <p className="mt-3 text-sm text-[rgb(var(--muted))] leading-relaxed">
              FDV counts all 1,000,000,000 tokens at the latest transaction price. Circulating market cap counts
              only tokens that have entered active circulation outside the bonding curve. We display both transparently side-by-side.
            </p>
          </section>

          {/* Step 6 */}
          <section className="panel p-6">
            <h2 className="font-pixel text-xl font-bold text-[rgb(var(--ink))]">
              6. What you need to launch
            </h2>
            <p className="mt-3 text-sm text-[rgb(var(--muted))] leading-relaxed">
              A <strong>Robinhood Wallet</strong> (or any EVM wallet like MetaMask) and about{' '}
              <strong>0.005 ETH</strong> for Arbitrum contract deployment gas. Zero platform fees.
            </p>

            <button
              onClick={() => navigate('/launch')}
              className="btn-dark mt-5"
            >
              Launch your token now →
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
