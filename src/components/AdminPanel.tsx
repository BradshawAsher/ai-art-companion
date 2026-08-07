import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, Sparkles, Trash2, Database, Loader2, Terminal } from "lucide-react";

import { useAdmin } from "@/context/AdminContext";
import {
  clearDebugEntries,
  subscribeDebugEntries,
  type DebugEntry,
} from "@/lib/debug-log";

/** Model fallback chain, mirrored from the server route for the debug readout. */
const MODEL_CHAIN = [
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-3.1-pro-preview",
  "gemini-2.5-pro",
];

interface AdminPanelProps {
  onSeedDemo: () => Promise<number>;
}

export default function AdminPanel({ onSeedDemo }: AdminPanelProps) {
  const { adminMode, toggleAdminMode, hydrated } = useAdmin();
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<DebugEntry[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  useEffect(() => subscribeDebugEntries(setLogs), []);

  const seed = async () => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      const count = await onSeedDemo();
      setSeedMsg(count > 0 ? `Added ${count} demo entries to the gallery.` : "Couldn't add demo entries.");
    } catch {
      setSeedMsg("Couldn't add demo entries.");
    } finally {
      setSeeding(false);
    }
  };

  if (!hydrated) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-card-soft transition-all ${
          adminMode
            ? "bg-gradient-to-r from-accent-lavender to-accent-sky text-white shadow-glow-sage"
            : "bg-white/80 text-muted-brown border border-sand/50 hover:text-deep-earth"
        }`}
        aria-label="Open admin mode panel"
      >
        <ShieldCheck size={14} />
        {adminMode ? "Admin mode on" : "Admin"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-deep-earth/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-cream rounded-3xl border border-sand/60 shadow-card-warm overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center gap-2 px-6 py-4 border-b border-sand/50 bg-gradient-to-r from-pastel-lavender/40 to-pastel-sky/30">
                <ShieldCheck size={18} className="text-accent-lavender" />
                <h2 className="font-display font-bold text-deep-earth">Admin / Demo Mode</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="ml-auto text-muted-brown hover:text-deep-earth"
                  aria-label="Close admin panel"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto scroll-warm">
                <div className="flex items-start justify-between gap-4 bg-white/70 rounded-2xl border border-sand/40 p-4">
                  <div>
                    <p className="text-sm font-semibold text-deep-earth">Admin mode</p>
                    <p className="text-xs text-muted-brown mt-1 leading-relaxed">
                      Unlimited tokens, every shop item, background, sticker pack and badge unlocked.
                      AI-artwork rejection is skipped so a demo never dead-ends.
                    </p>
                  </div>
                  <button
                    onClick={toggleAdminMode}
                    role="switch"
                    aria-checked={adminMode}
                    className={`relative w-12 h-7 rounded-full flex-shrink-0 transition-colors ${
                      adminMode ? "bg-accent-sage" : "bg-sand"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        adminMode ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="bg-white/70 rounded-2xl border border-sand/40 p-4">
                  <p className="text-sm font-semibold text-deep-earth flex items-center gap-1.5">
                    <Database size={14} className="text-accent-amber" /> Demo gallery data
                  </p>
                  <p className="text-xs text-muted-brown mt-1">
                    Adds three sample critiques so the gallery is never empty on stage.
                  </p>
                  <button
                    onClick={seed}
                    disabled={seeding}
                    className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-accent-amber to-accent-coral text-white text-xs font-semibold rounded-full px-4 py-2 disabled:opacity-50"
                  >
                    {seeding ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    Seed demo entries
                  </button>
                  {seedMsg && <p className="text-xs text-muted-brown mt-2">{seedMsg}</p>}
                </div>

                <div className="bg-white/70 rounded-2xl border border-sand/40 p-4">
                  <p className="text-sm font-semibold text-deep-earth">Model fallback chain</p>
                  <ol className="mt-2 space-y-1">
                    {MODEL_CHAIN.map((m, i) => (
                      <li key={m} className="text-xs text-muted-brown flex items-center gap-2">
                        <span className="w-4 text-right text-warm-taupe">{i + 1}.</span>
                        <code className="text-deep-earth">{m}</code>
                      </li>
                    ))}
                  </ol>
                  <p className="text-[11px] text-warm-taupe mt-2">
                    Each model retries once, then escalates on rate limits, errors or truncated output.
                  </p>
                </div>

                <div className="bg-white/70 rounded-2xl border border-sand/40 p-4">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-accent-sky" />
                    <p className="text-sm font-semibold text-deep-earth">AI request log</p>
                    <button
                      onClick={clearDebugEntries}
                      className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-brown hover:text-accent-rose"
                    >
                      <Trash2 size={11} /> Clear
                    </button>
                  </div>
                  {logs.length === 0 ? (
                    <p className="text-xs text-muted-brown mt-2">
                      No requests yet this session.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {logs.map((entry) => (
                        <li
                          key={entry.id}
                          className="text-[11px] rounded-xl bg-white/70 border border-sand/40 px-3 py-2"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-bold ${
                                entry.status >= 200 && entry.status < 300
                                  ? "text-accent-sage"
                                  : "text-accent-rose"
                              }`}
                            >
                              {entry.status || "ERR"}
                            </span>
                            <span className="text-deep-earth font-semibold">{entry.mode}</span>
                            <span className="text-warm-taupe">{entry.ms}ms</span>
                            {entry.model && (
                              <code className="text-accent-lavender">{entry.model}</code>
                            )}
                            <span className="ml-auto text-warm-taupe">
                              {new Date(entry.at).toLocaleTimeString()}
                            </span>
                          </div>
                          {entry.error && <p className="text-accent-rose mt-1">{entry.error}</p>}
                          {entry.preview && (
                            <p className="text-muted-brown mt-1 line-clamp-2">{entry.preview}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
