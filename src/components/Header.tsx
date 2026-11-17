import React, { useState } from 'react';
import { Menu, X, Home, Rocket, Compass, Trophy, Crown, LayoutDashboard, BarChart3, HelpCircle } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { connected, publicKey, balanceUsd, openWalletModal } = useWallet();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Launch', path: '/launch', icon: Rocket },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Club', path: '/club', icon: Crown },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Stats', path: '/stats', icon: BarChart3 },
    { name: 'About', path: '/how-it-works', icon: HelpCircle },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-[rgb(var(--line))] bg-[rgb(var(--card))]/95 px-4 backdrop-blur-md lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--line))] text-[rgb(var(--ink))] transition hover:border-[rgb(var(--ink))]"
          aria-label="Open menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-pixel text-lg font-bold"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black border border-white/10 shadow-sm">
            <BrandLogo variant="feather-arrow" size={22} />
          </div>
          <span className="hidden tracking-[-0.03em] min-[400px]:inline text-[rgb(var(--ink))]">
            Hood<span className="text-[#00C805]">1M</span>
          </span>
        </button>

        <div className="ml-auto">
          {connected && publicKey ? (
            <div className="flex items-center gap-2 rounded-full border border-[rgb(var(--line))] bg-[rgb(var(--card))] px-3 py-1 font-mono text-xs">
              <span className="font-semibold">{publicKey}</span>
              <span className="font-bold text-[#00C805]">${balanceUsd.toFixed(0)}</span>
            </div>
          ) : (
            <button
              onClick={openWalletModal}
              className="btn-dark whitespace-nowrap text-xs px-3.5 py-1.5"
            >
              Connect
            </button>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 flex h-full w-[280px] flex-col bg-[rgb(var(--card))] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-6 border-b border-[rgb(var(--line))]">
              <span className="font-pixel text-xl font-bold">Hood<span className="text-[#00C805]">1M</span></span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1 text-[rgb(var(--muted))]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false);
                    }}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 font-pixel text-base font-medium transition text-left ${
                      isActive
                        ? 'bg-[rgb(var(--strong))] text-[rgb(var(--strong-ink))]'
                        : 'text-[rgb(var(--ink))]/70 hover:bg-black/5'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-[rgb(var(--line))] pt-4">
              <div className="font-mono text-xs text-[rgb(var(--muted))] text-center">
                Arbitrum L2 · Uniswap v3 Liquidity
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
