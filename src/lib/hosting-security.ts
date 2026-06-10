import { isAxiosError } from 'axios';

/** InfinityFree / similar hosts block requests until a __test cookie is set via JS challenge. */
export function isHostingSecurityBlock(error: unknown): boolean {
  if (!isAxiosError(error)) return false;

  const status = error.response?.status;
  const location = String(error.response?.headers?.location ?? '');

  if (status === 302 && (location.includes('?i=') || location.includes('aes'))) {
    return true;
  }

  const data = error.response?.data;
  if (typeof data === 'string' && (data.includes('aes.js') || data.includes('__test'))) {
    return true;
  }

  return false;
}

export const HOSTING_SECURITY_MESSAGE =
  'Hosting security blocked the API (302 redirect). Hard-refresh this page (Ctrl+Shift+R or Cmd+Shift+R), wait for it to load fully, then sign in again. InfinityFree free plans cannot run reliable APIs — use paid hosting for production.';

export function toAuthErrorMessage(error: unknown, fallback = 'Wrong username or PIN. Try again.'): string {
  if (isHostingSecurityBlock(error)) return HOSTING_SECURITY_MESSAGE;
  return fallback;
}
