export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "greenhill-eid-theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

export function getPreferredTheme(): Theme {
  const stored = readStoredTheme();

  if (stored) {
    return stored;
  }

  if (typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function storeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* storage may be unavailable (private mode, blocked cookies) */
  }
}

function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}
