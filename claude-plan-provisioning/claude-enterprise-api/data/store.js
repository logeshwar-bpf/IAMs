const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname);
const DB_FILE = path.join(DB_DIR, 'database.json');

function seedData() {
  const now = Date.now();

  const users = [
    { id: 'usr_001', name: 'John Doe', email: 'john.doe@anthropic-client.com', role: 'Engineering Lead', plan: 'Claude Pro', status: 'Active', seats: 1, billingCycle: 'Monthly', grantedAt: new Date(now - 86400000 * 30).toISOString(), updatedAt: new Date(now - 86400000 * 30).toISOString() },
    { id: 'usr_002', name: 'Sarah Lee', email: 'sarah.lee@designhub.io', role: 'Product Designer', plan: 'Claude Team', status: 'Active', seats: 5, billingCycle: 'Monthly', grantedAt: new Date(now - 86400000 * 25).toISOString(), updatedAt: new Date(now - 86400000 * 25).toISOString() },
    { id: 'usr_003', name: 'Alex Kim', email: 'alex.kim@fintechlabs.com', role: 'Data Scientist', plan: 'Claude Pro', status: 'Active', seats: 1, billingCycle: 'Monthly', grantedAt: new Date(now - 86400000 * 20).toISOString(), updatedAt: new Date(now - 86400000 * 20).toISOString() },
    { id: 'usr_004', name: 'Emma Wilson', email: 'emma.wilson@cloudtech.org', role: 'DevOps Engineer', plan: 'Enterprise', status: 'Active', seats: 25, billingCycle: 'Annual', grantedAt: new Date(now - 86400000 * 15).toISOString(), updatedAt: new Date(now - 86400000 * 15).toISOString() },
    { id: 'usr_005', name: 'Michael Brown', email: 'michael.b@acmesolutions.com', role: 'CTO', plan: 'Enterprise', status: 'Active', seats: 50, billingCycle: 'Permanent', grantedAt: new Date(now - 86400000 * 10).toISOString(), updatedAt: new Date(now - 86400000 * 10).toISOString() },
    { id: 'usr_006', name: 'Sophia Martinez', email: 'sophia.m@creativeworks.co', role: 'UX Researcher', plan: 'Claude Pro', status: 'Active', seats: 1, billingCycle: 'Monthly', grantedAt: new Date(now - 86400000 * 8).toISOString(), updatedAt: new Date(now - 86400000 * 8).toISOString() },
    { id: 'usr_007', name: 'David Chen', email: 'david.chen@quantumai.net', role: 'AI Researcher', plan: 'Claude Team', status: 'Active', seats: 10, billingCycle: 'Monthly', grantedAt: new Date(now - 86400000 * 7).toISOString(), updatedAt: new Date(now - 86400000 * 7).toISOString() },
    { id: 'usr_008', name: 'Olivia Taylor', email: 'olivia.t@venturecapital.io', role: 'Partner', plan: 'No Access', status: 'Revoked', seats: 0, billingCycle: 'N/A', grantedAt: new Date(now - 86400000 * 5).toISOString(), updatedAt: new Date(now - 86400000 * 5).toISOString() },
    { id: 'usr_009', name: 'James Anderson', email: 'james.a@cyberdefense.gov', role: 'Security Specialist', plan: 'Claude Pro', status: 'Active', seats: 1, billingCycle: 'Monthly', grantedAt: new Date(now - 86400000 * 4).toISOString(), updatedAt: new Date(now - 86400000 * 4).toISOString() },
    { id: 'usr_010', name: 'Emily Thomas', email: 'emily.t@healthplus.org', role: 'Medical Analyst', plan: 'Claude Team', status: 'Active', seats: 5, billingCycle: 'Monthly', grantedAt: new Date(now - 86400000 * 3).toISOString(), updatedAt: new Date(now - 86400000 * 3).toISOString() },
    { id: 'usr_011', name: 'Daniel Jackson', email: 'daniel.j@edulearn.edu', role: 'Professor', plan: 'Claude Pro', status: 'Active', seats: 1, billingCycle: 'Monthly', grantedAt: new Date(now - 86400000 * 2).toISOString(), updatedAt: new Date(now - 86400000 * 2).toISOString() },
    { id: 'usr_012', name: 'Ava White', email: 'ava.w@mediastream.tv', role: 'Content Strategist', plan: 'No Access', status: 'Revoked', seats: 0, billingCycle: 'N/A', grantedAt: new Date(now - 86400000 * 1).toISOString(), updatedAt: new Date(now - 86400000 * 1).toISOString() },
    { id: 'usr_013', name: 'Matthew Harris', email: 'matthew.h@logistics.com', role: 'Operations Manager', plan: 'Claude Team', status: 'Active', seats: 5, billingCycle: 'Monthly', grantedAt: new Date(now - 86400000 * 60).toISOString(), updatedAt: new Date(now - 86400000 * 60).toISOString() },
    { id: 'usr_014', name: 'Isabella Martin', email: 'isabella.m@retailgroup.com', role: 'Marketing Director', plan: 'Claude Pro', status: 'Active', seats: 1, billingCycle: 'Monthly', grantedAt: new Date(now - 86400000 * 55).toISOString(), updatedAt: new Date(now - 86400000 * 55).toISOString() },
    { id: 'usr_015', name: 'Ethan Thompson', email: 'ethan.t@financesec.com', role: 'Risk Analyst', plan: 'Enterprise', status: 'Active', seats: 20, billingCycle: 'Annual', grantedAt: new Date(now - 86400000 * 50).toISOString(), updatedAt: new Date(now - 86400000 * 50).toISOString() },
  ];

  const auditLogs = [
    { id: 'log_001', timestamp: new Date(now - 3600000 * 2).toISOString(), adminUser: 'admin', targetUserId: 'usr_001', targetUserName: 'John Doe', targetUserEmail: 'john.doe@anthropic-client.com', action: 'PLAN_GRANTED', oldPlan: 'No Access', newPlan: 'Claude Pro', notes: 'Initial workspace onboard' },
    { id: 'log_002', timestamp: new Date(now - 3600000 * 4).toISOString(), adminUser: 'admin', targetUserId: 'usr_002', targetUserName: 'Sarah Lee', targetUserEmail: 'sarah.lee@designhub.io', action: 'PLAN_UPGRADE', oldPlan: 'Claude Pro', newPlan: 'Claude Team', notes: 'Upgraded for design team workspace' },
    { id: 'log_003', timestamp: new Date(now - 3600000 * 8).toISOString(), adminUser: 'svc_bot', targetUserId: 'usr_003', targetUserName: 'Alex Kim', targetUserEmail: 'alex.kim@fintechlabs.com', action: 'PLAN_GRANTED', oldPlan: 'No Access', newPlan: 'Claude Pro', notes: 'Auto-provisioned via SCIM directory sync' },
    { id: 'log_004', timestamp: new Date(now - 3600000 * 12).toISOString(), adminUser: 'admin', targetUserId: 'usr_008', targetUserName: 'Olivia Taylor', targetUserEmail: 'olivia.t@venturecapital.io', action: 'PLAN_REVOKED', oldPlan: 'Claude Pro', newPlan: 'No Access', notes: 'Account offboarded' },
    { id: 'log_005', timestamp: new Date(now - 86400000).toISOString(), adminUser: 'admin', targetUserId: 'usr_004', targetUserName: 'Emma Wilson', targetUserEmail: 'emma.wilson@cloudtech.org', action: 'PLAN_UPGRADE', oldPlan: 'Claude Team', newPlan: 'Enterprise', notes: 'Enterprise tier contract activated' },
  ];

  const driftAlerts = [
    { id: 'd1', type: 'unmanaged', svc: 'Anthropic SSO', detail: { email: 'contractor_ext@vendor.com', entitlementExternalId: 'sso/team-seat' }, detectedAt: new Date(now - 7200000).toISOString(), status: 'open' },
    { id: 'd2', type: 'role_mismatch', svc: 'Claude Enterprise', detail: { email: 'alice@internal.io', expectedPlan: 'Claude Pro', actualPlan: 'Enterprise' }, detectedAt: new Date(now - 14400000).toISOString(), status: 'open' },
    { id: 'd3', type: 'missing', svc: 'Slack Enterprise', detail: { email: 'bob@internal.io', entitlementExternalId: 'slack/paid-seat' }, detectedAt: new Date(now - 86400000).toISOString(), status: 'open' },
    { id: 'd4', type: 'orphaned', svc: 'GitHub Enterprise', detail: { email: 'former.employee@internal.io' }, detectedAt: new Date(now - 172800000).toISOString(), status: 'open' },
  ];

  return { users, auditLogs, driftAlerts };
}

