"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always starts as "light" so the client's first render matches the
  // server-rendered HTML exactly. The blocking inline script in layout.tsx
  // already applies the correct `.dark` class to <html> before paint, so
  // there's no visible flash — only this React state value needs to catch
  // up, which happens in the effect below right after mount.
  const [theme, setTheme] = useState<Theme>("light");
  const isFirstApply = useRef(true);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme") as Theme | null;
    const detected =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing React state with the real, already-applied theme after mount (see comment above)
    setTheme(detected);
  }, []);

  useEffect(() => {
    if (isFirstApply.current) {
      // Skip: the blocking init script already set the correct class before
      // hydration. Applying the default "light" state here would flash the
      // page light for a frame before the effect above corrects it.
      isFirstApply.current = false;
      return;
    }
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
