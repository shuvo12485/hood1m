/**
 * Robinhood Web3 / Arbitrum Dynamic Bonding Curve simulation
 * 
 * Rules:
 * - Starting supply: 1,000,000,000 ERC-20 tokens
 * - Starting price: $0.00100 USD
 * - Starting FDV: $1,000,000 USD
 * - Native chain: Arbitrum (Robinhood Wallet's primary L2 network)
 * - Base currency: ETH & USD
 * - Target graduation threshold: 35 ETH (~$108,500 real liquidity)
 * - Graduation DEX: Uniswap v3 / Camelot with 100% permanently locked liquidity
 * - Trading fee: 1% per swap
 */

export const ETH_PRICE_USD = 3100; // Live simulated ETH/USD price
export const INITIAL_SUPPLY = 1_000_000_000;
export const INITIAL_PRICE_USD = 0.001;
export const INITIAL_FDV = 1_000_000;
export const GRADUATION_ETH_THRESHOLD = 35.0; // 35 ETH to graduate
export const GRADUATION_FDV = 11_400_000; // ~$11.4M FDV

export function calculateTokenPrice(ethReserve: number): number {
  const x = Math.max(0, ethReserve);
  // Multiplier from 1.0 at 0 ETH to 2.0 at 5 ETH to 11.4 at 35 ETH
  const factor = 1 + (x / 5) * 1.0 + Math.pow(x / 15, 2) * 1.8;
  return INITIAL_PRICE_USD * factor;
}

export function calculateFDV(ethReserve: number): number {
  return calculateTokenPrice(ethReserve) * INITIAL_SUPPLY;
}

export function calculateCirculatingSupply(ethReserve: number): number {
  const progressRatio = Math.min(1, Math.max(0, ethReserve / GRADUATION_ETH_THRESHOLD));
  return Math.floor(INITIAL_SUPPLY * (0.01 + progressRatio * 0.25));
}

export function calculateCirculatingMarketCap(ethReserve: number): number {
  const price = calculateTokenPrice(ethReserve);
  const circSupply = calculateCirculatingSupply(ethReserve);
  return price * circSupply;
}

export function calculateBuyTokens(ethAmount: number, currentEthReserve: number): {
  tokensReceived: number;
  newEthReserve: number;
  newPrice: number;
  newFdv: number;
  priceImpact: number;
  feeEth: number;
  usdAmount: number;
} {
  const feeEth = ethAmount * 0.01;
  const netEth = ethAmount - feeEth;
  const currentPrice = calculateTokenPrice(currentEthReserve);
  const newEthReserve = currentEthReserve + netEth;
  const newPrice = calculateTokenPrice(newEthReserve);
  
  const avgPrice = (currentPrice + newPrice) / 2;
  const tokensReceived = Math.floor((netEth * ETH_PRICE_USD) / avgPrice);
  const priceImpact = ((newPrice - currentPrice) / currentPrice) * 100;

  return {
    tokensReceived,
    newEthReserve,
    newPrice,
    newFdv: newPrice * INITIAL_SUPPLY,
    priceImpact,
    feeEth,
    usdAmount: ethAmount * ETH_PRICE_USD,
  };
}

export function calculateSellTokens(tokenAmount: number, currentEthReserve: number): {
  ethReceived: number;
  usdReceived: number;
  newEthReserve: number;
  newPrice: number;
  newFdv: number;
  priceImpact: number;
  feeEth: number;
} {
  const currentPrice = calculateTokenPrice(currentEthReserve);
  const rawEthValue = (tokenAmount * currentPrice) / ETH_PRICE_USD;
  const effectiveEth = Math.min(currentEthReserve * 0.95, rawEthValue);
  
  const newEthReserve = Math.max(0, currentEthReserve - effectiveEth);
  const newPrice = calculateTokenPrice(newEthReserve);
  const feeEth = effectiveEth * 0.01;
  const netEthReceived = Math.max(0, effectiveEth - feeEth);
  const priceImpact = ((currentPrice - newPrice) / currentPrice) * 100;

  return {
    ethReceived: netEthReceived,
    usdReceived: netEthReceived * ETH_PRICE_USD,
    newEthReserve,
    newPrice,
    newFdv: newPrice * INITIAL_SUPPLY,
    priceImpact,
    feeEth,
  };
}
