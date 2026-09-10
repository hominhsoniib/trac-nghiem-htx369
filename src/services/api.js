/**
 * API Service for OnLuyen Quiz Platform
 * Communicates with onluyen-auth-service backend
 */

const API_BASE = '/api';

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.');
  }
  if (data.accessToken) {
    localStorage.setItem('auth_token', data.accessToken);
  }
  return data;
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
  }
  if (data.accessToken) {
    localStorage.setItem('auth_token', data.accessToken);
  }
  return data;
}

export async function fetchProfile() {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('auth_token');
      }
      return null;
    }
    const data = await res.json();
    return data.user || data;
  } catch (e) {
    return null;
  }
}

export async function logoutUser() {
  try {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
  } catch (e) {
    /* silent fallback */
  }
  localStorage.removeItem('auth_token');
}
