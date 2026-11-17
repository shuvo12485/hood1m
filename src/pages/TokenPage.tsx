import React, { useState } from 'react';
import { useTokens } from '../context/TokensContext';
import { useWallet } from '../context/WalletContext';
import { PriceChart } from '../components/PriceChart';
import {
  calculateBuyTokens,
  calculateSellTokens,
  GRADUATION_ETH_THRESHOLD,
  INITIAL_SUPPLY,
  ETH_PRICE_USD,
} from '../utils/bondingCurve';
import {
  Copy,
  Check,
  Send,
  Globe,
  Settings,
  MessageSquare,
  Users,
  Activity,
  Award,
} from 'lucide-react';

interface TokenPageProps {
  mint: string;
  navigate: (path: string) => void;
}

export const TokenPage: React.FC<TokenPageProps> = ({ mint, navigate }) => {
  const { getToken, getTradesForToken, getCommentsForToken, executeTrade, addComment, ethPriceUsd } = useTokens();
  const { connected, publicKey, balanceEth, balanceUsd, userTokens, openWalletModal, updateUserTokens } = useWallet();

  const token = getToken(mint);
  const trades = getTradesForToken(mint);
  const comments = getCommentsForToken(mint);

  const [activeTab, setActiveTab] = useState<'trades' | 'holders' | 'comments'>('trades');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [currencyMode, setCurrencyMode] = useState<'usd' | 'eth'>('usd');
  const [tradeInput, setTradeInput] = useState<string>('500'); // default $500
  const [slippage, setSlippage] = useState<number>(1.0);
  const [showSlippage, setShowSlippage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [txHashLink, setTxHashLink] = useState<string | null>(null);
  const [isTrading, setIsTrading] = useState<boolean>(false);

  if (!token) {
    return (
      <div className="pt-16 pb-24 text-center">
        <h2 className="font-pixel text-2xl font-bold">Token Not Found</h2>
        <p className="mt-2 font-mono text-sm text-[rgb(var(--muted))]">
          The requested ERC-20 token address does not exist on this network.
        </p>
        <button onClick={() => navigate('/explore')} className="btn-dark mt-6">
          Back to Explore →
        </button>
      </div>
    );
  }

  const userTokenBalance = userTokens[token.mint] || 0;
  const progressPercent = Math.min(100, Math.round((token.ethReserve / GRADUATION_ETH_THRESHOLD) * 100));

  const parsedInput = parseFloat(tradeInput) || 0;
  const activeEthPrice = ethPriceUsd || ETH_PRICE_USD;
  const ethAmount = currencyMode === 'usd' ? parsedInput / activeEthPrice : parsedInput;

  const buySim = tradeType === 'buy' && ethAmount > 0 ? calculateBuyTokens(ethAmount, token.ethReserve) : null;
  const sellSim = tradeType === 'sell' && parsedInput > 0 ? calculateSellTokens(parsedInput, token.ethReserve) : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(token.mint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) {
      openWalletModal();
      return;
    }

    if (parsedInput <= 0) {
      setFeedback({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setIsTrading(true);
    setFeedback(null);
    setTxHashLink(null);

    try {
      if (tradeType === 'buy') {
        if (balanceEth < ethAmount) {
          setFeedback({ type: 'error', text: `Insufficient buying power (Available: ${balanceEth.toFixed(4)} ETH)` });
          setIsTrading(false);
          return;
        }

        const res = await executeTrade({
          mint: token.mint,
          type: 'buy',
          ethAmount,
          tokenAmount: buySim?.tokensReceived || 0,
          wallet: publicKey || '0x71C8...3999',
        });

        if (res.success) {
          setFeedback({
            type: 'success',
            text: `Order filled on Arbitrum Sepolia! Received ${res.tokensDiff ? res.tokensDiff.toLocaleString() : ''} ${token.symbol}.`,
          });
          if (res.txHash) setTxHashLink(res.txHash);
          setTradeInput('');
        } else {
          setFeedback({ type: 'error', text: res.message });
        }
      } else {
        if (userTokenBalance < parsedInput) {
          setFeedback({
            type: 'error',
            text: `Insufficient ${token.symbol} balance (You own ${userTokenBalance.toLocaleString()})`,
          });
          setIsTrading(false);
          return;
        }

        const res = await executeTrade({
          mint: token.mint,
          type: 'sell',
          ethAmount: sellSim?.ethReceived || 0,
          tokenAmount: parsedInput,
          wallet: publicKey || '0x71C8...3999',
        });

        if (res.success) {
          setFeedback({
            type: 'success',
            text: `Sold ${parsedInput.toLocaleString()} ${token.symbol} on Arbitrum Sepolia!`,
          });
          if (res.txHash) setTxHashLink(res.txHash);
          setTradeInput('');
        } else {
          setFeedback({ type: 'error', text: res.message });
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Transaction failed' });
    } finally {
      setIsTrading(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(token.mint, publicKey || '0x71C8...3999', commentInput.trim());
    setCommentInput('');
  };

  const formatUsd = (num: number) => {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="pt-8 pb-16">
      {/* Top Banner / Token Info */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[rgb(var(--line))] pb-6">
        <div className="flex items-center gap-4">
          <img
            src={token.image}
            alt={token.name}
            className="h-16 w-16 rounded-2xl object-cover border-2 border-[rgb(var(--line))] shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-pixel text-2xl font-bold sm:text-3xl text-[rgb(var(--ink))]">
                {token.name}
              </h1>
              <span className="font-mono text-sm font-bold text-[rgb(var(--muted))]">
                ${token.symbol}
              </span>
              {token.graduated ? (
                <span className="rounded-full bg-black px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
                  UNISWAP v3 GRADUATED
                </span>
              ) : (
                <span className="rounded-full border border-[#00C805] bg-[#00C805]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#00C805]">
                  HOOD1M CURVE
                </span>
              )}
            </div>

            {/* Contract and Links */}
            <div className="mt-1.5 flex flex-wrap items-center gap-3 font-mono text-xs text-[rgb(var(--muted))]">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-[rgb(var(--ink))] transition"
                title="Copy ERC-20 Address"
              >
                <span>{token.mint.slice(0, 6)}...{token.mint.slice(-4)}</span>
                {copied ? <Check className="h-3.5 w-3.5 text-[#00C805]" /> : <Copy className="h-3.5 w-3.5" />}
              </button>

              <span>· Creator: {token.creator}</span>
              <span>· Network: Arbitrum L2</span>

              {token.twitter && (
                <a href={token.twitter} target="_blank" rel="noreferrer" className="hover:text-[#00C805]">
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
              {token.telegram && (
                <a href={token.telegram} target="_blank" rel="noreferrer" className="hover:text-[#00C805]">
                  <Send className="h-3.5 w-3.5" />
                </a>
              )}
              {token.website && (
                <a href={token.website} target="_blank" rel="noreferrer" className="hover:text-[#00C805]">
                  <Globe className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Price & FDV Header Highlight */}
        <div className="text-right">
          <div className="font-pixel text-2xl font-bold sm:text-3xl text-[rgb(var(--ink))]">
            {formatUsd(token.fdv)}
          </div>
          <div className="mt-0.5 flex items-center justify-end gap-2 font-mono text-xs">
            <span className="text-[rgb(var(--muted))]">
              ${token.price.toFixed(6)} ({(token.price / ETH_PRICE_USD).toFixed(7)} ETH)
            </span>
            <span
              className={`font-bold ${
                token.change24h >= 0 ? 'text-[#00C805]' : 'text-[rgb(var(--down))]'
              }`}
            >
              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Graduation Progress Banner */}
      <div className="mt-6 panel p-4 bg-[rgb(var(--card))]">
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-[#00C805]" />
            <span className="font-bold text-[rgb(var(--ink))]">
              Uniswap v3 Liquidity Migration:
            </span>
            <span className="text-[rgb(var(--muted))]">
              {token.ethReserve.toFixed(2)} / {GRADUATION_ETH_THRESHOLD} ETH ({progressPercent}%)
            </span>
          </div>
          <span className="text-[rgb(var(--muted))]">
            Target Graduation: <span className="text-[rgb(var(--ink))] font-bold">~$11.4M FDV (35 ETH)</span>
          </span>
        </div>

        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[rgb(var(--raised))]">
          <div
            className={`h-full transition-all duration-500 ${
              token.graduated ? 'bg-[rgb(var(--strong))]' : 'bg-[#00C805]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-2 flex justify-between font-mono text-[10px] text-[rgb(var(--muted))]">
          <span>Start: $1,000,000</span>
          <span>$2M (5 ETH)</span>
          <span>$5M (15 ETH)</span>
          <span>$10M (30 ETH)</span>
          <span className="text-[#00C805] font-bold">Graduate: $11.4M (35 ETH)</span>
        </div>
      </div>

      {/* Main Grid: Chart & Terminal */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column */}
        <div className="space-y-6">
          <PriceChart token={token} />

          {/* Description & Overview */}
          <div className="panel p-5">
            <h3 className="font-pixel text-base font-bold">About {token.name}</h3>
            <p className="mt-2 text-sm text-[rgb(var(--muted))] leading-relaxed">
              {token.description}
            </p>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[rgb(var(--line))] pt-4 font-mono text-xs">
              <div>
                <span className="text-[rgb(var(--muted))] block">Circ. Market Cap</span>
                <span className="font-bold mt-0.5 block">{formatUsd(token.circulatingMarketCap)}</span>
              </div>
              <div>
                <span className="text-[rgb(var(--muted))] block">24h Volume</span>
                <span className="font-bold mt-0.5 block">{formatUsd(token.volume24h)}</span>
              </div>
              <div>
                <span className="text-[rgb(var(--muted))] block">Curve Liquidity</span>
                <span className="font-bold mt-0.5 block">{token.ethReserve.toFixed(2)} ETH (~${(token.ethReserve * ETH_PRICE_USD).toLocaleString()})</span>
              </div>
              <div>
                <span className="text-[rgb(var(--muted))] block">Holders</span>
                <span className="font-bold mt-0.5 block">{token.holders.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Bottom Tabs: Trades, Holders, Comments */}
          <div className="panel p-5">
            <div className="flex border-b border-[rgb(var(--line))] pb-3 gap-2">
              <button
                onClick={() => setActiveTab('trades')}
                className={`flex items-center gap-1.5 ${activeTab === 'trades' ? 'tab-on' : 'tab'}`}
              >
                <Activity className="h-3.5 w-3.5" /> Trades ({trades.length})
              </button>
              <button
                onClick={() => setActiveTab('holders')}
                className={`flex items-center gap-1.5 ${activeTab === 'holders' ? 'tab-on' : 'tab'}`}
              >
                <Users className="h-3.5 w-3.5" /> Holders
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex items-center gap-1.5 ${activeTab === 'comments' ? 'tab-on' : 'tab'}`}
              >
                <MessageSquare className="h-3.5 w-3.5" /> Chat ({comments.length})
              </button>
            </div>

            <div className="mt-4">
              {activeTab === 'trades' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[rgb(var(--line))] text-left text-[rgb(var(--muted))]">
                        <th className="pb-2 font-normal">Type</th>
                        <th className="pb-2 font-normal">USD ($)</th>
                        <th className="pb-2 font-normal">ETH</th>
                        <th className="pb-2 font-normal">{token.symbol}</th>
                        <th className="pb-2 font-normal">Price USD</th>
                        <th className="pb-2 font-normal">Trader</th>
                        <th className="pb-2 font-normal">Tx Hash</th>
                        <th className="pb-2 font-normal text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgb(var(--line))]/50">
                      {trades.map((tr) => (
                        <tr key={tr.id} className="hover:bg-[rgb(var(--raised))]/50 transition">
                          <td className="py-2.5">
                            <span
                              className={`rounded px-1.5 py-0.5 font-bold uppercase text-[10px] ${
                                tr.type === 'buy'
                                  ? 'bg-[#00C805]/10 text-[#00C805]'
                                  : 'bg-[rgb(var(--down))]/10 text-[rgb(var(--down))]'
                              }`}
                            >
                              {tr.type}
                            </span>
                          </td>
                          <td className="py-2.5 font-bold">${tr.usdAmount.toFixed(2)}</td>
                          <td className="py-2.5 font-semibold text-[rgb(var(--muted))]">{tr.ethAmount.toFixed(4)}</td>
                          <td className="py-2.5">{tr.tokenAmount.toLocaleString()}</td>
                          <td className="py-2.5">${tr.priceUsd.toFixed(6)}</td>
                          <td className="py-2.5 text-[rgb(var(--muted))]">{tr.wallet}</td>
                          <td className="py-2.5 text-[rgb(var(--muted))]">
                            {tr.txHash ? (
                              <a
                                href={`https://sepolia.arbiscan.io/tx/${tr.txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#00C805] hover:underline"
                              >
                                {tr.txHash.slice(0, 8)}…
                              </a>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-2.5 text-right text-[rgb(var(--muted))]">
                            {Math.round((Date.now() - tr.timestamp) / 1000 / 60)}m ago
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'holders' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between rounded-xl border border-[rgb(var(--line))] p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[rgb(var(--ink))]">1. Robinhood / Uniswap Curve Pool</span>
                      <span className="rounded bg-[#00C805]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#00C805]">
                        LOCKED
                      </span>
                    </div>
                    <span className="font-bold">
                      {((token.tokenReserve / INITIAL_SUPPLY) * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[rgb(var(--line))] p-3">
                    <div className="flex items-center gap-2">
                      <span>2. Creator ({token.creator})</span>
                      <span className="rounded bg-[rgb(var(--raised))] px-1.5 py-0.5 text-[10px] text-[rgb(var(--muted))]">
                        DEV
                      </span>
                    </div>
                    <span className="font-bold">
                      {(100 - (token.tokenReserve / INITIAL_SUPPLY) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div>
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      className="input text-xs"
                      placeholder="Post a message about this token…"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                    />
                    <button type="submit" className="btn-dark px-4 py-1.5 text-xs">
                      Send
                    </button>
                  </form>

                  <div className="mt-4 space-y-3">
                    {comments.length === 0 ? (
                      <p className="font-mono text-xs text-[rgb(var(--muted))] text-center py-4">
                        No messages yet. Be the first to shout out!
                      </p>
                    ) : (
                      comments.map((cm) => (
                        <div key={cm.id} className="flex gap-3 rounded-xl border border-[rgb(var(--line))] p-3">
                          <img src={cm.avatar} alt="Avatar" className="h-8 w-8 rounded-lg bg-[rgb(var(--raised))]" />
                          <div>
                            <div className="flex items-center gap-2 font-mono text-xs">
                              <span className="font-bold text-[rgb(var(--ink))]">{cm.wallet}</span>
                              <span className="text-[10px] text-[rgb(var(--muted))]">
                                {Math.round((Date.now() - cm.timestamp) / 1000 / 60)}m ago
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-[rgb(var(--ink))]">{cm.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Robinhood Order Terminal */}
        <div className="panel p-5 h-fit sticky top-20 shadow-md">
          {/* Buy / Sell Tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--raised))]/50 p-1">
            <button
              onClick={() => {
                setTradeType('buy');
                setTradeInput('500');
                setFeedback(null);
              }}
              className={`rounded-lg py-2 font-pixel text-xs font-bold transition ${
                tradeType === 'buy'
                  ? 'bg-[#00C805] text-white shadow-xs'
                  : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--ink))]'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => {
                setTradeType('sell');
                setTradeInput(userTokenBalance > 0 ? (userTokenBalance / 2).toString() : '10000');
                setFeedback(null);
              }}
              className={`rounded-lg py-2 font-pixel text-xs font-bold transition ${
                tradeType === 'sell'
                  ? 'bg-[rgb(var(--down))] text-white shadow-xs'
                  : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--ink))]'
              }`}
            >
              Sell
            </button>
          </div>

          <form onSubmit={handleTrade} className="mt-5 space-y-4">
            {/* Input Module */}
            <div>
              <div className="flex justify-between font-mono text-xs text-[rgb(var(--muted))] mb-1.5">
                <span>{tradeType === 'buy' ? 'Order Amount' : `Shares to Sell`}</span>
                <span>
                  {tradeType === 'buy'
                    ? `Buying Power: $${balanceUsd.toFixed(2)}`
                    : `Balance: ${userTokenBalance.toLocaleString()}`}
                </span>
              </div>

              {/* Currency toggle for Buy */}
              {tradeType === 'buy' && (
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setCurrencyMode('usd')}
                    className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      currencyMode === 'usd' ? 'bg-black text-white' : 'bg-[rgb(var(--raised))] text-[rgb(var(--muted))]'
                    }`}
                  >
                    Dollars ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrencyMode('eth')}
                    className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      currencyMode === 'eth' ? 'bg-black text-white' : 'bg-[rgb(var(--raised))] text-[rgb(var(--muted))]'
                    }`}
                  >
                    ETH
                  </button>
                </div>
              )}

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  className="input pr-16 font-mono font-bold text-base"
                  placeholder="0.0"
                  value={tradeInput}
                  onChange={(e) => {
                    setTradeInput(e.target.value);
                    setFeedback(null);
                  }}
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-[rgb(var(--muted))]">
                  {tradeType === 'buy' ? (currencyMode === 'usd' ? 'USD' : 'ETH') : token.symbol}
                </span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex gap-1.5">
              {tradeType === 'buy' ? (
                <>
                  {['$100', '$250', '$500', '$1,000'].map((amt) => {
                    const raw = amt.replace('$', '').replace(',', '');
                    return (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => {
                          setCurrencyMode('usd');
                          setTradeInput(raw);
                        }}
                        className="tab flex-1 py-1 text-center font-mono text-[11px]"
                      >
                        {amt}
                      </button>
                    );
                  })}
                </>
              ) : (
                <>
                  {['25%', '50%', '75%', '100%'].map((pct) => (
                    <button
                      type="button"
                      key={pct}
                      onClick={() => {
                        const mult = parseInt(pct) / 100;
                        setTradeInput(Math.floor(userTokenBalance * mult).toString());
                      }}
                      className="tab flex-1 py-1 text-center font-mono text-[11px]"
                    >
                      {pct}
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Estimated Output */}
            <div className="rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--raised))]/40 p-3 font-mono text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[rgb(var(--muted))]">Estimated Shares:</span>
                <span className="font-bold text-[rgb(var(--ink))]">
                  {tradeType === 'buy'
                    ? buySim
                      ? `${buySim.tokensReceived.toLocaleString()} ${token.symbol}`
                      : '0'
                    : sellSim
                    ? `$${sellSim.usdReceived.toFixed(2)} (${sellSim.ethReceived.toFixed(4)} ETH)`
                    : '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--muted))]">Price Impact:</span>
                <span className="font-bold text-[rgb(var(--ink))]">
                  {tradeType === 'buy'
                    ? buySim
                      ? `${buySim.priceImpact.toFixed(2)}%`
                      : '0.00%'
                    : sellSim
                    ? `${sellSim.priceImpact.toFixed(2)}%`
                    : '0.00%'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--muted))]">Trading Commission:</span>
                <span className="text-[#00C805] font-bold">$0.00 (Commission-Free)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--muted))]">Execution Network:</span>
                <span>Arbitrum L2</span>
              </div>
            </div>

            {/* Slippage Settings Toggle */}
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[rgb(var(--muted))]">Slippage Tolerance:</span>
              <button
                type="button"
                onClick={() => setShowSlippage(!showSlippage)}
                className="flex items-center gap-1 font-bold text-[rgb(var(--ink))] hover:text-[#00C805]"
              >
                <span>{slippage}%</span>
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>

            {showSlippage && (
              <div className="flex gap-1.5 pt-1">
                {[0.5, 1.0, 2.5, 5.0].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => {
                      setSlippage(s);
                      setShowSlippage(false);
                    }}
                    className={`flex-1 rounded-md py-1 font-mono text-xs ${
                      slippage === s ? 'tab-on' : 'tab'
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            )}

            {/* Feedback message */}
            {feedback && (
              <div
                className={`rounded-xl p-3 font-mono text-xs ${
                  feedback.type === 'success'
                    ? 'border border-[#00C805] bg-[#00C805]/10 text-[#00C805]'
                    : 'border border-[rgb(var(--down))] bg-[rgb(var(--down))]/10 text-[rgb(var(--down))]'
                }`}
              >
                <div>{feedback.text}</div>
                {txHashLink && (
                  <div className="mt-1.5">
                    <a
                      href={`https://sepolia.arbiscan.io/tx/${txHashLink}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-bold inline-flex items-center gap-1 hover:opacity-80"
                    >
                      View on Arbiscan ({txHashLink.slice(0, 10)}…) ↗
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            {!connected ? (
              <button
                type="button"
                onClick={openWalletModal}
                className="btn-dark w-full py-3 font-bold justify-center"
              >
                Connect Wallet
              </button>
            ) : (
              <button
                type="submit"
                disabled={isTrading}
                className={`w-full py-3 font-pixel text-sm font-bold justify-center rounded-full text-white transition disabled:opacity-50 ${
                  tradeType === 'buy'
                    ? 'bg-[#00C805] hover:brightness-110'
                    : 'bg-[rgb(var(--down))] hover:brightness-110'
                }`}
              >
                {isTrading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Activity className="h-4 w-4 animate-spin" /> Signing on Arbitrum Sepolia…
                  </span>
                ) : (
                  tradeType === 'buy' ? `Execute Buy Order` : `Execute Sell Order`
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
