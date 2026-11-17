import React, { useEffect, useState } from 'react';

export const AsciiBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 120);
      }
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const normalBanner = `
  ██╗  ██╗ ██████╗  ██████╗ ██████╗       ██╗███╗   ███╗
  ██║  ██║██╔═══██╗██╔═══██╗██╔══██╗     ███║████╗ ████║
  ███████║██║   ██║██║   ██║██║  ██║     ╚██║██╔████╔██║
  ██╔══██║██║   ██║██║   ██║██║  ██║      ██║██║╚██╔╝██║
  ██║  ██║╚██████╔╝╚██████╔╝██████╔╝██╗   ██║██║ ╚═╝ ██║
  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝   ╚═╝╚═╝     ╚═╝
  ┌─────────────────────────────────────────────────────┐
  │  $1,000,000 BASELINE VALUATION · ARBITRUM L2 WEB3   │
  └─────────────────────────────────────────────────────┘
  `.trim();

  const glitchBanner = `
  ██╗  ██╗ ██████╗  ██████╗ ██████╗       ██╗███╗   ███╗
  ██║  ██║████████╗██╔═══██╗██╔══██╗     ███║████╗ ████║
  ███████║██║   ██║██║   ██║██║  ██║     ╚██║██╔████╔██║
  ██╔══██║██║   ██║██║ ▓▓██║██║  ██║      ██║██║╚██╔╝██║
  ██║  ██║╚██████╔╝╚██████╔╝██████╔╝██╗   ██║██║ ╚═╝ ██║
  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝   ╚═╝╚═╝     ╚═╝
  ┌─────────────────────────────────────────────────────┐
  │  [!] SYNCHRONIZING REALTIME BONDING CURVE FEED ...  │
  └─────────────────────────────────────────────────────┘
  `.trim();

  return (
    <div className={`overflow-x-auto text-center font-mono select-none ${className}`}>
      <pre
        className={`inline-block text-[9px] min-[480px]:text-[11px] sm:text-[12px] font-bold tracking-tight text-[#00FF66] transition-all duration-75 ${
          glitch ? 'text-[#00E600] scale-[1.01] blur-[0.3px]' : ''
        }`}
        style={{
          textShadow: '0 0 10px rgba(0, 255, 102, 0.7), 0 0 20px rgba(0, 200, 5, 0.4)',
          lineHeight: '1.15',
        }}
      >
        {glitch ? glitchBanner : normalBanner}
      </pre>
    </div>
  );
};
