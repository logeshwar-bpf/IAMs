import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Initial seed data helper
function generateSeedData() {
  const plans = [
    ...Array(24).fill('Claude Pro'),
    ...Array(15).fill('Claude Team'),
    ...Array(3).fill('Enterprise'),
    ...Array(8).fill('No Access'),
  ];

  // Shuffle plans deterministically or map to 50 realistic users
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

  return { users, auditLogs: initialAuditLogs };
}

let memoryCache = null;

function ensureDB() {
  if (memoryCache) return memoryCache;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const seed = generateSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    memoryCache = seed;
    return seed;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    memoryCache = JSON.parse(content);
    return memoryCache;
  } catch (e) {
    const backupFile = `${DB_FILE}.corrupt-${Date.now()}`;
    try {
      fs.renameSync(DB_FILE, backupFile);
      console.error(`Database file corrupted. Backed up corrupt file to ${backupFile}`);
    } catch {}
    throw new Error(`Failed to parse database file ${DB_FILE}: ${e.message}`);
  }
}

function saveDB(data) {
  memoryCache = data;
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  const tmpFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}

// Database helper API methods
export function getDashboardStats() {
  const db = ensureDB();
  const users = db.users || [];

  const totalUsers = users.length;
  const activePlans = users.filter((u) => u.plan !== 'No Access').length;
  const noAccess = users.filter((u) => u.plan === 'No Access').length;

  const distribution = {
    'Claude Pro': users.filter((u) => u.plan === 'Claude Pro').length,
    'Claude Team': users.filter((u) => u.plan === 'Claude Team').length,
    Enterprise: users.filter((u) => u.plan === 'Enterprise').length,
    'No Access': noAccess
  };

  return {
    totalUsers,
    activePlans,
    noAccess,
    distribution
  };
}

export function getUsers({ search = '', plan = 'All', page = 1, limit = 10 }) {
  const db = ensureDB();
  let users = db.users || [];

  if (search.trim()) {
    const q = search.toLowerCase().trim();
    users = users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
    );
  }

  if (plan !== 'All') {
    users = users.filter((u) => u.plan === plan);
  }

  const total = users.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const start = (currentPage - 1) * limit;
  const paginatedUsers = users.slice(start, start + limit);

  return {
    users: paginatedUsers,
    total,
    page: currentPage,
    totalPages,
    limit,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + limit, total)
  };
}

export function getUserById(id) {
  const db = ensureDB();
  const user = (db.users || []).find((u) => u.id === id);
  if (!user) return null;

  // Also include recent audit logs for this user
  const userLogs = (db.auditLogs || [])
    .filter((log) => log.targetUserId === id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return { ...user, auditLogs: userLogs };
}

export function updateUserPlan({ userId, newPlan, seats, billingCycle, adminUser = 'admin', notes = '' }) {
  const db = ensureDB();
  const userIndex = (db.users || []).findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const user = db.users[userIndex];
  const oldPlan = user.plan;
  const now = new Date().toISOString();

  // Determine status
  const status = newPlan === 'No Access' ? 'Revoked' : 'Active';

  // Update user
  db.users[userIndex] = {
    ...user,
    plan: newPlan,
    status,
    seats: seats ? Number(seats) : newPlan === 'Claude Team' ? 5 : newPlan === 'Enterprise' ? 25 : 1,
    billingCycle: billingCycle || user.billingCycle,
    updatedAt: now,
    grantedAt: oldPlan !== newPlan ? now : user.grantedAt
  };

  // Add audit log record
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
}

export function getAuditLogs({ search = '', page = 1, limit = 10 }) {
  const db = ensureDB();
  let logs = db.auditLogs || [];

  if (search.trim()) {
    const q = search.toLowerCase().trim();
    logs = logs.filter(
      (l) =>
        l.targetUserName.toLowerCase().includes(q) ||
        l.targetUserEmail.toLowerCase().includes(q) ||
        l.adminUser.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.notes.toLowerCase().includes(q)
    );
  }

  // Sort descending by timestamp
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const total = logs.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const start = (currentPage - 1) * limit;
  const paginatedLogs = logs.slice(start, start + limit);

  return {
    logs: paginatedLogs,
    total,
    page: currentPage,
    totalPages,
    limit,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + limit, total)
  };
}
