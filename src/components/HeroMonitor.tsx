import React from 'react';

export const HeroMonitor: React.FC = () => {
  return (
    <div className="mx-auto mt-10 max-w-[860px]">
      <svg
        viewBox="0 0 760 470"
        className="h-auto w-full select-none"
        role="img"
        aria-label="Monitor showing a chart that only goes up from $1M to $10M"
      >
        <defs>
          <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgb(var(--accent))" stopOpacity=".18"></stop>
            <stop offset="1" stopColor="rgb(var(--accent))" stopOpacity="0"></stop>
          </linearGradient>
          <clipPath id="hero-plot">
            <rect x="106" y="54" width="478" height="268"></rect>
          </clipPath>
        </defs>

        {/* Monitor Stand */}
        <path d="M334 380L318 444M426 380L442 444" stroke="rgb(var(--ink))" strokeWidth="1.5"></path>
        <rect x="250" y="444" width="260" height="12" rx="6" fill="rgb(var(--card))" stroke="rgb(var(--ink))" strokeWidth="1.5"></rect>

        {/* Outer Bezel */}
        <rect x="36" y="14" width="700" height="372" rx="20" fill="rgb(var(--ink))"></rect>
        <rect x="30" y="8" width="700" height="372" rx="20" fill="rgb(var(--card))" stroke="rgb(var(--ink))" strokeWidth="1.5"></rect>
        <rect x="44" y="22" width="672" height="344" rx="10" fill="rgb(var(--paper))" stroke="rgb(var(--line))"></rect>

        {/* Window controls */}
        <circle cx="62" cy="40" r="3.6" fill="none" stroke="rgb(var(--ink))" strokeWidth="1.1"></circle>
        <circle cx="75" cy="40" r="3.6" fill="none" stroke="rgb(var(--ink))" strokeWidth="1.1"></circle>
        <circle cx="88" cy="40" r="3.6" fill="none" stroke="rgb(var(--ink))" strokeWidth="1.1"></circle>

        {/* Header Text */}
        <text x="108" y="44" fontSize="11" fill="rgb(var(--muted))" letterSpacing="1.5" className="font-mono">
          HOOD1M · FDV · 1D
        </text>

        {/* Live Indicator */}
        <circle cx="654" cy="40" r="6" fill="rgb(var(--accent))" className="live-pulse"></circle>
        <circle cx="654" cy="40" r="3.2" fill="rgb(var(--accent))"></circle>
        <text x="666" y="44" fontSize="11" fill="rgb(var(--ink))" letterSpacing="1.5" className="font-mono font-bold">
          LIVE
        </text>

        {/* Divider */}
        <path d="M44 58H716" stroke="rgb(var(--line))"></path>

        {/* $1M Milestone */}
        <g>
          <path d="M108 300.5H564" stroke="rgb(var(--ink))" strokeOpacity=".16" strokeDasharray="3 5"></path>
          <text x="96" y="304.5" fontSize="12" textAnchor="end" fill="rgb(var(--muted))" className="font-mono">
            $1M
          </text>
          <g>
            <rect x="572" y="290.5" width="85" height="20" rx="10" fill="rgb(var(--card))" stroke="rgb(var(--ink))" strokeOpacity=".5"></rect>
            <text x="579" y="304.1" fontSize="9.5" fill="rgb(var(--ink))" letterSpacing=".6" className="font-mono font-semibold">
              MILLIONAIRE
            </text>
          </g>
        </g>

        {/* $2M Milestone */}
        <g>
          <path d="M108 240.1H564" stroke="rgb(var(--ink))" strokeOpacity=".16" strokeDasharray="3 5"></path>
          <text x="96" y="244.1" fontSize="12" textAnchor="end" fill="rgb(var(--muted))" className="font-mono">
            $2M
          </text>
          <g>
            <rect x="572" y="230.1" width="124" height="20" rx="10" fill="rgb(var(--card))" stroke="rgb(var(--ink))" strokeOpacity=".5"></rect>
            <text x="579" y="243.7" fontSize="9.5" fill="rgb(var(--ink))" letterSpacing=".6" className="font-mono font-semibold">
              MULTI-MILLIONAIRE
            </text>
          </g>
        </g>

        {/* $5M Milestone */}
        <g>
          <path d="M108 160.3H564" stroke="rgb(var(--ink))" strokeOpacity=".16" strokeDasharray="3 5"></path>
          <text x="96" y="164.3" fontSize="12" textAnchor="end" fill="rgb(var(--muted))" className="font-mono">
            $5M
          </text>
        </g>

        {/* $10M Milestone */}
        <g>
          <path d="M108 99.9H564" stroke="rgb(var(--ink))" strokeOpacity=".16" strokeDasharray="3 5"></path>
          <text x="96" y="103.9" fontSize="12" textAnchor="end" fill="rgb(var(--muted))" className="font-mono">
            $10M
          </text>
          <g>
            <rect x="572" y="89.9" width="54" height="20" rx="10" fill="rgb(var(--card))" stroke="rgb(var(--ink))" strokeOpacity=".5"></rect>
            <text x="579" y="103.5" fontSize="9.5" fill="rgb(var(--ink))" letterSpacing=".6" className="font-mono font-semibold">
              LEGEND
            </text>
          </g>
        </g>

        {/* Bonding Curve Plot */}
        <g clipPath="url(#hero-plot)">
          <path
            d="M108.0 300.6L117.7 296.8L127.5 292.5L137.2 289.6L146.9 283.5L156.7 277.8L166.4 274.1L176.1 272.3L185.9 267.7L195.6 262.2L205.3 257.6L215.1 252.6L224.8 250.3L234.5 242.9L244.3 238.5L254.0 237.2L263.7 228.4L273.5 224.3L283.2 219.9L292.9 216.4L302.7 212.1L312.4 206.8L322.1 203.7L331.9 199.0L341.6 196.3L351.3 192.5L361.1 184.7L370.8 181.5L380.5 175.5L390.3 173.6L400.0 167.7L409.7 162.8L419.5 159.7L429.2 152.9L438.9 150.0L448.7 147.7L458.4 142.7L468.1 135.8L477.9 134.3L487.6 129.4L497.3 122.9L507.1 119.2L516.8 115.8L526.5 111.3L536.3 105.0L546.0 99.9L546 320L108 320Z"
            fill="url(#hero-area)"
          ></path>
          <path
            d="M108.0 300.6L117.7 296.8L127.5 292.5L137.2 289.6L146.9 283.5L156.7 277.8L166.4 274.1L176.1 272.3L185.9 267.7L195.6 262.2L205.3 257.6L215.1 252.6L224.8 250.3L234.5 242.9L244.3 238.5L254.0 237.2L263.7 228.4L273.5 224.3L283.2 219.9L292.9 216.4L302.7 212.1L312.4 206.8L322.1 203.7L331.9 199.0L341.6 196.3L351.3 192.5L361.1 184.7L370.8 181.5L380.5 175.5L390.3 173.6L400.0 167.7L409.7 162.8L419.5 159.7L429.2 152.9L438.9 150.0L448.7 147.7L458.4 142.7L468.1 135.8L477.9 134.3L487.6 129.4L497.3 122.9L507.1 119.2L516.8 115.8L526.5 111.3L536.3 105.0L546.0 99.9"
            fill="none"
            stroke="rgb(var(--accent))"
            strokeWidth="2.8"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="line-draw"
          ></path>
        </g>

        {/* Start Point */}
        <circle cx="108" cy="300.5" r="4.5" fill="rgb(var(--paper))" stroke="rgb(var(--ink))" strokeWidth="1.5"></circle>
        <text x="118" y="322.5" fontSize="11" fill="rgb(var(--muted))" className="font-mono">
          start · $1,000,000
        </text>

        {/* End Peak Target Badge */}
        <g>
          <circle cx="546" cy="99.9" r="6" fill="rgb(var(--accent))" className="live-pulse"></circle>
          <circle cx="546" cy="99.9" r="4.5" fill="rgb(var(--accent))" stroke="rgb(var(--paper))" strokeWidth="1.5"></circle>
          <rect x="428" y="49.9" width="112" height="34" rx="9" fill="rgb(var(--ink))"></rect>
          <text x="484" y="71.9" fontSize="15" fontWeight="700" textAnchor="middle" fill="rgb(var(--paper))" className="font-pixel">
            $10,000,000
          </text>
          <path d="M528 83.9L540 93.9" stroke="rgb(var(--ink))" strokeWidth="1.5"></path>
        </g>

        {/* Footnote & Gain */}
        <text x="108" y="354" fontSize="11" fill="rgb(var(--muted))" className="font-mono">
          illustration · Robinhood Web3 DBC curve<tspan className="blink">_</tspan>
        </text>
        <text x="700" y="354" fontSize="12" textAnchor="end" fill="rgb(var(--accent))" fontWeight="700" className="font-mono">
          +900.0%
        </text>
      </svg>
    </div>
  );
};
