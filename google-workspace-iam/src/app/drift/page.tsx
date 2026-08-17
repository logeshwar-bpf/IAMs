'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Topbar } from '@/components/Topbar';
import { DriftItem } from '@/lib/types';
import { AlertTriangle, CheckCircle2, ShieldAlert, RefreshCw, Sparkles, Check } from 'lucide-react';

function timeAgo(iso: string) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DriftLogsPage() {
  const [driftLogs, setDriftLogs] = useState<DriftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [remediatingId, setRemediatingId] = useState<string | null>(null);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const fetchDrifts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/drift-logs');
      const data = await res.json();
      setDriftLogs(data || []);
    } catch (err) {
      console.error('Error fetching drift logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrifts();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRemediate = async (id: string, action: 'remediated' | 'acknowledged') => {
    setRemediatingId(id);
    startTransition(async () => {
      try {
        const res = await fetch('/api/drift-logs/remediate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driftId: id }),
        });
        if (res.ok) {
          setResolvedIds((prev) => new Set([...prev, id]));
          showToast(action === 'remediated' ? '✓ Access policy synced & remediated successfully' : '✓ Drift finding acknowledged');
        } else {
          showToast('❌ Failed to remediate drift');
        }
      } catch (err) {
        showToast('❌ Network error communicating with server');
      } finally {
        setRemediatingId(null);
      }
    });
  };

  const openDrifts = driftLogs.filter((d) => d.status === 'DETECTED' && !resolvedIds.has(d.id));

  return (
    <>
      <Topbar
        title="Access Drift Detection & Remediation"
        subtitle="Identifies discrepancies between Google Workspace Directory policy and actual API grants"
      />

      <div className="content">
        {/* Status card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="stat-chip warn" style={{ width: 44, height: 44, borderRadius: 12 }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Continuous Drift Engine</h3>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-2)' }}>
                Compares company baseline authorization policies against live Google Directory API access records.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className={`pill ${openDrifts.length > 0 ? 'rejected' : 'approved'}`} style={{ fontSize: 13, padding: '6px 14px' }}>
              {openDrifts.length} Active Findings
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                fetchDrifts();
                setResolvedIds(new Set());
                showToast('↻ Refreshed drift scan from Google Workspace API');
              }}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              Rescan Live API
            </button>
          </div>
        </div>

        {/* Section Header */}
        <div className="tab-header" style={{ marginBottom: 16 }}>
          <h3 className="section-title" style={{ margin: 0 }}>
            Open Findings
          </h3>
          <span className="count-badge">{openDrifts.length} Action Items</span>
        </div>

        {/* Drift Rows */}
        {openDrifts.length === 0 ? (
          <div className="empty">
            <div className="empty-ic">
              <Check size={32} strokeWidth={2.4} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Zero Access Drift Detected</div>
            <div style={{ fontSize: 13.5, color: 'var(--text-2)', fontWeight: 600, marginTop: 6, maxWidth: 520, margin: '6px auto 0' }}>
              Every employee’s active Google Workspace service entitlement matches your company’s authorized access baseline.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {openDrifts.map((drift) => {
              const isUnauthorized = drift.driftType === 'UNAUTHORIZED_ACCESS';
              const sev = isUnauthorized ? 'high' : 'medium';
              const isRemediating = remediatingId === drift.id;

              return (
                <div className="drift-row" key={drift.id}>
                  <div className="drift-ic" style={{ background: isUnauthorized ? 'var(--risk-soft)' : 'var(--warn-soft)', color: isUnauthorized ? 'var(--risk)' : 'var(--warn)' }}>
                    <AlertTriangle size={20} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{drift.userName}</span>
                      <span className="badge badge-primary" style={{ textTransform: 'uppercase', fontSize: 10.5 }}>{drift.service}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500, marginTop: 4 }}>
                      <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-3)' }}>{drift.userEmail}</span>
                      {' · '}
                      <span>Expected: <strong>{drift.expectedState ? 'GRANTED' : 'REVOKED'}</strong></span>
                      {' · '}
                      <span>Live State: <strong style={{ color: drift.actualState ? 'var(--ok)' : 'var(--risk)' }}>{drift.actualState ? 'GRANTED' : 'REVOKED'}</strong></span>
                      {' · '}
                      <span>detected {timeAgo(drift.timestamp)}</span>
                    </div>
                  </div>

                  <span className={`sev ${sev}`}>{sev}</span>

                  <div className="row-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleRemediate(drift.id, 'acknowledged')}
                      disabled={isRemediating}
                    >
                      Acknowledge
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleRemediate(drift.id, 'remediated')}
                      disabled={isRemediating}
                    >
                      <RefreshCw size={13} className={isRemediating ? 'spin' : ''} />
                      {isRemediating ? 'Reconciling…' : 'Remediate Policy'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
