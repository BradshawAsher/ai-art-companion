import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

interface WorkspaceContextValue {
  notes: string;
  setNotes: (value: string) => void;
  sketch: string | null; // PNG data URL
  setSketch: (value: string | null) => void;
  /** Text summary of the notepad the AI can read. */
  workspacePrompt: string;
  hasWorkspaceContent: boolean;
}

const STORAGE_KEY = "atelier_workspace_v1";

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState("");
  const [sketch, setSketch] = useState<string | null>(null);

  // Read persisted state after hydration to keep SSR markup stable.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.notes === "string") setNotes(parsed.notes);
        if (typeof parsed.sketch === "string") setSketch(parsed.sketch);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes, sketch }));
    } catch {
      // ignore (quota)
    }
  }, [notes, sketch]);

  const updateNotes = useCallback((value: string) => setNotes(value), []);
  const updateSketch = useCallback((value: string | null) => setSketch(value), []);

  const workspacePrompt = notes.trim()
    ? `The student's notepad contains the following notes — reference them when relevant:\n"""\n${notes.trim().slice(0, 4000)}\n"""`
    : "";

  return (
    <WorkspaceContext.Provider
      value={{
        notes,
        setNotes: updateNotes,
        sketch,
        setSketch: updateSketch,
        workspacePrompt,
        hasWorkspaceContent: Boolean(notes.trim() || sketch),
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
