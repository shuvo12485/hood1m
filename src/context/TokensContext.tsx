import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Contract, ContractFactory, parseEther, formatEther, JsonRpcProvider } from 'ethers';
import { Token, Trade, Comment, PlatformStats } from '../types';
import { INITIAL_STATS } from '../data/mockData';
import {
  calculateBuyTokens,
  calculateSellTokens,
  calculateCirculatingMarketCap,
  calculateFDV,
  calculateTokenPrice,
  GRADUATION_ETH_THRESHOLD,
  INITIAL_FDV,
  INITIAL_PRICE_USD,
  INITIAL_SUPPLY,
} from '../utils/bondingCurve';
import { CURVE_ABI, CURVE_BYTECODE, TOKEN_ABI, TOKEN_BYTECODE } from '../contracts/artifacts';
import { useWallet } from './WalletContext';

interface TokensContextType {
  tokens: Token[];
  trades: Trade[];
  comments: Comment[];
  stats: PlatformStats;
  ethPriceUsd: number;
  isLoading: boolean;
  getToken: (mint: string) => Token | undefined;
  getTradesForToken: (mint: string) => Trade[];
  getCommentsForToken: (mint: string) => Comment[];
  getUserTokenBalance: (mint: string) => Promise<number>;
  getTokenHolders: (mint: string, curveAddress: string, creator: string) => Promise<{
    curveBalance: number;
    creatorBalance: number;
    userBalance: number;
  }>;
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
  }) => Promise<{ token: Token; txHash: string }>;
  executeTrade: (params: {
    mint: string;
    type: 'buy' | 'sell';
    ethAmount: number;
    tokenAmount: number;
    wallet: string;
  }) => Promise<{ success: boolean; message: string; txHash?: string; tokensDiff?: number; ethDiff?: number }>;
  addComment: (mint: string, wallet: string, text: string) => Promise<void>;
  refreshTokens: () => Promise<void>;
}

const TokensContext = createContext<TokensContextType | undefined>(undefined);

