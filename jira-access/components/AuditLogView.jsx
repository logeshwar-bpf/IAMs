"use client";

import React, { useState } from "react";
import { 
  History, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Trash2, 
  Sparkles, 
  Download,
  AlertCircle,
  FolderPlus,
  UserCheck,
  UserX,
  FileText
} from "lucide-react";
import Modal from "./Modal";
import { ACTION_META, ACTION_TYPES } from "../lib/audit";
import { formatTimestamp, matchesQuery } from "../lib/format";

export default function AuditLogView({ logs, onClearLogs }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      matchesQuery(log.targetPerson, searchTerm) ||
      matchesQuery(log.targetProject, searchTerm) ||
      matchesQuery(log.details, searchTerm) ||
      matchesQuery(log.actor, searchTerm) ||
      matchesQuery(log.action, searchTerm);

    const matchesAction = filterAction === "ALL" || log.action === filterAction;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action) => {
    const meta = ACTION_META[action];
    const label = meta?.label || action;

    switch (action) {
      case ACTION_TYPES.ACCESS_GRANTED:
        return (
          <span className="pill approved" style={{ gap: 6 }}>
            <CheckCircle2 style={{ width: 13, height: 13 }} />
            {label}
          </span>
        );
      case ACTION_TYPES.ACCESS_REVOKED:
        return (
          <span className="pill rejected" style={{ gap: 6 }}>
            <XCircle style={{ width: 13, height: 13 }} />
            {label}
          </span>
        );
      case ACTION_TYPES.ADMIN_LOGIN:
        return (
          <span className="pill primary" style={{ gap: 6 }}>
            <Shield style={{ width: 13, height: 13 }} />
            {label}
          </span>
        );
      case ACTION_TYPES.PROJECT_CREATED:
      case ACTION_TYPES.PROJECT_PROVISIONED:
        return (
          <span className="pill info" style={{ gap: 6 }}>
            <FolderPlus style={{ width: 13, height: 13 }} />
            {label}
          </span>
        );
      case ACTION_TYPES.USER_CREATED:
        return (
          <span className="pill active" style={{ gap: 6 }}>
            <UserCheck style={{ width: 13, height: 13 }} />
            {label}
          </span>
        );
      default:
        return (
          <span className="pill info" style={{ gap: 6 }}>
            <Sparkles style={{ width: 13, height: 13 }} />
            {label}
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    if (!logs.length) return;
    const headers = ["Timestamp", "Action Event", "Actor", "Target Person", "Target Project", "Details", "IP Address"];
    const rows = logs.map((log) => [
      `"${log.timestamp}"`,
      `"${log.action}"`,
      `"${log.actor}"`,
      `"${log.targetPerson}"`,
      `"${log.targetProject}"`,
      `"${(log.details || "").replace(/"/g, '""')}"`,
      `"${log.ipAddress || "—"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `jira_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      {/* ── Header & Action Bar ── */}
      <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="pill primary">
                <History style={{ width: 14, height: 14 }} />
                <span>Audit Trail & Telemetry</span>
              </div>
              <span className="count-badge">{filteredLogs.length} Events Recorded</span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '8px 0 2px', color: 'var(--text)' }}>
              System Audit Logs
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', margin: 0 }}>
              Real-time chronicle of administrator actions, provisioning events, and permission shifts.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Filter Dropdown */}
            <div className="field" style={{ margin: 0, minWidth: 160 }}>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                style={{ padding: '8px 12px', fontSize: 12.5, borderRadius: 10 }}
              >
                <option value="ALL">All Event Types</option>
                {Object.entries(ACTION_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="search">
              <Search style={{ width: 14, height: 14 }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search audit trail..."
                style={{ padding: '8px 12px 8px 34px', fontSize: 12.5, width: 200 }}
              />
            </div>

            {/* Export CSV Button */}
            {logs.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="btn btn-ghost btn-sm"
                title="Export Audit Log CSV"
                type="button"
              >
                <Download style={{ width: 14, height: 14 }} />
                <span>Export CSV</span>
              </button>
            )}

            {/* Clear Logs Button */}
            {logs.length > 0 && (
              <button
                onClick={() => setIsConfirmClearOpen(true)}
                title="Clear audit log history"
                className="btn btn-danger btn-sm"
                aria-label="Clear audit log history"
                type="button"
              >
                <Trash2 style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Structured Glassmorphic Data Table ── */}
      <div className="table-container" style={{ margin: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action Event</th>
              <th>Target Person</th>
              <th>Task Project</th>
              <th>Details & Payload</th>
              <th>Actor</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  {/* Timestamp */}
                  <td style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--mono)' }}>
                      <Clock style={{ width: 13, height: 13, color: 'var(--primary)', flexShrink: 0 }} />
                      <span>{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </td>

                  {/* Action Event Pill */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {getActionBadge(log.action)}
                  </td>

                  {/* Target Person */}
                  <td style={{ fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                    {log.targetPerson}
                  </td>

                  {/* Task Project */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="badge project" style={{ fontWeight: 700 }}>
                      {log.targetProject}
                    </span>
                  </td>

                  {/* Details */}
                  <td style={{ color: 'var(--text-2)', fontSize: 12.5, maxWidth: 320 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.details}>
                      {log.details}
                    </div>
                  </td>

                  {/* Actor */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="badge admin" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>
                      @{log.actor}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-3)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-elev)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText style={{ width: 20, height: 20, color: 'var(--text-3)' }} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>No Matching Audit Events</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Try adjusting your search query or filter settings.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Confirmation Modal for Clearing Logs ── */}
      <Modal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        title="Confirm Log Archival"
        maxWidth="max-w-sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, background: 'var(--risk-soft)', border: '1px solid var(--risk)', fontSize: 12.5, color: 'var(--risk)' }}>
            <AlertCircle style={{ width: 20, height: 20, flexShrink: 0 }} />
            <p style={{ margin: 0, lineHeight: 1.4 }}>
              Are you sure you want to clear all <strong>{logs.length}</strong> audit log records? An archival entry will be recorded in the system audit trail.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
            <button onClick={() => setIsConfirmClearOpen(false)} className="btn btn-ghost btn-sm" type="button">
              Cancel
            </button>
            <button
              onClick={() => {
                onClearLogs();
                setIsConfirmClearOpen(false);
              }}
              className="btn btn-danger btn-sm"
              type="button"
            >
              <Trash2 style={{ width: 14, height: 14 }} />
              <span>Confirm Clear</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
