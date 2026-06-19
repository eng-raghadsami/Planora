export default function AIPlanetIcon({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="aip-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="45%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <radialGradient id="aip-shine" cx="36%" cy="28%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.42)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      {/* Outer glow ring */}
      <circle cx="24" cy="24" r="23" fill="none" stroke="url(#aip-grad)" strokeWidth="1" strokeOpacity="0.35" />
      {/* Main orb */}
      <circle cx="24" cy="24" r="19" fill="url(#aip-grad)" />
      <circle cx="24" cy="24" r="19" fill="url(#aip-shine)" />
      {/* Hexagonal neural nodes */}
      <circle cx="24"   cy="9.5"  r="2.8" fill="white" opacity="0.93" />
      <circle cx="36"   cy="16.5" r="2.2" fill="white" opacity="0.78" />
      <circle cx="36"   cy="31.5" r="2.8" fill="white" opacity="0.93" />
      <circle cx="24"   cy="38.5" r="2.2" fill="white" opacity="0.78" />
      <circle cx="12"   cy="31.5" r="2.8" fill="white" opacity="0.93" />
      <circle cx="12"   cy="16.5" r="2.2" fill="white" opacity="0.78" />
      {/* Outer ring connections */}
      <line x1="24" y1="9.5"  x2="36" y2="16.5" stroke="white" strokeWidth="1.3" strokeOpacity="0.55" />
      <line x1="36" y1="16.5" x2="36" y2="31.5" stroke="white" strokeWidth="1.3" strokeOpacity="0.55" />
      <line x1="36" y1="31.5" x2="24" y2="38.5" stroke="white" strokeWidth="1.3" strokeOpacity="0.55" />
      <line x1="24" y1="38.5" x2="12" y2="31.5" stroke="white" strokeWidth="1.3" strokeOpacity="0.55" />
      <line x1="12" y1="31.5" x2="12" y2="16.5" stroke="white" strokeWidth="1.3" strokeOpacity="0.55" />
      <line x1="12" y1="16.5" x2="24" y2="9.5"  stroke="white" strokeWidth="1.3" strokeOpacity="0.55" />
      {/* Spokes to center (dashed) */}
      <line x1="24" y1="24" x2="24"   y2="9.5"  stroke="white" strokeWidth="0.9" strokeOpacity="0.28" strokeDasharray="2 2.5" />
      <line x1="24" y1="24" x2="36"   y2="16.5" stroke="white" strokeWidth="0.9" strokeOpacity="0.28" strokeDasharray="2 2.5" />
      <line x1="24" y1="24" x2="36"   y2="31.5" stroke="white" strokeWidth="0.9" strokeOpacity="0.28" strokeDasharray="2 2.5" />
      <line x1="24" y1="24" x2="24"   y2="38.5" stroke="white" strokeWidth="0.9" strokeOpacity="0.28" strokeDasharray="2 2.5" />
      <line x1="24" y1="24" x2="12"   y2="31.5" stroke="white" strokeWidth="0.9" strokeOpacity="0.28" strokeDasharray="2 2.5" />
      <line x1="24" y1="24" x2="12"   y2="16.5" stroke="white" strokeWidth="0.9" strokeOpacity="0.28" strokeDasharray="2 2.5" />
      {/* Center node */}
      <circle cx="24" cy="24" r="4.2" fill="white" opacity="0.96" />
      <circle cx="24" cy="24" r="2.2" fill="url(#aip-grad)" />
    </svg>
  );
}

/* AI neural icon */