export const TokensProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getSigner, fullAddress, connected, isArbitrumSepolia, switchToArbitrumSepolia, refreshBalance } = useWallet();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<PlatformStats>(INITIAL_STATS);
  const [ethPriceUsd, setEthPriceUsd] = useState<number>(3150);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch real data from server
  const refreshTokens = useCallback(async () => {
    try {
      const [tokensRes, tradesRes, priceRes, commentsRes, statsRes] = await Promise.all([
        fetch('/api/tokens').catch(() => null),
        fetch('/api/trades').catch(() => null),
        fetch('/api/eth-price').catch(() => null),
        fetch('/api/comments').catch(() => null),
        fetch('/api/stats').catch(() => null),
      ]);

      if (tokensRes && tokensRes.ok) {
        const liveTokens: Token[] = await tokensRes.json();
        if (Array.isArray(liveTokens)) {
          setTokens(liveTokens);
        }
      }

      if (tradesRes && tradesRes.ok) {
        const liveTrades: Trade[] = await tradesRes.json();
        if (Array.isArray(liveTrades)) {
          setTrades(liveTrades);
        }
      }

      if (priceRes && priceRes.ok) {
        const pData = await priceRes.json();
        if (pData?.ethPriceUsd) {
          setEthPriceUsd(pData.ethPriceUsd);
        }
      }

      if (commentsRes && commentsRes.ok) {
        const liveComments: Comment[] = await commentsRes.json();
        if (Array.isArray(liveComments)) {
          setComments(liveComments);
        }
      }

      if (statsRes && statsRes.ok) {
        const sData = await statsRes.json();
        if (sData) {
          setStats(sData);
        }
      }
    } catch (err) {
      console.warn('Backend sync error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTokens();
    const interval = setInterval(refreshTokens, 6000);
    return () => clearInterval(interval);
  }, [refreshTokens]);

  const getToken = (mint: string) => {
    return tokens.find(t => t.mint.toLowerCase() === mint.toLowerCase());
  };

  const getTradesForToken = (mint: string) => {
    return trades.filter(t => t.mint.toLowerCase() === mint.toLowerCase());
  };

  const getCommentsForToken = (mint: string) => {
    return comments.filter(c => c.mint.toLowerCase() === mint.toLowerCase());
  };

  /**
   * Query real on-chain token balance from Arbitrum Sepolia
   */
  const getUserTokenBalance = async (mint: string): Promise<number> => {
    if (!fullAddress || !mint) return 0;
    try {
      const provider = new JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
      const tokenContract = new Contract(mint, TOKEN_ABI, provider);
      const balWei = await tokenContract.balanceOf(fullAddress);
      return parseFloat(formatEther(balWei));
    } catch (err) {
      console.warn('Failed to fetch on-chain token balance:', err);
      return 0;
    }
  };

  /**
   * Query real on-chain holder distribution from Arbitrum Sepolia
   */
  const getTokenHolders = async (mint: string, curveAddress: string, creator: string) => {
    try {
      const provider = new JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
      const tokenContract = new Contract(mint, TOKEN_ABI, provider);
      const [curveBalWei, creatorBalWei, userBalWei] = await Promise.all([
        curveAddress ? tokenContract.balanceOf(curveAddress).catch(() => BigInt(0)) : Promise.resolve(BigInt(0)),
        creator ? tokenContract.balanceOf(creator).catch(() => BigInt(0)) : Promise.resolve(BigInt(0)),
        fullAddress ? tokenContract.balanceOf(fullAddress).catch(() => BigInt(0)) : Promise.resolve(BigInt(0)),
      ]);
      return {
        curveBalance: parseFloat(formatEther(curveBalWei)),
        creatorBalance: parseFloat(formatEther(creatorBalWei)),
        userBalance: parseFloat(formatEther(userBalWei)),
      };
    } catch {
      return { curveBalance: 0, creatorBalance: 0, userBalance: 0 };
    }
  };

  /**
   * Real on-chain token launch on Arbitrum Sepolia.
   * Prompts user wallet to deploy Hood1MBondingCurve & Hood1MToken.
   * Throws if rejected or gas insufficient — NEVER fakes addresses.
   */
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
  }): Promise<{ token: Token; txHash: string }> => {
    if (!connected || !fullAddress) {
      throw new Error('Please connect your MetaMask or Phantom wallet to deploy.');
    }

    if (!isArbitrumSepolia) {
      const switched = await switchToArbitrumSepolia();
      if (!switched) {
        throw new Error('Please switch your wallet network to Arbitrum Sepolia Testnet (Chain ID: 421614).');
      }
    }

    const signer = await getSigner();
    if (!signer) {
      throw new Error('Unable to access wallet signer. Please unlock MetaMask.');
    }

    let mintAddress = '';
    let curveAddress = '';
    let txHash = '';

    try {
      console.log('1/3 Deploying Hood1M Bonding Curve on Arbitrum Sepolia...');
      const curveFactory = new ContractFactory(CURVE_ABI, CURVE_BYTECODE, signer);
      const curveContract = await curveFactory.deploy(fullAddress);
      await curveContract.waitForDeployment();
      curveAddress = await curveContract.getAddress();
      console.log('Curve deployed at:', curveAddress);

      console.log('2/3 Deploying Hood1M ERC-20 Token on Arbitrum Sepolia...');
      const tokenFactory = new ContractFactory(TOKEN_ABI, TOKEN_BYTECODE, signer);
      const tokenContract = await tokenFactory.deploy(
        data.name,
        data.symbol.toUpperCase(),
        data.description,
        data.image,
        fullAddress,
        curveAddress
      );
      await tokenContract.waitForDeployment();
      mintAddress = await tokenContract.getAddress();
      const deployTx = tokenContract.deploymentTransaction();
      txHash = deployTx?.hash || '';
      console.log('Token deployed at:', mintAddress, 'txHash:', txHash);

      console.log('3/3 Configuring bonding curve...');
      const curveWithSigner = new Contract(curveAddress, CURVE_ABI, signer);
      const setTokenTx = await curveWithSigner.setToken(mintAddress);
      await setTokenTx.wait();

      if (data.initialBuyEth && data.initialBuyEth > 0) {
        console.log(`Executing initial buy of ${data.initialBuyEth} ETH...`);
        const buyTx = await curveWithSigner.buy(0, {
          value: parseEther(data.initialBuyEth.toString()),
        });
        const buyReceipt = await buyTx.wait();
        txHash = buyReceipt.hash;
      }
    } catch (err: any) {
      console.error('Real contract deployment failed:', err);
      if (err.code === 'ACTION_REJECTED' || err.message?.includes('user rejected') || err.message?.includes('ACTION_REJECTED')) {
        throw new Error('Transaction was rejected in your wallet.');
      }
      if (err.message?.includes('insufficient funds') || err.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient Arbitrum Sepolia ETH for gas. Please claim free ETH from the testnet faucet.');
      }
      throw new Error(err.shortMessage || err.message || 'On-chain deployment failed on Arbitrum Sepolia.');
    }

    // Save real on-chain token to server
    const payload = {
      mint: mintAddress,
      curveAddress,
      name: data.name,
      symbol: data.symbol.toUpperCase(),
      description: data.description,
      image: data.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop&q=80',
      creator: fullAddress,
      initialBuyEth: data.initialBuyEth || 0,
      txHash,
      twitter: data.twitter,
      telegram: data.telegram,
      website: data.website,
    };

    const res = await fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'Failed to register token on server');
    }

    const savedToken: Token = await res.json();
    setTokens(prev => [savedToken, ...prev.filter(t => t.mint.toLowerCase() !== savedToken.mint.toLowerCase())]);

    await refreshTokens();
    refreshBalance();

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00C805', '#10110F', '#00995C'],
      });
    } catch {}

    return { token: savedToken, txHash };
  };

  /**
   * Real on-chain trade execution on Arbitrum Sepolia.
   * Buys/sells directly against the real smart contract with real transaction receipt.
   * Throws if rejected or failed — NEVER fakes tx hashes.
   */
  const executeTrade = async ({
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
  }): Promise<{ success: boolean; message: string; txHash?: string; tokensDiff?: number; ethDiff?: number }> => {
    if (!connected || !fullAddress) {
      return { success: false, message: 'Please connect your wallet first.' };
    }

    if (!isArbitrumSepolia) {
      const switched = await switchToArbitrumSepolia();
      if (!switched) {
        return { success: false, message: 'Please switch your wallet to Arbitrum Sepolia Testnet (421614).' };
      }
    }

    const signer = await getSigner();
    if (!signer) {
      return { success: false, message: 'Wallet signer not found. Please unlock MetaMask.' };
    }

    const target = tokens.find(t => t.mint.toLowerCase() === mint.toLowerCase());
    if (!target) return { success: false, message: 'Token not found.' };

    const curveAddress = (target as any).curveAddress || target.mint;
    let txHash = '';

    try {
      const curveContract = new Contract(curveAddress, CURVE_ABI, signer);

      if (type === 'buy') {
        console.log(`Executing real on-chain buy: ${ethAmount} ETH on curve ${curveAddress}`);
        const valueWei = parseEther(ethAmount.toFixed(6));
        const tx = await curveContract.buy(0, { value: valueWei });
        const receipt = await tx.wait();
        txHash = receipt.hash;
        console.log('Real buy transaction mined on Arbitrum Sepolia:', txHash);
      } else {
        console.log(`Executing real on-chain sell: ${tokenAmount} tokens`);
        const tokenContract = new Contract(target.mint, TOKEN_ABI, signer);
        const tokenAmountWei = parseEther(tokenAmount.toString());

        // Check on-chain balance
        const onChainBalance = await tokenContract.balanceOf(fullAddress);
        if (onChainBalance < tokenAmountWei) {
          return {
            success: false,
            message: `Insufficient on-chain token balance. You hold ${parseFloat(formatEther(onChainBalance)).toLocaleString()} ${target.symbol}.`,
          };
        }

        // Check allowance
        const allowance = await tokenContract.allowance(fullAddress, curveAddress);
        if (allowance < tokenAmountWei) {
          console.log('Approving tokens for bonding curve...');
          const approveTx = await tokenContract.approve(curveAddress, tokenAmountWei);
          await approveTx.wait();
        }

        const tx = await curveContract.sell(tokenAmountWei, 0);
        const receipt = await tx.wait();
        txHash = receipt.hash;
        console.log('Real sell transaction mined on Arbitrum Sepolia:', txHash);
      }
    } catch (err: any) {
      console.error('On-chain trade failed:', err);
      if (err.code === 'ACTION_REJECTED' || err.message?.includes('user rejected') || err.message?.includes('ACTION_REJECTED')) {
        return { success: false, message: 'Transaction rejected in wallet.' };
      }
      if (err.message?.includes('insufficient funds') || err.code === 'INSUFFICIENT_FUNDS') {
        return { success: false, message: 'Insufficient ETH for transaction + gas. Get free testnet ETH from the faucet.' };
      }
      return {
        success: false,
        message: err.shortMessage || err.message || 'On-chain trade failed on Arbitrum Sepolia.',
      };
    }

    // Calculations
    let newPrice = target.price;
    let tokensDiff = 0;
    let ethDiff = 0;

    if (type === 'buy') {
      const calc = calculateBuyTokens(ethAmount, target.ethReserve);
      newPrice = calc.newPrice;
      tokensDiff = calc.tokensReceived;
      ethDiff = -ethAmount;
    } else {
      const calc = calculateSellTokens(tokenAmount, target.ethReserve);
      newPrice = calc.newPrice;
      tokensDiff = -tokenAmount;
      ethDiff = calc.ethReceived;
    }

    // Record verified on-chain trade on backend
    try {
      await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mint: target.mint,
          type,
          ethAmount: type === 'buy' ? ethAmount : Math.abs(ethDiff),
          tokenAmount: Math.abs(tokensDiff),
          priceUsd: newPrice,
          wallet: fullAddress,
          txHash,
        }),
      });
    } catch (recordErr) {
      console.warn('Failed to record trade to backend:', recordErr);
    }

    await refreshTokens();
    refreshBalance();

    return {
      success: true,
      message: `Order filled on Arbitrum Sepolia!`,
      txHash,
      tokensDiff,
      ethDiff,
    };
  };

  const addComment = async (mint: string, wallet: string, text: string) => {
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mint, wallet, text }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments(prev => [comment, ...prev]);
        return;
      }
    } catch {}

    const localComment: Comment = {
      id: `c-${Date.now()}`,
      mint,
      wallet,
      text,
      timestamp: Date.now(),
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${wallet}`,
    };
    setComments(prev => [localComment, ...prev]);
  };

  return (
    <TokensContext.Provider
      value={{
        tokens,
        trades,
        comments,
        stats,
        ethPriceUsd,
        isLoading,
        getToken,
        getTradesForToken,
        getCommentsForToken,
        getUserTokenBalance,
        getTokenHolders,
        createToken,
        executeTrade,
        addComment,
        refreshTokens,
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
