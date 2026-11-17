import React from 'react';

export const CyberBackground: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 1. Deep Matte Obsidian Base */}
      <div className="absolute inset-0 bg-[#090D12]" />

      {/* 2. Ultra-Subtle Architectural Precision Grid */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse 90% 60% at 50% 15%, black 20%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 60% at 50% 15%, black 20%, transparent 85%)',
        }}
      />

      {/* 3. Extremely restrained ambient emerald focus light at top */}
      <div className="absolute -top-[160px] left-1/2 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,200,5,0.08)_0%,transparent_70%)] blur-[80px]" />
    </div>
  );
};
