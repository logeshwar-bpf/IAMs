import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

const INITIAL_PLANS = [
  { key: 'Claude Pro', price: '$20 / user / mo', badge: 'Individual Power Users', color: '#5B5BD6', features: ['5× usage limits vs Free', 'Priority access during peak', 'Claude 3.5 Sonnet/Haiku/Opus', 'Custom Projects & Artifacts', 'Early feature access'] },
  { key: 'Claude Team', price: '$30 / user / mo', badge: 'Collaboration & Scale', color: '#2A7FFF', features: ['All Pro features', 'Higher usage limits', '200 000 token context', 'Centralized billing', 'Shared workspace & style guides'] },
  { key: 'Enterprise', price: 'Custom Pricing', badge: 'Maximum Governance & Limits', color: '#C77C0A', features: ['500 000 token context', 'SSO & SCIM sync', 'Zero data retention', '99.9% SLA + success manager', 'Granular audit logging'] },
  { key: 'No Access', price: 'Free / Unassigned', badge: 'No Paid Privileges', color: '#DD3E45', features: ['Standard Claude Free only', 'No enterprise workspace', 'Rate-limited availability', 'Admin privileges revoked'] },
];

const INITIAL_DRIFT_ALERTS = [
  { id: 'd1', type: 'unmanaged', svc: 'Anthropic SSO', detail: { email: 'contractor_ext@vendor.com', entitlementExternalId: 'sso/team-seat' }, detectedAt: new Date(Date.now() - 7200000).toISOString(), status: 'open' },
  { id: 'd2', type: 'role_mismatch', svc: 'Claude Enterprise', detail: { email: 'alice@internal.io', expectedPlan: 'Claude Pro', actualPlan: 'Enterprise' }, detectedAt: new Date(Date.now() - 14400000).toISOString(), status: 'open' },
  { id: 'd3', type: 'missing', svc: 'Slack Enterprise', detail: { email: 'bob@internal.io', entitlementExternalId: 'slack/paid-seat' }, detectedAt: new Date(Date.now() - 86400000).toISOString(), status: 'open' },
  { id: 'd4', type: 'orphaned', svc: 'GitHub Enterprise', detail: { email: 'former.emp@internal.io' }, detectedAt: new Date(Date.now() - 172800000).toISOString(), status: 'open' },
  { id: 'd5', type: 'over_provisioned', svc: 'Claude Enterprise', detail: { email: 'intern@internal.io', expectedPlan: 'Claude Pro', actualPlan: 'Enterprise' }, detectedAt: new Date(Date.now() - 259200000).toISOString(), status: 'open' },
];

