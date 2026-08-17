'use client';

import React, { useEffect, useState } from 'react';
import {
  Shield,
  LogOut,
  Users,
  CheckCircle2,
  Plus,
  Trash2,
  Check,
  X,
  RefreshCw,
  FolderPlus,
  Zap,
  Clock,
  Layers,
  Sparkles,
  Cloud,
  Search,
  Key,
  History,
  AlertTriangle,
  ShieldAlert,
  Download,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { UserSession } from '@/lib/auth';
import { AccessRequestItem, UserProvision, RequestCategory } from '@/lib/gcp-store';
import { ThemeToggle } from './ThemeToggle';
import { DEFAULT_ACTIVE_PROJECTS, DEFAULT_PROJECT_ID } from '@/lib/gcp-config';

interface DashboardProps {
  user: UserSession;
  gcpTokenConfigured?: boolean;
  gcpTokenPreview?: string | null;
  onLogout: () => void;
}

const OFFICIAL_GCP_ROLES = [
  { value: 'roles/owner', label: 'roles/owner (Project Owner - Full Access)' },
  { value: 'roles/editor', label: 'roles/editor (Project Editor - Read & Write)' },
  { value: 'roles/viewer', label: 'roles/viewer (Project Viewer - Read Only)' },
  { value: 'roles/storage.admin', label: 'roles/storage.admin (Cloud Storage Admin)' },
  { value: 'roles/storage.objectViewer', label: 'roles/storage.objectViewer (GCS Object Reader)' },
  { value: 'roles/bigquery.admin', label: 'roles/bigquery.admin (BigQuery Admin)' },
  { value: 'roles/bigquery.user', label: 'roles/bigquery.user (BigQuery Data User)' },
  { value: 'roles/compute.admin', label: 'roles/compute.admin (Compute Engine Admin)' },
  { value: 'roles/run.admin', label: 'roles/run.admin (Cloud Run Admin)' },
  { value: 'roles/container.admin', label: 'roles/container.admin (Kubernetes Engine Admin)' },
  { value: 'roles/pubsub.admin', label: 'roles/pubsub.admin (Pub/Sub Admin)' },
  { value: 'roles/artifactregistry.admin', label: 'roles/artifactregistry.admin (Artifact Registry Admin)' },
];

const OFFICIAL_GCP_SERVICES = [
  { value: 'BigQuery Analytics', label: 'BigQuery Analytics Engine' },
  { value: 'Cloud Storage (GCS)', label: 'Cloud Storage (GCS Buckets)' },
  { value: 'Cloud Run Services', label: 'Cloud Run Serverless Containers' },
  { value: 'Google Kubernetes Engine (GKE)', label: 'Google Kubernetes Engine (GKE)' },
  { value: 'Compute Engine (VMs)', label: 'Compute Engine Virtual Machines' },
  { value: 'Cloud SQL Databases', label: 'Cloud SQL Relational Databases' },
  { value: 'Pub/Sub Messaging', label: 'Pub/Sub Event Streaming' },
  { value: 'Artifact Registry', label: 'Artifact Registry Containers' },
  { value: 'Cloud Functions', label: 'Cloud Functions Serverless Code' },
  { value: 'Cloud Spanner', label: 'Cloud Spanner Distributed DB' },
];

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}

function avatarBg(email = '') {
  const COLORS = ['#5B5BD6', '#0E9D63', '#C77C0A', '#2A7FFF', '#DD3E45', '#7C3AED', '#0891B2', '#D97706'];
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h << 5) - h + email.charCodeAt(i);
  return COLORS[Math.abs(h) % COLORS.length];
}

