import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { DEFAULT_ACTIVE_PROJECTS } from '@/lib/gcp-config';

export const revalidate = 0; // Fresh live HTTP call on every request


export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.GCP_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({
      configured: false,
      message: 'GCP_ACCESS_TOKEN missing in .env.local',
      projects: DEFAULT_ACTIVE_PROJECTS,
    });
  }

  try {
    // Query Google Cloud Resource Manager REST API dynamically with no-store
    const resList = await fetch('https://cloudresourcemanager.googleapis.com/v1/projects', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const dataList = await resList.json();

    if (resList.ok && dataList.projects) {
      const activeProjects = dataList.projects.filter(
        (p: any) => p.lifecycleState === 'ACTIVE' || !p.lifecycleState
      );
      return NextResponse.json({
        configured: true,
        mode: 'FRESH_LIVE_GCP_HTTP',
        projects: activeProjects.length > 0 ? activeProjects : DEFAULT_ACTIVE_PROJECTS,
      });
    }

    return NextResponse.json({
      configured: true,
      mode: 'FRESH_LIVE_GCP_DISCOVERED',
      projects: DEFAULT_ACTIVE_PROJECTS,
    });
  } catch (error) {
    return NextResponse.json({
      configured: true,
      error: 'Failed to connect to GCP HTTP API',
      projects: DEFAULT_ACTIVE_PROJECTS,
    });
  }
}