// Initial seed data helper
function generateSeedData() {
  const plans = [
    ...Array(24).fill('Claude Pro'),
    ...Array(15).fill('Claude Team'),
    ...Array(3).fill('Enterprise'),
    ...Array(8).fill('No Access'),
  ];

  const mockNames = [
    { name: 'John Doe', email: 'john.doe@anthropic-client.com', role: 'Engineering Lead' },
    { name: 'Sarah Lee', email: 'sarah.lee@designhub.io', role: 'Product Designer' },
    { name: 'Alex Kim', email: 'alex.kim@fintechlabs.com', role: 'Data Scientist' },
    { name: 'Emma Wilson', email: 'emma.wilson@cloudtech.org', role: 'DevOps Engineer' },
    { name: 'Michael Brown', email: 'michael.b@acmesolutions.com', role: 'CTO' },
    { name: 'Sophia Martinez', email: 'sophia.m@creativeworks.co', role: 'UX Researcher' },
    { name: 'David Chen', email: 'david.chen@quantumai.net', role: 'AI Researcher' },
    { name: 'Olivia Taylor', email: 'olivia.t@venturecapital.io', role: 'Partner' },
    { name: 'James Anderson', email: 'james.a@cyberdefense.gov', role: 'Security Specialist' },
    { name: 'Emily Thomas', email: 'emily.t@healthplus.org', role: 'Medical Analyst' },
    { name: 'Daniel Jackson', email: 'daniel.j@edulearn.edu', role: 'Professor' },
    { name: 'Ava White', email: 'ava.w@mediastream.tv', role: 'Content Strategist' },
    { name: 'Matthew Harris', email: 'matthew.h@logistics.com', role: 'Operations Manager' },
    { name: 'Isabella Martin', email: 'isabella.m@retailgroup.com', role: 'Marketing Director' },
    { name: 'Ethan Thompson', email: 'ethan.t@financesec.com', role: 'Risk Analyst' },
    { name: 'Mia Garcia', email: 'mia.g@biotech.io', role: 'Genomics Researcher' },
    { name: 'Alexander Martinez', email: 'alex.m@cloudscale.net', role: 'Architect' },
    { name: 'Charlotte Robinson', email: 'charlotte.r@legaltech.com', role: 'Legal Counsel' },
    { name: 'Benjamin Clark', email: 'benjamin.c@synergy.org', role: 'Product Lead' },
    { name: 'Amelia Rodriguez', email: 'amelia.r@nextgen.io', role: 'Frontend Engineer' },
    { name: 'Lucas Lewis', email: 'lucas.l@databox.com', role: 'Backend Developer' },
    { name: 'Harper Lee', email: 'harper.l@writersguild.org', role: 'Technical Writer' },
    { name: 'Henry Walker', email: 'henry.w@aerospace.io', role: 'Systems Engineer' },
    { name: 'Evelyn Hall', email: 'evelyn.h@ecotech.org', role: 'Sustainability Analyst' },
    { name: 'Sebastian Allen', email: 'sebastian.a@robolabs.com', role: 'Robotics Lead' },
    { name: 'Abigail Young', email: 'abigail.y@consulting.com', role: 'Management Consultant' },
    { name: 'Jack Hernandez', email: 'jack.h@gamedev.io', role: 'Game Engine Dev' },
    { name: 'Emily King', email: 'emily.k@retailx.com', role: 'E-commerce Manager' },
    { name: 'Owen Wright', email: 'owen.w@deeplearning.ai', role: 'ML Researcher' },
    { name: 'Ella Lopez', email: 'ella.l@healthtech.co', role: 'Clinical Specialist' },
    { name: 'Samuel Hill', email: 'samuel.h@fintech.net', role: 'Compliance Officer' },
    { name: 'Scarlett Scott', email: 'scarlett.s@designstudio.io', role: 'Art Director' },
    { name: 'Ryan Green', email: 'ryan.g@cloudinfra.com', role: 'SRE Specialist' },
    { name: 'Grace Adams', email: 'grace.a@nonprofit.org', role: 'Program Director' },
    { name: 'Nathan Baker', email: 'nathan.b@mobileapps.co', role: 'iOS Engineer' },
    { name: 'Chloe Gonzalez', email: 'chloe.g@analytics.io', role: 'Data Engineer' },
    { name: 'Leo Nelson', email: 'leo.n@securityfirm.com', role: 'Penetration Tester' },
    { name: 'Penelope Carter', email: 'penelope.c@hrsolutions.com', role: 'People Lead' },
    { name: 'Isaac Mitchell', email: 'isaac.m@web3labs.io', role: 'Protocol Dev' },
    { name: 'Layla Perez', email: 'layla.p@brandagency.com', role: 'Creative Lead' },
    { name: 'Caleb Roberts', email: 'caleb.r@automotive.com', role: 'Software Engineer' },
    { name: 'Nora Turner', email: 'nora.t@biomed.org', role: 'Research Scientist' },
    { name: 'Luke Phillips', email: 'luke.p@saasplatform.io', role: 'Customer Success' },
    { name: 'Hazel Campbell', email: 'hazel.c@venturefund.com', role: 'Investment Analyst' },
    { name: 'Christian Parker', email: 'christian.p@datacloud.net', role: 'Database Admin' },
    { name: 'Zoey Evans', email: 'zoey.e@edtech.com', role: 'Curriculum Dev' },
    { name: 'Levi Edwards', email: 'levi.e@robotics.ai', role: 'Control Systems Dev' },
    { name: 'Nora Collins', email: 'nora.c@mediagroup.org', role: 'Editor in Chief' },
    { name: 'Aaron Stewart', email: 'aaron.s@cybertech.com', role: 'SOC Lead' },
    { name: 'Hannah Sanchez', email: 'hannah.s@growthio.com', role: 'Growth Hacker' }
  ];

  const now = new Date();

  const users = mockNames.map((user, idx) => {
    const plan = plans[idx];
    const createdDaysAgo = Math.floor(Math.random() * 90) + 10;
    const createdAt = new Date(now.getTime() - createdDaysAgo * 86400000).toISOString();

    return {
      id: `usr_${(idx + 1).toString().padStart(3, '0')}`,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: plan,
      status: plan === 'No Access' ? 'Revoked' : 'Active',
      grantedAt: createdAt,
      updatedAt: createdAt,
      seats: plan === 'Claude Team' ? 5 : plan === 'Enterprise' ? 25 : 1,
      billingCycle: plan === 'Enterprise' ? 'Annual' : plan === 'No Access' ? 'N/A' : 'Monthly'
    };
  });

  const initialAuditLogs = [
    {
      id: 'log_001',
      timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
      adminUser: 'admin',
      targetUserId: 'usr_001',
      targetUserName: 'John Doe',
      targetUserEmail: 'john.doe@anthropic-client.com',
      action: 'INITIAL_PROVISION',
      oldPlan: 'No Access',
      newPlan: 'Claude Pro',
      notes: 'Initial workspace onboard'
    },
    {
      id: 'log_002',
      timestamp: new Date(now.getTime() - 1 * 3600000).toISOString(),
      adminUser: 'admin',
      targetUserId: 'usr_002',
      targetUserName: 'Sarah Lee',
      targetUserEmail: 'sarah.lee@designhub.io',
      action: 'PLAN_UPGRADE',
      oldPlan: 'Claude Pro',
      newPlan: 'Claude Team',
      notes: 'Upgraded team seat count to 5'
    }
  ];

  return { users, auditLogs: initialAuditLogs, driftAlerts: INITIAL_DRIFT_ALERTS, plans: INITIAL_PLANS };
}

