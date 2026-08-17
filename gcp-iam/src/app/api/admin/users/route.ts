import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { DEFAULT_PROJECT_ID, isValidProjectId } from '@/lib/gcp-config';
import { getAllUserProvisions, getUserProvision, grantPermission, revokePermission, UserProvision } from '@/lib/gcp-store';

export const revalidate = 0; // Disable caching: Fresh live HTTP call on every request

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.role !== 'ADMIN') {
    const ownProvision = getUserProvision(user.email) || {
      userEmail: user.email,
      userName: user.name,
      roles: [],
      services: [],
      projects: [],
    };
    return NextResponse.json({
      users: [],
      userProvision: ownProvision,
    });
  }

  const token = process.env.GCP_ACCESS_TOKEN;
  const memberMap: Record<string, UserProvision> = {};

  // Initialize memberMap with local store provisions as default/fallback
  const localProvisions = getAllUserProvisions();
  localProvisions.forEach((p) => {
    const clean = p.userEmail.toLowerCase().trim();
    memberMap[clean] = {
      userEmail: p.userEmail,
      userName: p.userName,
      roles: [...p.roles],
      services: [...p.services],
      projects: [...p.projects],
    };
  });

  if (token) {
    try {
      // 1. Fresh Live GCP HTTP call to fetch all active projects
      const projRes = await fetch('https://cloudresourcemanager.googleapis.com/v1/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      const projData = await projRes.json();
      if (projRes.ok && projData.projects) {
        const activeProjects = projData.projects.filter((p: any) => p.lifecycleState === 'ACTIVE' || !p.lifecycleState);

        // 2. Fresh Live GCP HTTP call to fetch IAM policy for each active project
        for (const proj of activeProjects) {
          const safeProjId = encodeURIComponent(proj.projectId);
          const iamRes = await fetch(`https://cloudresourcemanager.googleapis.com/v1/projects/${safeProjId}:getIamPolicy`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          });

          const iamData = await iamRes.json();

          if (iamRes.ok && iamData.bindings) {
            iamData.bindings.forEach((binding: { role: string; members: string[] }) => {
              binding.members.forEach((m: string) => {
                const cleanEmail = m.replace(/^(user:|serviceAccount:)/, '').toLowerCase().trim();
                const originalEmail = m.replace(/^(user:|serviceAccount:)/, '');
                const isSa = m.startsWith('serviceAccount:');

                if (!memberMap[cleanEmail]) {
                  memberMap[cleanEmail] = {
                    userEmail: originalEmail,
                    userName: originalEmail.split('@')[0],
                    roles: [],
                    services: [isSa ? 'Cloud Service Account' : 'GCP Project IAM'],
                    projects: [],
                  };
                }

                if (!memberMap[cleanEmail].roles.includes(binding.role)) {
                  memberMap[cleanEmail].roles.push(binding.role);
                }
                if (!memberMap[cleanEmail].projects.includes(proj.projectId)) {
                  memberMap[cleanEmail].projects.push(proj.projectId);
                }
              });
            });
          }
        }
      }
    } catch (error) {
      console.warn('Error fetching live GCP HTTP IAM data, falling back to stored provisions:', error);
    }
  }

  const realMembers = Object.values(memberMap).filter(
    (m) => m.userEmail.toLowerCase() !== 'logeshwar2525@gmail.com'
  );

  const currentCleanEmail = user.email.toLowerCase().trim();
  const currentUserProvision = memberMap[currentCleanEmail] || getUserProvision(user.email) || {
    userEmail: user.email,
    userName: user.name,
    roles: [],
    services: [],
    projects: [],
  };

  return NextResponse.json({
    mode: token ? 'HYBRID_GCP_STORE' : 'MOCK_STORE',
    users: realMembers,
    userProvision: currentUserProvision,
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, targetEmail, type, value } = body;

    if (!targetEmail || !action || !type || !value) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const targetProject = body.project ? String(body.project).trim() : DEFAULT_PROJECT_ID;
    if (!isValidProjectId(targetProject)) {
      return NextResponse.json({ error: 'Invalid target project ID format' }, { status: 400 });
    }

    // 1. Update local store state
    if (action === 'grant') {
      grantPermission(targetEmail, type, value);
    } else if (action === 'revoke') {
      revokePermission(targetEmail, type, value);
    }

    const token = process.env.GCP_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json({
        success: true,
        mode: 'LOCAL_STORE_MUTATED',
        message: `Successfully executed local IAM mutation: ${action.toUpperCase()} ${value} for ${targetEmail}`,
      });
    }

    try {
      const safeProject = encodeURIComponent(targetProject);
      // 2. Fresh Live GCP HTTP call to fetch current policy & etag for target project
      const getRes = await fetch(`https://cloudresourcemanager.googleapis.com/v1/projects/${safeProject}:getIamPolicy`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      const policyData = await getRes.json();

      if (!getRes.ok) {
        return NextResponse.json(
          { error: policyData.error?.message || `GCP getIamPolicy failed for project '${targetProject}'` },
          { status: getRes.status || 500 }
        );
      }

      let bindings = policyData.bindings || [];
      const formattedMember = targetEmail.includes('gserviceaccount.com')
        ? `serviceAccount:${targetEmail}`
        : `user:${targetEmail}`;

      if (action === 'grant') {
        const targetRole = type === 'role' ? value : 'roles/viewer';
        let roleBinding = bindings.find((b: any) => b.role === targetRole);

        if (roleBinding) {
          if (!roleBinding.members.includes(formattedMember)) {
            roleBinding.members.push(formattedMember);
          }
        } else {
          bindings.push({
            role: targetRole,
            members: [formattedMember],
          });
        }
      } else if (action === 'revoke') {
        const targetRole = type === 'role' ? value : 'roles/viewer';
        bindings = bindings.map((b: any) => {
          if (b.role === targetRole) {
            return {
              ...b,
              members: b.members.filter((m: string) => m !== formattedMember),
            };
          }
          return b;
        }).filter((b: any) => b.members.length > 0);
      }

      const setRes = await fetch(`https://cloudresourcemanager.googleapis.com/v1/projects/${safeProject}:setIamPolicy`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          policy: {
            version: policyData.version || 1,
            etag: policyData.etag,
            bindings: bindings,
          },
        }),
        cache: 'no-store',
      });

      const setResult = await setRes.json();

      if (setRes.ok) {
        return NextResponse.json({
          success: true,
          mode: 'FRESH_LIVE_GCP_MUTATED',
          message: `Successfully executed live GCP setIamPolicy mutation on project '${targetProject}': ${action.toUpperCase()} ${value} for ${targetEmail}`,
          gcpPolicy: setResult,
        });
      } else {
        return NextResponse.json(
          { error: setResult.error?.message || `GCP setIamPolicy failed: ${setRes.statusText}` },
          { status: setRes.status || 500 }
        );
      }
    } catch (gcpErr: any) {
      console.warn('GCP setIamPolicy API failed:', gcpErr);
      return NextResponse.json({ error: gcpErr.message || 'GCP API request failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      mode: 'LOCAL_STORE_MUTATED',
      message: `Successfully executed local IAM mutation: ${action.toUpperCase()} ${value} for ${targetEmail}`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

