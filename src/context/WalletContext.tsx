import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ETH_PRICE_USD } from '../utils/bondingCurve';

export interface WalletContextType {
  connected: boolean;
  publicKey: string | null;
  fullAddress: string | null;
  balanceEth: number;
  balanceUsd: number;
  chainId: string | null;
  chainName: string;
  walletName: string;
  userTokens: Record<string, number>;
  isModalOpen: boolean;
  isConnecting: boolean;
  error: string | null;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  connectMetaMask: () => Promise<boolean>;
  connectPhantom: () => Promise<boolean>;
  switchChain: (targetChainIdHex: string) => Promise<boolean>;
  sendRealTransaction: (params: { to: string; valueEth: number; data?: string }) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  disconnect: () => void;
  updateUserTokens: (mint: string, deltaTokens: number) => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Known chains
const CHAINS: Record<string, string> = {
  '0x1': 'Ethereum Mainnet',
  '0xa4b1': 'Arbitrum One',
  '0xfa': 'Fantom Opera',
  '0x280': 'Sonic Mainnet',
  '0x2105': 'Base',
  '0x89': 'Polygon',
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [fullAddress, setFullAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string>('MetaMask');
  const [balanceEth, setBalanceEth] = useState<number>(0.0);
  const [chainId, setChainId] = useState<string | null>(null);
  const [chainName, setChainName] = useState<string>('Arbitrum One');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userTokens, setUserTokens] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('robinhood_user_tokens');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const getProvider = (type: 'metamask' | 'phantom') => {
    const win = window as any;
    if (type === 'phantom') {
      return win.phantom?.ethereum || (win.ethereum?.isPhantom ? win.ethereum : null);
    }
    // MetaMask or standard EIP-1193
    if (win.ethereum?.providers) {
      return win.ethereum.providers.find((p: any) => p.isMetaMask && !p.isPhantom) || win.ethereum;
    }
    return win.ethereum;
  };

  const fetchBalance = useCallback(async (address: string, provider: any) => {
    try {
      if (!provider) return;
      const balanceHex = await provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      if (balanceHex) {
        const wei = BigInt(balanceHex);
        const eth = Number(wei) / 1e18;
        setBalanceEth(+eth.toFixed(4));
      }
    } catch (e) {
      console.warn('Failed to fetch real on-chain balance:', e);
    }
  }, []);

  const refreshBalance = async () => {
    if (!fullAddress) return;
    const provider = getProvider(walletName.toLowerCase().includes('phantom') ? 'phantom' : 'metamask');
    await fetchBalance(fullAddress, provider);
  };

  const connectProvider = async (type: 'metamask' | 'phantom', displayName: string) => {
    setIsConnecting(true);
    setError(null);

    const provider = getProvider(type);
    if (!provider) {
      setError(`${displayName} is not installed in your browser. Please install the ${displayName} extension.`);
      setIsConnecting(false);
      return false;
    }

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts selected in wallet.');
      }

      const account = accounts[0];
      setFullAddress(account);
      setPublicKey(account.slice(0, 6) + '...' + account.slice(-4));
      setWalletName(displayName);
      setConnected(true);

      const currentChainId = await provider.request({ method: 'eth_chainId' });
      setChainId(currentChainId);
      setChainName(CHAINS[currentChainId.toLowerCase()] || `Chain ${currentChainId}`);

      await fetchBalance(account, provider);

      provider.on('accountsChanged', (newAccounts: string[]) => {
        if (!newAccounts || newAccounts.length === 0) {
          disconnect();
        } else {
          const acc = newAccounts[0];
          setFullAddress(acc);
          setPublicKey(acc.slice(0, 6) + '...' + acc.slice(-4));
          fetchBalance(acc, provider);
        }
      });

      provider.on('chainChanged', (newChainId: string) => {
        setChainId(newChainId);
        setChainName(CHAINS[newChainId.toLowerCase()] || `Chain ${newChainId}`);
        if (account) fetchBalance(account, provider);
      });

      setIsModalOpen(false);
      setIsConnecting(false);
      return true;
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err?.message || `Failed to connect ${displayName}`);
      setIsConnecting(false);
      return false;
    }
  };

  const connectMetaMask = async () => {
    return connectProvider('metamask', 'MetaMask');
  };

  const connectPhantom = async () => {
    return connectProvider('phantom', 'Phantom');
  };

  const switchChain = async (targetChainIdHex: string) => {
    const provider = getProvider(walletName.toLowerCase().includes('phantom') ? 'phantom' : 'metamask');
    if (!provider) return false;

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainIdHex }],
      });
      return true;
    } catch (switchError: any) {
      console.warn('Chain switch error:', switchError);
      return false;
    }
  };

  const sendRealTransaction = async ({
    to,
    valueEth,
    data = '0x',
  }: {
    to: string;
    valueEth: number;
    data?: string;
  }): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    if (!connected || !fullAddress) {
      return { success: false, error: 'Wallet not connected' };
    }

    const provider = getProvider(walletName.toLowerCase().includes('phantom') ? 'phantom' : 'metamask');
    if (!provider) {
      return { success: false, error: 'Wallet provider not found' };
    }

    try {
      const valueWei = BigInt(Math.floor(valueEth * 1e18));
      const valueHex = '0x' + valueWei.toString(16);

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: fullAddress,
            to,
            value: valueHex,
            data,
          },
        ],
      });

      setTimeout(() => fetchBalance(fullAddress, provider), 2000);
      return { success: true, txHash };
    } catch (err: any) {
      console.error('Real transaction error:', err);
      return { success: false, error: err?.message || 'Transaction rejected by user' };
    }
  };

  const disconnect = () => {
    setConnected(false);
    setPublicKey(null);
    setFullAddress(null);
    setBalanceEth(0.0);
    setError(null);
  };

  const updateUserTokens = (mint: string, deltaTokens: number) => {
    setUserTokens(prev => {
      const cur = prev[mint] || 0;
      const next = Math.max(0, cur + deltaTokens);
      const updated = { ...prev, [mint]: next };
      localStorage.setItem('robinhood_user_tokens', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        publicKey,
        fullAddress,
        balanceEth,
        balanceUsd: balanceEth * ETH_PRICE_USD,
        chainId,
        chainName,
        walletName,
        userTokens,
        isModalOpen,
        isConnecting,
        error,
        openWalletModal: () => setIsModalOpen(true),
        closeWalletModal: () => {
          setIsModalOpen(false);
          setError(null);
        },
        connectMetaMask,
        connectPhantom,
        switchChain,
        sendRealTransaction,
        disconnect,
        updateUserTokens,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