let memoryCache = null;
let lastMtime = 0;
let writeQueue = Promise.resolve();

function enqueueWrite(fn) {
  const resultPromise = writeQueue.then(async () => {
    return await fn();
  });
  writeQueue = resultPromise.catch(() => {});
  return resultPromise;
}

function ensureDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const seed = generateSeedData();
    const tmpFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(seed, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
    memoryCache = seed;
    try {
      lastMtime = fs.statSync(DB_FILE).mtimeMs;
    } catch {}
    return seed;
  }

  try {
    const stat = fs.statSync(DB_FILE);
    if (memoryCache && stat.mtimeMs === lastMtime) {
      return memoryCache;
    }

    const content = fs.readFileSync(DB_FILE, 'utf-8');
    memoryCache = JSON.parse(content);
    lastMtime = stat.mtimeMs;
    if (!memoryCache.driftAlerts) memoryCache.driftAlerts = INITIAL_DRIFT_ALERTS;
    if (!memoryCache.plans) memoryCache.plans = INITIAL_PLANS;
    return memoryCache;
  } catch (e) {
    if (memoryCache) return memoryCache;
    const backupFile = `${DB_FILE}.corrupt-${Date.now()}`;
    try {
      fs.renameSync(DB_FILE, backupFile);
      console.error(`Database file corrupted. Backed up corrupt file to ${backupFile}`);
    } catch {}
    throw new Error(`Failed to parse database file ${DB_FILE}: ${e.message}`);
  }
}

function saveDB(data) {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  const tmpFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
  memoryCache = data;
  try {
    lastMtime = fs.statSync(DB_FILE).mtimeMs;
  } catch {}
}

// Database helper API methods
export function getDashboardStats() {
  const db = ensureDB();
  const users = db.users || [];
  const driftAlerts = db.driftAlerts || INITIAL_DRIFT_ALERTS;
  const auditLogs = db.auditLogs || [];

  const totalUsers = users.length;
  const activePlans = users.filter((u) => u.plan !== 'No Access').length;
  const noAccess = users.filter((u) => u.plan === 'No Access').length;
  const openDrift = driftAlerts.filter((d) => d.status === 'open').length;

  const distribution = {
    'Claude Pro': users.filter((u) => u.plan === 'Claude Pro').length,
    'Claude Team': users.filter((u) => u.plan === 'Claude Team').length,
    Enterprise: users.filter((u) => u.plan === 'Enterprise').length,
    'No Access': noAccess
  };

  const recentActivity = auditLogs.slice(0, 6).map((l) => ({
    adminUser: l.adminUser,
    action: l.action,
    targetUserName: l.targetUserName,
    timestamp: l.timestamp
  }));

  return {
    stats: {
      totalUsers,
      activePlans,
      noAccess,
      driftAlerts: openDrift,
      pendingProvisions: 5,
      distribution
    },
    drift: driftAlerts.filter((d) => d.status === 'open').slice(0, 3),
    activity: recentActivity
  };
}

