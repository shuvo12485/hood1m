import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner, formatEther } from 'ethers';
import { ARBITRUM_SEPOLIA_CHAIN_HEX, ARBITRUM_SEPOLIA_CHAIN_ID, CHAIN_CONFIG } from '../contracts/config';

export interface WalletContextType {
  connected: boolean;
  publicKey: string | null;
  fullAddress: string | null;
  balanceEth: number;
  balanceUsd: number;
  chainId: string | null;
  chainName: string;
  isArbitrumSepolia: boolean;
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
  switchToArbitrumSepolia: () => Promise<boolean>;
  getSigner: () => Promise<JsonRpcSigner | null>;
  sendRealTransaction: (params: { to: string; valueEth: number; data?: string }) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  disconnect: () => void;
  updateUserTokens: (mint: string, deltaTokens: number) => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Known chains
const CHAINS: Record<string, string> = {
  '0x66eee': 'Arbitrum Sepolia Testnet',
  '421614': 'Arbitrum Sepolia Testnet',
  '0x1': 'Ethereum Mainnet',
  '0xa4b1': 'Arbitrum One',
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
  const [chainName, setChainName] = useState<string>('Arbitrum Sepolia');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ethPriceUsd, setEthPriceUsd] = useState<number>(3150);

  const [userTokens, setUserTokens] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('hood1m_user_tokens');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Fetch live ETH price from backend
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('/api/eth-price');
        if (res.ok) {
          const data = await res.json();
          if (data.ethPriceUsd) setEthPriceUsd(data.ethPriceUsd);
        }
      } catch {}
    };
    fetchPrice();
    const iv = setInterval(fetchPrice, 30000);
    return () => clearInterval(iv);
  }, []);

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

  const getActiveProvider = () => {
    return getProvider(walletName.toLowerCase().includes('phantom') ? 'phantom' : 'metamask');
  };

  const getSigner = async (): Promise<JsonRpcSigner | null> => {
    const provider = getActiveProvider();
    if (!provider) return null;
    try {
      const browserProvider = new BrowserProvider(provider);
      return await browserProvider.getSigner();
    } catch (e) {
      console.error('Failed to get signer:', e);
      return null;
    }
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
        const eth = parseFloat(formatEther(wei));
        setBalanceEth(+eth.toFixed(4));
      }
    } catch (e) {
      console.warn('Failed to fetch real on-chain balance:', e);
    }
  }, []);

  const refreshBalance = async () => {
    if (!fullAddress) return;
    const provider = getActiveProvider();
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
      const chainNormalized = currentChainId.toLowerCase();
      setChainName(CHAINS[chainNormalized] || `Chain ${currentChainId}`);

      await fetchBalance(account, provider);

      // Check if user is already on Arbitrum Sepolia; if not, prompt switch
      if (chainNormalized !== ARBITRUM_SEPOLIA_CHAIN_HEX && chainNormalized !== '0x66eee') {
        promptSwitchToArbitrumSepolia(provider);
      }

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
        const cNorm = newChainId.toLowerCase();
        setChainName(CHAINS[cNorm] || `Chain ${newChainId}`);
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

  const promptSwitchToArbitrumSepolia = async (provider: any) => {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARBITRUM_SEPOLIA_CHAIN_HEX }],
      });
    } catch (switchError: any) {
      // Chain 4902 means network needs to be added
      if (switchError.code === 4902 || switchError.data?.originalError?.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [CHAIN_CONFIG],
          });
        } catch (addError) {
          console.warn('Failed to add Arbitrum Sepolia chain:', addError);
        }
      }
    }
  };

  const switchToArbitrumSepolia = async () => {
    const provider = getActiveProvider();
    if (!provider) return false;
    await promptSwitchToArbitrumSepolia(provider);
    return true;
  };

  const switchChain = async (targetChainIdHex: string) => {
    const provider = getActiveProvider();
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

    const provider = getActiveProvider();
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
      localStorage.setItem('hood1m_user_tokens', JSON.stringify(updated));
      return updated;
    });
  };

  const isArbitrumSepolia = chainId?.toLowerCase() === ARBITRUM_SEPOLIA_CHAIN_HEX || chainId === `${ARBITRUM_SEPOLIA_CHAIN_ID}`;

  return (
    <WalletContext.Provider
      value={{
        connected,
        publicKey,
        fullAddress,
        balanceEth,
        balanceUsd: balanceEth * ethPriceUsd,
        chainId,
        chainName,
        isArbitrumSepolia,
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
        connectMetaMask: () => connectProvider('metamask', 'MetaMask'),
        connectPhantom: () => connectProvider('phantom', 'Phantom'),
        switchChain,
        switchToArbitrumSepolia,
        getSigner,
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
