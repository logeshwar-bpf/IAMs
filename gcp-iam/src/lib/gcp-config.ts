export const DEFAULT_PROJECT_ID = process.env.GCP_PROJECT_ID || 'my-project-82180212';

export const PROJECT_ID_REGEX = /^[a-z][a-z0-9-]{4,29}$/i;

export interface GCPProjectInfo {
  projectId: string;
  name: string;
  projectNumber?: string;
  lifecycleState?: string;
}

export const DEFAULT_ACTIVE_PROJECTS: GCPProjectInfo[] = [
  { projectId: 'bye-32507', name: 'Bye 32507', projectNumber: '138536914432', lifecycleState: 'ACTIVE' },
  { projectId: 'hello-20954', name: 'Hello 20954', projectNumber: '180457349687', lifecycleState: 'ACTIVE' },
  { projectId: 'my-project-82180212', name: 'my-project-82180212', projectNumber: '1092945188165', lifecycleState: 'ACTIVE' },
];

export function isValidProjectId(projectId: string): boolean {
  if (!projectId || typeof projectId !== 'string') return false;
  return PROJECT_ID_REGEX.test(projectId.trim());
}