export function getUsers({ search = '', plan = 'All', page = 1, limit = 10 } = {}) {
  const db = ensureDB();
  let users = db.users || [];

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    users = users.filter(
      (u) => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.role || '').toLowerCase().includes(q)
    );
  }

  if (plan && plan !== 'All') {
    users = users.filter((u) => u.plan === plan);
  }

  const total = users.length;
  const totalPages = Math.ceil(total / Number(limit)) || 1;
  const currentPage = Math.max(1, Math.min(Number(page), totalPages));

  const start = (currentPage - 1) * Number(limit);
  const paginatedUsers = users.slice(start, start + Number(limit));

  return {
    users: paginatedUsers,
    total,
    page: currentPage,
    totalPages,
    limit: Number(limit),
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + Number(limit), total)
  };
}

export function getUserById(id) {
  const db = ensureDB();
  const user = (db.users || []).find((u) => u.id === id);
  if (!user) return null;

  const userLogs = (db.auditLogs || [])
    .filter((log) => log.targetUserId === id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return { ...user, auditLogs: userLogs };
}

export async function updateUserPlan({ userId, newPlan, seats, billingCycle, adminUser = 'admin', notes = '' }) {
  return enqueueWrite(async () => {
    const db = ensureDB();
    const userIndex = (db.users || []).findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const user = db.users[userIndex];
    const oldPlan = user.plan;
    const now = new Date().toISOString();
    const status = newPlan === 'No Access' ? 'Revoked' : 'Active';

    db.users[userIndex] = {
      ...user,
      plan: newPlan,
      status,
      seats: seats ? Number(seats) : newPlan === 'Claude Team' ? 5 : newPlan === 'Enterprise' ? 25 : 1,
      billingCycle: billingCycle || user.billingCycle,
      updatedAt: now,
      grantedAt: oldPlan !== newPlan ? now : user.grantedAt
    };

    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: now,
      adminUser,
      targetUserId: user.id,
      targetUserName: user.name,
      targetUserEmail: user.email,
      action: oldPlan === 'No Access' ? 'PLAN_GRANTED' : newPlan === 'No Access' ? 'PLAN_REVOKED' : 'PLAN_CHANGED',
      oldPlan,
      newPlan,
      notes: notes || `Admin changed plan from ${oldPlan} to ${newPlan}`
    };

    db.auditLogs = [newLog, ...(db.auditLogs || [])];
    saveDB(db);

    return {
      user: db.users[userIndex],
      auditLog: newLog
    };
  });
}

export function getAuditLogs({ search = '', page = 1, limit = 15 } = {}) {
  const db = ensureDB();
  let logs = db.auditLogs || [];

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    logs = logs.filter(
      (l) =>
        (l.targetUserName || '').toLowerCase().includes(q) ||
        (l.targetUserEmail || '').toLowerCase().includes(q) ||
        (l.adminUser || '').toLowerCase().includes(q) ||
        (l.action || '').toLowerCase().includes(q) ||
        (l.notes || '').toLowerCase().includes(q)
    );
  }

  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const total = logs.length;
  const totalPages = Math.ceil(total / Number(limit)) || 1;
  const currentPage = Math.max(1, Math.min(Number(page), totalPages));

  const start = (currentPage - 1) * Number(limit);
  const paginatedLogs = logs.slice(start, start + Number(limit));

  return {
    logs: paginatedLogs,
    total,
    page: currentPage,
    totalPages,
    limit: Number(limit),
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + Number(limit), total)
  };
}

export function getPlans() {
  const db = ensureDB();
  const users = db.users || [];
  const distribution = {
    'Claude Pro': users.filter((u) => u.plan === 'Claude Pro').length,
    'Claude Team': users.filter((u) => u.plan === 'Claude Team').length,
    Enterprise: users.filter((u) => u.plan === 'Enterprise').length,
    'No Access': users.filter((u) => u.plan === 'No Access').length
  };
  const plans = db.plans || INITIAL_PLANS;
  return { plans: plans.map((p) => ({ ...p, activeCount: distribution[p.key] ?? 0 })) };
}

export function getDriftAlerts() {
  const db = ensureDB();
  const alerts = db.driftAlerts || INITIAL_DRIFT_ALERTS;
  return { alerts, total: alerts.filter((d) => d.status === 'open').length };
}

export async function resolveDriftAlert(id, status = 'resolved') {
  return enqueueWrite(async () => {
    const db = ensureDB();
    const alerts = db.driftAlerts || INITIAL_DRIFT_ALERTS;
    const alert = alerts.find((d) => d.id === id);
    if (!alert) {
      throw new Error('Alert not found');
    }
    alert.status = status;
    alert.resolvedAt = new Date().toISOString();
    saveDB(db);
    return alert;
  });
}
