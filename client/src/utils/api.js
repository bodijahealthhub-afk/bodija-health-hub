const TOKEN_KEY = 'adminToken';
const USER_KEY = 'adminUser';

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAdminSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('bhh_token');
}

export function redirectToAdminLogin() {
  if (window.location.pathname.startsWith('/admin') && !window.location.pathname.endsWith('/admin/login')) {
    window.location.href = '/admin/login';
  }
}

export async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getAdminToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    const body = await res.clone().json().catch(() => null);
    const authError =
      body && (body.error === 'Invalid or expired token' || body.error === 'Access token required');
    if (authError && getAdminToken()) {
      clearAdminSession();
      redirectToAdminLogin();
    }
  }

  return res;
}

const CACHE_PREFIX = 'bhh_cache_'
const CACHE_TTL = 5 * 60 * 1000

function cacheKey(url) {
  return CACHE_PREFIX + url
}

function getCached(url) {
  try {
    const raw = sessionStorage.getItem(cacheKey(url))
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(cacheKey(url))
      return null
    }
    return data
  } catch {
    return null
  }
}

function setCache(url, data) {
  try {
    sessionStorage.setItem(cacheKey(url), JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

export function clearCache(url) {
  if (url) {
    sessionStorage.removeItem(cacheKey(url))
  } else {
    Object.keys(sessionStorage)
      .filter(k => k.startsWith(CACHE_PREFIX))
      .forEach(k => sessionStorage.removeItem(k))
  }
}

export async function cachedFetch(url, { retries = 2, retryDelay = 800, useCache = true, signal } = {}) {
  if (useCache) {
    const cached = getCached(url)
    if (cached !== null) return cached
  }

  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (useCache) setCache(url, data)
      return data
    } catch (err) {
      if (err.name === 'AbortError') throw err
      lastError = err
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, retryDelay * (attempt + 1)))
      }
    }
  }
  throw lastError
}
