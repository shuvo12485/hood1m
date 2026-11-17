import React from 'react';

export type LogoVariant = 'feather-arrow' | 'ascending-m' | 'monogram-1m' | 'vault-beacon';

interface BrandLogoProps {
  variant?: LogoVariant;
  className?: string;
  size?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'feather-arrow',
  className = '',
  size = 28,
}) => {
  switch (variant) {
    case 'feather-arrow':
      // Aerodynamic Robinhood Feather terminating into a sharp upward rocket arrow
      return (
        <svg
          viewBox="0 0 48 48"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {/* Feather spine / arrow shaft */}
          <path
            d="M8 40C12 36 24 24 38 10"
            stroke="#00C805"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Arrowhead */}
          <path
            d="M26 8H40V22"
            stroke="#00C805"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Feather vanes - upper side */}
          <path
            d="M17 31C18 24 25 18 35 13"
            stroke="#00C805"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="url(#featherGlow)"
            fillOpacity="0.25"
          />
          {/* Feather vanes - lower side */}
          <path
            d="M11 37C16 34 23 31 31 23"
            stroke="#00E600"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M15 41C20 38 27 34 33 28"
            stroke="#00C805"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />
          <defs>
            <linearGradient id="featherGlow" x1="8" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00C805" />
              <stop offset="1" stopColor="#A3FF2E" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'ascending-m':
      // Geometric letter 'M' formed by an upward exponential financial chart
      return (
        <svg
          viewBox="0 0 48 48"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {/* Chart volume bars */}
          <rect x="8" y="24" width="5" height="16" rx="2" fill="#00C805" fillOpacity="0.4" />
          <rect x="16" y="18" width="5" height="22" rx="2" fill="#00C805" fillOpacity="0.7" />
          <rect x="24" y="22" width="5" height="18" rx="2" fill="#00C805" fillOpacity="0.5" />
          <rect x="32" y="12" width="5" height="28" rx="2" fill="#00C805" />
          {/* Ascending M Line with Arrow */}
          <path
            d="M8 32L17 20L25 28L39 10"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M29 10H39V20"
            stroke="#00C805"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'monogram-1m':
      // Modern cyber luxury 1M monogram
      return (
        <svg
          viewBox="0 0 48 48"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {/* Numeral 1 */}
          <path
            d="M10 16L16 12V36M12 36H20"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Letter M intertwined */}
          <path
            d="M22 36V16L29 27L36 16V36"
            stroke="#00C805"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'vault-beacon':
      // Hexagonal vault with laser pulse
      return (
        <svg
          viewBox="0 0 48 48"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <polygon
            points="24,6 40,15 40,33 24,42 8,33 8,15"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <polygon
            points="24,12 34,18 34,30 24,36 14,30 14,18"
            stroke="#00C805"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <line x1="24" y1="2" x2="24" y2="34" stroke="#00C805" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    default:
      return null;
  }
};
