'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import { PageHeader } from '@/components/PageHeader';
import { Icon } from '@/components/Icons';
import { fetchDashboardStatsAction } from '@/app/actions';

const PLAN_TIERS = [
  {
    key: 'Claude Pro',
    price: '$20 / user / mo',
    badge: 'Individual Power Users',
    color: '#5B5BD6',
    features: [
      '5× usage limits vs Free tier',
      'Priority access during high-traffic periods',
      'Access to Claude 3.5 Sonnet, Haiku & Opus',
      'Create and share custom Projects & Artifacts',
      'Early access to new features',
    ],
  },
  {
    key: 'Claude Team',
    price: '$30 / user / mo',
    badge: 'Collaboration & Scale',
    color: '#2A7FFF',
    features: [
      'All Pro tier capabilities included',
      'Higher usage limits for team collaboration',
      '200 000 token context window support',
      'Centralized team administrative billing',
      'Shared workspace projects & custom style guides',
    ],
  },
  {
    key: 'Enterprise',
    price: 'Custom Pricing',
    badge: 'Maximum Governance & Limits',
    color: '#C77C0A',
    features: [
      'Expanded 500 000 token context window',
      'Single Sign-On (SSO) & SCIM directory sync',
      'Zero data retention for AI model training',
      'Dedicated success manager & 99.9% uptime SLA',
      'Granular admin audit logging & export controls',
    ],
  },
  {
    key: 'No Access',
    price: 'Free / Unassigned',
    badge: 'No Paid Privileges',
    color: '#DD3E45',
    features: [
      'Standard Claude Free web access only',
      'No enterprise or team workspace access',
      'Rate-limited standard availability',
      'Admin privileges revoked',
    ],
  },
];

function planBadgeClass(key) {
  if (key === 'Claude Pro')  return 'badge pro';
  if (key === 'Claude Team') return 'badge team';
  if (key === 'Enterprise')  return 'badge enterprise';
  return 'badge no-access';
}

function planPillClass(key) {
  if (key === 'No Access') return 'pill no-access';
  return 'pill active';
}

export default function PlansPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardStatsAction().then(setStats);
  }, []);

  const innerStats = stats?.stats ?? stats;
  const dist = innerStats?.distribution ?? {};
  const total = innerStats?.totalUsers || 1;

  return (
    <AdminShell>
      <PageHeader
        title="Claude Plan Tiers"
        subtitle="Feature matrix, pricing, and active user distribution across all tiers"
        actions={
          <Link className="btn btn-primary" href="/users">
            <Icon name="plus" size={15} />
            Provision user
          </Link>
        }
      />

      <div className="content">
        {/* ── Summary stat row ── */}
        <div className="stat-grid" style={{ marginBottom: 24 }}>
          {PLAN_TIERS.map((t) => {
            const count = dist[t.key] ?? 0;
            const pct = Math.round((count / total) * 100);
            return (
              <div className="stat-card" key={t.key}>
                <div className="stat-top">
                  <span>{t.key}</span>
                  <div
                    className="stat-chip"
                    style={{ background: `${t.color}22`, color: t.color }}
                  >
                    <Icon name={t.key === 'No Access' ? 'alert' : 'shield'} size={15} />
                  </div>
                </div>
                <div className="stat-num">{count}</div>
                <div
                  className="stat-foot"
                  style={{ color: t.key === 'No Access' ? 'var(--risk)' : 'var(--text-3)' }}
                >
                  {pct}% of directory
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Plan tier cards ── */}
        <h3 className="section-title">Plan specifications</h3>
        <div className="svc-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
          {PLAN_TIERS.map((t) => {
            const count = dist[t.key] ?? 0;
            return (
              <div className="svc-card" key={t.key}>
                <div className="svc-head">
                  <div
                    className="svc-badge"
                    style={{
                      width: 42, height: 42, fontSize: 18,
                      background: t.color,
                    }}
                  >
                    {t.key === 'Claude Pro'   ? '⚡' :
                     t.key === 'Claude Team'  ? '👥' :
                     t.key === 'Enterprise'   ? '🏛' : '🚫'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="svc-name">{t.key}</div>
                    <div className="svc-type auto">{t.price}</div>
                  </div>
                  <span className={planBadgeClass(t.key)}>{t.badge}</span>
                </div>

                {/* Feature list */}
                <ul style={{ margin: '0 0 16px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {t.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13 }}>
                      <span style={{ color: 'var(--ok)', fontWeight: 800, marginTop: 1 }}>✓</span>
                      <span style={{ color: 'var(--text-2)' }}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Footer: count + action */}
                <div className="svc-stats">
                  <div>
                    <div className="svc-mini-num">{count}</div>
                    <div className="svc-mini-lbl">active users</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                    <span className={planPillClass(t.key)}>
                      {t.key === 'No Access' ? 'Unprovisioned' : 'Active'}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <Link
                    href="/users"
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Provision users for {t.key} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