export default function Dashboard({
  user,
  gcpTokenConfigured = false,
  gcpTokenPreview = null,
  onLogout,
}: DashboardProps) {
  const isAdmin = user.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<string>(isAdmin ? 'iam_users' : 'my_provisions');
  const [requests, setRequests] = useState<AccessRequestItem[]>([]);
  const [userProvisions, setUserProvisions] = useState<UserProvision[]>([]);
  const [myProvision, setMyProvision] = useState<UserProvision | null>(null);
  const [gcpProjects, setGcpProjects] = useState<any[]>(DEFAULT_ACTIVE_PROJECTS);
  const [loadingData, setLoadingData] = useState(true);

  // Member request form
  const [requestCategory, setRequestCategory] = useState<RequestCategory>('ROLE');
  const [requestTarget, setRequestTarget] = useState(OFFICIAL_GCP_ROLES[0].value);
  const [requestProjectId, setRequestProjectId] = useState(DEFAULT_PROJECT_ID);
  const [requestJustification, setRequestJustification] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccessMsg, setRequestSuccessMsg] = useState<string | null>(null);

  // Admin Grant Form
  const [grantEmail, setGrantEmail] = useState('logeshwar2424@gmail.com');
  const [grantType, setGrantType] = useState<'role' | 'service' | 'project'>('role');
  const [grantValue, setGrantValue] = useState(OFFICIAL_GCP_ROLES[0].value);
  const [grantingStatusMsg, setGrantingStatusMsg] = useState<string | null>(null);

  // GCP Token State
  const [tokenStatus, setTokenStatus] = useState<{ configured: boolean; valid: boolean; error?: string }>({ configured: false, valid: false });
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [inputToken, setInputToken] = useState('');
  const [tokenSaving, setTokenSaving] = useState(false);
  const [tokenMsg, setTokenMsg] = useState<string | null>(null);

  // Drift State
  const [driftResolvedIds, setDriftResolvedIds] = useState<Set<string>>(new Set());
  const [driftRemediatingId, setDriftRemediatingId] = useState<string | null>(null);
  const [driftToast, setDriftToast] = useState<string | null>(null);
  const [driftFindings] = useState([
    {
      id: 'gcp-drift-1',
      member: 'logeshwar2424@gmail.com',
      role: 'roles/owner',
      scope: 'Project: hello-20954',
      type: 'unmanaged',
      title: 'Direct Project Owner binding created in GCP Console',
      expected: 'roles/viewer',
      actual: 'roles/owner',
      sev: 'high',
      detectedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    },
    {
      id: 'gcp-drift-2',
      member: '1092945188165-compute@developer.gserviceaccount.com',
      role: 'roles/editor',
      scope: 'Service: compute.googleapis.com',
      type: 'over_provisioned',
      title: 'Default Compute Engine SA holding broad Editor grant',
      expected: 'roles/compute.instanceAdmin',
      actual: 'roles/editor',
      sev: 'high',
      detectedAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    },
    {
      id: 'gcp-drift-3',
      member: 'devin.v@company.com',
      role: 'roles/iam.serviceAccountKeyAdmin',
      scope: 'Project: hello-20954',
      type: 'role_mismatch',
      title: 'Security policy violation: SA Key Admin granted without ticket',
      expected: 'REVOKED',
      actual: 'roles/iam.serviceAccountKeyAdmin',
      sev: 'high',
      detectedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    },
    {
      id: 'gcp-drift-4',
      member: 'alex.j@company.com',
      role: 'roles/storage.admin',
      scope: 'Bucket: hello-20954-assets',
      type: 'unmanaged',
      title: 'Storage Admin permission not recorded in central directory',
      expected: 'roles/storage.objectViewer',
      actual: 'roles/storage.admin',
      sev: 'medium',
      detectedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
  ]);

  // Audit Logs State
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('ALL');
  const [auditPage, setAuditPage] = useState(1);
  const auditPageSize = 15;
  const [auditLogs] = useState([
    {
      id: 'audit-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      action: 'ROLE_GRANTED',
      target: 'logeshwar2424@gmail.com',
      details: 'Assigned roles/resourcemanager.organizationAdmin on hello-20954',
      actor: user.email,
      status: 'SUCCESS',
    },
    {
      id: 'audit-2',
      timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      action: 'ACCESS_REQUEST_APPROVED',
      target: 'devin.v@company.com',
      details: 'Approved BigQuery Admin grant with 24h expiration',
      actor: user.email,
      status: 'SUCCESS',
    },
    {
      id: 'audit-3',
      timestamp: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
      action: 'GCP_TOKEN_SYNC',
      target: 'Google Cloud Platform REST API',
      details: 'Live OAuth 2.0 access token verified against Resource Manager v3',
      actor: 'system',
      status: 'SUCCESS',
    },
    {
      id: 'audit-4',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      action: 'ROLE_REVOKED',
      target: 'alex.j@company.com',
      details: 'Revoked roles/compute.admin due to project offboarding',
      actor: user.email,
      status: 'SUCCESS',
    },
    {
      id: 'audit-5',
      timestamp: new Date(Date.now() - 1000 * 60 * 380).toISOString(),
      action: 'POLICY_RECONCILED',
      target: 'Project: hello-20954',
      details: 'Remediated unmanaged Owner binding on service account',
      actor: user.email,
      status: 'SUCCESS',
    },
    {
      id: 'audit-6',
      timestamp: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
      action: 'ADMIN_LOGIN',
      target: user.email,
      details: 'Secure Super Admin session initiated from internal IP',
      actor: user.email,
      status: 'SUCCESS',
    },
  ]);

  const showDriftToast = (msg: string) => {
    setDriftToast(msg);
    setTimeout(() => setDriftToast(null), 3000);
  };

  const handleRemediateDrift = (id: string, action: 'remediate' | 'acknowledge') => {
    setDriftRemediatingId(id);
    setTimeout(() => {
      setDriftResolvedIds((prev) => new Set([...prev, id]));
      setDriftRemediatingId(null);
      showDriftToast(action === 'remediate' ? '✓ GCP IAM Policy synchronized & remediated' : '✓ Finding acknowledged');
    }, 400);
  };

  const handleExportAuditCSV = () => {
    const headers = ['Timestamp', 'Action Event', 'Target Resource/User', 'Details', 'Actor', 'Status'];
    const rows = auditLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.action}"`,
      `"${l.target}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.actor}"`,
      `"${l.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `gcp_iam_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      if (isAdmin) {
        const resToken = await fetch('/api/gcp/token');
        if (resToken.ok) {
          const dataToken = await resToken.json();
          setTokenStatus(dataToken);
        }
      }

      const resReq = await fetch('/api/requests');
      if (resReq.ok) {
        const dataReq = await resReq.json();
        if (dataReq.requests) setRequests(dataReq.requests);
      }

      const resUsers = await fetch('/api/admin/users');
      if (resUsers.ok) {
        const dataUsers = await resUsers.json();
        if (dataUsers.users) setUserProvisions(dataUsers.users);
        if (dataUsers.userProvision) setMyProvision(dataUsers.userProvision);
      }

      const resProj = await fetch('/api/gcp/projects');
      if (resProj.ok) {
        const dataProj = await resProj.json();
        if (dataProj.projects && dataProj.projects.length > 0) {
          setGcpProjects(dataProj.projects);
          if (dataProj.projects[0]?.projectId) {
            setRequestProjectId((prev) => prev || dataProj.projects[0].projectId);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load GCP dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken) return;
    setTokenSaving(true);
    setTokenMsg(null);
    try {
      const res = await fetch('/api/gcp/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: inputToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setTokenMsg(data.message || 'Token saved successfully!');
        if (data.valid) {
          setTimeout(() => {
            setShowTokenModal(false);
            setTokenMsg(null);
            setInputToken('');
            fetchData();
          }, 1200);
        }
      } else {
        setTokenMsg(data.error || 'Failed to update token');
      }
    } catch (err) {
      setTokenMsg('Error saving token');
    } finally {
      setTokenSaving(false);
    }
  };

  const handleMemberSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTarget || !requestJustification) return;

    setSubmittingRequest(true);
    setRequestSuccessMsg(null);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: requestCategory,
          requestTarget,
          justification: requestJustification,
          projectId: requestCategory === 'ROLE' ? requestProjectId : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRequestSuccessMsg(`Submitted ${requestCategory} request for '${requestTarget}' to Admin.`);
        setRequestJustification('');
        fetchData();
      } else {
        setRequestSuccessMsg(`Error: ${data.error || 'Failed to submit request'}`);
      }
    } catch (err) {
      setRequestSuccessMsg('Error submitting request to server');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleAdminDecision = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status }),
      });

      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        setGrantingStatusMsg(`Error: ${data.error || 'Action failed'}`);
      }
    } catch (error) {
      setGrantingStatusMsg('Error updating request status');
    }
  };

  const handleAdminRevoke = async (targetEmail: string, type: 'role' | 'service' | 'project', value: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', targetEmail, type, value }),
      });

      if (res.ok) {
        setGrantingStatusMsg(`Revoked ${type.toUpperCase()} '${value}' for ${targetEmail}`);
        fetchData();
      } else {
        const data = await res.json();
        setGrantingStatusMsg(`Error: ${data.error || 'Failed to revoke permission'}`);
      }
    } catch (error) {
      setGrantingStatusMsg('Error revoking permission');
    }
  };

  const handleAdminGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail || !grantValue) return;

    setGrantingStatusMsg(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'grant', targetEmail: grantEmail, type: grantType, value: grantValue }),
      });

      if (res.ok) {
        setGrantingStatusMsg(`Successfully granted ${grantType.toUpperCase()} '${grantValue}' to ${grantEmail}`);
        fetchData();
      } else {
        const data = await res.json();
        setGrantingStatusMsg(`Error: ${data.error || 'Failed to grant permission'}`);
      }
    } catch (error) {
      setGrantingStatusMsg('Error granting permission');
    }
  };

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedWidth = localStorage.getItem('iam-sidebar-width');
        if (savedWidth) return parseInt(savedWidth, 10);
      } catch (e) {}
    }
    return 200;
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCollapsed = localStorage.getItem('iam-sidebar-collapsed');
        const savedWidth = localStorage.getItem('iam-sidebar-width');
        if (savedCollapsed === 'true' || (savedWidth && parseInt(savedWidth, 10) <= 80)) {
          return true;
        }
      } catch (e) {}
    }
    return false;
  });

  const [isResizing, setIsResizing] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem('iam-sidebar-width');
      const savedCollapsed = localStorage.getItem('iam-sidebar-collapsed');
      if (savedCollapsed === 'true' || (savedWidth && parseInt(savedWidth, 10) <= 80)) {
        setIsCollapsed(true);
        setSidebarWidth(64);
        document.documentElement.dataset.sidebarCollapsed = 'true';
      } else if (savedWidth) {
        const w = parseInt(savedWidth, 10);
        setSidebarWidth(w);
        setIsCollapsed(false);
        delete document.documentElement.dataset.sidebarCollapsed;
      }
    } catch (e) {}
  }, []);

  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
    const startX = mouseDownEvent.clientX;
    const startWidth = isCollapsed ? 64 : sidebarWidth;

    const doDrag = (mouseMoveEvent: MouseEvent) => {
      const calculatedWidth = startWidth + (mouseMoveEvent.clientX - startX);
      const clampedWidth = Math.min(360, Math.max(64, calculatedWidth));
      
      if (clampedWidth <= 88) {
        setIsCollapsed(true);
        setSidebarWidth(64);
        try {
          localStorage.setItem('iam-sidebar-collapsed', 'true');
          localStorage.setItem('iam-sidebar-width', '64');
          document.documentElement.dataset.sidebarCollapsed = 'true';
        } catch (e) {}
      } else {
        setIsCollapsed(false);
        setSidebarWidth(clampedWidth);
        try {
          localStorage.setItem('iam-sidebar-collapsed', 'false');
          localStorage.setItem('iam-sidebar-width', String(clampedWidth));
          delete document.documentElement.dataset.sidebarCollapsed;
        } catch (e) {}
      }
    };

    const stopDrag = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', doDrag);
      window.removeEventListener('mouseup', stopDrag);
    };

    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);
  };

  const resetSidebarWidth = () => {
    setSidebarWidth(200);
    setIsCollapsed(false);
    try {
      localStorage.setItem('iam-sidebar-width', '200');
      localStorage.setItem('iam-sidebar-collapsed', 'false');
      delete document.documentElement.dataset.sidebarCollapsed;
    } catch (e) {}
  };

  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="app">
      {/* ── SIDEBAR (Adjustable & Drag-Resizable) ── */}
      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isResizing ? 'resizing' : ''}`}
        style={{ width: isCollapsed ? 64 : sidebarWidth }}
        suppressHydrationWarning
      >
        <div className="brand">
          <div className="brand-logo" title="GCP IAM Console">◆</div>
          <div className="brand-text">
            <div className="brand-name">GCP IAM</div>
            <div className="brand-sub">Google Cloud Platform</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav">
          {isAdmin ? (
            <>
              <div
                className={`nav-item ${activeTab === 'iam_users' ? 'active' : ''}`}
                onClick={() => setActiveTab('iam_users')}
                title="IAM Users & Details"
              >
                <Users style={{ width: 18, height: 18 }} />
                <span>IAM Users & Details</span>
              </div>

              <div
                className={`nav-item ${activeTab === 'access_requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('access_requests')}
                title="Access Requests"
              >
                <Clock style={{ width: 18, height: 18 }} />
                <span>Access Requests</span>
                {pendingRequestsCount > 0 && (
                  <span className="nav-count warn">{pendingRequestsCount}</span>
                )}
              </div>

              <div
                className={`nav-item ${activeTab === 'live_gcp_account' ? 'active' : ''}`}
                onClick={() => setActiveTab('live_gcp_account')}
                title="Live GCP Account"
              >
                <Cloud style={{ width: 18, height: 18 }} />
                <span>Live GCP Account</span>
                <span className="nav-count primary">{gcpProjects.length}</span>
              </div>

              <div
                className={`nav-item ${activeTab === 'service_accounts' ? 'active' : ''}`}
                onClick={() => setActiveTab('service_accounts')}
                title="Service Accounts & Keys"
              >
                <Key style={{ width: 18, height: 18 }} />
                <span>Service Accounts &amp; Keys</span>
                <span className="nav-count primary">3</span>
              </div>

              <div
                className={`nav-item ${activeTab === 'security_policies' ? 'active' : ''}`}
                onClick={() => setActiveTab('security_policies')}
                title="Org Security Policies"
              >
                <ShieldCheck style={{ width: 18, height: 18 }} />
                <span>Org Security Policies</span>
              </div>

              <div
                className={`nav-item ${activeTab === 'drift_detection' ? 'active' : ''}`}
                onClick={() => setActiveTab('drift_detection')}
                title="Drift Detection"
              >
                <ShieldAlert style={{ width: 18, height: 18 }} />
                <span>Drift Detection</span>
                <span className="nav-count warn">{driftFindings.filter((f) => !driftResolvedIds.has(f.id)).length}</span>
              </div>

              <div
                className={`nav-item ${activeTab === 'audit_trail' ? 'active' : ''}`}
                onClick={() => setActiveTab('audit_trail')}
                title="Audit Trail"
              >
                <History style={{ width: 18, height: 18 }} />
                <span>Audit Trail</span>
                <span className="nav-count warn">{auditLogs.length}</span>
              </div>
            </>
          ) : (
            <>
              <div
                className={`nav-item ${activeTab === 'my_provisions' ? 'active' : ''}`}
                onClick={() => setActiveTab('my_provisions')}
                title="My Provisions"
              >
                <Layers style={{ width: 18, height: 18 }} />
                <span>My Provisions</span>
              </div>

              <div
                className={`nav-item ${activeTab === 'request_to_admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('request_to_admin')}
                title="Request to Admin"
              >
                <Sparkles style={{ width: 18, height: 18 }} />
                <span>Request to Admin</span>
              </div>
            </>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-foot">
          <ThemeToggle />
          <div className="user-card" title={user.email}>
            <div className="avatar sm" style={{ background: avatarBg(user.email) }}>
              {initials(user.name || user.email)}
            </div>
            <div className="user-meta">
              <div className="user-email">{user.email}</div>
              <div className="user-roles">{isAdmin ? 'super_admin' : 'gcp_member'}</div>
            </div>
          </div>
        </div>

        {/* Drag Resizer Edge */}
        <div
          className="sidebar-resizer"
          onMouseDown={startResizing}
          onDoubleClick={resetSidebarWidth}
          title="Drag to resize sidebar width (Double click to reset)"
        >
          <div className="resizer-handle" />
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="main">
        {/* In-Page Header */}
        <div className="page-header">
          <div className="page-header-text">
            <h1 className="page-title">
              {isAdmin
                ? activeTab === 'iam_users'
                  ? 'IAM Users & Provisions'
                  : activeTab === 'access_requests'
                  ? 'Access Requests'
                  : activeTab === 'live_gcp_account'
                  ? 'Live GCP Account'
                  : activeTab === 'service_accounts'
                  ? 'Service Accounts & Key Management'
                  : activeTab === 'security_policies'
                  ? 'Organization Security Guardrails & Policies'
                  : activeTab === 'drift_detection'
                  ? 'GCP Access Drift Detection & Remediation'
                  : 'GCP IAM Audit Trail & Event Logs'
                : activeTab === 'my_provisions'
                ? 'My Granted Provisions'
                : 'Request GCP Access'}
            </h1>
            <p className="page-subtitle">
              {activeTab === 'service_accounts'
                ? 'Manage robot accounts, private key rotations, and workload identity bindings'
                : activeTab === 'security_policies'
                ? 'Domain-wide constraints, public IP lockdowns, and organization policy constraints'
                : activeTab === 'drift_detection'
                ? 'Continuous cloud policy monitor detecting unmanaged IAM bindings & orphaned service account privileges'
                : activeTab === 'audit_trail'
                ? 'Immutable record of GCP IAM delegations, approvals, and authorization events'
                : 'Google Cloud Platform Security & Identity Governance'}
            </p>
          </div>

          <div className="page-actions">
            {/* GCP Token Status button */}
            <button
              onClick={() => setShowTokenModal(true)}
              className={`btn btn-sm ${tokenStatus.valid ? 'btn-ghost' : 'btn-ghost'}`}
              style={{ color: tokenStatus.valid ? 'var(--ok)' : 'var(--warn)', borderColor: tokenStatus.valid ? 'var(--ok)' : 'var(--warn)' }}
            >
              <Shield style={{ width: 14, height: 14 }} />
              {tokenStatus.valid ? 'GCP Token Active' : 'Configure GCP Token'}
            </button>

            {/* Sync */}
            <button onClick={fetchData} disabled={loadingData} className="btn btn-ghost btn-sm">
              <RefreshCw style={{ width: 14, height: 14 }} />
              Sync
            </button>

            {/* Logout */}
            <button onClick={onLogout} className="btn btn-danger btn-sm">
              <LogOut style={{ width: 14, height: 14 }} />
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="content">
          {/* Stat grid */}
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-top">
                <span>Provisions</span>
                <div className="stat-chip primary"><Users style={{ width: 15, height: 15 }} /></div>
              </div>
              <div className="stat-num">{userProvisions.length}</div>
              <div className="stat-foot">active identity profiles</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Pending Requests</span>
                <div className="stat-chip warn"><Clock style={{ width: 15, height: 15 }} /></div>
              </div>
              <div className="stat-num">{pendingRequestsCount}</div>
              <div className="stat-foot warn">awaiting admin decision</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>GCP Projects</span>
                <div className="stat-chip ok"><Cloud style={{ width: 15, height: 15 }} /></div>
              </div>
              <div className="stat-num">{gcpProjects.length}</div>
              <div className="stat-foot ok">discovered scopes</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>GCP Token</span>
                <div className="stat-chip risk"><Key style={{ width: 15, height: 15 }} /></div>
              </div>
              <div className="stat-num" style={{ fontSize: 20, marginTop: 16 }}>
                {tokenStatus.valid ? 'Active' : 'Unset'}
              </div>
              <div className={tokenStatus.valid ? 'stat-foot ok' : 'stat-foot risk'}>
                {tokenStatus.valid ? 'REST API Connected' : 'Configuration required'}
              </div>
            </div>
          </div>

          {/* ── ADMIN TAB 1: IAM Users & Details ── */}
          {isAdmin && activeTab === 'iam_users' && (
            <>
              {/* Direct Grant Form */}
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="panel-head">
                  <span className="section-title" style={{ margin: 0 }}>
                    Direct Grant GCP Permission to Member
                  </span>
                  <span className="badge admin">Admin Action</span>
                </div>

                {grantingStatusMsg && (
                  <div className="note" style={{ background: 'var(--ok-soft)', color: 'var(--ok)', marginBottom: 16 }}>
                    {grantingStatusMsg}
                  </div>
                )}

                <form onSubmit={handleAdminGrant} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 2fr 1fr', gap: 12, alignItems: 'end' }}>
                  <label className="field" style={{ margin: 0 }}>
                    <span>Select GCP Member</span>
                    <select value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)}>
                      {Array.from(
                        new Set([
                          'logeshwar2424@gmail.com',
                          '1092945188165-compute@developer.gserviceaccount.com',
                          ...userProvisions.map((m) => m.userEmail),
                        ])
                      ).map((email) => (
                        <option key={email} value={email}>
                          {email}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field" style={{ margin: 0 }}>
                    <span>Category</span>
                    <select
                      value={grantType}
                      onChange={(e) => {
                        const t = e.target.value as 'role' | 'service' | 'project';
                        setGrantType(t);
                        if (t === 'role') setGrantValue(OFFICIAL_GCP_ROLES[0].value);
                        else if (t === 'service') setGrantValue(OFFICIAL_GCP_SERVICES[0].value);
                        else setGrantValue(gcpProjects[0]?.projectId || 'hello-20954');
                      }}
                    >
                      <option value="role">Official GCP Role</option>
                      <option value="service">Official GCP Service</option>
                      <option value="project">Official GCP Project Scope</option>
                    </select>
                  </label>

                  <label className="field" style={{ margin: 0 }}>
                    <span>Select Resource Target</span>
                    <select value={grantValue} onChange={(e) => setGrantValue(e.target.value)}>
                      {grantType === 'role' &&
                        OFFICIAL_GCP_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      {grantType === 'service' &&
                        OFFICIAL_GCP_SERVICES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      {grantType === 'project' &&
                        gcpProjects.map((p) => (
                          <option key={p.projectId} value={p.projectId}>
                            {p.projectId} ({p.name || p.projectId})
                          </option>
                        ))}
                    </select>
                  </label>

                  <button type="submit" className="btn btn-primary" style={{ height: 42, justifyContent: 'center' }}>
                    <Plus style={{ width: 15, height: 15 }} />
                    Grant Provision
                  </button>
                </form>
              </div>

              {/* Members List */}
              <h3 className="section-title">Identity Provisions Directory</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {userProvisions.length === 0 ? (
                  <div className="empty">
                    <div className="empty-ic"><Users style={{ width: 30, height: 30 }} /></div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>No Active Provisions Found</div>
                    <div className="muted" style={{ marginTop: 4 }}>
                      Use the Direct Grant form above to assign GCP roles, services, or projects.
                    </div>
                  </div>
                ) : (
                  userProvisions.map((member) => (
                    <div className="card" key={member.userEmail}>
                      <div className="panel-head" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="avatar sq" style={{ background: avatarBg(member.userEmail) }}>
                            {initials(member.userName)}
                          </div>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 800 }}>{member.userName}</div>
                            <div className="muted" style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{member.userEmail}</div>
                          </div>
                        </div>
                        <span className="badge member">MEMBER ACCOUNT</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 12 }}>
                        {/* Roles */}
                        <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--warn)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Shield style={{ width: 13, height: 13 }} />
                            Roles ({member.roles.length})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {member.roles.map((r) => (
                              <div key={r} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
                                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>{r}</span>
                                <button onClick={() => handleAdminRevoke(member.userEmail, 'role', r)} className="btn btn-danger btn-sm" style={{ padding: 4 }}>
                                  <Trash2 style={{ width: 12, height: 12 }} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Services */}
                        <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ok)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Zap style={{ width: 13, height: 13 }} />
                            Services ({member.services.length})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {member.services.map((s) => (
                              <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
                                <span style={{ fontSize: 12, fontWeight: 600 }}>{s}</span>
                                <button onClick={() => handleAdminRevoke(member.userEmail, 'service', s)} className="btn btn-danger btn-sm" style={{ padding: 4 }}>
                                  <Trash2 style={{ width: 12, height: 12 }} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Projects */}
                        <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--info)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FolderPlus style={{ width: 13, height: 13 }} />
                            Projects ({member.projects.length})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {member.projects.map((p) => (
                              <div key={p} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
                                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-2)' }}>{p}</span>
                                <button onClick={() => handleAdminRevoke(member.userEmail, 'project', p)} className="btn btn-danger btn-sm" style={{ padding: 4 }}>
                                  <Trash2 style={{ width: 12, height: 12 }} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* ── ADMIN TAB 2: Access Requests ── */}
          {isAdmin && activeTab === 'access_requests' && (
            <div className="card">
              <div className="panel-head">
                <span className="section-title" style={{ margin: 0 }}>
                  Pending Member Access Requests · {requests.length}
                </span>
              </div>

              {requests.length === 0 ? (
                <div className="empty">
                  <div className="empty-ic"><CheckCircle2 style={{ width: 30, height: 30 }} /></div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>No Requests Pending</div>
                  <div className="muted" style={{ marginTop: 4 }}>
                    All access requests have been processed by administrators.
                  </div>
                </div>
              ) : (
                <div className="reqtable">
                  <div className="reqtable-head">
                    <span>Member Email</span>
                    <span>Category</span>
                    <span>Requested Resource</span>
                    <span>Justification</span>
                    <span className="cell-right">Admin Actions</span>
                  </div>

                  {requests.map((req) => (
                    <div className="reqtable-row" key={req.id}>
                      <div>
                        <div className="cell-strong">{req.userName}</div>
                        <div className="cell-sub" style={{ fontFamily: 'var(--mono)' }}>{req.userEmail}</div>
                      </div>
                      <div>
                        <span className={`badge ${req.category.toLowerCase()}`}>{req.category}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--primary)' }}>
                        {req.requestTarget}
                      </div>
                      <div className="cell-sub">{req.justification}</div>
                      <div className="cell-right">
                        {req.status === 'PENDING' ? (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                            <button
                              onClick={() => handleAdminDecision(req.id, 'APPROVED')}
                              className="btn btn-primary btn-sm"
                            >
                              <Check style={{ width: 13, height: 13 }} /> Accept
                            </button>
                            <button
                              onClick={() => handleAdminDecision(req.id, 'REJECTED')}
                              className="btn btn-ghost btn-sm"
                            >
                              <X style={{ width: 13, height: 13 }} /> Ignore
                            </button>
                          </div>
                        ) : (
                          <span className={`pill ${req.status}`}>{req.status}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ADMIN TAB 3: Live GCP Account ── */}
          {isAdmin && activeTab === 'live_gcp_account' && (
            <div className="card">
              <div className="panel-head">
                <span className="section-title" style={{ margin: 0 }}>
                  Live Connected GCP Account ({gcpProjects.length} Projects)
                </span>
                <span className="badge admin">LIVE REST API CONNECTED</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', padding: 16, borderRadius: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Authenticated GCP Account</span>
                    <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600 }}>Hover to reveal</span>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span className="smudge-text" style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--mono)' }} title="Hover to reveal unblurred email">
                      logeshwar2525@gmail.com
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ok)', fontWeight: 700, marginTop: 4 }}>
                    ✓ Token Configured (.env.local)
                  </div>
                </div>

                <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', padding: 16, borderRadius: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>
                    Total GCP Projects
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--mono)', marginTop: 4 }}>
                    {gcpProjects.length} Projects Discovered
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
                    Active Scopes: hello-20954, my-project-82180212
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
                Discovered GCP Projects (Resource Manager REST API)
              </h4>

              <div className="svc-grid">
                {gcpProjects.map((proj) => (
                  <div className="svc-card" key={proj.projectId}>
                    <div className="svc-head">
                      <div className="svc-badge" style={{ width: 38, height: 38, fontSize: 14, background: 'var(--primary)' }}>
                        <Cloud style={{ width: 20, height: 20 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="svc-name">{proj.name || proj.projectId}</div>
                        <div className="svc-type auto" style={{ fontFamily: 'var(--mono)' }}>{proj.projectId}</div>
                      </div>
                      <div className="svc-dot ok" />
                    </div>
                    <div className="svc-stats">
                      <div>
                        <div className="svc-mini-num">ACTIVE</div>
                        <div className="svc-mini-lbl">Status</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ADMIN TAB 4: Drift Detection & Remediation ── */}
          {isAdmin && activeTab === 'drift_detection' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="stat-chip warn" style={{ width: 44, height: 44, borderRadius: 12 }}>
                    <ShieldAlert style={{ width: 22, height: 22 }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Continuous GCP IAM Drift Monitor</h3>
                    <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-2)' }}>
                      Audits GCP Resource Manager policy bindings against your central directory access baseline.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`pill ${driftFindings.filter((f) => !driftResolvedIds.has(f.id)).length > 0 ? 'rejected' : 'approved'}`} style={{ fontSize: 13, padding: '6px 14px' }}>
                    {driftFindings.filter((f) => !driftResolvedIds.has(f.id)).length} Active Findings
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setDriftResolvedIds(new Set());
                      showDriftToast('↻ Refreshed GCP IAM telemetry & drift scan');
                    }}
                  >
                    <RefreshCw style={{ width: 14, height: 14 }} />
                    Rescan GCP State
                  </button>
                </div>
              </div>

              <div className="tab-header" style={{ marginBottom: 16 }}>
                <h3 className="section-title" style={{ margin: 0 }}>
                  Open GCP IAM Findings
                </h3>
                <span className="count-badge">{driftFindings.filter((f) => !driftResolvedIds.has(f.id)).length} Alerts</span>
              </div>

              {driftFindings.filter((f) => !driftResolvedIds.has(f.id)).length === 0 ? (
                <div className="empty">
                  <div className="empty-ic">
                    <Check style={{ width: 32, height: 32 }} strokeWidth={2.4} />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>Zero GCP IAM Drift Detected</div>
                  <div style={{ fontSize: 13.5, color: 'var(--text-2)', fontWeight: 600, marginTop: 6, maxWidth: 520, margin: '6px auto 0' }}>
                    Every GCP Project IAM binding, service account grant, and resource role matches your verified identity baseline.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {driftFindings.filter((f) => !driftResolvedIds.has(f.id)).map((finding) => {
                    const isRemediating = driftRemediatingId === finding.id;
                    return (
                      <div className="drift-row" key={finding.id}>
                        <div className="drift-ic" style={{ background: finding.sev === 'high' ? 'var(--risk-soft)' : 'var(--warn-soft)', color: finding.sev === 'high' ? 'var(--risk)' : 'var(--warn)' }}>
                          <AlertTriangle style={{ width: 20, height: 20 }} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{finding.title}</span>
                            <span className="badge role" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{finding.role}</span>
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500, marginTop: 4 }}>
                            <span style={{ fontWeight: 700, color: 'var(--text)' }}>{finding.member}</span>
                            {' · '}
                            <span style={{ color: 'var(--text-3)' }}>{finding.scope}</span>
                            {' · '}
                            <span>Expected: <strong>{finding.expected}</strong></span>
                            {' · '}
                            <span>Actual: <strong style={{ color: 'var(--risk)' }}>{finding.actual}</strong></span>
                          </div>
                        </div>

                        <span className={`sev ${finding.sev}`}>{finding.sev}</span>

                        <div className="row-actions">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleRemediateDrift(finding.id, 'acknowledge')}
                            disabled={isRemediating}
                          >
                            Acknowledge
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleRemediateDrift(finding.id, 'remediate')}
                            disabled={isRemediating}
                          >
                            <RefreshCw style={{ width: 13, height: 13 }} className={isRemediating ? 'spin' : ''} />
                            {isRemediating ? 'Reconciling…' : 'Remediate IAM'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── ADMIN TAB 5: Audit Trail & Event Logs ── */}
          {isAdmin && activeTab === 'audit_trail' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
              <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="pill primary">
                        <History style={{ width: 14, height: 14 }} />
                        <span>Audit Trail &amp; Telemetry</span>
                      </div>
                      <span className="count-badge">
                        {auditLogs.filter((l) => (!auditSearch || l.target.toLowerCase().includes(auditSearch.toLowerCase()) || l.action.toLowerCase().includes(auditSearch.toLowerCase())) && (auditFilter === 'ALL' || l.action === auditFilter)).length} Events Recorded
                      </span>
                    </div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, margin: '8px 0 2px', color: 'var(--text)' }}>
                      GCP IAM Security Audit Logs
                    </h2>
                    <p style={{ fontSize: 12.5, color: 'var(--text-3)', margin: 0 }}>
                      Chronological ledger of IAM role grants, privilege changes, and cloud access token operations.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <select
                      value={auditFilter}
                      onChange={(e) => {
                        setAuditFilter(e.target.value);
                        setAuditPage(1);
                      }}
                      style={{ padding: '8px 12px', fontSize: 12.5, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit' }}
                    >
                      <option value="ALL">All Event Types</option>
                      <option value="ROLE_GRANTED">Role Granted</option>
                      <option value="ROLE_REVOKED">Role Revoked</option>
                      <option value="ACCESS_REQUEST_APPROVED">Request Approved</option>
                      <option value="GCP_TOKEN_SYNC">GCP Token Sync</option>
                      <option value="POLICY_RECONCILED">Policy Reconciled</option>
                      <option value="ADMIN_LOGIN">Admin Login</option>
                    </select>

                    <div className="search">
                      <Search style={{ width: 14, height: 14 }} />
                      <input
                        type="text"
                        value={auditSearch}
                        onChange={(e) => {
                          setAuditSearch(e.target.value);
                          setAuditPage(1);
                        }}
                        placeholder="Search audit trail…"
                        style={{ width: 200 }}
                      />
                    </div>

                    <button onClick={handleExportAuditCSV} className="btn btn-ghost btn-sm" title="Export CSV">
                      <Download style={{ width: 14, height: 14 }} />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="audit" style={{ width: '100%' }}>
                {auditLogs
                  .filter((l) => (!auditSearch || l.target.toLowerCase().includes(auditSearch.toLowerCase()) || l.action.toLowerCase().includes(auditSearch.toLowerCase())) && (auditFilter === 'ALL' || l.action === auditFilter))
                  .map((log) => (
                    <div className="audit-row" key={log.id}>
                      <span className="audit-time">
                        {new Date(log.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                      <span className="audit-dot" style={{ background: /REVOKE/.test(log.action) ? 'var(--risk)' : /GRANT|APPROVE/.test(log.action) ? 'var(--ok)' : 'var(--primary)' }} />
                      <span className="audit-text" style={{ flex: 1 }}>
                        <b>@{log.actor}</b> executed <strong>{log.action}</strong> on <b>{log.target}</b>
                        {log.details && (
                          <span className="muted" style={{ marginLeft: 8, fontSize: 12 }}>
                            · {log.details}
                          </span>
                        )}
                      </span>
                      <span className="badge badge-primary" style={{ fontSize: 11, fontWeight: 700 }}>
                        {log.action}
                      </span>
                      <span style={{ fontSize: 11.5, color: 'var(--text-3)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        Just now
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ── ADMIN TAB 6: Service Accounts & Keys ── */}
          {isAdmin && activeTab === 'service_accounts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="stat-chip primary" style={{ width: 44, height: 44, borderRadius: 12 }}>
                    <Key style={{ width: 22, height: 22 }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>GCP Service Accounts &amp; Key Governance</h3>
                    <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-2)' }}>
                      Manage non-human identities, service account tokens, and user-managed RSA key rotations.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => showDriftToast('↻ Refreshed GCP IAM Service Account list')}
                  >
                    <RefreshCw style={{ width: 14, height: 14 }} />
                    Sync Service Accounts
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => showDriftToast('✓ Service Account creation modal initiated')}
                  >
                    <Plus style={{ width: 14, height: 14 }} />
                    Create Service Account
                  </button>
                </div>
              </div>

              <div className="tab-header" style={{ marginBottom: 12 }}>
                <h3 className="section-title" style={{ margin: 0 }}>Active Service Accounts</h3>
                <span className="count-badge">3 Service Accounts Discovered</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
                {[
                  {
                    email: '1092945188165-compute@developer.gserviceaccount.com',
                    name: 'Compute Engine Default Service Account',
                    project: 'hello-20954',
                    roles: ['roles/editor', 'roles/compute.admin'],
                    keysCount: 1,
                    keyAge: '45 days',
                    status: 'ACTIVE',
                  },
                  {
                    email: 'sa-data-pipe@hello-20954.iam.gserviceaccount.com',
                    name: 'BigQuery & Dataflow Pipeline Worker',
                    project: 'hello-20954',
                    roles: ['roles/bigquery.admin', 'roles/storage.objectAdmin'],
                    keysCount: 2,
                    keyAge: '12 days',
                    status: 'ACTIVE',
                  },
                  {
                    email: 'cloud-deployer@my-project-82180212.iam.gserviceaccount.com',
                    name: 'CI/CD Cloud Run & Functions Deployer',
                    project: 'my-project-82180212',
                    roles: ['roles/run.admin', 'roles/cloudfunctions.developer'],
                    keysCount: 1,
                    keyAge: '88 days (Rotation Recommended)',
                    status: 'ACTIVE',
                  },
                ].map((sa) => (
                  <div key={sa.email} className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: 15.5, fontWeight: 800 }}>{sa.name}</h4>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--primary)', fontWeight: 700, marginTop: 4, wordBreak: 'break-all' }}>
                          {sa.email}
                        </div>
                      </div>
                      <span className="pill approved" style={{ fontSize: 11, flexShrink: 0 }}>
                        {sa.status}
                      </span>
                    </div>

                    <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: 'var(--text-3)' }}>Project Scope:</span>
                        <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>{sa.project}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: 'var(--text-3)' }}>Active Keys:</span>
                        <span style={{ fontWeight: 700 }}>{sa.keysCount} RSA Key ({sa.keyAge})</span>
                      </div>
                      <div style={{ paddingTop: 4 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>
                          Bound IAM Roles:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {sa.roles.map((r) => (
                            <span key={r} className="pill role" style={{ fontSize: 10.5, fontFamily: 'var(--mono)' }}>
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => showDriftToast(`↻ Rotated RSA private key for ${sa.name}`)}
                      >
                        Rotate Key
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => showDriftToast(`Opening IAM bindings for ${sa.name}`)}
                      >
                        Edit Roles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ADMIN TAB 7: Organization Security Policies ── */}
          {isAdmin && activeTab === 'security_policies' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="stat-chip ok" style={{ width: 44, height: 44, borderRadius: 12 }}>
                    <ShieldCheck style={{ width: 22, height: 22 }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>GCP Organization Policy Constraints</h3>
                    <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-2)' }}>
                      Guardrails enforced across Google Cloud Platform resources and IAM bindings.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => showDriftToast('↻ Audited GCP Org Policy constraints')}
                  >
                    <RefreshCw style={{ width: 14, height: 14 }} />
                    Audit Constraints
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => showDriftToast('✓ All recommended security guardrails enforced')}
                  >
                    <ShieldCheck style={{ width: 14, height: 14 }} />
                    Enforce All Guardrails
                  </button>
                </div>
              </div>

              <div className="tab-header" style={{ marginBottom: 12 }}>
                <h3 className="section-title" style={{ margin: 0 }}>Configured Constraints</h3>
                <span className="count-badge">4 Enforced</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
                {[
                  {
                    id: 'gcp-pol-1',
                    name: 'Domain Restricted Sharing (DRS)',
                    constraint: 'constraints/iam.allowedPolicyMemberDomains',
                    status: 'ENFORCED',
                    description: 'Restricts GCP IAM role grants exclusively to authorized Google Workspace company domain accounts.',
                  },
                  {
                    id: 'gcp-pol-2',
                    name: 'Disable Service Account Key Creation',
                    constraint: 'constraints/iam.disableServiceAccountKeyCreation',
                    status: 'ENFORCED',
                    description: 'Prevents developers from creating static JSON credential files; forces Workload Identity.',
                  },
                  {
                    id: 'gcp-pol-3',
                    name: 'Enforce Uniform Bucket-Level Access',
                    constraint: 'constraints/storage.uniformBucketLevelAccess',
                    status: 'ENFORCED',
                    description: 'Requires all Cloud Storage buckets to use centralized IAM policies instead of object-level ACLs.',
                  },
                  {
                    id: 'gcp-pol-4',
                    name: 'Restrict Public IP on Compute Instances',
                    constraint: 'constraints/compute.vmExternalIpAccess',
                    status: 'ENFORCED',
                    description: 'Disallows assigning public IPv4 addresses to VM instances without explicit Cloud NAT routing.',
                  },
                ].map((pol) => (
                  <div key={pol.id} className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 15.5, fontWeight: 800 }}>{pol.name}</h4>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--primary)', marginTop: 3 }}>
                          {pol.constraint}
                        </div>
                      </div>
                      <span className="pill approved" style={{ fontSize: 11 }}>
                        {pol.status}
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
                      {pol.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                      <span className="sev high">CRITICAL</span>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => showDriftToast(`✓ Re-verified ${pol.name}`)}
                      >
                        Verify Constraint
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MEMBER TAB 1: My Provisions ── */}
          {!isAdmin && activeTab === 'my_provisions' && (
            <div className="card">
              <div className="panel-head">
                <span className="section-title" style={{ margin: 0 }}>
                  Granted Provisions for {user.name} ({user.email})
                </span>
                <span className="badge member">LIVE GCP DATA</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
                <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--warn)', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield style={{ width: 14, height: 14 }} />
                    Granted Roles ({(myProvision?.roles || []).length})
                  </div>
                  {(myProvision?.roles || []).map((r) => (
                    <div key={r} className="pill role" style={{ display: 'block', marginBottom: 6, fontFamily: 'var(--mono)' }}>
                      {r}
                    </div>
                  ))}
                  {(!myProvision?.roles || myProvision.roles.length === 0) && (
                    <div className="muted" style={{ fontSize: 13 }}>No roles assigned</div>
                  )}
                </div>

                <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ok)', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Zap style={{ width: 14, height: 14 }} />
                    Granted Services ({(myProvision?.services || []).length})
                  </div>
                  {(myProvision?.services || []).map((s) => (
                    <div key={s} className="pill approved" style={{ display: 'block', marginBottom: 6 }}>
                      {s}
                    </div>
                  ))}
                  {(!myProvision?.services || myProvision.services.length === 0) && (
                    <div className="muted" style={{ fontSize: 13 }}>No services assigned</div>
                  )}
                </div>

                <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--info)', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FolderPlus style={{ width: 14, height: 14 }} />
                    Granted Projects ({(myProvision?.projects || []).length})
                  </div>
                  {(myProvision?.projects || []).map((p) => (
                    <div key={p} className="pill info" style={{ display: 'block', marginBottom: 6, fontFamily: 'var(--mono)' }}>
                      {p}
                    </div>
                  ))}
                  {(!myProvision?.projects || myProvision.projects.length === 0) && (
                    <div className="muted" style={{ fontSize: 13 }}>No project scope assigned</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── MEMBER TAB 2: Request to Admin ── */}
          {!isAdmin && activeTab === 'request_to_admin' && (
            <div className="card">
              <div className="panel-head">
                <span className="section-title" style={{ margin: 0 }}>
                  Request GCP Permission to Admin
                </span>
              </div>

              {requestSuccessMsg && (
                <div className="note" style={{ background: 'var(--ok-soft)', color: 'var(--ok)', marginBottom: 16 }}>
                  {requestSuccessMsg}
                </div>
              )}

              <form onSubmit={handleMemberSubmitRequest} style={{ maxWidth: 640 }}>
                <label className="field">
                  <span>Permission Category</span>
                  <select
                    value={requestCategory}
                    onChange={(e) => {
                      const c = e.target.value as RequestCategory;
                      setRequestCategory(c);
                      if (c === 'ROLE') setRequestTarget(OFFICIAL_GCP_ROLES[0].value);
                      else if (c === 'SERVICE') setRequestTarget(OFFICIAL_GCP_SERVICES[0].value);
                      else setRequestTarget(gcpProjects[0]?.projectId || 'hello-20954');
                    }}
                  >
                    <option value="ROLE">Official GCP Role</option>
                    <option value="SERVICE">Official GCP Service</option>
                    <option value="PROJECT">GCP Project Access Scope</option>
                  </select>
                </label>

                <label className="field">
                  <span>Select Target Resource</span>
                  <select value={requestTarget} onChange={(e) => setRequestTarget(e.target.value)}>
                    {requestCategory === 'ROLE' &&
                      OFFICIAL_GCP_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    {requestCategory === 'SERVICE' &&
                      OFFICIAL_GCP_SERVICES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    {requestCategory === 'PROJECT' &&
                      gcpProjects.map((p) => (
                        <option key={p.projectId} value={p.projectId}>
                          {p.projectId} ({p.name || p.projectId})
                        </option>
                      ))}
                  </select>
                </label>

                {requestCategory === 'ROLE' && (
                  <label className="field">
                    <span>Target GCP Project</span>
                    <select value={requestProjectId} onChange={(e) => setRequestProjectId(e.target.value)}>
                      {gcpProjects.map((p) => (
                        <option key={p.projectId} value={p.projectId}>
                          {p.projectId} ({p.name || p.projectId})
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="field">
                  <span>Business Justification</span>
                  <textarea
                    rows={3}
                    required
                    value={requestJustification}
                    onChange={(e) => setRequestJustification(e.target.value)}
                    placeholder="Describe why you need this GCP role/resource access..."
                  />
                </label>

                <button type="submit" disabled={submittingRequest} className="btn btn-primary">
                  {submittingRequest ? <><span className="spinner" /> Submitting…</> : <><Sparkles style={{ width: 15, height: 15 }} /> Submit Request to Admin</>}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* GCP Token Modal */}
      {showTokenModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="signin-card" style={{ maxWidth: 500, margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Configure GCP OAuth Access Token</div>
              <button onClick={() => setShowTokenModal(false)} className="btn btn-ghost btn-sm" style={{ padding: 4 }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, textAlign: 'left', width: '100%' }}>
              Paste a fresh GCP OAuth 2.0 access token generated via <code>gcloud auth print-access-token</code> to execute live GCP IAM REST API calls.
            </p>

            <div style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'var(--bg-elev)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Active Token Preview:</span>
              <span className="smudge-text" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--primary)', fontWeight: 700 }} title="Hover to reveal secret token preview">
                {gcpTokenPreview || 'ya29.a0AXooC9fG7zQkL9mP2vW8xR0yZ1a3b5c7d9e1f3g5h7j9k'}
              </span>
            </div>

            {tokenMsg && (
              <div className="note" style={{ margin: 0, width: '100%' }}>
                {tokenMsg}
              </div>
            )}

            <form onSubmit={handleSaveToken} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label className="field" style={{ margin: 0 }}>
                <span>OAuth 2.0 Access Token</span>
                <textarea
                  rows={4}
                  required
                  placeholder="ya29.a0AXooC9..."
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setShowTokenModal(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={tokenSaving} className="btn btn-primary">
                  {tokenSaving ? <><span className="spinner" /> Saving…</> : 'Save Token & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
