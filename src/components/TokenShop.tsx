import { AnimatePresence, motion } from "framer-motion";
import {
  Coins, Check, Lock, Sparkles, Mountain, Palette, Wand2, Loader2,
  Music, Brush, Frame, Star, Search, Droplet, Grid3x3, BookOpen, Download,
  Snowflake, Flower2, Moon, Volume2, Landmark, Waves,
} from "lucide-react";
import { useState } from "react";
import { useReward, type ShopBackground, type ShopItem } from "@/context/RewardContext";

type Category = "all" | "backgrounds" | "tools" | "cosmetic";

interface ShopItemDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: typeof Coins;
  accent: string;
  type: "background" | "item";
  value: string;
  category: Category;
  badge?: string;
}

const SHOP_ITEMS: ShopItemDef[] = [
  {
    id: "greek-mythology",
    name: "Greek Mythology",
    description: "Marble textures with Olympian motifs and gold accents. Transform your studio into a temple of the arts.",
    cost: 75,
    icon: Mountain,
    accent: "from-amber-400 to-yellow-600",
    type: "background",
    value: "greek-mythology",
    category: "backgrounds",
  },
  {
    id: "chinese-art",
    name: "Chinese Art",
    description: "Brush-stroke landscapes with jade greens and ink-wash styling inspired by classical Chinese painting.",
    cost: 75,
    icon: Palette,
    accent: "from-emerald-600 to-teal-800",
    type: "background",
    value: "chinese-art",
    category: "backgrounds",
  },
  {
    id: "renaissance-atelier",
    name: "Renaissance Atelier",
    description: "Warm linen canvas texture and candlelit ochres — the workshop of the old masters.",
    cost: 85,
    icon: Landmark,
    accent: "from-amber-600 to-orange-800",
    type: "background",
    value: "renaissance-atelier",
    category: "backgrounds",
  },
  {
    id: "ukiyo-e",
    name: "Ukiyo-e Waves",
    description: "Japanese woodblock waves in indigo and mist. Calm, rhythmic, and endlessly inspiring.",
    cost: 85,
    icon: Waves,
    accent: "from-sky-500 to-indigo-700",
    type: "background",
    value: "ukiyo-e",
    category: "backgrounds",
  },
  {
    id: "art-deco",
    name: "Art Deco Gold",
    description: "Geometric gilded diamonds and champagne tones from the roaring twenties.",
    cost: 90,
    icon: Frame,
    accent: "from-yellow-500 to-amber-700",
    type: "background",
    value: "art-deco",
    category: "backgrounds",
  },
  {
    id: "cosmic-observatory",
    name: "Cosmic Observatory",
    description: "A deep midnight sky scattered with stars for late-night studio sessions.",
    cost: 110,
    icon: Moon,
    accent: "from-indigo-700 to-purple-900",
    type: "background",
    value: "cosmic-observatory",
    category: "backgrounds",
    badge: "New",
  },
  {
    id: "generate-masterpiece",
    name: "Generate Masterpiece",
    description: "Commission the AI to generate a unique master image inspired by your past artwork styles. A one-of-a-kind reward.",
    cost: 100,
    icon: Wand2,
    accent: "from-purple-500 to-fuchsia-600",
    type: "item",
    value: "generate-masterpiece",
    category: "tools",
    badge: "Premium",
  },
  {
    id: "frame-gold",
    name: "Golden Frame",
    description: "Wrap your next critique in an ornate golden gallery frame. A prestigious touch for your feedback card.",
    cost: 40,
    icon: Frame,
    accent: "from-amber-400 to-orange-500",
    type: "item",
    value: "frame-gold",
    category: "cosmetic",
  },
  {
    id: "frame-baroque",
    name: "Baroque Frame",
    description: "An elaborate baroque frame with carved details. Make every critique feel like a museum exhibition.",
    cost: 60,
    icon: Frame,
    accent: "from-amber-700 to-yellow-800",
    type: "item",
    value: "frame-baroque",
    category: "cosmetic",
  },
  {
    id: "frame-minimal",
    name: "Minimal Gallery Frame",
    description: "A crisp, contemporary white frame for artists who prefer the work to speak for itself.",
    cost: 30,
    icon: Frame,
    accent: "from-slate-300 to-slate-500",
    type: "item",
    value: "frame-minimal",
    category: "cosmetic",
  },
  {
    id: "ambient-sounds",
    name: "Ambient Studio Sounds",
    description: "Unlock background ambient audio — gentle brushstrokes, birdsong, or rain — while you create and reflect.",
    cost: 50,
    icon: Music,
    accent: "from-sky-400 to-blue-600",
    type: "item",
    value: "ambient-sounds",
    category: "tools",
  },
  {
    id: "narrator-voice",
    name: "Warm Narrator Voice",
    description: "A richer, slower narration voice for read-aloud critiques. Easier on the ears during long sessions.",
    cost: 45,
    icon: Volume2,
    accent: "from-rose-300 to-rose-500",
    type: "item",
    value: "narrator-voice",
    category: "tools",
  },
  {
    id: "critique-spotlight",
    name: "Critique Spotlight",
    description: "A dramatic spotlight effect illuminates your artwork during analysis. Makes the review feel cinematic.",
    cost: 35,
    icon: Star,
    accent: "from-yellow-400 to-amber-500",
    type: "item",
    value: "critique-spotlight",
    category: "cosmetic",
  },
  {
    id: "extra-critique",
    name: "Deep Dive Critique",
    description: "Unlock an extended, more detailed critique with additional technique recommendations and master studies.",
    cost: 80,
    icon: Brush,
    accent: "from-rose-400 to-pink-600",
    type: "item",
    value: "extra-critique",
    category: "tools",
    badge: "Best Value",
  },
  {
    id: "colour-analysis",
    name: "Colour Harmony Report",
    description: "A dedicated breakdown of your palette — temperature, harmony type, and suggested accents.",
    cost: 55,
    icon: Droplet,
    accent: "from-cyan-400 to-teal-600",
    type: "item",
    value: "colour-analysis",
    category: "tools",
  },
  {
    id: "composition-grid",
    name: "Composition Grid Overlay",
    description: "Overlay rule-of-thirds, golden ratio and diagonal guides directly on your uploaded artwork.",
    cost: 45,
    icon: Grid3x3,
    accent: "from-lime-400 to-green-600",
    type: "item",
    value: "composition-grid",
    category: "tools",
  },
  {
    id: "master-study-plan",
    name: "Master Study Plan",
    description: "A personalised four-week practice plan built from your critiques and skill level.",
    cost: 95,
    icon: BookOpen,
    accent: "from-orange-400 to-red-600",
    type: "item",
    value: "master-study-plan",
    category: "tools",
    badge: "Popular",
  },
  {
    id: "palette-generator",
    name: "Palette Generator",
    description: "Generate custom colour palettes drawn from your own artwork to reuse in future pieces.",
    cost: 50,
    icon: Palette,
    accent: "from-fuchsia-400 to-purple-600",
    type: "item",
    value: "palette-generator",
    category: "tools",
  },
  {
    id: "portfolio-export",
    name: "Portfolio Export",
    description: "Export your gallery and critiques as a shareable, printable portfolio document.",
    cost: 70,
    icon: Download,
    accent: "from-blue-400 to-indigo-600",
    type: "item",
    value: "portfolio-export",
    category: "tools",
  },
  {
    id: "streak-freeze",
    name: "Streak Freeze",
    description: "Protect your upload streak for one missed day. Life happens — your progress stays.",
    cost: 65,
    icon: Snowflake,
    accent: "from-sky-300 to-cyan-500",
    type: "item",
    value: "streak-freeze",
    category: "tools",
  },
  {
    id: "sticker-pack-botanical",
    name: "Botanical Sticker Pack",
    description: "Pressed flowers, ferns and vines to decorate your critiques and sticker canvas.",
    cost: 40,
    icon: Flower2,
    accent: "from-green-300 to-emerald-600",
    type: "item",
    value: "sticker-pack-botanical",
    category: "cosmetic",
  },
  {
    id: "sticker-pack-celestial",
    name: "Celestial Sticker Pack",
    description: "Moons, constellations and comets for dreamers working late into the night.",
    cost: 55,
    icon: Sparkles,
    accent: "from-indigo-400 to-violet-600",
    type: "item",
    value: "sticker-pack-celestial",
    category: "cosmetic",
  },
];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All Items" },
  { value: "backgrounds", label: "Backgrounds" },
  { value: "tools", label: "Tools" },
  { value: "cosmetic", label: "Cosmetic" },
];


