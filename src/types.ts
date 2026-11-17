export interface Token {
  mint: string; // ERC-20 contract address (0x...)
  name: string;
  symbol: string;
  description: string;
  image: string;
  creator: string; // 0x... address
  createdAt: number;
  price: number; // in USD
  fdv: number;   // in USD
  circulatingMarketCap: number; // in USD
  ethReserve: number; // real ETH in curve pool
  usdReserve: number; // real USD liquidity
  tokenReserve: number; // tokens remaining on curve
  volume24h: number; // in USD
  change24h: number; // percentage
  graduated: boolean;
  holders: number;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export interface Trade {
  id: string;
  mint: string;
  type: 'buy' | 'sell';
  ethAmount: number;
  usdAmount: number;
  tokenAmount: number;
  priceUsd: number;
  wallet: string;
  timestamp: number;
  txHash: string;
}

export interface Comment {
  id: string;
  mint: string;
  wallet: string;
  text: string;
  timestamp: number;
  avatar?: string;
}

export interface PlatformStats {
  coinsLaunched: number;
  totalVolume: number;
  coinsAbove1M: number;
  multiMillionaires: number;
}
