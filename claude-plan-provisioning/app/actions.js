'use server';

import { revalidatePath } from 'next/cache';
import {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUserPlan,
  getAuditLogs,
  getPlans,
  getDriftAlerts,
  resolveDriftAlert
} from '@/lib/db';

export async function fetchDashboardStatsAction() {
  try {
    return getDashboardStats();
  } catch (err) {
    return { stats: { totalUsers: 0, activePlans: 0, noAccess: 0, driftAlerts: 0, distribution: {} }, drift: [], activity: [] };
  }
}

export async function fetchUsersAction({ search = '', plan = 'All', page = 1, limit = 10 } = {}) {
  try {
    return getUsers({ search, plan, page, limit });
  } catch (err) {
    return { users: [], total: 0, page: 1, totalPages: 1, from: 0, to: 0 };
  }
}

export async function fetchUserByIdAction(id) {
  try {
    return getUserById(id);
  } catch (err) {
    return null;
  }
}

export async function updateUserPlanAction({ userId, newPlan, seats, billingCycle, notes }) {
  try {
    const result = updateUserPlan({
      userId,
      newPlan,
      seats,
      billingCycle,
      notes
    });

    revalidatePath('/');
    revalidatePath('/users');
    revalidatePath('/audit-logs');
    revalidatePath('/plans');

    return { success: true, user: result.user, auditLog: result.auditLog };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchAuditLogsAction({ search = '', page = 1, limit = 15 } = {}) {
  try {
    return getAuditLogs({ search, page, limit });
  } catch (err) {
    return { logs: [], total: 0, page: 1, totalPages: 1, from: 0, to: 0 };
  }
}

export async function fetchPlansAction() {
  try {
    return getPlans();
  } catch (err) {
    return { plans: [] };
  }
}

export async function fetchDriftAlertsAction() {
  try {
    return getDriftAlerts();
  } catch (err) {
    return { alerts: [], total: 0 };
  }
}

export async function resolveDriftAlertAction(id, status = 'resolved') {
  try {
    const alert = resolveDriftAlert(id, status);
    revalidatePath('/drift');
    revalidatePath('/');
    return { success: true, alert };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
