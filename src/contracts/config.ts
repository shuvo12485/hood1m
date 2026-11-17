export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
export const ARBITRUM_SEPOLIA_CHAIN_HEX = '0x66eee';

export const CHAIN_CONFIG = {
  chainId: ARBITRUM_SEPOLIA_CHAIN_HEX,
  chainName: 'Arbitrum Sepolia Testnet',
  nativeCurrency: {
    name: 'Arbitrum Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'https://sepolia-rollup.arbitrum.io/rpc',
    'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
  ],
  blockExplorerUrls: ['https://sepolia.arbiscan.io'],
};

export const FAUCETS = [
  { name: 'Chainlink Arbitrum Sepolia Faucet', url: 'https://faucets.chain.link/arbitrum-sepolia' },
  { name: 'LearnWeb3 Faucet', url: 'https://learnweb3.io/faucets/arbitrum_sepolia' },
  { name: 'QuickNode Faucet', url: 'https://faucet.quicknode.com/arbitrum/sepolia' },
];

export const getExplorerTxUrl = (txHash: string) => `https://sepolia.arbiscan.io/tx/${txHash}`;
export const getExplorerAddressUrl = (address: string) => `https://sepolia.arbiscan.io/address/${address}`;
