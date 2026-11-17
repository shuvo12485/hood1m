import React from 'react';
import { useWallet } from '../context/WalletContext';
import { useTokens } from '../context/TokensContext';
import { LayoutDashboard, Wallet, ArrowUpRight } from 'lucide-react';
import { ETH_PRICE_USD } from '../utils/bondingCurve';

interface DashboardPageProps {
  navigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { connected, publicKey, balanceEth, balanceUsd, userTokens, openWalletModal } = useWallet();
  const { tokens } = useTokens();

  if (!connected || !publicKey) {
    return (
      <div className="pt-16 pb-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-[#00C805]">
          <Wallet className="h-8 w-8" />
        </div>
        <h2 className="font-pixel text-2xl font-bold mt-4">Connect Wallet</h2>
        <p className="mt-2 font-mono text-sm text-[rgb(var(--muted))] max-w-sm mx-auto">
          Connect your Web3 wallet to view your Hood1M portfolio, token holdings, and launched assets.
        </p>
        <button onClick={openWalletModal} className="btn-dark mt-6">
          Connect Wallet →
        </button>
      </div>
    );
  }

  const userHoldings = Object.entries(userTokens)
    .filter(([_, amt]) => amt > 0)
    .map(([mint, amt]) => {
      const token = tokens.find((t) => t.mint.toLowerCase() === mint.toLowerCase());
      const valueUsd = token ? amt * token.price : 0;
      return { mint, amount: amt, token, valueUsd };
    });

  const totalTokensValueUsd = userHoldings.reduce((sum, h) => sum + h.valueUsd, 0);
  const netWorthUsd = totalTokensValueUsd + balanceUsd;

  const userCoins = tokens.filter(
    (t) => t.creator.toLowerCase() === publicKey.toLowerCase()
  );

  return (
    <div className="pt-8 pb-16">
      <div className="border-b border-[rgb(var(--line))] pb-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-[#00C805]" />
          <h1 className="h-display text-4xl font-bold">Robinhood Portfolio</h1>
        </div>
        <p className="font-mono text-xs text-[rgb(var(--muted))] mt-1">
          Account: {publicKey} · Network: Arbitrum One L2
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="panel p-5">
          <span className="label block">Total Portfolio Value</span>
          <div className="mt-2 font-pixel text-3xl font-bold text-[rgb(var(--ink))]">
            ${netWorthUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="mt-1 block font-mono text-xs text-[rgb(var(--muted))]">
            Buying Power + Token Equity
          </span>
        </div>

        <div className="panel p-5">
          <span className="label block">Robinhood Buying Power</span>
          <div className="mt-2 font-pixel text-3xl font-bold text-[#00C805]">
            ${balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="mt-1 block font-mono text-xs text-[rgb(var(--muted))]">
            {balanceEth.toFixed(3)} ETH (@ ${ETH_PRICE_USD}/ETH)
          </span>
        </div>

        <div className="panel p-5">
          <span className="label block">Assets Created</span>
          <div className="mt-2 font-pixel text-3xl font-bold text-[rgb(var(--ink))]">
            {userCoins.length}
          </div>
          <span className="mt-1 block font-mono text-xs text-[rgb(var(--muted))]">
            Arbitrum L2 deployments
          </span>
        </div>
      </div>

      {/* Token Holdings Table */}
      <div className="mt-10">
        <h2 className="font-pixel text-xl font-bold mb-4">Your Positions</h2>
        {userHoldings.length === 0 ? (
          <div className="panel p-8 text-center font-mono text-xs text-[rgb(var(--muted))]">
            You don't hold any positions yet. Explore the launchpad to discover or create millionaires!
          </div>
        ) : (
          <div className="panel overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[rgb(var(--line))] bg-[rgb(var(--raised))]/40 text-left">
                  <th className="label px-4 py-3 font-normal">Asset</th>
                  <th className="label px-4 py-3 font-normal">Shares</th>
                  <th className="label px-4 py-3 font-normal">Current Price</th>
                  <th className="label px-4 py-3 font-normal">Market Value</th>
                  <th className="label px-4 py-3 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--line))]/60">
                {userHoldings.map((h) => (
                  <tr key={h.mint} className="hover:bg-[rgb(var(--raised))]/50 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={h.token?.image || ''}
                          alt={h.token?.name || ''}
                          className="h-8 w-8 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-pixel font-bold text-sm text-[rgb(var(--ink))]">
                            {h.token?.name || 'Unknown Token'}
                          </div>
                          <div className="font-mono text-[10px] text-[rgb(var(--muted))]">
                            ${h.token?.symbol || 'TKN'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-sm">
                      {h.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      ${h.token?.price.toFixed(6) || '0.00'}
                    </td>
                    <td className="px-4 py-3.5 font-pixel font-bold text-sm text-[#00C805]">
                      ${h.valueUsd.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/token/${h.mint}`)}
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
        )}
      </div>

      {/* User Created Coins */}
      {userCoins.length > 0 && (
        <div className="mt-10">
          <h2 className="font-pixel text-xl font-bold mb-4">Tokens Deployed by You</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {userCoins.map((t) => (
              <div
                key={t.mint}
                onClick={() => navigate(`/token/${t.mint}`)}
                className="panel p-4 flex items-center justify-between cursor-pointer hover:border-[rgb(var(--ink))] transition"
              >
                <div className="flex items-center gap-3">
                  <img src={t.image} alt={t.name} className="h-10 w-10 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-pixel text-sm font-bold">{t.name}</h4>
                    <p className="font-mono text-xs text-[rgb(var(--muted))]">${t.symbol} · FDV ${(t.fdv / 1_000_000).toFixed(2)}M</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-[rgb(var(--muted))]" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
