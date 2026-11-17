import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Token, Trade, Comment, PlatformStats } from '../types';
import { INITIAL_TOKENS, INITIAL_TRADES, INITIAL_COMMENTS, INITIAL_STATS } from '../data/mockData';
import {
  calculateBuyTokens,
  calculateSellTokens,
  calculateCirculatingMarketCap,
  GRADUATION_ETH_THRESHOLD,
  INITIAL_FDV,
  INITIAL_PRICE_USD,
  INITIAL_SUPPLY,
  ETH_PRICE_USD,
} from '../utils/bondingCurve';

interface TokensContextType {
  tokens: Token[];
  trades: Trade[];
  comments: Comment[];
  stats: PlatformStats;
  getToken: (mint: string) => Token | undefined;
  getTradesForToken: (mint: string) => Trade[];
  getCommentsForToken: (mint: string) => Comment[];
  createToken: (data: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    creator: string;
    initialBuyEth?: number;
    twitter?: string;
    telegram?: string;
    website?: string;
  }) => Promise<Token>;
  executeTrade: (params: {
    mint: string;
    type: 'buy' | 'sell';
    ethAmount: number;
    tokenAmount: number;
    wallet: string;
  }) => { success: boolean; message: string; tokensDiff?: number; ethDiff?: number };
  addComment: (mint: string, wallet: string, text: string) => void;
}

const TokensContext = createContext<TokensContextType | undefined>(undefined);

