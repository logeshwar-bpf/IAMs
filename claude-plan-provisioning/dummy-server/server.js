const express = require('express');
const cors = require('cors');
const jsonwebtoken = require('jsonwebtoken');
let { USERS, AUDIT_LOGS, DRIFT_ALERTS, PLANS } = require('./data');

const JWT_SECRET = process.env.JWT_SECRET || 'claude-plan-provisioning-secret-key-2026';
const ALLOWED_ORIGIN = process.env.APP_URL || 'http://localhost:3000';

const app = express();
app.use(cors({
  origin: [ALLOWED_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token && req.headers.cookie) {
    const cookies = Object.fromEntries(req.headers.cookie.split('; ').map(c => c.split('=')));
    token = cookies.session;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token required' });
  }

  try {
    const decoded = jsonwebtoken.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

// Require auth on all non-GET routes
app.use((req, res, next) => {
  if (req.method === 'GET') return next();
  requireAuth(req, res, next);
});

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', server: 'claude-plan-dummy-api', version: '1.0.0' }));

// ─── Dashboard ────────────────────────────────────────────────────────────────
app.get('/api/dashboard', (_, res) => {
  const users = USERS;
  const distribution = {
    'Claude Pro':  users.filter(u => u.plan === 'Claude Pro').length,
    'Claude Team': users.filter(u => u.plan === 'Claude Team').length,
    Enterprise:    users.filter(u => u.plan === 'Enterprise').length,
    'No Access':   users.filter(u => u.plan === 'No Access').length,
  };
  const openDrift = DRIFT_ALERTS.filter(d => d.status === 'open').length;
  const recentActivity = AUDIT_LOGS.slice(0, 6).map(l => ({
    adminUser: l.adminUser,
    action: l.action,
    targetUserName: l.targetUserName,
    timestamp: l.timestamp,
  }));

  res.json({
    stats: {
      totalUsers:        users.length,
      activePlans:       users.filter(u => u.plan !== 'No Access').length,
      noAccess:          users.filter(u => u.plan === 'No Access').length,
      driftAlerts:       openDrift,
      pendingProvisions: 5,
      distribution,
    },
    drift:    DRIFT_ALERTS.filter(d => d.status === 'open').slice(0, 3),
    activity: recentActivity,
  });
});

// ─── Users ────────────────────────────────────────────────────────────────────
app.get('/api/users', (req, res) => {
  const { search = '', plan = 'All', page = 1, limit = 10 } = req.query;
  let users = [...USERS];

  if (search.trim()) {
    const q = search.toLowerCase();
    users = users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }
  if (plan !== 'All') users = users.filter(u => u.plan === plan);

  const total = users.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const p = Math.max(1, Math.min(Number(page), totalPages));
  const start = (p - 1) * Number(limit);
  const paged = users.slice(start, start + Number(limit));

  res.json({ users: paged, total, page: p, totalPages, from: total ? start + 1 : 0, to: Math.min(start + Number(limit), total) });
});

app.get('/api/users/:id', (req, res) => {
  const user = USERS.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const logs = AUDIT_LOGS.filter(l => l.targetUserId === req.params.id);
  res.json({ ...user, auditLogs: logs });
});

app.post('/api/users/:id/provision', (req, res) => {
  const userIdx = USERS.findIndex(u => u.id === req.params.id);
  if (userIdx === -1) return res.status(404).json({ error: 'User not found' });

  const user = USERS[userIdx];
  const { newPlan, seats, notes } = req.body;
  const oldPlan = user.plan;
  const ts = new Date().toISOString();

  USERS[userIdx] = { ...user, plan: newPlan, status: newPlan === 'No Access' ? 'Revoked' : 'Active', updatedAt: ts };

  const log = {
    id: `log_${Date.now()}`,
    timestamp: ts,
    adminUser: 'admin',
    targetUserId: user.id,
    targetUserName: user.name,
    targetUserEmail: user.email,
    action: oldPlan === 'No Access' ? 'PLAN_GRANTED' : newPlan === 'No Access' ? 'PLAN_REVOKED' : 'PLAN_CHANGED',
    oldPlan, newPlan,
    notes: notes || `Plan changed from ${oldPlan} to ${newPlan}`,
  };
  AUDIT_LOGS.unshift(log);

  res.json({ success: true, user: USERS[userIdx], auditLog: log });
});

// ─── Audit Logs ───────────────────────────────────────────────────────────────
app.get('/api/audit-logs', (req, res) => {
  const { search = '', page = 1, limit = 15 } = req.query;
  let logs = [...AUDIT_LOGS].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (search.trim()) {
    const q = search.toLowerCase();
    logs = logs.filter(l =>
      l.targetUserName.toLowerCase().includes(q) ||
      l.adminUser.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      (l.notes || '').toLowerCase().includes(q)
    );
  }

  const total = logs.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const p = Math.max(1, Math.min(Number(page), totalPages));
  const start = (p - 1) * Number(limit);

  res.json({ logs: logs.slice(start, start + Number(limit)), total, page: p, totalPages, from: total ? start + 1 : 0, to: Math.min(start + Number(limit), total) });
});

// ─── Plans ────────────────────────────────────────────────────────────────────
app.get('/api/plans', (_, res) => {
  const distribution = {
    'Claude Pro':  USERS.filter(u => u.plan === 'Claude Pro').length,
    'Claude Team': USERS.filter(u => u.plan === 'Claude Team').length,
    Enterprise:    USERS.filter(u => u.plan === 'Enterprise').length,
    'No Access':   USERS.filter(u => u.plan === 'No Access').length,
  };
  res.json({ plans: PLANS.map(p => ({ ...p, activeCount: distribution[p.key] ?? 0 })) });
});

// ─── Drift Alerts ─────────────────────────────────────────────────────────────
app.get('/api/drift-alerts', (_, res) => {
  res.json({ alerts: DRIFT_ALERTS, total: DRIFT_ALERTS.filter(d => d.status === 'open').length });
});

app.post('/api/drift-alerts/:id/resolve', (req, res) => {
  const alert = DRIFT_ALERTS.find(d => d.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.status = req.body.status || 'resolved';
  alert.resolvedAt = new Date().toISOString();
  res.json({ success: true, alert });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n  ◆ Claude Plan Dummy API  →  http://localhost:${PORT}`);
  console.log(`  Endpoints:`);
  console.log(`    GET  /api/health`);
  console.log(`    GET  /api/dashboard`);
  console.log(`    GET  /api/users`);
  console.log(`    GET  /api/users/:id`);
  console.log(`    POST /api/users/:id/provision`);
  console.log(`    GET  /api/audit-logs`);
  console.log(`    GET  /api/plans`);
  console.log(`    GET  /api/drift-alerts`);
  console.log(`    POST /api/drift-alerts/:id/resolve\n`);
});
