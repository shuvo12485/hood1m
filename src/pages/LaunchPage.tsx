import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useTokens } from '../context/TokensContext';
import { calculateBuyTokens, INITIAL_SUPPLY, ETH_PRICE_USD } from '../utils/bondingCurve';
import { Rocket, Upload, Globe, Send } from 'lucide-react';

interface LaunchPageProps {
  navigate: (path: string) => void;
  initialName?: string;
  initialTicker?: string;
}

export const LaunchPage: React.FC<LaunchPageProps> = ({ navigate, initialName = '', initialTicker = '' }) => {
  const { connected, publicKey, balanceEth, balanceUsd, openWalletModal, sendRealTransaction } = useWallet();
  const { createToken } = useTokens();

  const [name, setName] = useState(initialName);
  const [symbol, setSymbol] = useState(initialTicker);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [twitter, setTwitter] = useState('');
  const [telegram, setTelegram] = useState('');
  const [website, setWebsite] = useState('');
  const [initialBuyEth, setInitialBuyEth] = useState<string>('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rentEth = 0.005; // Standard Arbitrum L2 gas for ERC-20 contract creation
  const buyAmount = parseFloat(initialBuyEth) || 0;
  const totalEthRequired = rentEth + buyAmount;

  const buySim = buyAmount > 0 ? calculateBuyTokens(buyAmount, 0) : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) {
      openWalletModal();
      return;
    }

    if (balanceEth < totalEthRequired) {
      alert(`Insufficient balance. You need at least ${totalEthRequired.toFixed(3)} ETH on Arbitrum Sepolia.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createToken({
        name,
        symbol: symbol.toUpperCase(),
        description: description || `${name} launched on Hood1M starting at $1,000,000 FDV.`,
        image: imageUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop&q=80',
        creator: publicKey || '0x71C8...3999',
        initialBuyEth: buyAmount,
        twitter: twitter || undefined,
        telegram: telegram || undefined,
        website: website || undefined,
      });

      navigate(`/token/${res.token.mint}`);
    } catch (err: any) {
      console.error(err);
      alert('Failed to launch token: ' + (err?.message || 'Transaction rejected'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-8 pb-16">
      <div className="mx-auto max-w-3xl">
        <div className="border-b border-[rgb(var(--line))] pb-6">
          <div className="flex items-center gap-2 rounded-full border border-[rgb(var(--line))] bg-[rgb(var(--card))] px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[rgb(var(--muted))] w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00C805] animate-pulse"></span>
            Hood1M · Arbitrum L2 ERC-20
          </div>
          <h1 className="h-display text-4xl font-bold mt-3">Launch on Hood1M</h1>
          <p className="font-mono text-xs text-[rgb(var(--muted))] mt-1">
            Every coin launches at $1,000,000 FDV. Zero upfront liquidity deposit.
          </p>
        </div>

        <form onSubmit={handleLaunch} className="mt-8 space-y-6">
          {/* Basic Details */}
          <div className="panel p-6 space-y-4">
            <h2 className="font-pixel text-lg font-bold">Token Details</h2>

            <div>
              <label className="label block font-semibold" htmlFor="coin-name">
                Token Name *
              </label>
              <input
                id="coin-name"
                className="input mt-1.5"
                placeholder="e.g. Robinhood Bull"
                maxLength={32}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label block font-semibold" htmlFor="coin-symbol">
                Ticker Symbol * (Max 10 chars)
              </label>
              <input
                id="coin-symbol"
                className="input mt-1.5 uppercase"
                placeholder="e.g. RHBULL"
                maxLength={10}
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label block font-semibold" htmlFor="coin-desc">
                Description
              </label>
              <textarea
                id="coin-desc"
                rows={3}
                className="input mt-1.5 py-2"
                placeholder="Explain the narrative, meme, or utility for Robinhood traders…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="label block font-semibold">Coin Icon / Logo *</label>
              <div className="mt-1.5 flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-[rgb(var(--line))] bg-[rgb(var(--raised))]/50 overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <Upload className="h-6 w-6 text-[rgb(var(--muted))]" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[rgb(var(--strong))] file:px-3 file:py-1.5 file:font-pixel file:text-[13px] file:font-bold file:text-[rgb(var(--strong-ink))] hover:file:brightness-110 text-xs font-mono"
                  />
                  <input
                    type="url"
                    placeholder="Or paste an image URL directly"
                    className="input text-xs py-1.5"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="panel p-6 space-y-4">
            <h2 className="font-pixel text-lg font-bold">Socials & Community</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="label flex items-center gap-1 font-semibold">
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> Twitter / X
                </label>
                <input
                  type="url"
                  placeholder="https://x.com/..."
                  className="input mt-1 text-xs"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                />
              </div>
              <div>
                <label className="label flex items-center gap-1 font-semibold">
                  <Send className="h-3.5 w-3.5" /> Telegram
                </label>
                <input
                  type="url"
                  placeholder="https://t.me/..."
                  className="input mt-1 text-xs"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                />
              </div>
              <div>
                <label className="label flex items-center gap-1 font-semibold">
                  <Globe className="h-3.5 w-3.5" /> Website
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="input mt-1 text-xs"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Initial Dev Buy */}
          <div className="panel p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-pixel text-lg font-bold">Initial Dev Buy (Optional)</h2>
                <p className="font-mono text-xs text-[rgb(var(--muted))]">
                  Secure initial supply at the exact starting price ($0.001) in the creation transaction.
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-[rgb(var(--muted))]">
                Buying Power: ${balanceUsd.toFixed(2)} ({balanceEth.toFixed(3)} ETH)
              </span>
            </div>

            <div className="relative max-w-xs">
              <input
                type="number"
                step="0.05"
                min="0"
                max={Math.max(0, balanceEth - rentEth)}
                className="input pr-14 font-mono font-bold text-base"
                placeholder="0.0"
                value={initialBuyEth}
                onChange={(e) => setInitialBuyEth(e.target.value)}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-[rgb(var(--muted))]">
                ETH
              </span>
            </div>

            {buySim && (
              <div className="rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--raised))]/50 p-3 font-mono text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--muted))]">Tokens you will receive:</span>
                  <span className="font-bold text-[#00C805]">
                    {buySim.tokensReceived.toLocaleString()} {symbol || 'TOKENS'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--muted))]">Supply ownership:</span>
                  <span className="font-bold">
                    {((buySim.tokensReceived / INITIAL_SUPPLY) * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--muted))]">Immediate post-buy FDV:</span>
                  <span className="font-bold">${(buySim.newFdv / 1_000_000).toFixed(2)}M</span>
                </div>
              </div>
            )}
          </div>

          {/* Technical Simulation Breakdown */}
          <div className="panel-dark p-6 space-y-4">
            <h2 className="font-pixel text-lg font-bold text-[rgb(var(--strong-ink))]">
              Robinhood Web3 Specifications
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-[rgb(var(--muted))]">STARTING FDV</div>
                <div className="text-base font-bold text-[#00C805] mt-1">$1,000,000</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-[rgb(var(--muted))]">SUPPLY (ERC-20)</div>
                <div className="text-base font-bold mt-1">1,000,000,000</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-[rgb(var(--muted))]">START PRICE</div>
                <div className="text-base font-bold mt-1">$0.00100</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-[rgb(var(--muted))]">UNISWAP v3 TARGET</div>
                <div className="text-base font-bold mt-1">35 ETH (~$108.5K)</div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 flex flex-wrap items-center justify-between text-xs font-mono">
              <div className="text-[rgb(var(--muted))]">
                Arbitrum Gas & Contract Deployment: <span className="text-white font-bold">~{rentEth} ETH</span>
              </div>
              <div className="text-white font-bold">
                Total Required: <span className="text-[#00C805]">{totalEthRequired.toFixed(3)} ETH (~${(totalEthRequired * ETH_PRICE_USD).toFixed(0)})</span>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div>
            {!connected ? (
              <button
                type="button"
                onClick={openWalletModal}
                className="btn-dark w-full py-4 text-base justify-center shadow-lg"
              >
                Connect Robinhood Wallet to Launch
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-dark w-full py-4 text-base justify-center shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 animate-spin" /> Deploying to Arbitrum L2…
                  </span>
                ) : (
                  <span>Launch at $1,000,000 FDV →</span>
                )}
              </button>
            )}
            <p className="text-center font-mono text-[11px] text-[rgb(var(--muted))] mt-3">
              Your token will be deployed as an ERC-20 on Arbitrum with full self-custody and automated Uniswap v3 graduation.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