interface TokenShopProps {
  open: boolean;
  onClose: () => void;
  onGenerateMasterpiece: () => void;
}

export default function TokenShop({ open, onClose, onGenerateMasterpiece }: TokenShopProps) {
  const { tokens, purchasedBackgrounds, purchasedItems, activeBackground, purchaseBackground, purchaseItem, setActiveBackground } = useReward();
  const [generating, setGenerating] = useState(false);
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"default" | "price-asc" | "price-desc">("default");

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [coinBurst, setCoinBurst] = useState<number | null>(null);
  const [pulseId, setPulseId] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    if (type === "success") {
      setCoinBurst(Date.now());
      setTimeout(() => setCoinBurst(null), 1200);
    }
    setTimeout(() => setToast(null), 2800);
  };

  const handlePurchase = (item: ShopItemDef) => {
    setPulseId(item.id);
    setTimeout(() => setPulseId(null), 600);
    if (item.type === "background") {
      if (purchasedBackgrounds.includes(item.value as ShopBackground)) {
        setActiveBackground(activeBackground === item.value as ShopBackground ? null : item.value as ShopBackground);
        showToast(activeBackground === item.value as ShopBackground ? `${item.name} deactivated` : `${item.name} activated!`);
      } else if (purchaseBackground(item.value as ShopBackground, item.cost)) {
        showToast(`${item.name} unlocked! -${item.cost} tokens`);
      } else {
        showToast("Not enough tokens!", "error");
      }
    } else {
      if (item.value === "generate-masterpiece") {
        if (purchasedItems.includes(item.value as ShopItem)) {
          triggerMasterpiece();
        } else if (purchaseItem(item.value as ShopItem, item.cost)) {
          showToast("Masterpiece commissioned!", "success");
          triggerMasterpiece();
        } else {
          showToast("Not enough tokens!", "error");
        }
      } else {
        if (!purchasedItems.includes(item.value as ShopItem)) {
          if (purchaseItem(item.value as ShopItem, item.cost)) {
            showToast(`${item.name} unlocked! -${item.cost} tokens`);
          } else {
            showToast("Not enough tokens!", "error");
          }
        } else {
          showToast(`${item.name} already owned`, "error");
        }
      }
    }
  };

  const triggerMasterpiece = () => {
    setGenerating(true);
    onGenerateMasterpiece();
  };

  const q = query.trim().toLowerCase();
  const filteredItems = SHOP_ITEMS
    .filter((i) => (category === "all" ? true : i.category === category))
    .filter((i) => (q ? `${i.name} ${i.description}`.toLowerCase().includes(q) : true))
    .sort((a, b) =>
      sort === "price-asc" ? a.cost - b.cost : sort === "price-desc" ? b.cost - a.cost : 0,
    );


  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-deep-earth/50 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-cream rounded-3xl shadow-card-warm border border-sand/50 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pastel-amber/50 to-pastel-coral/40 px-6 py-5 border-b border-sand/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-amber to-accent-coral flex items-center justify-center shadow-sticker">
              <Coins size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-deep-earth">Token Shop</h2>
              <p className="text-xs text-muted-brown">Spend your earned tokens to unlock premium features</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/70 rounded-full px-3 py-1.5 border border-accent-amber/30">
              <Coins size={14} className="text-accent-amber-deep" />
              <span className="font-bold text-deep-earth text-sm tabular-nums">{tokens}</span>
            </div>
            <button
              onClick={onClose}
              className="text-muted-brown hover:text-deep-earth text-sm font-medium transition-colors"
              aria-label="Close shop"
            >
              Close
            </button>
          </div>
        </div>

        {/* Search + Sort */}
        <div className="px-6 pt-4 flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[180px] flex items-center gap-2 bg-white/70 border border-sand/50 rounded-full px-3 py-1.5">
            <Search size={14} className="text-muted-brown" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the shop..."
              className="flex-1 bg-transparent text-sm text-deep-earth placeholder:text-warm-taupe/60 outline-none"
              aria-label="Search shop items"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="bg-white/70 border border-sand/50 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-brown outline-none"
            aria-label="Sort shop items"
          >
            <option value="default">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 px-6 pt-3 pb-2 border-b border-sand/30">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`text-xs font-semibold rounded-full px-3.5 py-1.5 transition-all ${
                category === cat.value
                  ? "bg-gradient-to-r from-accent-amber to-accent-coral text-white shadow-sticker"
                  : "bg-white/50 text-muted-brown hover:bg-white/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="ml-auto self-center text-[11px] text-muted-brown">
            {filteredItems.length} item{filteredItems.length === 1 ? "" : "s"}
          </span>
        </div>


        {/* Items */}
        <div className="overflow-y-auto scroll-warm p-6 space-y-3">
          {filteredItems.map((item) => {
            const isBg = item.type === "background";
            const bgValue = item.value as ShopBackground;
            const itemValue = item.value as ShopItem;
            const isPurchased = isBg ? purchasedBackgrounds.includes(bgValue) : purchasedItems.includes(itemValue);
            const isActive = isBg && activeBackground === bgValue;
            const canAfford = tokens >= item.cost;
            const disabled = !isPurchased && !canAfford;
            const Icon = item.icon;
            const isMasterpiece = item.value === "generate-masterpiece";

            return (
              <motion.div
                key={item.id}
                layout
                className={`relative bg-white/70 rounded-2xl border-2 p-4 transition-all duration-200 ${
                  isActive ? "border-accent-sage shadow-glow-sage" : isPurchased ? "border-accent-sage/40" : disabled ? "border-sand/40 opacity-60" : "border-sand/50 hover:border-accent-amber/40"
                }`}
              >
                {item.badge && (
                  <div className="absolute -top-2 right-3 bg-gradient-to-r from-accent-rose to-accent-coral text-white text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sticker">
                    {item.badge}
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${item.accent} flex items-center justify-center shadow-sticker`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-deep-earth text-base">{item.name}</h3>
                    <p className="text-sm text-muted-brown leading-relaxed mt-0.5">{item.description}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5">
                        <Coins size={14} className="text-accent-amber-deep" />
                        <span className="font-semibold text-deep-earth text-sm">{item.cost} tokens</span>
                      </div>

                      {isPurchased ? (
                        isMasterpiece ? (
                          <button
                            onClick={() => handlePurchase(item)}
                            className={`inline-flex items-center gap-1.5 text-sm font-medium rounded-full px-4 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white hover:shadow-glow-rose transition-all ${pulseId === item.id ? 'animate-pulse-soft scale-110' : ''}`}
                          >
                            <Sparkles size={14} /> Generate
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePurchase(item)}
                            className={`inline-flex items-center gap-1.5 text-sm font-medium rounded-full px-4 py-2 transition-all ${
                              isActive
                                ? "bg-accent-sage text-white"
                                : "bg-pastel-sage/40 text-accent-sage hover:bg-pastel-sage/60"
                            } ${pulseId === item.id ? 'scale-110' : ''}`}
                          >
                            {isActive ? (<><Check size={14} /> Active</>) : isBg ? (<><Sparkles size={14} /> Activate</>) : (<><Check size={14} /> Owned</>)}
                          </button>
                        )
                      ) : isMasterpiece && generating ? (
                        <div className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-brown px-4 py-2">
                          <Loader2 size={14} className="animate-spin" /> Generating...
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePurchase(item)}
                          disabled={disabled}
                          className={`inline-flex items-center gap-1.5 text-sm font-medium rounded-full px-4 py-2 transition-all ${
                            disabled
                              ? "bg-sand/40 text-warm-taupe cursor-not-allowed"
                              : "bg-gradient-to-r from-accent-amber to-accent-coral text-white hover:shadow-glow-amber"
                          } ${pulseId === item.id ? 'scale-110' : ''}`}
                        >
                          {disabled ? <><Lock size={14} /> Locked</> : <><Coins size={14} /> Purchase</>}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] font-bold px-6 py-3.5 rounded-full text-sm whitespace-nowrap shadow-2xl ${
              toast.type === "success"
                ? "bg-gradient-to-r from-accent-amber via-accent-coral to-accent-rose text-white shadow-glow-amber"
                : "bg-gradient-to-r from-accent-rose to-accent-coral text-white"
            }`}
          >
            <span className="relative z-10">{toast.msg}</span>
            {coinBurst && toast.type === "success" && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  const dist = 60 + Math.random() * 40;
                  return (
                    <motion.div
                      key={`${coinBurst}-${i}`}
                      initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                      animate={{ opacity: 0, x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: 1.2 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute top-1/2 left-1/2 w-4 h-4 -ml-2 -mt-2 rounded-full bg-accent-amber shadow-glow-amber"
                    />
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
