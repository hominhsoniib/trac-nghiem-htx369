/**
 * API Service for OnLuyen Quiz Platform
 * Supports both online backend API & instant localStorage / demo account fallback
 */

const API_BASE = '/api';

// Initial local users database fallback
const LOCAL_USERS_KEY = 'htx369_users_db';
const CURRENT_USER_KEY = 'htx369_current_user';

function getLocalUsers() {
  try {
    const data = localStorage.getItem(LOCAL_USERS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  // Default demo accounts
  return [
    { name: "Thành Viên HTX 369", email: "thanhvien@htx369.vn", password: "123", role: "member" },
    { name: "Ban Quản Trị 369", email: "admin@htx369.vn", password: "123", role: "admin" },
  ];
}

function saveLocalUsers(users) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {}
}

export async function loginUser(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.accessToken) localStorage.setItem('auth_token', data.accessToken);
      if (data.user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
      return data;
    }
  } catch (e) {
    // Fallback to local auth
  }

  // Local authentication fallback
  const cleanEmail = (email || '').trim().toLowerCase();
  const users = getLocalUsers();
  const found = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);

  if (!found) {
    // Auto-login or create if email is valid and has password
    if (cleanEmail && password) {
      const newUser = { name: cleanEmail.split('@')[0] || "Thành viên", email: cleanEmail, password, role: "member" };
      users.push(newUser);
      saveLocalUsers(users);
      const userObj = { name: newUser.name, email: newUser.email, role: newUser.role };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));
      return { user: userObj };
    }
    throw new Error('Mật khẩu hoặc Email không chính xác.');
  }

  const userObj = { name: found.name, email: found.email, role: found.role || "member" };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));
  return { user: userObj };
}

export async function registerUser(name, email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.accessToken) localStorage.setItem('auth_token', data.accessToken);
      if (data.user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
      return data;
    }
  } catch (e) {
    // Fallback to local
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const users = getLocalUsers();
  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error('Email này đã được đăng ký. Vui lòng chọn Đăng nhập.');
  }

  const newUser = { name: name || cleanEmail.split('@')[0], email: cleanEmail, password, role: "member" };
  users.push(newUser);
  saveLocalUsers(users);

  const userObj = { name: newUser.name, email: newUser.email, role: newUser.role };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));
  return { user: userObj };
}

export async function fetchProfile() {
  // Check local saved user first
  try {
    const localUserStr = localStorage.getItem(CURRENT_USER_KEY);
    if (localUserStr) return JSON.parse(localUserStr);
  } catch (e) {}

  const token = localStorage.getItem('auth_token');
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return data.user || data;
    }
  } catch (e) {}

  return null;
}

export async function logoutUser() {
  try {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
  } catch (e) {}
  localStorage.removeItem('auth_token');
  localStorage.removeItem(CURRENT_USER_KEY);
}

