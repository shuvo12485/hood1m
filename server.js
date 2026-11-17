import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const TOKENS_FILE = path.join(DATA_DIR, 'tokens.json');
const TRADES_FILE = path.join(DATA_DIR, 'trades.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initial mock data seeds
const INITIAL_TOKENS = [
  {
    mint: '0x71C8A79B37A4a24c28470aE2E72Ac23999911111',
    curveAddress: '0x81C8A79B37A4a24c28470aE2E72Ac23999922222',
    name: 'Robinhood Genesis',
    symbol: 'HOOD1M',
    description: 'The premier millionaire token launching on Hood1M (Arbitrum L2). Fair, commission-free, starting at $1,000,000 FDV.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop&q=80',
    creator: '0x9B2a4e9812A45C8F79B12456eC23412345674Fa1',
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    ethReserve: 3.5,
    usdReserve: 3.5 * 3150,
    price: 0.0017,
    fdv: 1_700_000,
    circulatingMarketCap: 1_700_000 * 0.035,
    tokenReserve: 965_000_000,
    volume24h: 84_500,
    change24h: 70.0,
    graduated: false,
    holders: 195,
    twitter: 'https://x.com',
    telegram: 'https://t.me',
  },
  {
    mint: '0x32A4B88dE75e925c48b0a982Fe3e134599922222',
    curveAddress: '0x92A4B88dE75e925c48b0a982Fe3e134599933333',
    name: 'Arbitrum Chad',
    symbol: 'ACHAD',
    description: 'Decentralized meme finance on Arbitrum Sepolia with instant execution and deep Uniswap liquidity.',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&auto=format&fit=crop&q=80',
    creator: '0x3Fe1789B12019348274092174981273491898Bc1',
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    ethReserve: 8.6,
    usdReserve: 8.6 * 3150,
    price: 0.0028,
    fdv: 2_800_000,
    circulatingMarketCap: 2_800_000 * 0.086,
    tokenReserve: 810_000_000,
    volume24h: 215_000,
    change24h: 180.0,
    graduated: false,
    holders: 840,
    twitter: 'https://x.com',
    telegram: 'https://t.me',
  },
  {
    mint: '0x8892cF89d120a16B45A259eB9d7F341999933333',
    curveAddress: '0xA892cF89d120a16B45A259eB9d7F341999944444',
    name: 'Sherwood Green',
    symbol: 'WOOD',
    description: 'The green candle army backed by Hood1M self-custody. Fast approaching the 35 ETH graduation.',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&auto=format&fit=crop&q=80',
    creator: '0x712a45698B124560912450912456091245B4f311',
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
    ethReserve: 28.5,
    usdReserve: 28.5 * 3150,
    price: 0.0084,
    fdv: 8_400_000,
    circulatingMarketCap: 8_400_000 * 0.285,
    tokenReserve: 380_000_000,
    volume24h: 960_000,
    change24h: 740.0,
    graduated: false,
    holders: 2420,
    twitter: 'https://x.com',
    telegram: 'https://t.me',
  },
  {
    mint: '0x11119A887c2b381F490234eB205a123999944444',
    curveAddress: '0xB1119A887c2b381F490234eB205a123999955555',
    name: 'Giga Millionaire',
    symbol: 'GIGA',
    description: 'First coin to surpass 35 ETH on Hood1M! Permanently locked in Uniswap v3 on Arbitrum.',
    image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&auto=format&fit=crop&q=80',
    creator: '0x55aa45698B124560912450912456091245120E22',
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    ethReserve: 35.0,
    usdReserve: 35.0 * 3150,
    price: 0.0114,
    fdv: 11_400_000,
    circulatingMarketCap: 11_400_000,
    tokenReserve: 0,
    volume24h: 3_120_000,
    change24h: 1040.0,
    graduated: true,
    holders: 5310,
    twitter: 'https://x.com',
    telegram: 'https://t.me',
  }
];

const INITIAL_TRADES = [
  {
    id: 't-init-1',
    mint: '0x32A4B88dE75e925c48b0a982Fe3e134599922222',
    type: 'buy',
    ethAmount: 0.8,
    usdAmount: 0.8 * 3150,
    tokenAmount: 140_000,
    priceUsd: 0.0028,
    wallet: '0x7b814a21568912480124951240891245784A2199',
    timestamp: Date.now() - 1000 * 120,
    txHash: '0x89ab45ef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
  },
  {
    id: 't-init-2',
    mint: '0x8892cF89d120a16B45A259eB9d7F341999933333',
    type: 'buy',
    ethAmount: 1.5,
    usdAmount: 1.5 * 3150,
    tokenAmount: 95_000,
    priceUsd: 0.0084,
    wallet: '0x21fe89bc12456891248012495124089124589bc1',
    timestamp: Date.now() - 1000 * 300,
    txHash: '0x1234cdef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
  }
];

function readJsonFile(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
    return defaultValue;
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`Error writing ${filePath}:`, e);
  }
}

