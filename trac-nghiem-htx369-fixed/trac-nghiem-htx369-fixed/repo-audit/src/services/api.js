/**
 * API Service for OnLuyen Quiz Platform (HTX 369)
 *
 * Talks to the real onluyen-auth-service backend only. There is no
 * client-side fallback: no plaintext passwords, no auto-registration
 * on failed login, no hard-coded demo accounts. If the API is
 * unreachable, calls fail loudly instead of silently degrading into
 * an insecure local mode.
 *
 * Auth model:
 *  - access token: kept in memory only (never localStorage) to reduce
 *    exposure if the page is ever compromised by XSS.
 *  - refresh token: httpOnly cookie set by the server; the browser
 *    sends it automatically on requests to /api/auth/* — this client
 *    never reads or stores it directly.
 *  - on page load, initSession() silently calls /auth/refresh using
 *    the cookie so a reload doesn't log the user out.
 */

const API_BASE = import.meta.env.VITE_API_URL || "/api";

let accessToken = null;

function setAccessToken(token) {
  accessToken = token;
}

async function extractErrorMessage(res) {
  try {
    const data = await res.json();
    if (data?.error?.details?.fieldErrors) {
      const first = Object.values(data.error.details.fieldErrors).flat()[0];
      if (first) return first;
    }
    return data?.error?.message || `Lỗi máy chủ (${res.status})`;
  } catch {
    return `Lỗi máy chủ (${res.status})`;
  }
}

async function rawFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return fetch(`${API_BASE}${path}`, { ...options, headers, credentials: "include" });
}

async function tryRefresh() {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, { method: "POST", credentials: "include" });
    if (!res.ok) return false;
    const data = await res.json();
    setAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

/** Fetch that transparently retries once after a silent token refresh on 401. */
async function authedFetch(path, options = {}) {
  let res = await rawFetch(path, options);
  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) res = await rawFetch(path, options);
  }
  return res;
}

/** Call once on app boot to restore a session from the refresh cookie, if any. */
export async function initSession() {
  const ok = await tryRefresh();
  if (!ok) return null;
  return fetchProfile();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res));
  const data = await res.json();
  setAccessToken(data.accessToken);
  return data;
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res));
  const data = await res.json();
  setAccessToken(data.accessToken);
  return data;
}

export async function fetchProfile() {
  const res = await authedFetch("/users/me");
  if (!res.ok) return null;
  const data = await res.json();
  return data.user;
}

export async function logoutUser() {
  try {
    await rawFetch("/auth/logout", { method: "POST" });
  } catch {
    /* best-effort */
  }
  setAccessToken(null);
}

/**
 * Changes the current user's password. Requires the current password
 * (server re-verifies it) and revokes every session — including this
 * one — so the caller must log in again afterward. Call logoutUser()
 * or reload the app once this resolves successfully.
 */
export async function changePassword(currentPassword, newPassword) {
  const res = await authedFetch("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res));
  setAccessToken(null);
  return res.json();
}

/* ---------------------------- Members (admin only) ---------------------------- */
/* Every call here requires an admin access token; the server enforces this
   independently of anything the client does — see members.routes.ts. */

export async function fetchMembers() {
  const res = await authedFetch("/members");
  if (!res.ok) throw new Error(await extractErrorMessage(res));
  const data = await res.json();
  return data.members;
}

export async function createMember(input) {
  const res = await authedFetch("/members", { method: "POST", body: JSON.stringify(input) });
  if (!res.ok) throw new Error(await extractErrorMessage(res));
  const data = await res.json();
  return data.member;
}

export async function updateMember(id, input) {
  const res = await authedFetch(`/members/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  if (!res.ok) throw new Error(await extractErrorMessage(res));
  const data = await res.json();
  return data.member;
}

export async function deleteMember(id) {
  const res = await authedFetch(`/members/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error(await extractErrorMessage(res));
}
