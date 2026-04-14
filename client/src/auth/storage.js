const TOKEN_KEY = 'shop-keep-token';
const USER_KEY = 'shop-keep-user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Minimal profile for UI (e.g. header initials). Cleared with the token. */
export function getUserProfile() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setUserProfile(user) {
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  const minimal = {
    email: user.email != null ? String(user.email) : '',
    first_name: user.first_name != null ? String(user.first_name) : '',
    last_name: user.last_name != null ? String(user.last_name) : ''
  };
  localStorage.setItem(USER_KEY, JSON.stringify(minimal));
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Headers for authenticated API calls */
export function authHeaders(extra = {}) {
  const t = getToken();
  return {
    ...extra,
    ...(t ? { Authorization: `Bearer ${t}` } : {})
  };
}
