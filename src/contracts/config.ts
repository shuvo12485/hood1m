// Arbitrum One Mainnet (Robinhood Wallet's primary native L2 network)
export const ARBITRUM_ONE_CHAIN_ID = 42161;
export const ARBITRUM_ONE_CHAIN_HEX = '0xa4b1';

// Arbitrum Sepolia Testnet
export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
export const ARBITRUM_SEPOLIA_CHAIN_HEX = '0x66eee';

// Default target: Arbitrum One Mainnet
export const TARGET_CHAIN_ID = ARBITRUM_ONE_CHAIN_ID;
export const TARGET_CHAIN_HEX = ARBITRUM_ONE_CHAIN_HEX;

export const CHAIN_CONFIG = {
  chainId: ARBITRUM_ONE_CHAIN_HEX,
  chainName: 'Arbitrum One',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'https://arb1.arbitrum.io/rpc',
    'https://arbitrum.llamarpc.com',
    'https://rpc.ankr.com/arbitrum',
  ],
  blockExplorerUrls: ['https://arbiscan.io'],
};

// Canonical Uniswap v4 Protocol Contracts on Arbitrum One Mainnet
export const UNISWAP_V4 = {
  poolManager: '0x360E68faCcca8cA495c1B759Fd9EEe466db9FB32',
  positionManager: '0xd88F38F930b7952f2DB2432Cb002E7abbF3dD869',
  positionDescriptor: '0xe2023f3fa515cf070e07fd9d51c1d236e07843f4',
  universalRouter: '0xa44B3Da505494C24F3A530511874982635951804',
};

export const getExplorerTxUrl = (txHash: string, chainIdHex?: string) => {
  const isSepolia = chainIdHex?.toLowerCase() === ARBITRUM_SEPOLIA_CHAIN_HEX || chainIdHex === `${ARBITRUM_SEPOLIA_CHAIN_ID}`;
  const base = isSepolia ? 'https://sepolia.arbiscan.io' : 'https://arbiscan.io';
  return `${base}/tx/${txHash}`;
};

export const getExplorerAddressUrl = (address: string, chainIdHex?: string) => {
  const isSepolia = chainIdHex?.toLowerCase() === ARBITRUM_SEPOLIA_CHAIN_HEX || chainIdHex === `${ARBITRUM_SEPOLIA_CHAIN_ID}`;
  const base = isSepolia ? 'https://sepolia.arbiscan.io' : 'https://arbiscan.io';
  return `${base}/address/${address}`;
};
