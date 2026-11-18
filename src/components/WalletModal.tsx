import React from 'react';
import { useWallet } from '../context/WalletContext';
import { X, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

export const WalletModal: React.FC = () => {
  const {
    isModalOpen,
    closeWalletModal,
    connectMetaMask,
    connectPhantom,
    isConnecting,
    error,
  } = useWallet();

  if (!isModalOpen) return null;

  const hasMetaMask = typeof window !== 'undefined' && Boolean((window as any).ethereum);
  const hasPhantom =
    typeof window !== 'undefined' &&
    Boolean((window as any).phantom?.ethereum || (window as any).ethereum?.isPhantom);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="panel w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgb(var(--line))] pb-4">
          <div>
            <h3 className="font-pixel text-xl font-bold leading-tight text-[rgb(var(--ink))]">
              Connect a Wallet
            </h3>
            <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
              Choose how you want to connect
            </p>
          </div>
          <button
            onClick={closeWalletModal}
            className="rounded-lg p-1.5 text-[rgb(var(--muted))] hover:bg-black/5 hover:text-[rgb(var(--ink))] transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[rgb(var(--down))]/30 bg-[rgb(var(--down))]/10 p-3 font-mono text-xs text-[rgb(var(--down))]">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Wallet Options List */}
        <div className="mt-5 space-y-3">
          {/* 1. MetaMask */}
          <div
            onClick={() => {
              if (hasMetaMask && !isConnecting) connectMetaMask();
            }}
            className={`group flex items-center justify-between rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--card))] p-4 transition ${
              hasMetaMask
                ? 'cursor-pointer hover:border-[rgb(var(--ink))] hover:bg-[rgb(var(--raised))]/50 hover:shadow-sm'
                : 'opacity-90'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-2 border border-[rgb(var(--line))] shadow-xs">
                <img
                  src="/metamask.svg"
                  alt="MetaMask"
                  className="h-full w-full object-contain transition duration-200 group-hover:scale-105"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-base font-bold text-[rgb(var(--ink))]">
                    MetaMask
                  </span>
                  {hasMetaMask && (
                    <span className="rounded-full bg-[#00C805]/15 px-2 py-0.5 font-mono text-[10px] font-bold text-[#00C805]">
                      Installed
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs text-[rgb(var(--muted))] mt-0.5">
                  Ethereum & Arbitrum
                </p>
              </div>
            </div>

            {hasMetaMask ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  connectMetaMask();
                }}
                disabled={isConnecting}
                className="btn-dark px-4 py-2 text-xs font-bold"
              >
                {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Connect'}
              </button>
            ) : (
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="btn-light px-3.5 py-1.5 text-xs font-mono flex items-center gap-1.5"
              >
                Install <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* 2. Phantom */}
          <div
            onClick={() => {
              if (hasPhantom && !isConnecting) connectPhantom();
            }}
            className={`group flex items-center justify-between rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--card))] p-4 transition ${
              hasPhantom
                ? 'cursor-pointer hover:border-[rgb(var(--ink))] hover:bg-[rgb(var(--raised))]/50 hover:shadow-sm'
                : 'opacity-90'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-xs border border-[rgb(var(--line))]">
                <img
                  src="/phantom.svg"
                  alt="Phantom"
                  className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-base font-bold text-[rgb(var(--ink))]">
                    Phantom
                  </span>
                  {hasPhantom && (
                    <span className="rounded-full bg-[#00C805]/15 px-2 py-0.5 font-mono text-[10px] font-bold text-[#00C805]">
                      Installed
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs text-[rgb(var(--muted))] mt-0.5">
                  Multi-chain wallet
                </p>
              </div>
            </div>

            {hasPhantom ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  connectPhantom();
                }}
                disabled={isConnecting}
                className="btn-dark px-4 py-2 text-xs font-bold"
              >
                {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Connect'}
              </button>
            ) : (
              <a
                href="https://phantom.app/download"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="btn-light px-3.5 py-1.5 text-xs font-mono flex items-center gap-1.5"
              >
                Install <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Network & Protocol Notice */}
        <div className="mt-5 rounded-xl border border-[#00C805]/30 bg-[#00C805]/5 p-3.5 font-mono text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#00C805]">
            <span className="h-2 w-2 rounded-full bg-[#00C805] animate-pulse"></span>
            Arbitrum One Mainnet · Uniswap v4
          </div>
          <p className="mt-1 text-[rgb(var(--muted))] leading-relaxed text-[11px]">
            Hood1M connects directly to Arbitrum One Mainnet (Chain ID: 42161) — the primary native L2 network of the Robinhood Web3 Wallet. All tokens migrate automatically into the canonical Uniswap v4 Singleton PoolManager.
          </p>
          <div className="mt-2.5 pt-2 border-t border-[rgb(var(--line))] flex justify-between items-center text-[11px]">
            <span className="text-[rgb(var(--muted))]">Arbitrum One Explorer</span>
            <a
              href="https://arbiscan.io"
              target="_blank"
              rel="noreferrer"
              className="text-[#00C805] font-bold hover:underline inline-flex items-center gap-1"
            >
              Arbiscan ↗ <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 border-t border-[rgb(var(--line))] pt-3 text-center">
          <p className="font-mono text-[11px] text-[rgb(var(--muted))]">
            By connecting a wallet, you agree to the Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};
