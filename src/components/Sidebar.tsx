import React from 'react';
import { Home, Rocket, Compass, Trophy, Crown, LayoutDashboard, BarChart3, HelpCircle, Terminal } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  currentPath: string;
  navigate: (path: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, navigate, searchQuery, setSearchQuery }) => {
  const { connected, publicKey, balanceEth, balanceUsd, openWalletModal, disconnect } = useWallet();
  const { theme, toggleTheme } = useTheme();

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
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] border-r border-[rgb(var(--line))] bg-[rgb(var(--card))] lg:block">
      <div className="flex h-full flex-col gap-5 overflow-y-auto px-5 py-6">
        {/* Brand Logo - Hood1M */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 text-left transition"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black border border-white/10 shadow-sm transition duration-300 group-hover:-translate-y-0.5">
            <BrandLogo variant="feather-arrow" size={26} />
          </div>
          <span className="leading-none">
            <span className="block font-pixel text-[22px] font-bold tracking-[-0.03em] text-[rgb(var(--ink))]">
              Hood<span className="text-[#00C805]">1M</span>
            </span>
            <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-[#00C805] font-bold">
              $1,000,000 Floor
            </span>
          </span>
        </button>

        {/* Search */}
        <div className="relative">
          <input
            className="input py-2 text-xs"
            placeholder="⌕  Search token, symbol, 0x…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentPath !== '/explore') navigate('/explore');
            }}
          />
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2 font-pixel text-[15px] font-medium transition text-left ${
                  isActive
                    ? 'bg-[rgb(var(--strong))] text-[rgb(var(--strong-ink))] shadow-xs'
                    : 'text-[rgb(var(--ink))]/70 hover:bg-[rgb(var(--ink))]/[0.04] hover:text-[rgb(var(--ink))]'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Start FDV Ticker Card */}
        <div className="rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--card))] p-3">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[rgb(var(--muted))]">
            <span>Start FDV</span>
            <span className="flex items-center gap-1 font-semibold text-[#00C805]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00C805] animate-pulse"></span> live
            </span>
          </div>
          <div className="mt-1 font-pixel text-lg font-bold tracking-tight text-[rgb(var(--ink))]">
            $1,000,000.00
          </div>
          <svg viewBox="0 0 200 40" className="mt-1 h-9 w-full" aria-hidden="true">
            <path d="M0 36h200" stroke="rgb(var(--line))" strokeWidth="1"></path>
            <path
              d="M0 34 22 30 38 31 58 24 74 25 96 17 112 18 134 11 152 12 176 5 200 3"
              fill="none"
              stroke="#00C805"
              strokeWidth="2.0"
              strokeLinejoin="round"
            ></path>
          </svg>
          <div className="mt-1 flex justify-between font-mono text-[10px] text-[rgb(var(--muted))]">
            <span>Arbitrum L2</span>
            <span>Uniswap v3 Pool</span>
          </div>
        </div>

        {/* Wallet Connection / Buying Power */}
        <div className="mt-auto flex flex-col gap-3">
          {/* Theme Mode Toggle (ASCII Terminal / Paper Retro) */}
          <div className="rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--raised))]/40 p-2.5 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[rgb(var(--muted))] flex items-center gap-1">
                <Terminal className="h-3 w-3 text-[#00C805]" />
                Theme
              </span>
              <button
                onClick={toggleTheme}
                className="rounded border border-[#00C805]/30 bg-[#00C805]/10 px-2 py-0.5 text-[10px] font-bold text-[#00C805] hover:bg-[#00C805]/20 cursor-pointer transition"
              >
                {theme === 'fintech-dark'
                  ? '💎 FINTECH DARK'
                  : theme === 'terminal'
                  ? '⚡ ASCII TERMINAL'
                  : '📜 RETRO PAPER'}
              </button>
            </div>
          </div>

          {connected && publicKey ? (
            <div className="rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--raised))]/60 p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[rgb(var(--muted))]">
                Buying Power
              </div>
              <div className="mt-0.5 font-pixel text-base font-bold text-[#00C805]">
                ${balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-[rgb(var(--muted))]">
                <span>{publicKey}</span>
                <span>{balanceEth.toFixed(3)} ETH</span>
              </div>
              <button
                onClick={disconnect}
                className="mt-2.5 w-full rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--card))] py-1 font-mono text-[10px] text-[rgb(var(--muted))] hover:text-[rgb(var(--down))]"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={openWalletModal}
              className="btn-dark whitespace-nowrap w-full text-center"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
