"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, RefreshCw, Check, Sparkles } from "lucide-react";

function timeAgo(iso) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DriftView({ people, projects, onToggleAccess }) {
  const [resolvedIds, setResolvedIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [remediatingId, setRemediatingId] = useState(null);

  // Initial drift findings simulated from actual project and people state
  const [findings, setFindings] = useState([
    {
      id: "drift-1",
      userName: "Alex Johnson",
      userEmail: "alex.j@company.com",
      projectName: "CORE-INFRA",
      service: "Jira Core",
      type: "unmanaged",
      title: "Direct board membership granted outside IAM portal",
      expected: "VIEWER",
      actual: "PROJECT_ADMIN",
      sev: "high",
      detectedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
    {
      id: "drift-2",
      userName: "Devin Vance",
      userEmail: "devin.v@company.com",
      projectName: "MOBILE-APP",
      service: "Jira Software",
      type: "role_mismatch",
      title: "Role mismatch between HR directory and Project role",
      expected: "DEVELOPER",
      actual: "QA_LEAD",
      sev: "medium",
      detectedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: "drift-3",
      userName: "Priya Sharma",
      userEmail: "priya.s@company.com",
      projectName: "DATA-ENG",
      service: "Jira Service",
      type: "over_provisioned",
      title: "User has sprint management rights on read-only board",
      expected: "REPORTER",
      actual: "SPRINT_MANAGER",
      sev: "high",
      detectedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    },
  ]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRemediate = (id, action) => {
    setRemediatingId(id);
    setTimeout(() => {
      setResolvedIds((prev) => new Set([...prev, id]));
      setRemediatingId(null);
      showToast(action === "remediate" ? "✓ Jira permission policy synchronized & remediated" : "✓ Drift alert acknowledged");
    }, 400);
  };

  const openFindings = findings.filter((f) => !resolvedIds.has(f.id));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
      {/* ── Status Card ── */}
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="stat-chip warn" style={{ width: 44, height: 44, borderRadius: 12 }}>
            <ShieldAlert style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Continuous Jira Access Drift Monitor</h3>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--text-2)" }}>
              Audits Jira Cloud/Server project permissions against your central security access baseline.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className={`pill ${openFindings.length > 0 ? "rejected" : "approved"}`} style={{ fontSize: 13, padding: "6px 14px" }}>
            {openFindings.length} Active Findings
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setResolvedIds(new Set());
              showToast("↻ Refreshed Jira project telemetry & drift status");
            }}
          >
            <RefreshCw style={{ width: 14, height: 14 }} />
            Rescan Jira State
          </button>
        </div>
      </div>

      {/* ── Section Header ── */}
      <div className="tab-header" style={{ marginBottom: 16 }}>
        <h3 className="section-title" style={{ margin: 0 }}>
          Open Jira Findings
        </h3>
        <span className="count-badge">{openFindings.length} Alerts</span>
      </div>

      {/* ── Findings List ── */}
      {openFindings.length === 0 ? (
        <div className="empty">
          <div className="empty-ic">
            <Check style={{ width: 32, height: 32 }} strokeWidth={2.4} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Zero Jira Drift Detected</div>
          <div style={{ fontSize: 13.5, color: "var(--text-2)", fontWeight: 600, marginTop: 6, maxWidth: 520, margin: "6px auto 0" }}>
            Every Jira project role and board assignment strictly matches your organization’s access matrix policy.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {openFindings.map((finding) => {
            const isRemediating = remediatingId === finding.id;
            return (
              <div className="drift-row" key={finding.id}>
                <div className="drift-ic" style={{ background: finding.sev === "high" ? "var(--risk-soft)" : "var(--warn-soft)", color: finding.sev === "high" ? "var(--risk)" : "var(--warn)" }}>
                  <AlertTriangle style={{ width: 20, height: 20 }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{finding.title}</span>
                    <span className="badge project" style={{ fontSize: 11 }}>{finding.projectName}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500, marginTop: 4 }}>
                    <span style={{ fontWeight: 700, color: "var(--text)" }}>{finding.userName}</span>
                    {" · "}
                    <span style={{ fontFamily: "var(--mono)", color: "var(--text-3)" }}>{finding.userEmail}</span>
                    {" · "}
                    <span>Expected: <strong>{finding.expected}</strong></span>
                    {" · "}
                    <span>Actual: <strong style={{ color: "var(--risk)" }}>{finding.actual}</strong></span>
                    {" · "}
                    <span>detected {timeAgo(finding.detectedAt)}</span>
                  </div>
                </div>

                <span className={`sev ${finding.sev}`}>{finding.sev}</span>

                <div className="row-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleRemediate(finding.id, "acknowledge")}
                    disabled={isRemediating}
                  >
                    Acknowledge
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleRemediate(finding.id, "remediate")}
                    disabled={isRemediating}
                  >
                    <RefreshCw style={{ width: 13, height: 13 }} className={isRemediating ? "spin" : ""} />
                    {isRemediating ? "Reconciling…" : "Remediate Policy"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
