const ACTION_SEGMENTS = new Set(['edit', 'new', 'create']);

/**
 * Derives the logical parent route from the current pathname.
 * Does not use browser history — walks the route tree instead.
 */
export function getSmartBackRoute(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, '') || '/';

  if (normalized === '/') {
    return null;
  }

  const segments = normalized.split('/').filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  // Top-level list pages go home.
  if (segments.length === 1) {
    return '/';
  }

  let effectiveSegments = [...segments];

  const last = effectiveSegments[effectiveSegments.length - 1];
  if (ACTION_SEGMENTS.has(last)) {
    effectiveSegments = effectiveSegments.slice(0, -1);
  }

  if (effectiveSegments.length > 1) {
    effectiveSegments = effectiveSegments.slice(0, -1);
  }

  let parent = `/${effectiveSegments.join('/')}`;

  // No standalone reports hub — home is the map.
  if (parent === '/reports') {
    return '/';
  }

  if (!parent || parent === normalized) {
    return '/';
  }

  return parent;
}

export function shouldShowBackButton(pathname: string): boolean {
  return getSmartBackRoute(pathname) !== null;
}
