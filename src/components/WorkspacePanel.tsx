import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotebookPen, Brush, Eraser, Trash2, X, Download, Check } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { downloadDataUrl } from "@/lib/image-utils";

const COLORS = ["#3B2F2F", "#E08D51", "#D9736A", "#7FA88B", "#7CA6C9", "#A796C9"];

interface WorkspacePanelProps {
  open: boolean;
  onClose: () => void;
}

export default function WorkspacePanel({ open, onClose }: WorkspacePanelProps) {
  const { notes, setNotes, sketch, setSketch } = useWorkspace();
  const [tab, setTab] = useState<"notepad" | "sketchpad">("notepad");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(4);
  const [erasing, setErasing] = useState(false);
  const [saved, setSaved] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  // Restore saved sketch onto the canvas whenever the sketchpad opens.
  useEffect(() => {
    if (!open || tab !== "sketchpad") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFDF8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (sketch) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = sketch;
    }
  }, [open, tab, sketch]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = erasing ? size * 4 : size;
    ctx.strokeStyle = erasing ? "#FFFDF8" : color;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const end = useCallback(() => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) setSketch(canvas.toDataURL("image/png"));
  }, [setSketch]);

  const clearSketch = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#FFFDF8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSketch(null);
  };

  const markSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-deep-earth/50 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.94, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-cream rounded-3xl shadow-card-warm border border-sand/50 w-full max-w-2xl max-h-[88vh] overflow-hidden flex flex-col"
        >
          <div className="bg-gradient-to-r from-pastel-sky/50 to-pastel-lavender/40 px-6 py-4 border-b border-sand/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-sky to-accent-lavender flex items-center justify-center shadow-sticker">
                <NotebookPen size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-deep-earth">Studio Workspace</h2>
                <p className="text-xs text-muted-brown">Your teacher can read these notes and sketches</p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-brown hover:text-deep-earth" aria-label="Close workspace">
              <X size={18} />
            </button>
          </div>

          <div className="flex gap-2 px-6 pt-4">
            {(["notepad", "sketchpad"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-1.5 capitalize transition-all ${
                  tab === t
                    ? "bg-gradient-to-r from-accent-sky to-accent-lavender text-white shadow-sticker"
                    : "bg-white/60 text-muted-brown hover:bg-white"
                }`}
              >
                {t === "notepad" ? <NotebookPen size={12} /> : <Brush size={12} />}
                {t}
              </button>
            ))}
          </div>

          <div className="p-6 overflow-y-auto scroll-warm">
            {tab === "notepad" ? (
              <div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Jot down ideas, goals for this piece, references, questions for your teacher..."
                  className="w-full h-72 resize-none rounded-2xl border border-sand/60 bg-white/80 p-4 text-sm leading-relaxed text-deep-earth placeholder:text-warm-taupe/60 outline-none focus:border-accent-sky"
                />
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-muted-brown">{notes.trim().length} characters · saved automatically</p>
                  <button
                    onClick={markSaved}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-sage bg-pastel-sage/40 rounded-full px-3 py-1.5"
                  >
                    {saved ? <Check size={12} /> : <NotebookPen size={12} />}
                    {saved ? "Saved" : "Save note"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setColor(c);
                        setErasing(false);
                      }}
                      style={{ background: c }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === c && !erasing ? "border-deep-earth scale-110" : "border-white/70"
                      }`}
                      aria-label={`Colour ${c}`}
                    />
                  ))}
                  <input
                    type="range"
                    min={2}
                    max={20}
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="ml-2 w-24 accent-accent-amber"
                    aria-label="Brush size"
                  />
                  <button
                    onClick={() => setErasing((v) => !v)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 ${
                      erasing ? "bg-accent-rose text-white" : "bg-white/70 text-muted-brown"
                    }`}
                  >
                    <Eraser size={12} /> Eraser
                  </button>
                  <button
                    onClick={clearSketch}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 bg-white/70 text-muted-brown hover:text-accent-rose"
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                  <button
                    onClick={() => sketch && downloadDataUrl(sketch, "download.png")}
                    disabled={!sketch}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 bg-white/70 text-muted-brown disabled:opacity-40"
                  >
                    <Download size={12} /> Download
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={960}
                  height={600}
                  onPointerDown={start}
                  onPointerMove={move}
                  onPointerUp={end}
                  onPointerLeave={end}
                  className="w-full rounded-2xl border border-sand/60 bg-white touch-none cursor-crosshair"
                />
                <p className="text-xs text-muted-brown mt-2">
                  Your sketch is sent along with follow-up questions so the teacher can comment on it.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
