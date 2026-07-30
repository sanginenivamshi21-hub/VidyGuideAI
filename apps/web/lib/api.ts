const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_BASE = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST', credentials: 'include',
      });
      return res.ok;
    } catch { return false; }
    finally { refreshing = null; }
  })();
  return refreshing;
}

export async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${API_BASE}${path}`;
  const doFetch = () => fetch(url, { ...options, credentials: options.credentials || 'include' });

  let res = await doFetch();
  if (res.status === 401 && !path.startsWith('/auth/')) {
    const refreshed = await tryRefresh();
    if (refreshed) res = await doFetch();
  }
  return res;
}

export interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

export async function api<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, credentials = 'include' } = options;
  const isFormData = body instanceof FormData;

  const res = await fetchWithAuth(path, {
    method,
    headers: isFormData ? headers : { 'Content-Type': 'application/json', ...headers },
    credentials,
    body: body ? (isFormData ? body as FormData : JSON.stringify(body)) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }
  return data;
}
