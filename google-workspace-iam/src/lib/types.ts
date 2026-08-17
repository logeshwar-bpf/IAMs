export type ServiceName =
  | 'gmail'
  | 'drive'
  | 'meet'
  | 'calendar'
  | 'gemini'
  | 'youtube'
  | 'maps'
  | 'news'
  | 'chat'
  | 'keep'
  | 'sites'
  | 'vault';

export type ServiceFlags = Record<ServiceName, boolean>;

export interface User {
  id: string;
  primaryEmail: string;
  name: {
    givenName: string;
    familyName: string;
    fullName: string;
  };
  orgUnitPath: string;
  suspended: boolean;
  creationTime: string;
  lastLoginTime: string;
  services: ServiceFlags;
  licenseSkuId: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  details: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface DriftItem {
  id: string;
  timestamp: string;
  userEmail: string;
  userName: string;
  service: ServiceName;
  expectedState: boolean;
  actualState: boolean;
  driftType: 'UNAUTHORIZED_ACCESS' | 'UNEXPECTED_REVOCATION';
  status: 'DETECTED' | 'RESOLVED';
}

export interface BulkServiceRequest {
  userIds?: string[];
  orgUnitPath?: string;
  services: Partial<ServiceFlags>;
}

export interface UserQueryParams {
  search?: string;
  orgUnitPath?: string;
  suspended?: boolean;
  service?: ServiceName;
  serviceState?: boolean;
  page?: number;
  limit?: number;
}
