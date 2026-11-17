import React, { useEffect, useRef, useState } from 'react';

type AsciiMode = 'donut' | 'matrix' | 'chart';

interface AsciiArtAnimationProps {
  initialMode?: AsciiMode;
  className?: string;
}

export const AsciiArtAnimation: React.FC<AsciiArtAnimationProps> = ({
  initialMode = 'donut',
  className = '',
}) => {
  const [mode, setMode] = useState<AsciiMode>(initialMode);
  const [speed, setSpeed] = useState<number>(1);
  const containerRef = useRef<HTMLPreElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Math parameters for 3D ASCII Donut / Coin
  const angleA = useRef(0);
  const angleB = useRef(0);

  // Matrix stream columns state
  const matrixCols = useRef<number[]>([]);

  useEffect(() => {
    let lastTime = performance.now();

    // Initialize matrix columns
    const colsCount = 64;
    matrixCols.current = Array.from({ length: colsCount }, () => Math.floor(Math.random() * 20));

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (!containerRef.current) {
        animFrameId.current = requestAnimationFrame(render);
        return;
      }

      if (mode === 'donut') {
        // 3D ASCII Torus (Donut) / Ring of Wealth
        angleA.current += 1.5 * dt * speed;
        angleB.current += 0.8 * dt * speed;

        const A = angleA.current;
        const B = angleB.current;

        const width = 68;
        const height = 22;
        const b: string[] = [];
        const z: number[] = [];

        for (let k = 0; k < width * height; k++) {
          b[k] = ' ';
          z[k] = 0;
        }

        const cosA = Math.cos(A);
        const sinA = Math.sin(A);
        const cosB = Math.cos(B);
        const sinB = Math.sin(B);

        // Torus parameters
        const R1 = 1; // tube radius
        const R2 = 2; // donut radius
        const K2 = 5;
        const K1 = (width * K2 * 3) / (8 * (R1 + R2));

        for (let theta = 0; theta < 6.28; theta += 0.08) {
          const cosTheta = Math.cos(theta);
          const sinTheta = Math.sin(theta);

          for (let phi = 0; phi < 6.28; phi += 0.03) {
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const circlex = R2 + R1 * cosTheta;
            const circley = R1 * sinTheta;

            const x = circlex * (cosB * cosPhi + sinA * sinB * sinPhi) - circley * cosA * sinB;
            const y = circlex * (sinB * cosPhi - sinA * cosB * sinPhi) + circley * cosA * cosB;
            const zCoord = K2 + cosA * circlex * sinPhi + circley * sinA;
            const ooz = 1 / zCoord;

            const xp = Math.floor(width / 2 + K1 * ooz * x * 1.8); // 1.8 aspect correction for mono font
            const yp = Math.floor(height / 2 - K1 * ooz * y);

            // Luminance L
            const L =
              cosPhi * cosTheta * sinB -
              cosA * cosTheta * sinPhi -
              sinA * sinTheta +
              cosB * (cosA * sinTheta - cosTheta * sinA * sinPhi);

            if (L > 0) {
              if (yp >= 0 && yp < height && xp >= 0 && xp < width) {
                const idx = xp + width * yp;
                if (ooz > z[idx]) {
                  z[idx] = ooz;
                  const luminanceChars = '.,-~:;=!*#$@';
                  const lumIdx = Math.floor(L * 8);
                  b[idx] = luminanceChars[Math.min(lumIdx, luminanceChars.length - 1)];
                }
              }
            }
          }
        }

        let output = '';
        for (let row = 0; row < height; row++) {
          output += b.slice(row * width, (row + 1) * width).join('') + '\n';
        }
        containerRef.current.textContent = output;

      } else if (mode === 'matrix') {
        // Falling Financial Matrix Stream
        const cols = 56;
        const rows = 20;
        const chars = '$1M0ETH▲▼%#*+:=~';
        const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill(' '));

        for (let c = 0; c < cols; c++) {
          const head = matrixCols.current[c] || 0;
          const trailLen = 7;
          for (let i = 0; i < trailLen; i++) {
            const r = head - i;
            if (r >= 0 && r < rows) {
              const char = chars[(c * 7 + r * 13 + Math.floor(time / 80)) % chars.length];
              grid[r][c] = i === 0 ? '█' : char;
            }
          }

          if (Math.random() > 0.88) {
            matrixCols.current[c] = (head + 1) % (rows + trailLen + 5);
          }
        }

        containerRef.current.textContent = grid.map((r) => r.join('')).join('\n');

      } else if (mode === 'chart') {
        // ASCII Financial Market Wave
        const cols = 60;
        const rows = 18;
        const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill(' '));

        const t = time * 0.002 * speed;
        for (let x = 0; x < cols; x++) {
          const yFloat =
            rows / 2 +
            Math.sin(x * 0.2 + t) * 4 +
            Math.sin(x * 0.08 - t * 1.5) * 2 -
            (x / cols) * 3; // upward slant

          const y = Math.max(1, Math.min(rows - 2, Math.floor(yFloat)));

          // draw candle body
          for (let fillY = y; fillY < rows - 1; fillY++) {
            grid[fillY][x] = fillY === y ? '▲' : fillY % 2 === 0 ? '▓' : '░';
          }

          // wick
          if (y > 1) grid[y - 1][x] = '|';
        }

        // Add header and baseline in grid
        const output =
          '╔═════════════════════ HOOD1M LIVE ASCII TICKER ═════════════════════╗\n' +
          grid.map((r) => '║ ' + r.join('') + ' ║').join('\n') +
          '\n╚══ [FDV: $1,000,000 BASELINE] ══════════ [UNISWAP V3 GRADUATION] ══╝';

        containerRef.current.textContent = output;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [mode, speed]);

  return (
    <div className={`relative rounded-2xl border border-[#00C805]/40 bg-[#070b09] p-4 text-[#00FF66] shadow-[0_0_30px_rgba(0,200,5,0.15)] font-mono text-[11px] leading-[13px] ${className}`}>
      {/* Terminal Title Bar */}
      <div className="mb-3 flex items-center justify-between border-b border-[#00C805]/20 pb-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#00FF66] animate-pulse shadow-[0_0_8px_#00FF66]"></span>
          <span className="font-bold tracking-wider text-white">HOOD1M://ASCII_CORE.SH</span>
          <span className="rounded bg-[#00C805]/20 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-[#00FF66]">
            30 FPS
          </span>
        </div>

        {/* Mode Switchers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMode('donut')}
            className={`rounded px-2 py-0.5 text-[10px] uppercase transition ${
              mode === 'donut'
                ? 'bg-[#00C805] font-bold text-black shadow-[0_0_10px_#00C805]'
                : 'text-[#00FF66]/70 hover:bg-[#00C805]/10 hover:text-white'
            }`}
          >
            [3D Coin]
          </button>
          <button
            onClick={() => setMode('chart')}
            className={`rounded px-2 py-0.5 text-[10px] uppercase transition ${
              mode === 'chart'
                ? 'bg-[#00C805] font-bold text-black shadow-[0_0_10px_#00C805]'
                : 'text-[#00FF66]/70 hover:bg-[#00C805]/10 hover:text-white'
            }`}
          >
            [Chart Wave]
          </button>
          <button
            onClick={() => setMode('matrix')}
            className={`rounded px-2 py-0.5 text-[10px] uppercase transition ${
              mode === 'matrix'
                ? 'bg-[#00C805] font-bold text-black shadow-[0_0_10px_#00C805]'
                : 'text-[#00FF66]/70 hover:bg-[#00C805]/10 hover:text-white'
            }`}
          >
            [Matrix Rain]
          </button>
        </div>
      </div>

      {/* CRT Scanline Overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-70"></div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.25)_2px,rgba(0,0,0,0.25)_4px)] opacity-50"></div>

      {/* ASCII Output Display */}
      <pre
        ref={containerRef}
        className="relative z-10 select-none overflow-x-auto whitespace-pre font-mono font-bold tracking-[1px] text-[#00FF66] text-shadow-glow"
        style={{
          textShadow: '0 0 6px rgba(0, 255, 102, 0.65), 0 0 12px rgba(0, 200, 5, 0.35)',
          minHeight: '290px',
        }}
      ></pre>

      {/* Footer Info */}
      <div className="relative z-10 mt-3 flex items-center justify-between border-t border-[#00C805]/20 pt-2 text-[10px] text-[#00FF66]/70">
        <div>SYS: ARBITRUM_L2 · 35_ETH_GRADUATION</div>
        <div className="flex items-center gap-3">
          <span>SPEED: {speed}X</span>
          <button
            onClick={() => setSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
            className="text-white hover:text-[#00FF66] underline cursor-pointer"
          >
            TOGGLE
          </button>
        </div>
      </div>
    </div>
  );
};