function readDb() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    const data = seedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return data;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    const data = seedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return data;
  }
}

function writeDb(data) {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  getDashboard() {
    const db = readDb();
    const users = db.users || [];
    const openDrift = (db.driftAlerts || []).filter(d => d.status === 'open');

    const distribution = {
      'Claude Pro': users.filter(u => u.plan === 'Claude Pro').length,
      'Claude Team': users.filter(u => u.plan === 'Claude Team').length,
      Enterprise: users.filter(u => u.plan === 'Enterprise').length,
      'No Access': users.filter(u => u.plan === 'No Access').length,
    };

    return {
      stats: {
        totalUsers: users.length,
        activePlans: users.filter(u => u.plan !== 'No Access').length,
        noAccess: users.filter(u => u.plan === 'No Access').length,
        driftAlerts: openDrift.length,
        pendingProvisions: 2,
        distribution,
      },
      drift: openDrift.slice(0, 5),
      activity: (db.auditLogs || []).slice(0, 6),
    };
  },

  getUsers({ search = '', plan = 'All', page = 1, limit = 10 }) {
    const db = readDb();
    let users = db.users || [];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q));
    }
    if (plan !== 'All') {
      users = users.filter(u => u.plan === plan);
    }

    const total = users.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const p = Math.max(1, Math.min(Number(page), totalPages));
    const start = (p - 1) * limit;

    return {
      users: users.slice(start, start + Number(limit)),
      total,
      page: p,
      totalPages,
      limit: Number(limit),
      from: total === 0 ? 0 : start + 1,
      to: Math.min(start + Number(limit), total),
    };
  },

  getUserById(id) {
    const db = readDb();
    const user = (db.users || []).find(u => u.id === id);
    if (!user) return null;
    const logs = (db.auditLogs || [])
      .filter(l => l.targetUserId === id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return { ...user, auditLogs: logs };
  },

  updateUserPlan({ userId, newPlan, seats, billingCycle, notes = '', adminUser = 'admin' }) {
    const db = readDb();
    const idx = (db.users || []).findIndex(u => u.id === userId);
    if (idx === -1) throw new Error(`User with ID ${userId} not found`);

    const user = db.users[idx];
    const oldPlan = user.plan;
    const nowIso = new Date().toISOString();
    const status = newPlan === 'No Access' ? 'Revoked' : 'Active';

    const updatedUser = {
      ...user,
      plan: newPlan,
      status,
      seats: seats ? Number(seats) : newPlan === 'Claude Team' ? 5 : newPlan === 'Enterprise' ? 25 : (newPlan === 'No Access' ? 0 : 1),
      billingCycle: billingCycle || user.billingCycle || 'Monthly',
      updatedAt: nowIso,
      grantedAt: oldPlan !== newPlan ? nowIso : user.grantedAt,
    };

    db.users[idx] = updatedUser;

    const action = oldPlan === 'No Access' ? 'PLAN_GRANTED' : newPlan === 'No Access' ? 'PLAN_REVOKED' : 'PLAN_CHANGED';
    const auditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: nowIso,
      adminUser,
      targetUserId: user.id,
      targetUserName: user.name,
      targetUserEmail: user.email,
      action,
      oldPlan,
      newPlan,
      notes: notes || `Admin changed plan from ${oldPlan} to ${newPlan}`,
    };

    db.auditLogs = [auditLog, ...(db.auditLogs || [])];
    writeDb(db);

    return { user: updatedUser, auditLog };
  },

  getPlans() {
    const db = readDb();
    const users = db.users || [];
    const distribution = {
      'Claude Pro': users.filter(u => u.plan === 'Claude Pro').length,
      'Claude Team': users.filter(u => u.plan === 'Claude Team').length,
      Enterprise: users.filter(u => u.plan === 'Enterprise').length,
      'No Access': users.filter(u => u.plan === 'No Access').length,
    };
    return { distribution, totalUsers: users.length };
  },

  getDriftAlerts() {
    const db = readDb();
    const openAlerts = (db.driftAlerts || []).filter(d => d.status === 'open');
    return { alerts: openAlerts, total: openAlerts.length };
  },

  resolveDriftAlert(id, status = 'resolved') {
    const db = readDb();
    const alert = (db.driftAlerts || []).find(d => d.id === id);
    if (!alert) throw new Error(`Drift alert ${id} not found`);
    alert.status = status;
    alert.resolvedAt = new Date().toISOString();
    writeDb(db);
    return alert;
  },

  getAuditLogs({ search = '', page = 1, limit = 15 }) {
    const db = readDb();
    let logs = db.auditLogs || [];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      logs = logs.filter(l =>
        l.targetUserName.toLowerCase().includes(q) ||
        l.targetUserEmail.toLowerCase().includes(q) ||
        l.adminUser.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        (l.notes || '').toLowerCase().includes(q)
      );
    }
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const total = logs.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const p = Math.max(1, Math.min(Number(page), totalPages));
    const start = (p - 1) * limit;

    return {
      logs: logs.slice(start, start + Number(limit)),
      total,
      page: p,
      totalPages,
      limit: Number(limit),
      from: total === 0 ? 0 : start + 1,
      to: Math.min(start + Number(limit), total),
    };
  },
};
