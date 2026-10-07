import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'greenhill-theme';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage can be unavailable — fall through to the OS preference */
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore write failures (private mode, etc.) */
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    [],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, isDark: theme === 'dark', setTheme, toggleTheme }),
    [theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside a <ThemeProvider>');
  }
  return context;
}

/**
 * Chart colours are supplied to Recharts as props (inline styles / SVG
 * attributes), so they cannot come from CSS custom properties. Keep the two
 * palettes in sync with the tokens in `src/index.css`.
 */
export const CHART_PALETTE = {
  light: {
    green: '#1F9D55',
    blue: '#2F6FED',
    slate: '#0E1C3D',
    grid: '#eef1f5',
    tick: '#94a3b8',
    cursor: '#d8dbe3',
    barCursor: 'rgba(148, 163, 184, 0.08)',
  },
  dark: {
    green: '#34D07F',
    blue: '#7AA2FF',
    slate: '#CBD5E1',
    grid: 'rgba(148, 163, 184, 0.16)',
    tick: '#8FA0B8',
    cursor: 'rgba(148, 163, 184, 0.35)',
    barCursor: 'rgba(148, 163, 184, 0.12)',
  },
} as const;

export type ChartPalette = (typeof CHART_PALETTE)['light'];
