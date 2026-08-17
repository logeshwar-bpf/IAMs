'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import { PageHeader } from '@/components/PageHeader';
import { Icon } from '@/components/Icons';
import { getUserById, updateUserPlan } from '@/lib/api-client';

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}

const AVATAR_COLORS = ['#5B5BD6', '#0E9D63', '#C77C0A', '#2A7FFF', '#DD3E45', '#7C3AED', '#0891B2', '#D97706'];
function avatarColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function formatTs(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
}

function dotColor(action) {
  if (/REVOKED/.test(action)) return 'var(--risk)';
  if (/GRANTED|PROVISION/.test(action)) return 'var(--ok)';
  if (/CHANGED|UPGRADE/.test(action)) return 'var(--warn)';
  return 'var(--primary)';
}

function actionBadgeClass(action) {
  if (/REVOKED/.test(action)) return 'audit-action revoke';
  if (/GRANTED|PROVISION/.test(action)) return 'audit-action grant';
  if (/CHANGED|UPGRADE/.test(action)) return 'audit-action change';
  return 'audit-action provision';
}

function planColor(plan) {
  if (plan === 'Claude Pro') return { bg: 'var(--primary-soft)', fg: 'var(--primary)', border: 'var(--primary)' };
  if (plan === 'Claude Team') return { bg: 'var(--info-soft)', fg: 'var(--info)', border: 'var(--info)' };
  if (plan === 'Enterprise') return { bg: 'var(--warn-soft)', fg: 'var(--warn)', border: 'var(--warn)' };
  return { bg: 'var(--risk-soft)', fg: 'var(--risk)', border: 'var(--risk)' };
}

const PLAN_OPTIONS = [
  { id: 'No Access', badge: 'Free / Revoked', desc: 'Remove paid access. User cannot use paid Claude features.' },
  { id: 'Claude Pro', badge: '$20 / mo', desc: '5× usage limits, priority access, Claude 3.5 Sonnet & Haiku.' },
  { id: 'Claude Team', badge: '$30 / user / mo', desc: 'Team billing, shared workspace, 200k context, higher limits.' },
  { id: 'Enterprise', badge: 'Custom', desc: '500k context, SSO, SCIM, zero retention, 99.9% SLA.' },
];

