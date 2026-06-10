const ACCESS_KEY = 'cms_access_token';
const REFRESH_KEY = 'cms_refresh_token';
const LEGACY_TOKEN_KEY = 'cms_token';

let accessTokenMemory: string | null = null;

function readStoredAccess(): string | null {
  return localStorage.getItem(ACCESS_KEY) ?? localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  return accessTokenMemory ?? readStoredAccess();
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh?: string | null): void {
  accessTokenMemory = access;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  if (refresh) {
    localStorage.setItem(REFRESH_KEY, refresh);
  }
}

export function setAccessToken(access: string): void {
  accessTokenMemory = access;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function clearTokens(): void {
  accessTokenMemory = null;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function hydrateAccessToken(): void {
  const stored = readStoredAccess();
  if (stored) accessTokenMemory = stored;
}

hydrateAccessToken();