// In-memory cache for live ETH price
let cachedEthPrice = { price: 3150, timestamp: 0 };

async function fetchLiveEthPrice() {
  const now = Date.now();
  if (now - cachedEthPrice.timestamp < 30000) {
    return cachedEthPrice.price;
  }

  return new Promise((resolve) => {
    https.get('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT', { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed.price) {
            const p = parseFloat(parsed.price);
            if (!isNaN(p) && p > 0) {
              cachedEthPrice = { price: p, timestamp: now };
              return resolve(p);
            }
          }
        } catch {}
        resolve(cachedEthPrice.price);
      });
    }).on('error', () => {
      resolve(cachedEthPrice.price);
    });
  });
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Hood1M',
    network: 'Arbitrum Sepolia Testnet (421614)',
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.get('/api/eth-price', async (req, res) => {
  const price = await fetchLiveEthPrice();
  res.json({ ethPriceUsd: price, timestamp: Date.now() });
});

app.get('/api/tokens', (req, res) => {
  const tokens = readJsonFile(TOKENS_FILE, INITIAL_TOKENS);
  res.json(tokens);
});

app.get('/api/tokens/:mint', (req, res) => {
  const tokens = readJsonFile(TOKENS_FILE, INITIAL_TOKENS);
  const token = tokens.find(t => t.mint.toLowerCase() === req.params.mint.toLowerCase());
  if (!token) return res.status(404).json({ error: 'Token not found' });
  res.json(token);
});

app.post('/api/tokens', (req, res) => {
  const {
    mint,
    curveAddress,
    name,
    symbol,
    description,
    image,
    creator,
    txHash,
    initialBuyEth = 0,
    twitter,
    telegram,
    website,
  } = req.body;

  if (!mint || !name || !symbol) {
    return res.status(400).json({ error: 'Missing required token fields' });
  }

  const tokens = readJsonFile(TOKENS_FILE, INITIAL_TOKENS);
  const existing = tokens.find(t => t.mint.toLowerCase() === mint.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Token already exists' });
  }

  const ethPrice = cachedEthPrice.price;
  const initialEth = Number(initialBuyEth) || 0;
  
  // Starting FDV $1,000,000
  const price = 0.001 * (1 + (initialEth / 5) * 1.0);
  const fdv = price * 1_000_000_000;

  const newToken = {
    mint,
    curveAddress: curveAddress || mint,
    name,
    symbol: symbol.toUpperCase(),
    description: description || 'Launched on Hood1M ($1,000,000 starting FDV floor).',
    image: image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop&q=80',
    creator: creator || '0x0000000000000000000000000000000000000000',
    createdAt: Date.now(),
    ethReserve: initialEth,
    usdReserve: initialEth * ethPrice,
    price,
    fdv,
    circulatingMarketCap: fdv * 0.01,
    tokenReserve: 1_000_000_000,
    volume24h: initialEth * ethPrice,
    change24h: initialEth > 0 ? ((price - 0.001) / 0.001) * 100 : 0,
    graduated: initialEth >= 35.0,
    holders: initialEth > 0 ? 2 : 1,
    txHash,
    twitter,
    telegram,
    website,
  };

  tokens.unshift(newToken);
  writeJsonFile(TOKENS_FILE, tokens);

  // If initial buy happened, register trade
  if (initialEth > 0) {
    const trades = readJsonFile(TRADES_FILE, INITIAL_TRADES);
    trades.unshift({
      id: `t-${Date.now()}`,
      mint,
      type: 'buy',
      ethAmount: initialEth,
      usdAmount: initialEth * ethPrice,
      tokenAmount: Math.floor((initialEth * ethPrice) / price),
      priceUsd: price,
      wallet: creator,
      timestamp: Date.now(),
      txHash: txHash || `0x${Date.now().toString(16)}`,
    });
    writeJsonFile(TRADES_FILE, trades);
  }

  res.status(201).json(newToken);
});

