import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { isValidProjectId } from '@/lib/gcp-config';
import {
  getAllRequests,
  getUserRequests,
  createAccessRequest,
  updateRequestStatus,
  getRequestById,
  RequestCategory,
  RequestStatus,
  ALLOWED_ROLES,
  ALLOWED_SERVICES,
} from '@/lib/gcp-store';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyJWT(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (user.role === 'ADMIN') {
      return NextResponse.json({ requests: getAllRequests() });
    } else {
      return NextResponse.json({ requests: getUserRequests(user.email) });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyJWT(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { category, requestTarget, justification, projectId } = await request.json();

    const ALLOWED_CATEGORIES: RequestCategory[] = ['ROLE', 'SERVICE', 'PROJECT'];
    if (!category || !ALLOWED_CATEGORIES.includes(category as RequestCategory)) {
      return NextResponse.json({ error: 'Invalid or missing category' }, { status: 400 });
    }

    if (!requestTarget || typeof requestTarget !== 'string') {
      return NextResponse.json({ error: 'Invalid requestTarget' }, { status: 400 });
    }

    const cleanTarget = requestTarget.trim();

    if (category === 'ROLE' && !ALLOWED_ROLES.includes(cleanTarget)) {
      return NextResponse.json({ error: 'Invalid role requested' }, { status: 400 });
    }
    if (category === 'SERVICE' && !ALLOWED_SERVICES.includes(cleanTarget)) {
      return NextResponse.json({ error: 'Invalid service requested' }, { status: 400 });
    }
    if (category === 'PROJECT' && !isValidProjectId(cleanTarget)) {
      return NextResponse.json({ error: 'Invalid project ID format' }, { status: 400 });
    }

    if (!justification || typeof justification !== 'string') {
      return NextResponse.json({ error: 'Missing justification' }, { status: 400 });
    }

    const cleanProjectId = projectId ? String(projectId).trim() : undefined;

    if (category === 'ROLE') {
      if (!cleanProjectId || !isValidProjectId(cleanProjectId)) {
        return NextResponse.json({ error: 'Valid projectId is required for ROLE requests' }, { status: 400 });
      }
    } else if (cleanProjectId && !isValidProjectId(cleanProjectId)) {
      return NextResponse.json({ error: 'Invalid projectId format' }, { status: 400 });
    }

    const newRequest = createAccessRequest(
      user.email,
      user.name,
      category as RequestCategory,
      cleanTarget,
      justification.trim(),
      cleanProjectId
    );

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyJWT(token);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const { requestId, status } = await request.json();

    const ALLOWED_STATUSES: RequestStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!requestId || !status || !ALLOWED_STATUSES.includes(status as RequestStatus)) {
      return NextResponse.json({ error: 'Invalid or missing requestId/status' }, { status: 400 });
    }

    const existingReq = getRequestById(requestId);
    if (!existingReq) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Review Item 3: Reject ROLE approvals missing valid projectId before mutating state
    if (status === 'APPROVED' && existingReq.category === 'ROLE') {
      if (!existingReq.projectId || !isValidProjectId(existingReq.projectId)) {
        return NextResponse.json(
          { error: 'Cannot approve ROLE request: missing or invalid target projectId' },
          { status: 400 }
        );
      }
    }

    // Review Item 1: Execute live GCP setIamPolicy mutation and return error response if GCP grant fails
    if (status === 'APPROVED') {
      const gcpToken = process.env.GCP_ACCESS_TOKEN;

      if (gcpToken) {
        let targetProjects: string[] = [];
        let targetRole = 'roles/viewer';

        if (existingReq.category === 'SERVICE') {
          // SERVICE requests do not mutate GCP IAM roles
          targetProjects = [];
        } else if (existingReq.category === 'PROJECT') {
          targetProjects = [existingReq.requestTarget];
          targetRole = 'roles/viewer';
        } else if (existingReq.category === 'ROLE') {
          targetRole = existingReq.requestTarget;
          targetProjects = [existingReq.projectId!];
        }

        const formattedMember = existingReq.userEmail.includes('gserviceaccount.com')
          ? `serviceAccount:${existingReq.userEmail}`
          : `user:${existingReq.userEmail}`;

        for (const projId of targetProjects) {
          const safeProjId = encodeURIComponent(projId);
          try {
            const getRes = await fetch(`https://cloudresourcemanager.googleapis.com/v1/projects/${safeProjId}:getIamPolicy`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${gcpToken}`,
                'Content-Type': 'application/json',
              },
              cache: 'no-store',
            });

            const policyData = await getRes.json();

            if (!getRes.ok) {
              return NextResponse.json(
                { error: policyData.error?.message || `GCP getIamPolicy failed for project '${projId}'` },
                { status: getRes.status || 500 }
              );
            }

            let bindings = policyData.bindings || [];
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

            const setRes = await fetch(`https://cloudresourcemanager.googleapis.com/v1/projects/${safeProjId}:setIamPolicy`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${gcpToken}`,
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

            if (!setRes.ok) {
              return NextResponse.json(
                { error: setResult.error?.message || `GCP setIamPolicy failed for project '${projId}': ${setRes.statusText}` },
                { status: setRes.status || 500 }
              );
            }
          } catch (gcpErr: any) {
            console.error('Error executing live GCP setIamPolicy on approval:', gcpErr);
            return NextResponse.json(
              { error: gcpErr.message || `GCP IAM mutation failed for project '${projId}'` },
              { status: 500 }
            );
          }
        }
      }
    }

    const updated = updateRequestStatus(requestId, status);
    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update request status' }, { status: 500 });
  }
}
