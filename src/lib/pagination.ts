export interface ListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: ListMeta;
}

export const PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;

export function defaultMeta(total: number, perPage: number): ListMeta {
  const last = Math.max(1, Math.ceil(total / perPage) || 1);
  return {
    current_page: 1,
    last_page: last,
    per_page: perPage,
    total,
    from: total > 0 ? 1 : null,
    to: Math.min(perPage, total) || null,
  };
}

/** Normalizes Laravel paginated JSON, `{ data, meta }`, or a plain array. */
export function unwrapPaginated<T>(
  payload: unknown,
  fallbackPerPage: number,
): PaginatedResult<T> {
  if (Array.isArray(payload)) {
    return { data: payload as T[], meta: defaultMeta(payload.length, fallbackPerPage) };
  }

  if (!payload || typeof payload !== 'object') {
    return { data: [], meta: defaultMeta(0, fallbackPerPage) };
  }

  const root = payload as Record<string, unknown>;
  const data: T[] = Array.isArray(root.data) ? (root.data as T[]) : unwrapListOnly<T>(root);

  if (root.meta && typeof root.meta === 'object') {
    const m = root.meta as Record<string, unknown>;
    return {
      data,
      meta: {
        current_page: num(m.current_page, 1),
        last_page: num(m.last_page, 1),
        per_page: num(m.per_page, fallbackPerPage),
        total: num(m.total, data.length),
        from: m.from as number | null | undefined,
        to: m.to as number | null | undefined,
      },
    };
  }

  return { data, meta: defaultMeta(data.length, fallbackPerPage) };
}

function unwrapListOnly<T>(root: Record<string, unknown>): T[] {
  if (Array.isArray(root.data)) return root.data as T[];
  return [];
}

function num(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export interface ListQueryParams {
  page: number;
  perPage: number;
  search: string;
  filters: Record<string, string>;
}

export function buildListParams({ page, perPage, search, filters }: ListQueryParams): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page,
    per_page: perPage,
  };

  const trimmed = search.trim();
  if (trimmed) params.search = trimmed;

  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== undefined && value !== null) {
      params[key] = value;
    }
  }

  return params;
}