app.get('/api/trades', (req, res) => {
  const trades = readJsonFile(TRADES_FILE, INITIAL_TRADES);
  const mint = req.query.mint;
  if (mint) {
    return res.json(trades.filter(t => t.mint.toLowerCase() === mint.toLowerCase()));
  }
  res.json(trades);
});

app.post('/api/trades', (req, res) => {
  const { mint, type, ethAmount, tokenAmount, priceUsd, wallet, txHash } = req.body;
  if (!mint || !wallet || ethAmount === undefined) {
    return res.status(400).json({ error: 'Missing required trade fields' });
  }

  const trades = readJsonFile(TRADES_FILE, INITIAL_TRADES);
  const ethPrice = cachedEthPrice.price;
  const numEth = Number(ethAmount);
  const numTokens = Number(tokenAmount);
  const numPrice = Number(priceUsd) || (numEth * ethPrice) / (numTokens || 1);

  const trade = {
    id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    mint,
    type: type === 'sell' ? 'sell' : 'buy',
    ethAmount: numEth,
    usdAmount: numEth * ethPrice,
    tokenAmount: numTokens,
    priceUsd: numPrice,
    wallet,
    timestamp: Date.now(),
    txHash: txHash || `0x${Date.now().toString(16)}`,
  };

  trades.unshift(trade);
  writeJsonFile(TRADES_FILE, trades);

  // Update token reserves
  const tokens = readJsonFile(TOKENS_FILE, INITIAL_TOKENS);
  const tokenIdx = tokens.findIndex(t => t.mint.toLowerCase() === mint.toLowerCase());
  if (tokenIdx !== -1) {
    const t = tokens[tokenIdx];
    const newEthReserve = type === 'buy' ? t.ethReserve + numEth : Math.max(0, t.ethReserve - numEth);
    const newPrice = 0.001 * (1 + (newEthReserve / 5) * 1.0 + Math.pow(newEthReserve / 15, 2) * 1.8);
    const newFdv = newPrice * 1_000_000_000;
    
    tokens[tokenIdx] = {
      ...t,
      ethReserve: newEthReserve,
      usdReserve: newEthReserve * ethPrice,
      price: newPrice,
      fdv: newFdv,
      volume24h: t.volume24h + (numEth * ethPrice),
      change24h: ((newPrice - 0.001) / 0.001) * 100,
      graduated: newEthReserve >= 35.0,
      holders: t.holders + (type === 'buy' ? 1 : 0),
    };
    writeJsonFile(TOKENS_FILE, tokens);
  }

  res.status(201).json(trade);
});

app.get('/api/comments', (req, res) => {
  const comments = readJsonFile(COMMENTS_FILE, []);
  const mint = req.query.mint;
  if (mint) {
    return res.json(comments.filter(c => c.mint.toLowerCase() === mint.toLowerCase()));
  }
  res.json(comments);
});

app.post('/api/comments', (req, res) => {
  const { mint, wallet, text } = req.body;
  if (!mint || !wallet || !text) {
    return res.status(400).json({ error: 'Missing comment fields' });
  }

  const comments = readJsonFile(COMMENTS_FILE, []);
  const comment = {
    id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    mint,
    wallet,
    text,
    timestamp: Date.now(),
    avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${wallet}`,
  };

  comments.unshift(comment);
  writeJsonFile(COMMENTS_FILE, comments);
  res.status(201).json(comment);
});

// Serve frontend static files
const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Hood1M server live on port ${PORT}`);
  console.log(`Arbitrum Sepolia Testnet enabled (Chain ID: 421614)`);
});
