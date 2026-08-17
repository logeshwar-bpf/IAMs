import {
  User,
  AuditLog,
  DriftItem,
  ServiceFlags,
  ServiceName,
  UserQueryParams,
} from './types';

// Pre-populated default services
const defaultServices: ServiceFlags = {
  gmail: true,
  drive: true,
  meet: true,
  calendar: true,
  gemini: true,
  youtube: true,
  maps: true,
  news: true,
  chat: true,
  keep: true,
  sites: true,
  vault: false,
};

// Generate 50 realistic employees focusing on email, name, status & service access
const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Sam', 'Chris', 'Pat', 'Riley', 'Casey', 'Jesse',
  'Avery', 'Dakota', 'Reese', 'Quinn', 'Skyler', 'Cameron', 'Logan', 'Rowan', 'Finley', 'Harper',
  'Ethan', 'Sophia', 'Lucas', 'Emma', 'Oliver', 'Ava', 'Liam', 'Isabella', 'Noah', 'Mia',
  'James', 'Charlotte', 'Benjamin', 'Amelia', 'Henry', 'Harper', 'Alexander', 'Evelyn', 'Sebastian', 'Abigail',
  'Jack', 'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Mila', 'Samuel', 'Ella', 'David', 'Avery'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const ouPaths = ['/Engineering', '/Sales', '/Marketing', '/Finance', '/Executive'];

const usersStore: User[] = Array.from({ length: 50 }, (_, i) => {
  const givenName = firstNames[i];
  const familyName = lastNames[i];
  const email = `${givenName.toLowerCase()}.${familyName.toLowerCase()}@company.com`;
  const ou = ouPaths[i % ouPaths.length];

  const userServices: ServiceFlags = {
    ...defaultServices,
    gemini: i % 2 === 0, // 25 enabled
    youtube: i % 3 !== 0, // 33 enabled
    vault: i % 4 === 0,
    news: i % 5 !== 0,
  };

  return {
    id: `usr-${i + 1}`,
    primaryEmail: email,
    name: {
      givenName,
      familyName,
      fullName: `${givenName} ${familyName}`,
    },
    orgUnitPath: ou,
    suspended: i === 48 || i === 49,
    creationTime: new Date(Date.now() - (50 - i) * 86400000 * 3).toISOString(),
    lastLoginTime: new Date(Date.now() - (i % 7) * 86400000).toISOString(),
    services: userServices,
    licenseSkuId: '1010020020',
  };
});

let auditLogsStore: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    actor: 'admin@company.com',
    action: 'SERVICE_ACCESS_GRANT',
    target: 'alex.smith@company.com',
    details: 'Granted Gemini Enterprise access',
    status: 'SUCCESS',
  },
  {
    id: 'log-102',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actor: 'admin@company.com',
    action: 'USER_PROVISION',
    target: 'jordan.johnson@company.com',
    details: 'Provisioned new employee account with default Gmail, Drive, Meet & Gemini access',
    status: 'SUCCESS',
  },
  {
    id: 'log-103',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    actor: 'admin@company.com',
    action: 'SERVICE_ACCESS_REVOKE',
    target: 'taylor.williams@company.com',
    details: 'Revoked YouTube access',
    status: 'SUCCESS',
  },
];

let driftLogsStore: DriftItem[] = [
  {
    id: 'drift-1',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    userEmail: 'alex.smith@company.com',
    userName: 'Alex Smith',
    service: 'youtube',
    expectedState: false,
    actualState: true,
    driftType: 'UNAUTHORIZED_ACCESS',
    status: 'DETECTED',
  },
  {
    id: 'drift-2',
    timestamp: new Date(Date.now() - 2700000).toISOString(),
    userEmail: 'jordan.johnson@company.com',
    userName: 'Jordan Johnson',
    service: 'gemini',
    expectedState: true,
    actualState: false,
    driftType: 'UNEXPECTED_REVOCATION',
    status: 'DETECTED',
  },
  {
    id: 'drift-3',
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    userEmail: 'sam.brown@company.com',
    userName: 'Sam Brown',
    service: 'drive',
    expectedState: true,
    actualState: false,
    driftType: 'UNEXPECTED_REVOCATION',
    status: 'DETECTED',
  },
  {
    id: 'drift-4',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    userEmail: 'chris.jones@company.com',
    userName: 'Chris Jones',
    service: 'gemini',
    expectedState: false,
    actualState: true,
    driftType: 'UNAUTHORIZED_ACCESS',
    status: 'DETECTED',
  },
];

function logAudit(action: string, target: string, details: string, actor?: string) {
  const auditActor = actor || process.env.ADMIN_EMAIL || 'system';
  auditLogsStore.unshift({
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    actor: auditActor,
    action,
    target,
    details,
    status: 'SUCCESS',
  });
}

