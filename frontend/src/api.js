const BASE = "http://127.0.0.1:8000";

// ── Helpers ───────────────────────────────────────────────────────────────────

function authHeaders(extra = {}) {
  const token = localStorage.getItem('notemind_token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function handleResponse(res) {
  if (res.status === 401) {
    localStorage.removeItem('notemind_token');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Session expired');
  }
  const data = await res.json().catch(() => ({}));
  if (res.ok) return data;
  throw new Error(data.detail || `Error ${res.status}`);
}

// ── Auth & User ───────────────────────────────────────────────────────────────

export async function apiSignup(username, password) {
  const res = await fetch(`${BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

export async function apiLogin(username, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await handleResponse(res);
  if (data?.access_token) localStorage.setItem('notemind_token', data.access_token);
  return data;
}

export async function apiGetMe() {
  const res = await fetch(`${BASE}/me`, { headers: authHeaders() });
  return handleResponse(res);
}

export function apiLogout() {
  localStorage.removeItem('notemind_token');
  window.location.href = '/login';
}

// ── Upload Handlers ──────────────────────────────────────────────────────────

export async function apiUploadFile(file, title, tag = 'general') {
  const form = new FormData();
  form.append('file', file);
  form.append('title', title);
  form.append('tag', tag);
  const res = await fetch(`${BASE}/upload`, {
    method: 'POST',
    headers: authHeaders(),   // Do NOT set Content-Type manually for FormData
    body: form,
  });
  return handleResponse(res);
}

export async function apiUploadText(content, title, tag = 'general') {
  const res = await fetch(`${BASE}/upload-text`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ content, title, tag }),
  });
  return handleResponse(res);
}

export async function apiUploadURL(url, title, tag = 'general') {
  const res = await fetch(`${BASE}/upload-text`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ url, title, tag }),
  });
  return handleResponse(res);
}

// ── Collections & Documents ───────────────────────────────────────────────────

export async function apiGetCollections() {
  const res = await fetch(`${BASE}/collections`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function apiDeleteDocument(docId) {
  // FIX: route is DELETE /upload/{docId} — matches backend
  const res = await fetch(`${BASE}/upload/${docId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export async function apiChat(query) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ query }),
  });
  return handleResponse(res);
}

// ── Document Viewer ───────────────────────────────────────────────────────────

export async function apiGetDocument(docId) {
  // FIX: URL must match the backend route exactly: /api/docs/view/{doc_id}
  const res = await fetch(`${BASE}/api/docs/view/${docId}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}