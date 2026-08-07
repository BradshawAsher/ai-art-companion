import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, Coins, Loader2, NotebookPen, Brush } from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { postAnalyze } from "@/lib/api-client";
import { useWorkspace } from "@/context/WorkspaceContext";

interface FollowupChatProps {
  artworkContext: string | null;
  onTokensEarned: (amount: number, reason: string) => void;
  onQuestionAsked?: () => void;
  artworkBase64?: string | null;
  artworkMimeType?: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How can I practice this?",
  "Can you explain that technique?",
  "What masters should I study?",
  "Give me a step-by-step plan for my next piece",
];

export default function FollowupChat({
  artworkContext,
  onTokensEarned,
  onQuestionAsked,
  artworkBase64,
  artworkMimeType,
}: FollowupChatProps) {
  const { notes, sketch } = useWorkspace();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [includeSketch, setIncludeSketch] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || loading || !artworkContext) return;

      const userMsg: Message = { role: "user", content: question };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setError(null);
      setLoading(true);
      if (onQuestionAsked) onQuestionAsked();

      try {
        // Full conversation history is resent so the teacher keeps context.
        const data = await postAnalyze<{ feedback?: string }>({
          mode: "followup",
          history: newMessages,
          previousFeedback: artworkContext,
          notes,
          sketchBase64: includeSketch ? sketch : null,
          artworkBase64: artworkBase64 ?? null,
          artworkMimeType: artworkMimeType ?? null,
        });

        if (!data?.feedback) throw new Error("Couldn't get a response");

        setMessages([...newMessages, { role: "assistant", content: data.feedback }]);
        setExchangeCount((prev) => {
          const next = prev + 1;
          if (next === 1) onTokensEarned(3, "First follow-up question");
          else if (next === 3) onTokensEarned(5, "Deep engagement");
          else if (next === 5) onTokensEarned(8, "Master apprentice dialogue");
          else if (next % 2 === 0) onTokensEarned(2, "Continued conversation");
          return next;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        setMessages(newMessages);
      } finally {
        setLoading(false);
      }
    },
    [
      loading,
      artworkContext,
      messages,
      onTokensEarned,
      onQuestionAsked,
      notes,
      sketch,
      includeSketch,
      artworkBase64,
      artworkMimeType,
    ],
  );

  const retryLast = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setMessages((prev) => prev.filter((m) => m !== lastUser));
    setTimeout(() => send(lastUser.content), 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-5 bg-white/70 backdrop-blur-sm rounded-2xl border border-accent-sky/20 shadow-card-soft overflow-hidden"
    >
      <div className="bg-gradient-to-r from-pastel-sky/40 to-pastel-lavender/30 px-5 py-3 border-b border-accent-sky/20 flex items-center gap-2">
        <MessageCircle size={16} className="text-accent-sky" />
        <span className="text-sm font-semibold text-deep-earth">Continue the conversation</span>
        <span className="ml-auto flex items-center gap-1 text-xs text-muted-brown">
          <Coins size={12} className="text-accent-amber" />
          {exchangeCount} exchanges
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="px-5 pt-5 text-center">
          <p className="text-deep-earth font-semibold text-sm">Want to dig deeper?</p>
          <p className="text-muted-brown text-xs mt-1 mb-3">
            Ask a follow-up and the teacher will refine or expand the feedback — earning you bonus tokens.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {SUGGESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-xs bg-white/70 hover:bg-white text-muted-brown hover:text-deep-earth border border-sand/50 rounded-full px-3 py-1.5 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div ref={scrollRef} className="max-h-[300px] overflow-y-auto scroll-warm p-5 space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-accent-amber to-accent-coral text-white rounded-br-sm"
                      : "bg-gradient-to-br from-pastel-butter to-pastel-amber/30 text-deep-earth rounded-bl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="text-sm leading-relaxed">
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-br from-pastel-butter to-pastel-amber/30 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-accent-amber" />
                <span className="text-sm text-muted-brown">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mx-5 mb-3 rounded-xl bg-pastel-rose/40 border border-accent-rose/30 px-4 py-2.5 flex items-center justify-between gap-3">
          <p className="text-xs text-accent-rose">{error}</p>
          <button
            onClick={retryLast}
            className="text-xs font-semibold text-accent-rose bg-white/70 rounded-full px-3 py-1"
          >
            Retry
          </button>
        </div>
      )}

      {(notes.trim() || sketch) && (
        <div className="px-5 pb-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-brown">
          {notes.trim() && (
            <span className="inline-flex items-center gap-1 bg-pastel-sky/40 rounded-full px-2.5 py-1">
              <NotebookPen size={11} /> Notepad shared
            </span>
          )}
          {sketch && (
            <button
              onClick={() => setIncludeSketch((v) => !v)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${
                includeSketch ? "bg-pastel-lavender/50 text-deep-earth" : "bg-white/60"
              }`}
            >
              <Brush size={11} /> {includeSketch ? "Sketch shared" : "Sketch hidden"}
            </button>
          )}
        </div>
      )}

      <div className="border-t border-sand/50 p-3 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask a follow-up question..."
          className="flex-1 bg-transparent text-sm text-deep-earth placeholder:text-warm-taupe/60 px-3 py-2 outline-none"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className="bg-gradient-to-r from-accent-amber to-accent-coral hover:from-accent-amber-deep hover:to-accent-rose disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full p-2 transition-all shadow-glow-amber"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </motion.div>
  );
}
