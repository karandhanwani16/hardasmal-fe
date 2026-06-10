import api from './api';
import { buildListParams, type ListQueryParams } from './pagination';

export async function downloadReportExport(
  endpoint: string,
  format: 'xlsx' | 'pdf',
  listParams: ListQueryParams,
  sortBy: string,
  sortDir: 'asc' | 'desc',
): Promise<void> {
  const params: Record<string, string | number> = {
    ...buildListParams(listParams),
    format,
  };

  if (sortBy) {
    params.sort_by = sortBy;
    params.sort_dir = sortDir;
  }

  const { data, headers } = await api.get(endpoint, {
    params,
    responseType: 'blob',
  });

  const disposition = headers['content-disposition'] as string | undefined;
  const filenameMatch = disposition?.match(/filename="?([^";]+)"?/);
  const filename = filenameMatch?.[1] ?? `report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
