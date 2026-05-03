const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ethara_token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (name: string, email: string, password: string, role: string) =>
    request('/api/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password, role }) }),
  me: () => request('/api/auth/me'),

  // Projects
  getProjects: () => request('/api/projects'),
  createProject: (data: { name: string; description: string }) =>
    request('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  getProject: (id: number) => request(`/api/projects/${id}`),
  addMember: (projectId: number, userId: number) =>
    request(`/api/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify({ userId }) }),
  removeMember: (projectId: number, userId: number) =>
    request(`/api/projects/${projectId}/members/${userId}`, { method: 'DELETE' }),
  deleteProject: (id: number) =>
    request(`/api/projects/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: (projectId?: number) =>
    request(`/api/tasks${projectId ? `?projectId=${projectId}` : ''}`),
  getAllTasks: () => request('/api/tasks'),
  createTask: (data: Record<string, unknown>) =>
    request('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: number, data: Record<string, unknown>) =>
    request(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: number) =>
    request(`/api/tasks/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboard: () => request('/api/dashboard'),

  // Users
  getUsers: () => request('/api/users'),
};

export function setToken(token: string) {
  localStorage.setItem('ethara_token', token);
}
export function clearToken() {
  localStorage.removeItem('ethara_token');
}
export function isOverdue(dueDate: string, status: string) {
  if (!dueDate || status === 'done') return false;
  return new Date(dueDate) < new Date();
}
export function formatDate(date: string) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}