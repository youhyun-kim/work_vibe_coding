import React from 'react';

interface FlagAvatarProps {
  country: 'kr' | 'de' | 'korea' | 'germany' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  alt?: string;
}

export const KoreaFlagSvg: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 72 48"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    {/* White Background */}
    <rect width="72" height="48" fill="#FFFFFF" rx="2" />
    
    {/* Trigrams in Black */}
    {/* Top Left: Geon (3 solid bars) */}
    <g transform="translate(18, 14) rotate(-33.69)" stroke="#000000" strokeWidth="1.8" strokeLinecap="round">
      <line x1="-7" y1="-3.2" x2="7" y2="-3.2" />
      <line x1="-7" y1="0" x2="7" y2="0" />
      <line x1="-7" y1="3.2" x2="7" y2="3.2" />
    </g>

    {/* Bottom Right: Gon (3 split bars) */}
    <g transform="translate(54, 34) rotate(-33.69)" stroke="#000000" strokeWidth="1.8" strokeLinecap="round">
      <line x1="-7" y1="-3.2" x2="-1.2" y2="-3.2" />
      <line x1="1.2" y1="-3.2" x2="7" y2="-3.2" />
      <line x1="-7" y1="0" x2="-1.2" y2="0" />
      <line x1="1.2" y1="0" x2="7" y2="0" />
      <line x1="-7" y1="3.2" x2="-1.2" y2="3.2" />
      <line x1="1.2" y1="3.2" x2="7" y2="3.2" />
    </g>

    {/* Top Right: Gam (split, solid, split) */}
    <g transform="translate(54, 14) rotate(33.69)" stroke="#000000" strokeWidth="1.8" strokeLinecap="round">
      <line x1="-7" y1="-3.2" x2="-1.2" y2="-3.2" />
      <line x1="1.2" y1="-3.2" x2="7" y2="-3.2" />
      <line x1="-7" y1="0" x2="7" y2="0" />
      <line x1="-7" y1="3.2" x2="-1.2" y2="3.2" />
      <line x1="1.2" y1="3.2" x2="7" y2="3.2" />
    </g>

    {/* Bottom Left: Ri (solid, split, solid) */}
    <g transform="translate(18, 34) rotate(33.69)" stroke="#000000" strokeWidth="1.8" strokeLinecap="round">
      <line x1="-7" y1="-3.2" x2="7" y2="-3.2" />
      <line x1="-7" y1="0" x2="-1.2" y2="0" />
      <line x1="1.2" y1="0" x2="7" y2="0" />
      <line x1="-7" y1="3.2" x2="7" y2="3.2" />
    </g>

    {/* Center Taegeuk (Circle radius 12 rotated by 33.69 deg) */}
    <g transform="translate(36, 24) rotate(-33.69)">
      {/* Top half red */}
      <path d="M -12,0 A 12,12 0 0,1 12,0 A 6,6 0 0,1 0,0 A 6,6 0 0,0 -12,0 Z" fill="#CD2E3A" />
      {/* Bottom half blue */}
      <path d="M 12,0 A 12,12 0 0,1 -12,0 A 6,6 0 0,1 0,0 A 6,6 0 0,0 12,0 Z" fill="#0047A0" />
    </g>
  </svg>
);

export const GermanyFlagSvg: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 72 48"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    {/* Black Top */}
    <rect width="72" height="16" y="0" fill="#000000" />
    {/* Red Middle */}
    <rect width="72" height="16" y="16" fill="#DD0000" />
    {/* Gold/Yellow Bottom */}
    <rect width="72" height="16" y="32" fill="#FFCE00" />
  </svg>
);

export const FlagAvatar: React.FC<FlagAvatarProps> = ({
  country,
  size = 'md',
  className = '',
  alt = 'Flag',
}) => {
  const isKr =
    country === 'kr' ||
    country === 'korea' ||
    country === 'eurotech_korea' ||
    country.toLowerCase().includes('korea') ||
    country.toLowerCase().includes('kr');

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
  }[size] || 'w-8 h-8';

  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center border shadow-md shrink-0 aspect-square ${
        isKr ? 'border-slate-300 bg-white ring-1 ring-blue-500/30' : 'border-slate-700 bg-slate-950 ring-1 ring-amber-500/30'
      } ${sizeClasses} ${className}`}
      title={isKr ? '대한민국 / 유로테크 (Korea)' : '독일 / Wallpen GmbH (Germany)'}
      aria-label={alt}
    >
      {isKr ? (
        <KoreaFlagSvg className="w-full h-full object-cover scale-110" />
      ) : (
        <GermanyFlagSvg className="w-full h-full object-cover scale-110" />
      )}
    </div>
  );
};
