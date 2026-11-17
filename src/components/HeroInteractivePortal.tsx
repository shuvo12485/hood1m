import React, { useEffect, useRef, useState } from 'react';
import { Rocket, Sparkles, TrendingUp, ShieldCheck, Flame, ArrowUpRight, Zap, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HeroInteractivePortalProps {
  navigate: (path: string) => void;
  onQuickLaunch: (name: string, ticker: string) => void;
}

export const HeroInteractivePortal: React.FC<HeroInteractivePortalProps> = ({ navigate, onQuickLaunch }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [quickName, setQuickName] = useState('');
  const [quickTicker, setQuickTicker] = useState('');
  const [activeTab, setActiveTab] = useState<'hologram' | 'live-feed'>('hologram');

  // Simulated live trade stream
  const [trades, setTrades] = useState([
    { id: 1, type: 'BUY', symbol: 'PEPE1M', amountEth: 2.45, amountUsd: 7595, time: 'just now', gain: '+14.2%' },
    { id: 2, type: 'BUY', symbol: 'HOODBULL', amountEth: 5.10, amountUsd: 15810, time: '3s ago', gain: '+28.5%' },
    { id: 3, type: 'BUY', symbol: 'SHERWOOD', amountEth: 1.80, amountUsd: 5580, time: '8s ago', gain: '+9.1%' },
    { id: 4, type: 'BUY', symbol: 'DOSCOMMAS', amountEth: 4.20, amountUsd: 13020, time: '14s ago', gain: '+22.4%' },
  ]);

  // Periodic new simulated trades
  useEffect(() => {
    const symbols = ['PEPE1M', 'HOODBULL', 'SHERWOOD', 'DOSCOMMAS', 'MEGACAP', 'FIRSTMILLI', 'GREENARROW'];
    const interval = setInterval(() => {
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      const eth = Number((Math.random() * 4 + 0.5).toFixed(2));
      const usd = Math.round(eth * 3100);
      const gain = `+${(Math.random() * 25 + 5).toFixed(1)}%`;
      setTrades((prev) => [
        { id: Date.now(), type: 'BUY', symbol: sym, amountEth: eth, amountUsd: usd, time: 'just now', gain },
        ...prev.slice(0, 5),
      ]);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  // 3D Canvas Holographic Coin with orbiting particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotation = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - rect.width / 2) * 0.003;
      mouseY = (e.clientY - rect.top - rect.height / 2) * 0.003;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Particles system
    const numParticles = 45;
    const particles = Array.from({ length: numParticles }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 90 + Math.random() * 80,
      speed: (Math.random() * 0.015 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
      size: Math.random() * 2 + 1,
      yOffset: (Math.random() - 0.5) * 60,
    }));

    const render = () => {
      rotation += 0.018 + mouseX * 0.2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw glowing background halo
      const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 160);
      grad.addColorStop(0, 'rgba(0, 200, 5, 0.22)');
      grad.addColorStop(0.5, 'rgba(0, 255, 102, 0.08)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 170, 0, Math.PI * 2);
      ctx.fill();

      // Draw Orbiting Particles
      particles.forEach((p) => {
        p.angle += p.speed;
        const px = centerX + Math.cos(p.angle) * p.radius;
        const py = centerY + Math.sin(p.angle) * (p.radius * 0.35) + p.yOffset;
        ctx.fillStyle = '#00FF66';
        ctx.shadowColor = '#00C805';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3D Coin Ellipse Rings
      ctx.save();
      ctx.translate(centerX, centerY);

      const tilt = 0.25 + mouseY * 0.3;
      const coinWidth = 110 * Math.abs(Math.cos(rotation));
      const coinHeight = 110;

      // Outer Glow Ring
      ctx.strokeStyle = 'rgba(0, 200, 5, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 135, 135 * 0.45, rotation * 0.4, 0, Math.PI * 2);
      ctx.stroke();

      // Coin Rim (3D thickness effect)
      const rimDepth = 12 * Math.sin(rotation);
      ctx.fillStyle = 'rgba(12, 28, 18, 0.85)';
      ctx.strokeStyle = '#00C805';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00FF66';
      ctx.shadowBlur = 14;

      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(12, coinWidth), coinHeight, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner Coin Face
      ctx.strokeStyle = '#00FF66';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(8, coinWidth * 0.82), coinHeight * 0.82, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Coin Emblem ($1M / Feather Arrow)
      if (coinWidth > 30) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#00FF66';
        ctx.shadowBlur = 10;
        ctx.fillText('$1M', 0, -6);

        ctx.fillStyle = '#00FF66';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText('HOOD1M', 0, 18);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleLaunchClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName || !quickTicker) return;

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#00C805', '#00FF66', '#FFFFFF', '#68D391'],
    });

    onQuickLaunch(quickName, quickTicker);
  };

  return (
    <div className="relative mx-auto mt-8 max-w-5xl">
      {/* Outer Glow Cyber Frame */}
      <div className="relative rounded-3xl border border-[#00C805]/30 bg-[#0E141F]/90 p-6 shadow-[0_10px_50px_rgba(0,0,0,0.6),0_0_40px_rgba(0,200,5,0.12)] backdrop-blur-xl md:p-8">
        {/* Terminal Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-3 w-3 items-center justify-center rounded-full bg-[#00C805] animate-ping opacity-75" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#00FF66]">
                HOOD1M // LIVE LAUNCHPAD MATRIX
              </span>
              <span className="rounded-full bg-[#00C805]/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#00C805] border border-[#00C805]/30">
                ARBITRUM L2
              </span>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 p-1 font-mono text-xs">
            <button
              onClick={() => setActiveTab('hologram')}
              className={`rounded-full px-3.5 py-1 transition cursor-pointer ${
                activeTab === 'hologram'
                  ? 'bg-[#00C805] font-bold text-black shadow-[0_0_12px_rgba(0,200,5,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Holographic Core
            </button>
            <button
              onClick={() => setActiveTab('live-feed')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 transition cursor-pointer ${
                activeTab === 'live-feed'
                  ? 'bg-[#00C805] font-bold text-black shadow-[0_0_12px_rgba(0,200,5,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="h-3 w-3" />
              Live Orders
            </button>
          </div>
        </div>

        {/* Centerpiece Grid: Hologram + Realtime Metrics */}
        <div className="mt-6 grid items-center gap-8 lg:grid-cols-12">
          {/* Left Column: Holographic 3D Coin or Live Order Feed (7 Cols) */}
          <div className="relative flex items-center justify-center rounded-2xl border border-white/5 bg-[#090D15]/80 p-4 min-h-[310px] lg:col-span-7 overflow-hidden">
            {activeTab === 'hologram' ? (
              <div className="relative flex flex-col items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={280}
                  className="max-h-[280px] w-auto cursor-grab select-none"
                />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1 font-mono text-[10.5px] text-slate-400 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00FF66] animate-pulse" />
                  Every token spawns with $1,000,000 liquidity floor
                </div>
              </div>
            ) : (
              <div className="w-full space-y-2 py-2">
                <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 pb-2 border-b border-white/10">
                  <span>RECENT CURVE BUYS</span>
                  <span className="text-[#00C805]">STREAM ACTIVE</span>
                </div>
                {trades.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2.5 font-mono text-xs transition hover:border-[#00C805]/40 hover:bg-[#00C805]/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="rounded bg-[#00C805]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#00FF66]">
                        {t.type}
                      </span>
                      <span className="font-bold text-white">${t.symbol}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-300">
                        {t.amountEth} ETH <span className="text-slate-500">(${t.amountUsd.toLocaleString()})</span>
                      </span>
                      <span className="font-bold text-[#00FF66]">{t.gain}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Key Protocols & 1-Click Launch Terminal (5 Cols) */}
          <div className="flex flex-col justify-between space-y-5 lg:col-span-5">
            {/* Milestone Card */}
            <div className="rounded-2xl border border-white/10 bg-[#121926]/70 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  UNISWAP V3 GRADUATION GAUGE
                </span>
                <span className="rounded-full bg-[#00C805]/15 px-2 py-0.5 font-mono text-[10px] font-bold text-[#00FF66]">
                  TARGET: 35.0 ETH
                </span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-white font-bold">$1,000,000 Floor</span>
                  <span className="text-[#00FF66] font-bold">100% Locked Liquidity</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-black/60 p-0.5 border border-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#00C805] to-[#00FF88] shadow-[0_0_12px_#00C805] animate-pulse w-[68%]" />
                </div>
              </div>
            </div>

            {/* Quick 10-Second Token Creator Form */}
            <form onSubmit={handleLaunchClick} className="rounded-2xl border border-[#00C805]/30 bg-black/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#00FF66] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Instant Token Launch
                </span>
                <span className="font-mono text-[10px] text-slate-400">Zero Upfront Cash</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Name (e.g. Robin Bull)"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#0B1017] px-3 py-2 font-mono text-xs text-white placeholder-slate-500 focus:border-[#00C805] focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Ticker (e.g. BULL)"
                  value={quickTicker}
                  onChange={(e) => setQuickTicker(e.target.value.toUpperCase())}
                  className="rounded-xl border border-white/10 bg-[#0B1017] px-3 py-2 font-mono text-xs text-white placeholder-slate-500 focus:border-[#00C805] focus:outline-none uppercase"
                  maxLength={8}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00C805] py-2.5 font-pixel text-sm font-bold text-black transition hover:bg-[#00E600] hover:shadow-[0_0_20px_rgba(0,200,5,0.4)] cursor-pointer"
              >
                <Rocket className="h-4 w-4" />
                Spawn at $1,000,000 FDV →
              </button>
            </form>
          </div>
        </div>

        {/* High-Impact Stat Badges */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-white/10 pt-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00C805]/10 text-[#00FF66]">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-slate-400">Starting Floor</div>
              <div className="font-pixel text-sm font-bold text-white">$1,000,000</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00C805]/10 text-[#00FF66]">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-slate-400">Robinhood Fees</div>
              <div className="font-pixel text-sm font-bold text-[#00FF66]">$0.00 Free</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00C805]/10 text-[#00FF66]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-slate-400">Liquidity Rug</div>
              <div className="font-pixel text-sm font-bold text-white">Impossible (DBC)</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00C805]/10 text-[#00FF66]">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-slate-400">Graduation</div>
              <div className="font-pixel text-sm font-bold text-[#00FF66]">Uniswap v3 Pool</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
