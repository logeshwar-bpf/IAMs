'use client';

import { useState, useEffect, useTransition } from 'react';
import AdminShell from '@/components/AdminShell';
import { PageHeader } from '@/components/PageHeader';
import { Icon } from '@/components/Icons';
import { fetchAuditLogsAction } from '@/app/actions';

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

function dotColor(action) {
  if (/REVOKED/.test(action))  return 'var(--risk)';
  if (/GRANTED|PROVISION/.test(action)) return 'var(--ok)';
  if (/CHANGED|UPGRADE/.test(action))  return 'var(--warn)';
  return 'var(--primary)';
}

function actionClass(action) {
  if (/REVOKED/.test(action))  return 'audit-action revoke';
  if (/GRANTED|PROVISION/.test(action)) return 'audit-action grant';
  if (/CHANGED|UPGRADE/.test(action))  return 'audit-action change';
  return 'audit-action provision';
}

function formatTs(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export default function AuditLogsPage() {
  const [data, setData] = useState({ logs: [], total: 0, page: 1, totalPages: 1, from: 0, to: 0 });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const loadLogs = (query, p) => {
    startTransition(async () => {
      const res = await fetchAuditLogsAction({ search: query, page: p, limit: 15 });
      setData(res);
    });
  };

  useEffect(() => { loadLogs('', 1); }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    setCurrentPage(1);
    loadLogs(val, 1);
  };

  const handlePage = (p) => {
    if (p < 1 || p > data.totalPages) return;
    setCurrentPage(p);
    loadLogs(search, p);
  };

  return (
    <AdminShell>
      <PageHeader
        title="Audit Log"
        subtitle="Immutable record of every plan provisioning event"
        actions={
          <div className="search">
            <Icon name="search" size={16} />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search user, admin, or action…"
            />
          </div>
        }
      />

      <div className="content">
        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 className="section-title" style={{ margin: 0 }}>
            All events · {data.total}
          </h3>
          {isPending && (
            <span style={{ fontSize: 12.5, color: 'var(--warn)', fontWeight: 700 }}>
              <span className="spinner" style={{ marginRight: 6 }} />
              Filtering…
            </span>
          )}
        </div>

        {/* Audit table */}
        {data.logs.length === 0 ? (
          <div className="note">No audit events match your query.</div>
        ) : (
          <div className="audit">
            {data.logs.map((log, i) => {
              const who = log.adminUser === 'svc_bot' ? 'System' : `@${log.adminUser}`;
              return (
                <div className="audit-row" key={log.id ?? i}>
                  <span className="audit-time">{formatTs(log.timestamp)}</span>
                  <span
                    className="audit-dot"
                    style={{ background: dotColor(log.action) }}
                  />
                  <span className="audit-text" style={{ flex: 1 }}>
                    <b>{who}</b>{' '}
                    {log.action === 'PLAN_GRANTED'
                      ? 'provisioned'
                      : log.action === 'PLAN_REVOKED'
                      ? 'revoked'
                      : log.action === 'PLAN_CHANGED' || log.action === 'PLAN_UPGRADE'
                      ? 'changed'
                      : 'initialized'}{' '}
                    <b>{log.targetUserName}</b>
                    {log.oldPlan && log.newPlan && (
                      <span className="muted">
                        {' '}· {log.oldPlan} → {log.newPlan}
                      </span>
                    )}
                    {log.notes && (
                      <span
                        className="muted"
                        style={{ fontStyle: 'italic', marginLeft: 8, fontSize: 11.5 }}
                      >
                        "{log.notes}"
                      </span>
                    )}
                  </span>
                  <span className={actionClass(log.action)}>
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontSize: 11.5, color: 'var(--text-3)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {timeAgo(log.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600 }}>
              Showing {data.from}–{data.to} of {data.total}
            </span>
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => handlePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              {Array.from({ length: Math.min(data.totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`page-btn${currentPage === p ? ' active' : ''}`}
                  onClick={() => handlePage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="page-btn"
                onClick={() => handlePage(currentPage + 1)}
                disabled={currentPage === data.totalPages}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
