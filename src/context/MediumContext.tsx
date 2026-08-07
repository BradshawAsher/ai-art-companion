import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Medium =
  | "none"
  | "watercolor"
  | "oil-paint"
  | "gouache"
  | "charcoal"
  | "digital-illustration";

export const MEDIUM_LABELS: Record<Medium, string> = {
  "none": "No preference",
  "watercolor": "Watercolor",
  "oil-paint": "Oil Paint",
  "gouache": "Gouache",
  "charcoal": "Charcoal",
  "digital-illustration": "Digital Illustration",
};

export const MEDIUM_API_VALUES: Record<Medium, string> = {
  "none": "",
  "watercolor": "watercolor",
  "oil-paint": "oil paint",
  "gouache": "gouache",
  "charcoal": "charcoal",
  "digital-illustration": "digital illustration",
};

interface MediumContextValue {
  medium: Medium;
  setMedium: (m: Medium) => void;
}

const STORAGE_KEY = "atelier_preferred_medium_v1";

const MediumContext = createContext<MediumContextValue | null>(null);

export function MediumProvider({ children }: { children: ReactNode }) {
  const [medium, setMediumState] = useState<Medium>("none");

  // Read persisted preference after hydration so SSR markup stays stable.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved in MEDIUM_LABELS) setMediumState(saved as Medium);
    } catch {
      // ignore
    }
  }, []);

  const setMedium = (m: Medium) => {
    setMediumState(m);
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {
      // ignore
    }
  };

  return (
    <MediumContext.Provider value={{ medium, setMedium }}>
      {children}
    </MediumContext.Provider>
  );
}

export function useMedium() {
  const ctx = useContext(MediumContext);
  if (!ctx) throw new Error("useMedium must be used within MediumProvider");
  return ctx;
}
