export const THEME_STORAGE_KEY = 'hardasmal-theme';

export type ThemeMode = 'light' | 'dark';

export function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function readStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : null;
}

export function resolveTheme(): ThemeMode {
  return readStoredTheme() ?? getSystemTheme();
}

export function applyThemeToDocument(mode: ThemeMode): void {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  document.documentElement.style.colorScheme = mode;
}

/** Run before React mounts to avoid flash of wrong theme. */
export function initThemeFromStorage(): ThemeMode {
  const mode = resolveTheme();
  applyThemeToDocument(mode);
  return mode;
}
