const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function fetchFromApi(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errData.error || `API request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`[API Client Error] ${endpoint}:`, err.message);
    throw err;
  }
}

export async function getDashboardStats() {
  return fetchFromApi('/dashboard');
}

export async function getUsers({ search = '', plan = 'All', page = 1, limit = 10 } = {}) {
  const query = new URLSearchParams({ search, plan, page: String(page), limit: String(limit) });
  return fetchFromApi(`/users?${query}`);
}

export async function getUserById(id) {
  return fetchFromApi(`/users/${id}`);
}

export async function updateUserPlan({ userId, newPlan, seats, billingCycle, notes }) {
  return fetchFromApi(`/users/${userId}/provision`, {
    method: 'POST',
    body: JSON.stringify({ newPlan, seats, billingCycle, notes }),
  });
}

export async function getAuditLogs({ search = '', page = 1, limit = 15 } = {}) {
  const query = new URLSearchParams({ search, page: String(page), limit: String(limit) });
  return fetchFromApi(`/audit-logs?${query}`);
}

export async function getPlans() {
  return fetchFromApi('/plans');
}

export async function getDriftAlerts() {
  return fetchFromApi('/drift-alerts');
}

export async function resolveDriftAlert(id, status = 'resolved') {
  return fetchFromApi(`/drift-alerts/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}
