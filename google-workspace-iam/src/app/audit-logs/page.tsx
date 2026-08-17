'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Topbar } from '@/components/Topbar';
import { AuditLog } from '@/lib/types';
import { History, Shield, CheckCircle2, Search, Download, Clock, Trash2, FileText, AlertCircle } from 'lucide-react';

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

function dotColor(action: string) {
  if (/REVOKED|SUSPENDED|DELETE/.test(action)) return 'var(--risk)';
  if (/GRANTED|CREATED|PROVISION/.test(action)) return 'var(--ok)';
  if (/CHANGED|UPGRADE|UPDATE|TOGGLE/.test(action)) return 'var(--warn)';
  return 'var(--primary)';
}

function formatTs(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [isPending, startTransition] = useTransition();

  const fetchLogs = () => {
    setLoading(true);
    fetch('/api/audit-logs')
      .then((r) => r.json())
      .then((data) => setLogs(Array.isArray(data) ? data : (data.logs || [])))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (log.target && log.target.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      (log.actor && log.actor.toLowerCase().includes(q)) ||
      (log.action && log.action.toLowerCase().includes(q));

    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  const handleExportCSV = () => {
    if (!logs.length) return;
    const headers = ['Timestamp', 'Action Event', 'Target User/Resource', 'Details', 'Initiated By', 'Status'];
    const rows = logs.map((log) => [
      `"${log.timestamp}"`,
      `"${log.action}"`,
      `"${log.target}"`,
      `"${(log.details || '').replace(/"/g, '""')}"`,
      `"${log.actor}"`,
      `"${log.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `google_workspace_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const actionTypes = Array.from(new Set(logs.map((l) => l.action))).filter(Boolean);

  return (
    <>
      <Topbar
        title="Directory Audit Log"
        subtitle="Immutable chronological history of all user provisioning, access changes, and directory state"
      />

      <div className="content">
        {/* Header summary and filter card */}
        <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="pill primary">
                  <History style={{ width: 14, height: 14 }} />
                  <span>Audit Trail &amp; Telemetry</span>
                </div>
                <span className="count-badge">{filteredLogs.length} Events Recorded</span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: '8px 0 2px', color: 'var(--text)' }}>
                System Audit Chronicle
              </h2>
              <p style={{ fontSize: 12.5, color: 'var(--text-3)', margin: 0 }}>
                Real-time tracking of administrator operations, automated sync events, and employee service delegations.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {/* Action Filter */}
              <div style={{ minWidth: 160 }}>
                <select
                  value={filterAction}
                  onChange={(e) => {
                    setFilterAction(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    fontSize: 12.5,
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    color: 'var(--text)',
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="ALL">All Event Types</option>
                  {actionTypes.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="search">
                <Search style={{ width: 14, height: 14 }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search user, admin, or action…"
                  style={{ width: 220 }}
                />
              </div>

              {/* Export CSV */}
              {logs.length > 0 && (
                <button onClick={handleExportCSV} className="btn btn-ghost btn-sm" title="Export Audit Log CSV">
                  <Download style={{ width: 14, height: 14 }} />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Audit Table / Timeline */}
        {loading ? (
          <div className="table-container">
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-2)' }}>
              Loading audit trail…
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="table-container">
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-3)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-elev)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText style={{ width: 20, height: 20, color: 'var(--text-3)' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>No Matching Audit Events</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Try adjusting your search query or event filter.</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="audit" style={{ width: '100%' }}>
            {paginatedLogs.map((log) => {
              const who = log.actor === 'svc_bot' || !log.actor ? 'System' : `@${log.actor}`;
              return (
                <div className="audit-row" key={log.id}>
                  <span className="audit-time">{formatTs(log.timestamp)}</span>
                  <span className="audit-dot" style={{ background: dotColor(log.action) }} />
                  <span className="audit-text" style={{ flex: 1 }}>
                    <b>{who}</b> executed <strong>{log.action}</strong> on <b>{log.target}</b>
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
                    {timeAgo(log.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="pagination-footer" style={{ marginTop: 20 }}>
            <span className="pagination-info">
              Showing <strong>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredLogs.length)}</strong> of <strong>{filteredLogs.length}</strong> events
            </span>
            <div className="pagination">
              <button
                type="button"
                className="page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`page-btn${page === p ? ' active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
