'use client';

import { useState, useEffect } from 'react';
import AdminShell from '@/components/AdminShell';
import { PageHeader } from '@/components/PageHeader';
import { Icon } from '@/components/Icons';

// ─── helpers ──────────────────────────────────────────────────────────────────
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

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function avatarBg(i) {
  const COLORS = [
    'var(--primary)', '#0E9D63', '#C77C0A', '#2A7FFF',
    '#DD3E45', '#7C3AED', '#0891B2', '#D97706',
  ];
  return COLORS[i % COLORS.length];
}

const ACTION_TEXT = {
  PLAN_GRANTED:     'provisioned a plan',
  PLAN_CHANGED:     'changed a plan',
  PLAN_REVOKED:     'revoked a plan',
  PLAN_UPGRADE:     'upgraded a plan',
  INITIAL_PROVISION:'initially provisioned access',
};

const DRIFT_LABEL = {
  unmanaged:    'Access granted outside the tool',
  missing:      'Provisioned access no longer present',
  role_mismatch:'Plan does not match directory record',
};

// ─── Dummy data (used when dummy server is not running) ───────────────────────
const FALLBACK = {
  stats: {
    totalUsers: 50, activePlans: 42, noAccess: 8,
    driftAlerts: 3, pendingProvisions: 5,
    distribution: { 'Claude Pro': 24, 'Claude Team': 15, Enterprise: 3, 'No Access': 8 },
  },
  drift: [
    { id: 'd1', type: 'unmanaged',    svc: 'Anthropic SSO',   detail: { email: 'contractor@ext.com' },           detectedAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'd2', type: 'role_mismatch', svc: 'Claude Enterprise', detail: { expectedPlan: 'Claude Pro', actualPlan: 'Enterprise' }, detectedAt: new Date(Date.now() - 14400000).toISOString() },
    { id: 'd3', type: 'missing',      svc: 'Slack Enterprise', detail: { email: 'alice@internal.io' },           detectedAt: new Date(Date.now() - 86400000).toISOString() },
  ],
  activity: [
    { adminUser: 'admin',   action: 'PLAN_GRANTED',      targetUserName: 'John Doe',      timestamp: new Date(Date.now() - 1800000).toISOString() },
    { adminUser: 'svc_bot', action: 'PLAN_CHANGED',      targetUserName: 'Sarah Lee',     timestamp: new Date(Date.now() - 3600000).toISOString() },
    { adminUser: 'admin',   action: 'PLAN_REVOKED',      targetUserName: 'Alex Kim',      timestamp: new Date(Date.now() - 7200000).toISOString() },
    { adminUser: 'admin',   action: 'INITIAL_PROVISION', targetUserName: 'Emma Wilson',   timestamp: new Date(Date.now() - 10800000).toISOString() },
    { adminUser: 'svc_bot', action: 'PLAN_UPGRADE',      targetUserName: 'Michael Brown', timestamp: new Date(Date.now() - 18000000).toISOString() },
  ],
};

function actTone(action) {
  if (/REVOKED|OFFBOARD/.test(action)) return ['var(--risk-soft)', 'var(--risk)'];
  if (/GRANTED|PROVISION/.test(action)) return ['var(--ok-soft)', 'var(--ok)'];
  if (/CHANGED|UPGRADE/.test(action))  return ['var(--warn-soft)', 'var(--warn)'];
  return ['var(--primary-soft)', 'var(--primary)'];
}

