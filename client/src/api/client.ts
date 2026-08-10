// Lớp gọi HTTP duy nhất: gắn access token, tự refresh 1 lần khi 401. Mọi api/*.ts đi qua đây.
const ACCESS = 'lib_access';
const REFRESH = 'lib_refresh';

export const tokenStore = {
  get access(): string | null {
    return localStorage.getItem(ACCESS);
  },
  get refresh(): string | null {
    return localStorage.getItem(REFRESH);
  },
  set({ accessToken, refreshToken }: { accessToken?: string; refreshToken?: string }): void {
    if (accessToken) localStorage.setItem(ACCESS, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH, refreshToken);
  },
  clear(): void {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

export default async function request<T = any>(
  path: string,
  { method = 'GET', body, auth = false }: RequestOptions = {},
  retry = true
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && tokenStore.access) headers.Authorization = 'Bearer ' + tokenStore.access;

  const res = await fetch('/api' + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Access hết hạn → thử refresh 1 lần rồi gọi lại.
  if (res.status === 401 && auth && retry && tokenStore.refresh) {
    const r = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokenStore.refresh }),
    });
    if (r.ok) {
      const { accessToken } = await r.json();
      tokenStore.set({ accessToken });
      return request<T>(path, { method, body, auth }, false);
    }
    tokenStore.clear();
  }

  if (res.status === 204) return null as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && data.message) || 'Có lỗi xảy ra');
  return data as T;
}