export const TokensProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState<Token[]>(() => {
    try {
      const saved = localStorage.getItem('robinhood_millionaires_tokens');
      return saved ? JSON.parse(saved) : INITIAL_TOKENS;
    } catch {
      return INITIAL_TOKENS;
    }
  });

  const [trades, setTrades] = useState<Trade[]>(() => {
    try {
      const saved = localStorage.getItem('robinhood_millionaires_trades');
      return saved ? JSON.parse(saved) : INITIAL_TRADES;
    } catch {
      return INITIAL_TRADES;
    }
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const saved = localStorage.getItem('robinhood_millionaires_comments');
      return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
    } catch {
      return INITIAL_COMMENTS;
    }
  });

  const [stats, setStats] = useState<PlatformStats>(() => {
    try {
      const saved = localStorage.getItem('robinhood_millionaires_stats');
      return saved ? JSON.parse(saved) : INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  });

  useEffect(() => {
    localStorage.setItem('robinhood_millionaires_tokens', JSON.stringify(tokens));
    localStorage.setItem('robinhood_millionaires_trades', JSON.stringify(trades));
    localStorage.setItem('robinhood_millionaires_comments', JSON.stringify(comments));
    localStorage.setItem('robinhood_millionaires_stats', JSON.stringify(stats));
  }, [tokens, trades, comments, stats]);

  const getToken = (mint: string) => {
    return tokens.find(t => t.mint.toLowerCase() === mint.toLowerCase());
  };

  const getTradesForToken = (mint: string) => {
    return trades.filter(t => t.mint.toLowerCase() === mint.toLowerCase());
  };

  const getCommentsForToken = (mint: string) => {
    return comments.filter(c => c.mint.toLowerCase() === mint.toLowerCase());
  };

  const createToken = async (data: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    creator: string;
    initialBuyEth?: number;
    twitter?: string;
    telegram?: string;
    website?: string;
  }): Promise<Token> => {
    const rawHex = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const mint = `0x${rawHex}`;

    let ethReserve = 0;
    let price = INITIAL_PRICE_USD;
    let fdv = INITIAL_FDV;
    let tokenReserve = INITIAL_SUPPLY;
    let change24h = 0;
    let volume24h = 0;
    let initialDevTokens = 0;

    if (data.initialBuyEth && data.initialBuyEth > 0) {
      const buyCalc = calculateBuyTokens(data.initialBuyEth, 0);
      ethReserve = buyCalc.newEthReserve;
      price = buyCalc.newPrice;
      fdv = buyCalc.newFdv;
      tokenReserve = INITIAL_SUPPLY - buyCalc.tokensReceived;
      volume24h = data.initialBuyEth * ETH_PRICE_USD;
      change24h = buyCalc.priceImpact;
      initialDevTokens = buyCalc.tokensReceived;

      const devTrade: Trade = {
        id: `t-${Date.now()}`,
        mint,
        type: 'buy',
        ethAmount: data.initialBuyEth,
        usdAmount: data.initialBuyEth * ETH_PRICE_USD,
        tokenAmount: initialDevTokens,
        priceUsd: price,
        wallet: data.creator,
        timestamp: Date.now(),
        txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      };
      setTrades(prev => [devTrade, ...prev]);
    }

    const newToken: Token = {
      mint,
      name: data.name,
      symbol: data.symbol.toUpperCase(),
      description: data.description,
      image: data.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&auto=format&fit=crop&q=80',
      creator: data.creator,
      createdAt: Date.now(),
      ethReserve,
      usdReserve: ethReserve * ETH_PRICE_USD,
      price,
      fdv,
      circulatingMarketCap: calculateCirculatingMarketCap(ethReserve),
      tokenReserve,
      volume24h,
      change24h,
      graduated: false,
      holders: data.initialBuyEth && data.initialBuyEth > 0 ? 2 : 1,
      twitter: data.twitter,
      telegram: data.telegram,
      website: data.website,
    };

    setTokens(prev => [newToken, ...prev]);

    setStats(prev => ({
      ...prev,
      coinsLaunched: prev.coinsLaunched + 1,
      totalVolume: prev.totalVolume + volume24h,
      coinsAbove1M: fdv >= 1_000_000 ? prev.coinsAbove1M + 1 : prev.coinsAbove1M,
      multiMillionaires: fdv >= 2_000_000 ? prev.multiMillionaires + 1 : prev.multiMillionaires,
    }));

    try {
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#00C805', '#10110F', '#00995C'],
      });
    } catch {}

    return newToken;
  };

  const executeTrade = ({
    mint,
    type,
    ethAmount,
    tokenAmount,
    wallet,
  }: {
    mint: string;
    type: 'buy' | 'sell';
    ethAmount: number;
    tokenAmount: number;
    wallet: string;
  }) => {
    const target = tokens.find(t => t.mint.toLowerCase() === mint.toLowerCase());
    if (!target) return { success: false, message: 'Token not found' };

    let newEthReserve = target.ethReserve;
    let newPrice = target.price;
    let newFdv = target.fdv;
    let tokensDiff = 0;
    let ethDiff = 0;
    let volumeUsd = 0;

    if (type === 'buy') {
      const calc = calculateBuyTokens(ethAmount, target.ethReserve);
      newEthReserve = calc.newEthReserve;
      newPrice = calc.newPrice;
      newFdv = calc.newFdv;
      tokensDiff = calc.tokensReceived;
      ethDiff = -ethAmount;
      volumeUsd = ethAmount * ETH_PRICE_USD;
    } else {
      const calc = calculateSellTokens(tokenAmount, target.ethReserve);
      newEthReserve = calc.newEthReserve;
      newPrice = calc.newPrice;
      newFdv = calc.newFdv;
      tokensDiff = -tokenAmount;
      ethDiff = calc.ethReceived;
      volumeUsd = calc.ethReceived * ETH_PRICE_USD;
    }

    const isNowGraduated = newEthReserve >= GRADUATION_ETH_THRESHOLD;
    const priceChange = ((newPrice - INITIAL_PRICE_USD) / INITIAL_PRICE_USD) * 100;

    const updatedToken: Token = {
      ...target,
      ethReserve: newEthReserve,
      usdReserve: newEthReserve * ETH_PRICE_USD,
      price: newPrice,
      fdv: newFdv,
      circulatingMarketCap: calculateCirculatingMarketCap(newEthReserve),
      tokenReserve: Math.max(0, target.tokenReserve - tokensDiff),
      volume24h: target.volume24h + volumeUsd,
      change24h: +priceChange.toFixed(2),
      graduated: target.graduated || isNowGraduated,
      holders: target.holders + (type === 'buy' ? 1 : 0),
    };

    setTokens(prev => prev.map(t => (t.mint === target.mint ? updatedToken : t)));

    const newTrade: Trade = {
      id: `t-${Date.now()}`,
      mint: target.mint,
      type,
      ethAmount: type === 'buy' ? ethAmount : Math.abs(ethDiff),
      usdAmount: (type === 'buy' ? ethAmount : Math.abs(ethDiff)) * ETH_PRICE_USD,
      tokenAmount: Math.abs(tokensDiff),
      priceUsd: newPrice,
      wallet,
      timestamp: Date.now(),
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
    };

    setTrades(prev => [newTrade, ...prev]);

    setStats(prev => ({
      ...prev,
      totalVolume: prev.totalVolume + volumeUsd,
      coinsAbove1M: newFdv >= 1_000_000 ? prev.coinsAbove1M : Math.max(0, prev.coinsAbove1M - 1),
      multiMillionaires: newFdv >= 2_000_000 ? prev.multiMillionaires + (target.fdv < 2_000_000 ? 1 : 0) : prev.multiMillionaires,
    }));

    if (isNowGraduated && !target.graduated) {
      try {
        confetti({
          particleCount: 160,
          spread: 110,
          origin: { y: 0.5 },
          colors: ['#00C805', '#FFD700', '#111827'],
        });
      } catch {}
    }

    return {
      success: true,
      message: `Order filled! ${type === 'buy' ? 'Purchased' : 'Sold'} tokens on Robinhood Web3.`,
      tokensDiff,
      ethDiff,
    };
  };

  const addComment = (mint: string, wallet: string, text: string) => {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      mint,
      wallet,
      text,
      timestamp: Date.now(),
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${wallet}`,
    };
    setComments(prev => [newComment, ...prev]);
  };

  return (
    <TokensContext.Provider
      value={{
        tokens,
        trades,
        comments,
        stats,
        getToken,
        getTradesForToken,
        getCommentsForToken,
        createToken,
        executeTrade,
        addComment,
      }}
    >
      {children}
    </TokensContext.Provider>
  );
};

export const useTokens = () => {
  const context = useContext(TokensContext);
  if (!context) {
    throw new Error('useTokens must be used within a TokensProvider');
  }
  return context;
};
