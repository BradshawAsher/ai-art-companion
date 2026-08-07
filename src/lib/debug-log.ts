/**
 * Tiny in-memory log of AI requests, used by the admin debug panel.
 * Lives outside React so the low-level api-client can write to it.
 */
export interface DebugEntry {
  id: number;
  at: string;
  mode: string;
  status: number;
  ms: number;
  model?: string | null;
  error?: string | null;
  preview?: string | null;
}

const MAX_ENTRIES = 40;

let entries: DebugEntry[] = [];
let nextId = 1;
const listeners = new Set<(entries: DebugEntry[]) => void>();

function emit() {
  for (const listener of listeners) listener(entries);
}

export function pushDebugEntry(entry: Omit<DebugEntry, "id" | "at">) {
  entries = [{ ...entry, id: nextId++, at: new Date().toISOString() }, ...entries].slice(
    0,
    MAX_ENTRIES,
  );
  emit();
}

export function clearDebugEntries() {
  entries = [];
  emit();
}

export function getDebugEntries(): DebugEntry[] {
  return entries;
}

export function subscribeDebugEntries(listener: (entries: DebugEntry[]) => void): () => void {
  listeners.add(listener);
  listener(entries);
  return () => listeners.delete(listener);
}