export const mockAdminStore = {
  getUsers(params: UserQueryParams = {}) {
    let filtered = [...usersStore];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.fullName.toLowerCase().includes(q) ||
          u.primaryEmail.toLowerCase().includes(q)
      );
    }

    if (params.suspended !== undefined) {
      filtered = filtered.filter((u) => u.suspended === params.suspended);
    }

    if (params.service && params.serviceState !== undefined) {
      filtered = filtered.filter(
        (u) => u.services[params.service!] === params.serviceState
      );
    }

    const total = filtered.length;
    const page = params.page || 1;
    const limit = params.limit || 50;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    const orgStats = {
      geminiActiveCount: usersStore.filter((u) => u.services.gemini).length,
      meetActiveCount: usersStore.filter((u) => u.services.meet).length,
      totalUsersCount: usersStore.length,
    };

    return { data, total, page, limit, totalPages: Math.ceil(total / limit), orgStats };
  },

  getUserById(id: string) {
    return usersStore.find((u) => u.id === id || u.primaryEmail === id);
  },

  createUser(payload: {
    givenName: string;
    familyName: string;
    primaryEmail: string;
    services?: Partial<ServiceFlags>;
  }) {
    const cleanEmail = payload.primaryEmail.toLowerCase().trim();
    const exists = usersStore.some((u) => u.primaryEmail.toLowerCase().trim() === cleanEmail);
    if (exists) {
      throw new Error(`User with email '${payload.primaryEmail}' already exists`);
    }

    const newId = `usr-${crypto.randomUUID()}`;
    const newUser: User = {
      id: newId,
      primaryEmail: payload.primaryEmail,
      name: {
        givenName: payload.givenName,
        familyName: payload.familyName,
        fullName: `${payload.givenName} ${payload.familyName}`,
      },
      orgUnitPath: '/Engineering',
      suspended: false,
      creationTime: new Date().toISOString(),
      lastLoginTime: 'Never logged in',
      services: {
        ...defaultServices,
        ...(payload.services || {}),
      },
      licenseSkuId: '1010020020',
    };

    usersStore.unshift(newUser);
    logAudit('USER_PROVISION', newUser.primaryEmail, `Provisioned new user account with default access`);
    return newUser;
  },

  updateUser(id: string, updates: Partial<User>) {
    const index = usersStore.findIndex((u) => u.id === id || u.primaryEmail === id);
    if (index === -1) return null;

    const existing = usersStore[index];
    const updated = {
      ...existing,
      ...updates,
      name: updates.name ? { ...existing.name, ...updates.name } : existing.name,
    };

    usersStore[index] = updated;
    logAudit('USER_UPDATE', updated.primaryEmail, 'Updated user status');
    return updated;
  },

  deleteUser(id: string) {
    const index = usersStore.findIndex((u) => u.id === id || u.primaryEmail === id);
    if (index === -1) return false;

    const user = usersStore[index];
    usersStore.splice(index, 1);

    logAudit('USER_DELETE', user.primaryEmail, 'Deleted user account');
    return true;
  },

  updateUserServices(id: string, services: Partial<ServiceFlags>) {
    const user = this.getUserById(id);
    if (!user) return null;

    user.services = {
      ...user.services,
      ...services,
    };

    const toggled = Object.entries(services)
      .map(([k, v]) => `${k.toUpperCase()}=${v ? 'GRANTED' : 'REVOKED'}`)
      .join(', ');

    logAudit('ACCESS_TOGGLE', user.primaryEmail, `Updated service access: ${toggled}`);
    return user;
  },

  bulkUpdateServices(userIds: string[] | undefined, orgUnitPath: string | undefined, services: Partial<ServiceFlags>) {
    let targetUsers: User[] = [];

    if (userIds && userIds.length > 0) {
      targetUsers = usersStore.filter((u) => userIds.includes(u.id));
      if (orgUnitPath) {
        targetUsers = targetUsers.filter((u) => u.orgUnitPath === orgUnitPath);
      }
    } else if (orgUnitPath) {
      targetUsers = usersStore.filter((u) => u.orgUnitPath === orgUnitPath);
    } else {
      return { updatedCount: 0, targetUsers: [] };
    }

    targetUsers.forEach((u) => {
      u.services = {
        ...u.services,
        ...services,
      };
    });

    const serviceSummary = Object.entries(services)
      .map(([k, v]) => `${k}=${v ? 'GRANT' : 'REVOKE'}`)
      .join(', ');

    logAudit(
      'BULK_ACCESS_UPDATE',
      `${targetUsers.length} employees`,
      `Applied bulk access rule (${serviceSummary})`
    );

    return { updatedCount: targetUsers.length, users: targetUsers };
  },

  getAuditLogs() {
    return auditLogsStore;
  },

  getDriftLogs() {
    return driftLogsStore;
  },

  remediateDrift(driftId: string) {
    const item = driftLogsStore.find((d) => d.id === driftId);
    if (!item) return null;

    const user = usersStore.find((u) => u.primaryEmail === item.userEmail);
    if (!user) {
      return null;
    }

    item.status = 'RESOLVED';
    user.services[item.service] = item.expectedState;

    logAudit(
      'DRIFT_REMEDIATE',
      item.userEmail,
      `Remediated access drift for ${item.service.toUpperCase()}. Restored to policy state (${item.expectedState ? 'GRANTED' : 'REVOKED'})`
    );

    return item;
  },
};
