import { motion } from "framer-motion";
import type { ShopBackground } from "@/context/RewardContext";

// Static SVG-based decorative backgrounds for premium shop themes.
// These render behind the main content when a premium background is active.

const GREEK_PATTERN = `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <pattern id="greek-key" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M0 40h20v-20h20v20h20v-20h20" fill="none" stroke="#C9A961" stroke-width="1.5" opacity="0.12"/>
        <path d="M40 0v20h20v20h-20v20h-20v-20h20" fill="none" stroke="#C9A961" stroke-width="1.5" opacity="0.08"/>
      </pattern>
    </defs>
    <rect width="400" height="400" fill="url(#greek-key)"/>
    <circle cx="100" cy="100" r="30" fill="none" stroke="#C9A961" stroke-width="1" opacity="0.1"/>
    <circle cx="300" cy="300" r="25" fill="none" stroke="#C9A961" stroke-width="1" opacity="0.08"/>
    <path d="M180 80 L220 80 L220 120 L200 140 L180 120 Z" fill="none" stroke="#C9A961" stroke-width="1.5" opacity="0.1"/>
  </svg>
`;

const CHINESE_PATTERN = `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <pattern id="ink-wash" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
        <path d="M20 100 Q40 60 80 90 T160 80" fill="none" stroke="#7BA08C" stroke-width="2" opacity="0.08"/>
        <path d="M100 20 Q120 50 110 90 T140 160" fill="none" stroke="#6B9E7C" stroke-width="1.5" opacity="0.06"/>
        <circle cx="160" cy="40" r="3" fill="#5C6B7A" opacity="0.12"/>
        <circle cx="30" cy="170" r="2" fill="#5C6B7A" opacity="0.1"/>
      </pattern>
    </defs>
    <rect width="400" height="400" fill="url(#ink-wash)"/>
    <path d="M80 320 Q120 280 180 300 T300 290" fill="none" stroke="#5C6B7A" stroke-width="3" opacity="0.1"/>
    <rect x="340" y="20" width="20" height="120" fill="#C9A961" opacity="0.06" rx="2"/>
  </svg>
`;

const DECO_PATTERN = `
  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <defs>
      <pattern id="deco" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="none" stroke="#C9A961" stroke-width="1.2" opacity="0.14"/>
        <path d="M50 30 L70 50 L50 70 L30 50 Z" fill="none" stroke="#B08D57" stroke-width="1" opacity="0.1"/>
      </pattern>
    </defs>
    <rect width="300" height="300" fill="url(#deco)"/>
  </svg>
`;

const WAVE_PATTERN = `
  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
    <defs>
      <pattern id="wave" x="0" y="0" width="120" height="60" patternUnits="userSpaceOnUse">
        <path d="M0 40 Q30 10 60 40 T120 40" fill="none" stroke="#3E6E9E" stroke-width="1.6" opacity="0.12"/>
        <path d="M0 55 Q30 25 60 55 T120 55" fill="none" stroke="#7CA6C9" stroke-width="1.2" opacity="0.09"/>
      </pattern>
    </defs>
    <rect width="240" height="240" fill="url(#wave)"/>
  </svg>
`;

const STAR_PATTERN = `
  <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
    <circle cx="40" cy="60" r="2" fill="#EADFC8" opacity="0.5"/>
    <circle cx="180" cy="30" r="1.5" fill="#EADFC8" opacity="0.4"/>
    <circle cx="260" cy="140" r="2.5" fill="#EADFC8" opacity="0.45"/>
    <circle cx="90" cy="220" r="1.8" fill="#EADFC8" opacity="0.4"/>
    <circle cx="300" cy="280" r="2" fill="#EADFC8" opacity="0.35"/>
    <circle cx="150" cy="180" r="1.2" fill="#EADFC8" opacity="0.5"/>
  </svg>
`;

const CANVAS_PATTERN = `
  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <defs>
      <pattern id="linen" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <path d="M0 0h8M0 4h8" stroke="#B08D57" stroke-width="0.5" opacity="0.09"/>
        <path d="M0 0v8M4 0v8" stroke="#8C6D46" stroke-width="0.5" opacity="0.07"/>
      </pattern>
    </defs>
    <rect width="120" height="120" fill="url(#linen)"/>
  </svg>
`;

const BACKGROUNDS: Record<ShopBackground, { gradient: string; pattern: string }> = {
  "greek-mythology": {
    gradient: "linear-gradient(135deg, #F2EDE3 0%, #F0E8D6 50%, #E8D5CE 100%)",
    pattern: GREEK_PATTERN,
  },
  "chinese-art": {
    gradient: "linear-gradient(135deg, #F4F6F8 0%, #DCE6EF 50%, #D6E3D8 100%)",
    pattern: CHINESE_PATTERN,
  },
  "renaissance-atelier": {
    gradient: "linear-gradient(135deg, #F6EFE2 0%, #EBDCC4 55%, #DCC7A8 100%)",
    pattern: CANVAS_PATTERN,
  },
  "ukiyo-e": {
    gradient: "linear-gradient(135deg, #F3F7FA 0%, #DCE9F2 50%, #CFE0EC 100%)",
    pattern: WAVE_PATTERN,
  },
  "art-deco": {
    gradient: "linear-gradient(135deg, #F7F1E6 0%, #EFE2C9 50%, #E5D3AE 100%)",
    pattern: DECO_PATTERN,
  },
  "cosmic-observatory": {
    gradient: "linear-gradient(135deg, #1B1D2E 0%, #2A2C46 55%, #3B3358 100%)",
    pattern: STAR_PATTERN,
  },
};


interface PremiumBackgroundProps {
  background: ShopBackground;
}

export default function PremiumBackground({ background }: PremiumBackgroundProps) {
  const config = BACKGROUNDS[background];
  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      <div className="absolute inset-0" style={{ background: config.gradient }} />
      <div
        className="absolute inset-0 opacity-40"
        style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(config.pattern)}")`, backgroundRepeat: "repeat" }}
      />
    </motion.div>
  );
}
