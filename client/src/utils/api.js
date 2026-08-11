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

// fetch wrapper that attaches the bearer token and auto-logs-out on an
// invalid/expired token (403 "Invalid or expired token" / 401 "Access token required").
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