export default function UserDetailPage() {
  const params = useParams();
  const userId = params?.id;
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('Claude Pro');
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [seats, setSeats] = useState(1);
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState(null);

  const loadUserData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const u = await getUserById(userId);
      if (u) {
        setUser(u);
        setSelectedPlan(u.plan);
        setBillingCycle(u.billingCycle || 'Monthly');
        setSeats(u.seats || (u.plan === 'Claude Team' ? 5 : u.plan === 'Enterprise' ? 25 : 1));
      }
    } catch (err) {
      console.error('Failed to load user detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const handleGrant = (e) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await updateUserPlan({
          userId,
          newPlan: selectedPlan,
          seats,
          billingCycle,
          notes,
        });

        if (res.success && res.user) {
          setUser(res.user);
          setNotes('');
          showToast(`✓ Successfully granted "${selectedPlan}" to ${res.user.name}`);
        } else {
          showToast(`✗ ${res.error || 'Failed to update plan'}`, false);
        }
      } catch (err) {
        showToast(`✗ ${err.message || 'API Server Error'}`, false);
      }
    });
  };

  const col = user ? planColor(user.plan) : {};

  return (
    <AdminShell>
      <PageHeader
        title={loading ? 'User Profile' : (user?.name ?? 'Not found')}
        subtitle={user ? `${user.role} · ${user.email}` : ''}
        actions={
          <Link className="btn btn-ghost btn-sm" href="/users">
            ← Back to Users Directory
          </Link>
        }
      />

      <div className="content" style={{ maxWidth: 900 }}>
        {loading ? (
          <div className="note">Loading user profile from API server…</div>
        ) : !user ? (
          <div className="empty">
            <div className="empty-ic" style={{ background: 'var(--risk-soft)', color: 'var(--risk)' }}>✗</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>User Not Found</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
              No user found matching ID: {userId}
            </div>
          </div>
        ) : (
          <>
            {/* ── User header card ── */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
              <div className="avatar lg" style={{ background: avatarColor(user.name) }}>
                {initials(user.name)}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{user.name}</h2>
                  <span className={user.status === 'Active' ? 'pill active' : 'pill revoked'}>
                    {user.status}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600, marginTop: 3 }}>
                  {user.role} · <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{user.email}</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)', fontWeight: 600, marginTop: 2 }}>
                  ID: {user.id} · Member since {new Date(user.grantedAt).toLocaleDateString()}
                </div>
              </div>
              <div
                style={{
                  padding: '12px 18px', borderRadius: 14,
                  background: col.bg, border: `1px solid ${col.border}`,
                  minWidth: 160, textAlign: 'right',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                  Current Plan
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: col.fg, marginTop: 4 }}>{user.plan}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)', fontWeight: 600, marginTop: 2 }}>
                  {user.billingCycle || 'N/A'} · {user.seats || 1} seat{user.seats !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* ── Grant plan form ── */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="panel-head">
                <span className="section-title" style={{ margin: 0 }}>Grant / Provision Plan</span>
                <span className="badge">Realtime Claude API</span>
              </div>

              <form onSubmit={handleGrant}>
                {/* Plan selector cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 18 }}>
                  {PLAN_OPTIONS.map((p) => {
                    const active = selectedPlan === p.id;
                    const c = planColor(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlan(p.id)}
                        style={{
                          padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                          border: `2px solid ${active ? c.border : 'var(--border)'}`,
                          background: active ? c.bg : 'var(--bg-elev)',
                          transition: 'all .12s ease',
                          opacity: active ? 1 : 0.75,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: active ? c.fg : 'var(--text)' }}>{p.id}</span>
                          <span className="badge">{p.badge}</span>
                        </div>
                        <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.4 }}>{p.desc}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Secondary fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <label className="field" style={{ margin: 0 }}>
                    <span>Billing Cycle</span>
                    <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}>
                      <option value="Monthly">Monthly</option>
                      <option value="Annual">Annual (Discounted)</option>
                      <option value="Permanent">Permanent Grant</option>
                    </select>
                  </label>
                  <label className="field" style={{ margin: 0 }}>
                    <span>Workspace Seats</span>
                    <input type="number" min={1} max={500} value={seats} onChange={(e) => setSeats(Number(e.target.value))} />
                  </label>
                </div>

                <label className="field" style={{ marginBottom: 18 }}>
                  <span>Audit Note <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>(Logged in Realtime API)</span></span>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g. Upgraded to Enterprise per approval from VP of Engineering..."
                  />
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <Link href="/users" className="btn btn-ghost">Cancel</Link>
                  <button type="submit" className="btn btn-primary" disabled={isPending}>
                    {isPending ? <><span className="spinner" /> Provisioning Plan…</> : <><Icon name="shield" size={15} /> Grant Plan Provisioning</>}
                  </button>
                </div>
              </form>
            </div>

            {/* ── Audit history ── */}
            <div className="card">
              <div className="panel-head">
                <span className="section-title" style={{ margin: 0 }}>
                  Provisioning History · {user.auditLogs?.length ?? 0}
                </span>
                <span style={{ fontSize: 11.5, color: 'var(--text-3)', fontWeight: 600 }}>API Ledger</span>
              </div>

              {!user.auditLogs?.length ? (
                <div style={{ color: 'var(--text-3)', fontSize: 13, fontWeight: 600, padding: '16px 0' }}>
                  No audit entries recorded for this user yet.
                </div>
              ) : (
                <div className="audit">
                  {user.auditLogs.map((log, i) => (
                    <div className="audit-row" key={log.id ?? i}>
                      <span className="audit-time">{formatTs(log.timestamp)}</span>
                      <span className="audit-dot" style={{ background: dotColor(log.action) }} />
                      <span className="audit-text" style={{ flex: 1 }}>
                        <b>@{log.adminUser}</b>{' '}
                        {log.oldPlan} → <b>{log.newPlan}</b>
                        {log.notes && (
                          <span className="muted" style={{ fontStyle: 'italic', marginLeft: 8, fontSize: 11.5 }}>
                            "{log.notes}"
                          </span>
                        )}
                      </span>
                      <span className={actionBadgeClass(log.action)}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {toast && (
        <div className="toast" style={{ background: toast.ok ? '#191A26' : 'var(--risk)' }}>
          {toast.msg}
        </div>
      )}
    </AdminShell>
  );
}
