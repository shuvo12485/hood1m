import React from 'react';

export const CyberBackground: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 1. Deep Midnight Base Gradient */}
      <div className="absolute inset-0 bg-[#070A0F]" />

      {/* 2. Animated Emerald / Mint Aurora Spotlights */}
      <div className="absolute -top-[20%] left-1/2 h-[650px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,200,5,0.18)_0%,rgba(0,255,102,0.06)_40%,transparent_70%)] blur-[90px] animate-aurora-pulse" />
      <div className="absolute top-[40%] -left-[10%] h-[500px] w-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,200,5,0.09)_0%,transparent_60%)] blur-[100px]" />
      <div className="absolute top-[65%] -right-[10%] h-[550px] w-[650px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,180,216,0.08)_0%,transparent_60%)] blur-[110px]" />

      {/* 3. High-Tech Cyber Perspective Grid */}
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 25%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 25%, black 40%, transparent 100%)',
        }}
      />

      {/* 4. Subtle Vignette Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,10,15,0.7)_100%)]" />
    </div>
  );
};
