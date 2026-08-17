import { mockAdminStore } from './mock-admin-store';
import { UserQueryParams, ServiceFlags } from './types';

const isMockMode = process.env.MOCK_MODE !== 'false';

export const googleAdminClient = {
  isMock: () => isMockMode,

  async getUsers(params: UserQueryParams = {}) {
    if (isMockMode) return mockAdminStore.getUsers(params);
    throw new Error('Live Google Admin API credentials not configured.');
  },

  async getUserById(id: string) {
    if (isMockMode) return mockAdminStore.getUserById(id);
    throw new Error('Live Google Admin API credentials not configured.');
  },

  async createUser(payload: {
    givenName: string;
    familyName: string;
    primaryEmail: string;
    services?: Partial<ServiceFlags>;
  }) {
    if (isMockMode) return mockAdminStore.createUser(payload);
    throw new Error('Live Google Admin API credentials not configured.');
  },

  async updateUser(id: string, updates: any) {
    if (isMockMode) return mockAdminStore.updateUser(id, updates);
    throw new Error('Live Google Admin API credentials not configured.');
  },

  async deleteUser(id: string) {
    if (isMockMode) return mockAdminStore.deleteUser(id);
    throw new Error('Live Google Admin API credentials not configured.');
  },

  async updateUserServices(id: string, services: Partial<ServiceFlags>) {
    if (isMockMode) return mockAdminStore.updateUserServices(id, services);
    throw new Error('Live Google Admin API credentials not configured.');
  },

  async bulkUpdateServices(userIds: string[] | undefined, orgUnitPath: string | undefined, services: Partial<ServiceFlags>) {
    if (isMockMode) return mockAdminStore.bulkUpdateServices(userIds, orgUnitPath, services);
    throw new Error('Live Google Admin API credentials not configured.');
  },

  async getAuditLogs() {
    if (isMockMode) return mockAdminStore.getAuditLogs();
    throw new Error('Live Google Admin API credentials not configured.');
  },

  async getDriftLogs() {
    if (isMockMode) return mockAdminStore.getDriftLogs();
    throw new Error('Live Google Admin API credentials not configured.');
  },

  async remediateDrift(driftId: string) {
    if (isMockMode) return mockAdminStore.remediateDrift(driftId);
    throw new Error('Live Google Admin API credentials not configured.');
  },
};
