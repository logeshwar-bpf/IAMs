import crypto from 'crypto';
import { DEFAULT_PROJECT_ID } from '@/lib/gcp-config';

export type RequestCategory = 'ROLE' | 'SERVICE' | 'PROJECT';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export const ALLOWED_ROLES = [
  'roles/owner',
  'roles/editor',
  'roles/viewer',
  'roles/storage.admin',
  'roles/storage.objectViewer',
  'roles/bigquery.admin',
  'roles/bigquery.user',
  'roles/compute.admin',
  'roles/run.admin',
  'roles/container.admin',
  'roles/pubsub.admin',
  'roles/artifactregistry.admin',
];

export const ALLOWED_SERVICES = [
  'BigQuery Analytics',
  'Cloud Storage (GCS)',
  'Cloud Run Services',
  'Google Kubernetes Engine (GKE)',
  'Compute Engine (VMs)',
  'Cloud SQL Databases',
  'Pub/Sub Messaging',
  'Artifact Registry',
  'Cloud Functions',
  'Cloud Spanner',
];

export interface AccessRequestItem {
  id: string;
  userEmail: string;
  userName: string;
  category: RequestCategory;
  requestTarget: string;
  projectId?: string;
  justification: string;
  requestedAt: string;
  status: RequestStatus;
}

export interface UserProvision {
  userEmail: string;
  userName: string;
  roles: string[];
  services: string[];
  projects: string[];
}

export const initialUserProvisions: UserProvision[] = [
  {
    userEmail: 'logeshwar2424@gmail.com',
    userName: 'logeshwar2424',
    roles: ['roles/viewer'],
    services: ['GCP Project IAM'],
    projects: [DEFAULT_PROJECT_ID],
  },
  {
    userEmail: '1092945188165-compute@developer.gserviceaccount.com',
    userName: 'Compute Service Account',
    roles: ['roles/editor'],
    services: ['Cloud Service Account'],
    projects: [DEFAULT_PROJECT_ID],
  },
];

let MOCK_PROVISIONS: Record<string, UserProvision> = {
  'logeshwar2424@gmail.com': { ...initialUserProvisions[0], roles: [...initialUserProvisions[0].roles], services: [...initialUserProvisions[0].services], projects: [...initialUserProvisions[0].projects] },
  '1092945188165-compute@developer.gserviceaccount.com': { ...initialUserProvisions[1], roles: [...initialUserProvisions[1].roles], services: [...initialUserProvisions[1].services], projects: [...initialUserProvisions[1].projects] },
};

let MOCK_REQUESTS: AccessRequestItem[] = [
  {
    id: 'req-1',
    userEmail: 'logeshwar2424@gmail.com',
    userName: 'logeshwar2424',
    category: 'ROLE',
    requestTarget: 'roles/editor',
    projectId: DEFAULT_PROJECT_ID,
    justification: `Need editor permissions for deployment on ${DEFAULT_PROJECT_ID}`,
    requestedAt: '2026-07-30T10:00:00.000Z',
    status: 'PENDING',
  },
];

export function getAllRequests(): AccessRequestItem[] {
  return MOCK_REQUESTS;
}

export function getRequestById(requestId: string): AccessRequestItem | undefined {
  return MOCK_REQUESTS.find((r) => r.id === requestId);
}

export function getUserRequests(userEmail: string): AccessRequestItem[] {
  return MOCK_REQUESTS.filter((r) => r.userEmail.toLowerCase() === userEmail.toLowerCase());
}

export function createRequest(
  userEmail: string,
  userName: string,
  category: RequestCategory,
  requestTarget: string,
  justification: string,
  projectId?: string
): AccessRequestItem {
  const newReq: AccessRequestItem = {
    id: `req-${crypto.randomUUID()}`,
    userEmail,
    userName,
    category,
    requestTarget,
    projectId,
    justification,
    requestedAt: new Date().toISOString(),
    status: 'PENDING',
  };
  MOCK_REQUESTS.unshift(newReq);
  return newReq;
}

export const createAccessRequest = createRequest;

export function updateRequestStatus(requestId: string, status: RequestStatus): AccessRequestItem | null {
  const reqItem = MOCK_REQUESTS.find((r) => r.id === requestId);
  if (!reqItem) return null;

  reqItem.status = status;

  if (status === 'APPROVED') {
    const type = reqItem.category.toLowerCase() as 'role' | 'service' | 'project';
    grantPermission(reqItem.userEmail, type, reqItem.requestTarget);
  }

  return reqItem;
}

export function getAllUserProvisions(): UserProvision[] {
  return Object.values(MOCK_PROVISIONS);
}

export function getUserProvision(userEmail: string): UserProvision | null {
  const cleanEmail = userEmail.toLowerCase().trim();
  const found = Object.keys(MOCK_PROVISIONS).find((k) => k.toLowerCase().trim() === cleanEmail);
  return found ? MOCK_PROVISIONS[found] : null;
}

export function revokePermission(
  targetEmail: string,
  type: 'role' | 'service' | 'project',
  value: string
): boolean {
  const cleanEmail = targetEmail.toLowerCase().trim();
  const foundKey = Object.keys(MOCK_PROVISIONS).find((k) => k.toLowerCase().trim() === cleanEmail);
  if (!foundKey) return false;

  const prov = MOCK_PROVISIONS[foundKey];
  if (type === 'role') {
    prov.roles = prov.roles.filter((r) => r !== value);
  } else if (type === 'service') {
    prov.services = prov.services.filter((s) => s !== value);
  } else if (type === 'project') {
    prov.projects = prov.projects.filter((p) => p !== value);
  }
  return true;
}

export function grantPermission(
  targetEmail: string,
  type: 'role' | 'service' | 'project',
  value: string
): boolean {
  const cleanEmail = targetEmail.toLowerCase().trim();
  let foundKey = Object.keys(MOCK_PROVISIONS).find((k) => k.toLowerCase().trim() === cleanEmail);

  if (!foundKey) {
    MOCK_PROVISIONS[targetEmail] = {
      userEmail: targetEmail,
      userName: targetEmail.split('@')[0],
      roles: [],
      services: [],
      projects: [],
    };
    foundKey = targetEmail;
  }

  const prov = MOCK_PROVISIONS[foundKey];
  if (type === 'role' && !prov.roles.includes(value)) prov.roles.push(value);
  if (type === 'service' && !prov.services.includes(value)) prov.services.push(value);
  if (type === 'project' && !prov.projects.includes(value)) prov.projects.push(value);

  return true;
}

