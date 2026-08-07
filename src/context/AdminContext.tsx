import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

/**
 * Admin / demo mode. Purely a presentation-layer switch stored in localStorage:
 * it unlocks every cosmetic reward, reveals the debug panel, and skips the
 * AI-artwork rejection so a live demo can never dead-end.
 */
interface AdminContextValue {
  adminMode: boolean;
  setAdminMode: (value: boolean) => void;
  toggleAdminMode: () => void;
  hydrated: boolean;
}

const STORAGE_KEY = "atelier_admin_mode_v1";

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminMode, setAdminMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      setAdminMode(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      // ignore
    }
    loaded.current = true;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, String(adminMode));
    } catch {
      // ignore
    }
  }, [adminMode]);

  const toggleAdminMode = useCallback(() => setAdminMode((v) => !v), []);

  return (
    <AdminContext.Provider value={{ adminMode, setAdminMode, toggleAdminMode, hydrated }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
