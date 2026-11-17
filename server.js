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
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const INITIAL_TOKENS = [];
const INITIAL_TRADES = [];
const INITIAL_COMMENTS = [];

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

// In-memory cache for live ETH price from Binance
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

app.get('/api/config', (req, res) => {
  const config = readJsonFile(CONFIG_FILE, {
    factoryAddress: process.env.FACTORY_ADDRESS || '',
    network: 'Arbitrum Sepolia Testnet',
    chainId: 421614,
  });
  res.json(config);
});

app.post('/api/config', (req, res) => {
  const { factoryAddress } = req.body;
  const config = readJsonFile(CONFIG_FILE, {
    factoryAddress: '',
    network: 'Arbitrum Sepolia Testnet',
    chainId: 421614,
  });
  if (factoryAddress && factoryAddress.startsWith('0x')) {
    config.factoryAddress = factoryAddress;
    writeJsonFile(CONFIG_FILE, config);
  }
  res.json(config);
});

app.get('/api/stats', (req, res) => {
  const tokens = readJsonFile(TOKENS_FILE, []);
  const trades = readJsonFile(TRADES_FILE, []);

  const totalVolume = trades.reduce((sum, tr) => sum + (Number(tr.usdAmount) || 0), 0);
  const coinsAbove1M = tokens.filter(t => (t.fdv || 0) >= 1_000_000).length;
  const multiMillionaires = tokens.filter(t => (t.fdv || 0) >= 2_000_000).length;

  res.json({
    coinsLaunched: tokens.length,
    totalVolume,
    coinsAbove1M,
    multiMillionaires,
  });
});

app.get('/api/tokens', (req, res) => {
  const tokens = readJsonFile(TOKENS_FILE, []);
  res.json(tokens);
});

app.get('/api/tokens/:mint', (req, res) => {
  const tokens = readJsonFile(TOKENS_FILE, []);
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

  // Must be a real 0x address
  if (!mint.startsWith('0x') || mint.length !== 42) {
    return res.status(400).json({ error: 'Invalid Ethereum contract address' });
  }

  const tokens = readJsonFile(TOKENS_FILE, []);
  const existing = tokens.find(t => t.mint.toLowerCase() === mint.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Token already exists' });
  }

  const ethPrice = cachedEthPrice.price;
  const initialEth = Number(initialBuyEth) || 0;
  
  // Starting FDV $1,000,000 floor ($0.001 per token)
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

  // If initial buy happened on-chain, register trade
  if (initialEth > 0 && txHash) {
    const trades = readJsonFile(TRADES_FILE, []);
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
      txHash,
    });
    writeJsonFile(TRADES_FILE, trades);
  }

  res.status(201).json(newToken);
});

app.get('/api/trades', (req, res) => {
  const trades = readJsonFile(TRADES_FILE, []);
  const mint = req.query.mint;
  if (mint) {
    return res.json(trades.filter(t => t.mint.toLowerCase() === mint.toLowerCase()));
  }
  res.json(trades);
});

app.post('/api/trades', (req, res) => {
  const { mint, type, ethAmount, tokenAmount, priceUsd, wallet, txHash } = req.body;
  if (!mint || !wallet || ethAmount === undefined || !txHash) {
    return res.status(400).json({ error: 'Missing required trade fields or txHash' });
  }

  const trades = readJsonFile(TRADES_FILE, []);
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
    txHash,
  };

  trades.unshift(trade);
  writeJsonFile(TRADES_FILE, trades);

  // Update token reserves
  const tokens = readJsonFile(TOKENS_FILE, []);
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
