'use client';

import { useState, useEffect, useTransition } from 'react';
import AdminShell from '@/components/AdminShell';
import { PageHeader } from '@/components/PageHeader';
import { Icon } from '@/components/Icons';

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_LABEL = {
  unmanaged:     'Access granted outside the tool',
  missing:       'Provisioned access no longer present',
  role_mismatch: 'Plan does not match directory record',
  orphaned:      'User account no longer in directory',
  over_provisioned: 'User has more access than their role requires',
};

const SEV = {
  unmanaged:        'high',
  missing:          'high',
  role_mismatch:    'medium',
  orphaned:         'high',
  over_provisioned: 'medium',
};

// Dummy drift data — replaced when dummy server is running
const DUMMY_ALERTS = [
  {
    id: 'd1', type: 'unmanaged', svc: 'Anthropic SSO',
    detail: { email: 'contractor_ext@vendor.com', entitlementExternalId: 'sso/team-access' },
    detectedAt: new Date(Date.now() - 7200000).toISOString(), status: 'open',
  },
  {
    id: 'd2', type: 'role_mismatch', svc: 'Claude Enterprise',
    detail: { email: 'alice@internal.io', expectedPlan: 'Claude Pro', actualPlan: 'Enterprise' },
    detectedAt: new Date(Date.now() - 14400000).toISOString(), status: 'open',
  },
  {
    id: 'd3', type: 'missing', svc: 'Slack Enterprise',
    detail: { email: 'bob@internal.io', entitlementExternalId: 'slack/paid-seat' },
    detectedAt: new Date(Date.now() - 86400000).toISOString(), status: 'open',
  },
  {
    id: 'd4', type: 'orphaned', svc: 'GitHub Enterprise',
    detail: { email: 'former.employee@internal.io' },
    detectedAt: new Date(Date.now() - 172800000).toISOString(), status: 'open',
  },
  {
    id: 'd5', type: 'over_provisioned', svc: 'Claude Enterprise',
    detail: { email: 'intern@internal.io', expectedPlan: 'Claude Pro', actualPlan: 'Enterprise' },
    detectedAt: new Date(Date.now() - 259200000).toISOString(), status: 'open',
  },
];

export default function DriftPage() {
  const [alerts, setAlerts] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [resolved, setResolved] = useState(new Set());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Try dummy server first
    fetch('http://localhost:4000/api/drift-alerts')
      .then((r) => r.json())
      .then((data) => setAlerts(data.alerts ?? data))
      .catch(() => setAlerts(DUMMY_ALERTS));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleResolve = (id, action) => {
    startTransition(async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/drift-alerts/${id}/resolve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: action }),
        });
        if (res.ok) {
          setResolved((prev) => new Set([...prev, id]));
          showToast(action === 'resolved' ? '✓ Alert remediated' : '✓ Alert acknowledged');
        } else {
          showToast('❌ Failed to resolve alert');
        }
      } catch (e) {
        showToast('❌ Failed to communicate with server');
      }
    });
  };

  const openAlerts = alerts.filter((a) => a.status === 'open' && !resolved.has(a.id));

  return (
    <AdminShell driftCount={openAlerts.length}>
      <PageHeader
        title="Drift Detection"
        subtitle="Plan access that no longer matches its source of truth"
        actions={
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              fetch('http://localhost:4000/api/drift-alerts')
                .then((r) => r.json())
                .then((data) => { setAlerts(data.alerts ?? data); setResolved(new Set()); showToast('↻ Refreshed findings'); })
                .catch(() => { setAlerts(DUMMY_ALERTS); setResolved(new Set()); showToast('↻ Showing demo data'); });
            }}
          >
            <Icon name="refresh" size={15} />
            Refresh findings
          </button>
        }
      />

      <div className="content">
        <div className="panel-head">
          <h3 className="section-title" style={{ margin: 0 }}>
            Open findings · {openAlerts.length}
          </h3>
          {isPending && (
            <span style={{ fontSize: 12.5, color: 'var(--warn)', fontWeight: 700 }}>
              <span className="spinner" style={{ marginRight: 6 }} />
              Updating…
            </span>
          )}
        </div>

        {openAlerts.length === 0 ? (
          <div className="empty">
            <div className="empty-ic">
              <Icon name="check" size={30} strokeWidth={2.2} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>No drift detected</div>
            <div style={{ fontSize: 13.5, color: 'var(--text-2)', fontWeight: 600, marginTop: 4 }}>
              Every plan grant matches its source of truth. The scan compares actual access
              in each connected service against what was provisioned through this tool.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {openAlerts.map((a) => {
              const det = a.detail ?? {};
              const sev = SEV[a.type] ?? 'high';
              const sub =
                a.type === 'role_mismatch'
                  ? `expected ${det.expectedPlan ?? '—'}, actual ${det.actualPlan ?? '—'}`
                  : det.email ?? det.entitlementExternalId ?? '—';

              return (
                <div className="drift-row" key={a.id}>
                  <div className="drift-ic">
                    <Icon name="alert" size={20} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                      {TYPE_LABEL[a.type] ?? a.type}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600, marginTop: 2 }}>
                      {a.svc} · {sub} · detected {timeAgo(a.detectedAt)}
                    </div>
                  </div>

                  <span className={`sev ${sev}`}>{sev}</span>

                  <div className="row-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleResolve(a.id, 'acknowledged')}
                    >
                      Ack
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleResolve(a.id, 'resolved')}
                    >
                      Remediate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && <div className="toast">✓ {toast}</div>}
    </AdminShell>
  );
}
