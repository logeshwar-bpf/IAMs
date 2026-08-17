'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/Topbar';
import {
  Users,
  UserPlus,
  Layers,
  Sparkles,
  ShieldCheck,
  History,
  ShieldAlert,
  FolderTree,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Mail,
  HardDrive,
  Video,
  PlaySquare,
  Activity
} from 'lucide-react';
import { CreateUserModal } from '@/components/CreateUserModal';

export default function DashboardPage() {
  const [totalUsers, setTotalUsers] = useState(50);
  const [geminiActiveCount, setGeminiActiveCount] = useState(25);
  const [gmeetActiveCount, setGmeetActiveCount] = useState(50);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/users?page=1&limit=1')
      .then((res) => res.json())
      .then((data) => {
        if (data.total) setTotalUsers(data.total);
        if (data.orgStats) {
          setGeminiActiveCount(data.orgStats.geminiActiveCount || 25);
          setGmeetActiveCount(data.orgStats.meetActiveCount || 50);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <Topbar
        title="Google Workspace Command Dashboard"
        subtitle="Real-time security telemetry, app entitlement distribution & identity governance"
      />

      <div className="content">
        {/* Top 4 KPI Metrics */}
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', marginBottom: '24px' }}>
          <Link href="/people" style={{ textDecoration: 'none' }}>
            <div className="stat-card" style={{ cursor: 'pointer' }}>
              <div className="stat-top">
                <span>Total Directory</span>
                <div className="stat-chip primary">
                  <Users size={16} />
                </div>
              </div>
              <div className="stat-num">{totalUsers}</div>
              <div className="stat-foot ok">Company accounts · Click to view</div>
            </div>
          </Link>

          <Link href="/services" style={{ textDecoration: 'none' }}>
            <div className="stat-card" style={{ cursor: 'pointer' }}>
              <div className="stat-top">
                <span>Gemini AI Work</span>
                <div className="stat-chip primary">
                  <Sparkles size={16} />
                </div>
              </div>
              <div className="stat-num" style={{ color: 'var(--primary)' }}>
                {geminiActiveCount} <span style={{ fontSize: '18px', color: 'var(--text-3)', fontWeight: 600 }}>/ {totalUsers}</span>
              </div>
              <div className="stat-foot ok">{Math.round((geminiActiveCount / (totalUsers || 1)) * 100)}% AI Provisioned</div>
            </div>
          </Link>

          <Link href="/services" style={{ textDecoration: 'none' }}>
            <div className="stat-card" style={{ cursor: 'pointer' }}>
              <div className="stat-top">
                <span>GMeet Active</span>
                <div className="stat-chip ok">
                  <ShieldCheck size={16} />
                </div>
              </div>
              <div className="stat-num" style={{ color: 'var(--ok)' }}>
                {gmeetActiveCount} <span style={{ fontSize: '18px', color: 'var(--text-3)', fontWeight: 600 }}>/ {totalUsers}</span>
              </div>
              <div className="stat-foot ok">100% Video Conferencing</div>
            </div>
          </Link>

          <Link href="/drift" style={{ textDecoration: 'none' }}>
            <div className="stat-card" style={{ cursor: 'pointer' }}>
              <div className="stat-top">
                <span>Directory Drift</span>
                <div className="stat-chip warn">
                  <ShieldAlert size={16} />
                </div>
              </div>
              <div className="stat-num" style={{ color: 'var(--warn)' }}>4</div>
              <div className="stat-foot warn">Action required · Click to review</div>
            </div>
          </Link>
        </div>

        {/* Middle Two-Column Grid: Service Distribution & Quick Governance Hub */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {/* Service Entitlement Distribution Card */}
          <div className="card" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Workspace App Entitlement Distribution</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--text-3)' }}>
                  Active seat allocations across Google Workspace core services
                </p>
              </div>
              <Link href="/services">
                <span className="badge primary" style={{ fontSize: '11px', cursor: 'pointer' }}>Manage Apps ›</span>
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { name: 'Gmail Workspace', count: Math.round(totalUsers * 0.96) || 48, color: '#EA4335', bg: 'rgba(234, 67, 53, 0.12)' },
                { name: 'Google Drive Enterprise', count: Math.round(totalUsers * 0.88) || 44, color: '#34A853', bg: 'rgba(52, 168, 83, 0.12)' },
                { name: 'Google Meet HD', count: gmeetActiveCount || 50, color: '#4285F4', bg: 'rgba(66, 133, 244, 0.12)' },
                { name: 'YouTube Work', count: Math.round(totalUsers * 0.48) || 24, color: '#FBBC04', bg: 'rgba(251, 188, 4, 0.15)' },
                { name: 'Gemini AI Assistant', count: geminiActiveCount || 25, color: 'var(--primary)', bg: 'var(--primary-soft)' },
              ].map((svc) => {
                const pct = Math.round((svc.count / (totalUsers || 1)) * 100);
                return (
                  <div key={svc.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: svc.color }} />
                        {svc.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>{pct}%</span>
                        <span className="badge" style={{ background: svc.bg, color: svc.color, border: 'none', fontSize: '11px' }}>
                          {svc.count} users
                        </span>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: '8px', borderRadius: '99px', background: 'var(--bg-elev)', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          borderRadius: '99px',
                          background: svc.color,
                          width: `${Math.max(pct, 4)}%`,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions & Governance Hub */}
          <div className="card" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>IAM Governance Hub</h3>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--text-3)' }}>
                Direct shortcuts for employee onboarding &amp; app security delegations
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn btn-primary"
                onClick={() => setIsCreateOpen(true)}
                style={{ justifyContent: 'flex-start', width: '100%', padding: '12px 16px' }}
              >
                <UserPlus size={16} />
                <span>Provision New Employee Account</span>
              </button>

              <Link href="/people" style={{ textDecoration: 'none' }}>
                <button
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start', width: '100%', padding: '12px 16px' }}
                >
                  <Users size={16} />
                  <span>Open People Access Matrix (50)</span>
                </button>
              </Link>

              <Link href="/drift" style={{ textDecoration: 'none' }}>
                <button
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start', width: '100%', padding: '12px 16px', color: 'var(--warn)' }}
                >
                  <ShieldAlert size={16} />
                  <span>Inspect Directory Drift Alerts (4)</span>
                </button>
              </Link>

              <Link href="/audit-logs" style={{ textDecoration: 'none' }}>
                <button
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start', width: '100%', padding: '12px 16px' }}
                >
                  <History size={16} />
                  <span>Review Full Workspace Audit Logs</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: Directory Quick Access & Recent Security Events */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* People Directory Portal Card */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={18} color="var(--primary)" />
                <h4 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800 }}>Employee Directory Matrix</h4>
              </div>
              <span className="count-badge">{totalUsers} Registered</span>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
              Granular per-user toggles for Gmail, Google Drive, Google Meet, YouTube Work, and Gemini AI Pro with bulk provisioning and OU groupings.
            </p>

            <Link href="/people" style={{ textDecoration: 'none', marginTop: 'auto' }}>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                <span>Launch Full People Access Matrix</span>
                <ArrowRight size={15} />
              </button>
            </Link>
          </div>

          {/* Recent Security Activity */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={18} color="var(--ok)" />
                <h4 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800 }}>Recent Identity Telemetry</h4>
              </div>
              <Link href="/audit-logs">
                <span className="badge" style={{ fontSize: '11px', cursor: 'pointer' }}>View All ›</span>
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { user: 'alex.smith@company.com', action: 'Gemini AI Activated', time: '12m ago', type: 'ok' },
                { user: 'jordan.j@company.com', action: 'Drive Permissions Synced', time: '38m ago', type: 'primary' },
                { user: 'taylor.w@company.com', action: 'OU Baseline Enforced (/Eng)', time: '1h ago', type: 'info' },
              ].map((ev, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-elev)',
                    border: '1px solid var(--border)',
                    fontSize: '12.5px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.user}
                    </span>
                  </div>
                  <span className="badge" style={{ fontSize: '10.5px' }}>{ev.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <CreateUserModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => showToast('✓ Employee account provisioned')}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