// ─── Plan distribution bar ────────────────────────────────────────────────────
const PLAN_COLORS = {
  'Claude Pro':  { bar: '#5B5BD6', label: 'var(--primary)' },
  'Claude Team': { bar: '#2A7FFF', label: 'var(--info)' },
  Enterprise:    { bar: '#C77C0A', label: 'var(--warn)' },
  'No Access':   { bar: '#DD3E45', label: 'var(--risk)' },
};

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Try the dummy server first, fall back to local data
    fetch('http://localhost:4000/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(FALLBACK));
  }, []);

  const stats = data?.stats ?? FALLBACK.stats;
  const drift = data?.drift ?? FALLBACK.drift;
  const activity = data?.activity ?? FALLBACK.activity;
  const dist = stats.distribution ?? {};
  const total = stats.totalUsers || 1;

  return (
    <AdminShell driftCount={stats.driftAlerts}>
      <PageHeader
        title="Plan Provisioning"
        subtitle="Who has what tier, where, and why — at a glance"
      />

      <div className="content">
        {/* ── Stat cards ── */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span>Total Users</span>
              <div className="stat-chip primary"><Icon name="users" size={15} /></div>
            </div>
            <div className="stat-num">{stats.totalUsers}</div>
            <div className="stat-foot">registered in directory</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Active Plans</span>
              <div className="stat-chip ok"><Icon name="shield" size={15} /></div>
            </div>
            <div className="stat-num">{stats.activePlans}</div>
            <div className="stat-foot ok">
              {Math.round((stats.activePlans / total) * 100)}% provisioned
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>No Access</span>
              <div className="stat-chip warn"><Icon name="clock" size={15} /></div>
            </div>
            <div className="stat-num">{stats.noAccess}</div>
            <div className="stat-foot warn">unassigned or revoked</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Drift Alerts</span>
              <div className="stat-chip risk"><Icon name="alert" size={15} /></div>
            </div>
            <div className="stat-num">{stats.driftAlerts ?? drift.length}</div>
            <div className="stat-foot risk">open findings</div>
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div className="qa-row">
          <a className="qa" href="/users">
            <span className="qa-ic primary"><Icon name="plus" size={16} /></span>
            Provision user
          </a>
          <a className="qa" href="/plans">
            <span className="qa-ic info"><Icon name="plans" size={16} /></span>
            View plan tiers
          </a>
          <a className="qa" href="/drift">
            <span className="qa-ic warn"><Icon name="refresh" size={16} /></span>
            Review drift
            {stats.driftAlerts > 0 && (
              <span className="qa-count">{stats.driftAlerts}</span>
            )}
          </a>
          <a className="qa risk" href="/audit-logs">
            <span style={{ fontSize: 16 }}>📋</span>
            Audit log
          </a>
        </div>

        <div className="grid-2-1">
          {/* ── Left: Plan distribution ── */}
          <div className="card">
            <div className="panel-head">
              <span className="section-title" style={{ margin: 0 }}>Plan distribution</span>
              <a className="panel-link" href="/plans" style={{ color: 'var(--primary)' }}>
                Open plans →
              </a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {Object.entries(dist).map(([plan, count]) => {
                const col = PLAN_COLORS[plan] ?? { bar: 'var(--text-3)', label: 'var(--text-2)' };
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={plan}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: col.label }}>{plan}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-3)' }}>
                        {count} users · {pct}%
                      </span>
                    </div>
                    <div style={{ height: 10, borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.max(pct, 2)}%`,
                          background: col.bar,
                          borderRadius: 999,
                          transition: 'width .5s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="col-stack">
            {/* Needs attention */}
            <div className="card">
              <div className="panel-head">
                <span className="section-title" style={{ margin: 0 }}>Needs attention</span>
                <a className="panel-link" href="/drift" style={{ color: 'var(--risk)' }}>
                  View all →
                </a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {drift.length === 0 ? (
                  <div className="att-sub" style={{ padding: '4px 2px' }}>
                    Nothing needs attention right now. 🎉
                  </div>
                ) : (
                  drift.slice(0, 3).map((d) => {
                    const det = d.detail ?? {};
                    return (
                      <div className="att-item risk" key={d.id}>
                        <div className="att-dot risk" />
                        <div>
                          <div className="att-title">{DRIFT_LABEL[d.type] ?? d.type}</div>
                          <div className="att-sub">
                            {d.svc} · {det.email ?? det.actualPlan ?? '—'} · {timeAgo(d.detectedAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent activity */}
            <div className="card">
              <div className="section-title">Recent activity</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {activity.length === 0 ? (
                  <div className="att-sub">No activity yet.</div>
                ) : (
                  activity.slice(0, 6).map((a, i) => {
                    const [bg, fg] = actTone(a.action);
                    return (
                      <div className="act-item" key={i}>
                        <div className="avatar sm" style={{ background: bg, color: fg }}>
                          {a.adminUser === 'svc_bot' ? '⚙' : initials(a.adminUser)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="act-text">
                            <b>{a.adminUser === 'svc_bot' ? 'System' : a.adminUser}</b>{' '}
                            {ACTION_TEXT[a.action] ?? a.action.replace(/_/g, ' ').toLowerCase()}
                            {a.targetUserName && (
                              <span className="muted"> for {a.targetUserName}</span>
                            )}
                          </div>
                          <div className="act-time">{timeAgo(a.timestamp)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}