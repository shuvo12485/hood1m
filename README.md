# Millionaires — Solana Meteora DBC Launchpad Clone

A complete, high-fidelity clone of [trymillionaires.fun](https://trymillionaires.fun/) built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**.

Every coin starts with a fixed supply of 1,000,000,000 tokens configured at an initial price of $0.001, setting the initial Fully Diluted Valuation (FDV) at **$1,000,000**.

---

## 🚀 Key Features

1. **Exact Editorial Design & Pixel Aesthetics:**
   - Color palette matching the real site tokens (`--paper: #F7F6F2`, `--card: #FFFFFD`, `--ink: #10110F`, `--accent: #00995C`, `--line: #DEDCD3`).
   - Signature retro-monitor hero SVG with live bonding curve plotting from $1M -> $2M -> $5M -> $10M.
   - Desktop sidebar with live animated Start FDV sparkline ticker card and responsive mobile navigation.

2. **Meteora Dynamic Bonding Curve (DBC) Simulation:**
   - Real mathematical calibration: ~15 SOL of net buy pressure pushes FDV from $1M to $2M.
   - Target graduation threshold: **85 SOL** (~$11.4M FDV), automatically unlocking graduation status and simulating migration to Meteora DAMM v2 with 100% permanently locked liquidity.
   - Real-time slippage, price impact, and swap fee (1%) calculations.

3. **Complete Pages & Workflows:**
   - **Home (`/`)**: Hero monitor, 4 live platform metrics, "New millionaires" live card grid, "Top performers" tabular ranker with 24H/All toggles, quick launch aside widget, and Millionaires Club preview.
   - **Explore (`/explore`)**: Grid & Table view switch, live search, and all 12 filter categories (`New launches`, `Trending`, `Highest volume`, `Above $1M`, `Above $2M`, `Above $5M`, `Above $10M`, etc.).
   - **Launch Token (`/launch`)**: Full token creation flow with image drag & drop/upload/URL preview, social links (Twitter/X, Telegram, Website), initial Dev Buy simulator in SOL, network rent breakdown (~0.024 SOL), and celebratory confetti upon creation.
   - **Trading Terminal (`/token/:mint`)**: Interactive candlestick/area price chart with multiple timeframes (1M, 5M, 15M, 1H, 1D), full Buy/Sell swap module with quick SOL pills and custom slippage tolerance, live trades feed, holder distribution breakdown, and community chat comments.
   - **Leaderboard (`/leaderboard`)**: Standings by Highest FDV, 24h Volume, and Top Gainers.
   - **Millionaires Club (`/club`)**: Tiered milestone club for >$1M, >$5M, and >$10M coins.
   - **Portfolio Dashboard (`/dashboard`)**: SOL balance, user token balances with live USD valuation, coins launched, and net worth overview.
   - **How It Works (`/how-it-works`)**: Full technical documentation explaining the $1M starting price math, Meteora DBC, graduation, and locked liquidity.
   - **Fees, Risks, Docs, and Stats (`/fees`, `/risks`, `/docs`, `/stats`)**.

4. **Solana Wallet Integration:**
   - Modal support for **Phantom**, **Solflare**, or a **1-Click Instant Demo Wallet** pre-funded with 10.0 SOL for effortless local testing.

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
cd millionaires-clone
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```
Generates an optimized production bundle in `dist/`.
