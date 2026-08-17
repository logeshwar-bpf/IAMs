"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  ShieldAlert,
  Layers,
  Check
} from "lucide-react";

export default function PoliciesView() {
  const [toast, setToast] = useState(null);

  const [policies, setPolicies] = useState([
    {
      id: "pol-lead-override",
      title: "Project Lead Sprint Closure Authorization",
      category: "Agile Workflow",
      enabled: true,
      severity: "CRITICAL",
      description: "Restricts closing or completing active sprint boards strictly to designated Project Leads.",
    },
    {
      id: "pol-issue-delete",
      title: "Strict Issue Deletion Lockdown",
      category: "Data Protection",
      enabled: true,
      severity: "HIGH",
      description: "Disables permanent task deletion; tickets must be moved to 'Cancelled' or 'Archived' state.",
    },
    {
      id: "pol-ext-access",
      title: "External Contractor Board Scoping",
      category: "Access Boundary",
      enabled: true,
      severity: "HIGH",
      description: "Restricts guest and vendor accounts from viewing internal infrastructure and billing tickets.",
    },
    {
      id: "pol-audit-retention",
      title: "Immutable Access Log Retention (365 Days)",
      category: "Compliance",
      enabled: true,
      severity: "RECOMMENDED",
      description: "Preserves every role grant, revocation, and board modification in tamper-proof audit trail.",
    },
    {
      id: "pol-mfa-req",
      title: "Atlassian SSO Multi-Factor Authentication",
      category: "Authentication",
      enabled: false,
      severity: "CRITICAL",
      description: "Enforces hardware key / OTP verification before accessing production Jira project boards.",
    },
  ]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = (id) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
    showToast("✓ Jira access permission rule updated");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
      {/* ── Top Status Banner ── */}
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="stat-chip ok" style={{ width: 44, height: 44, borderRadius: 12 }}>
            <ShieldCheck style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Jira Security &amp; Access Policies</h3>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--text-2)" }}>
              Centralized policy matrix governing role capabilities, board deletion locks, and workflow rules.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => showToast("↻ Audited Jira policy baselines against central IAM matrix")}
          >
            <RefreshCw style={{ width: 14, height: 14 }} />
            Audit Policies
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setPolicies((prev) => prev.map((p) => ({ ...p, enabled: true })));
              showToast("✓ All recommended security baselines enforced across Jira");
            }}
          >
            <Lock style={{ width: 14, height: 14 }} />
            Enforce All Baselines
          </button>
        </div>
      </div>

      {/* ── Section Header ── */}
      <div className="tab-header" style={{ marginBottom: 12 }}>
        <div className="section-title !mb-0">Configured Policy Rules</div>
        <span className="count-badge">{policies.filter((p) => p.enabled).length} of {policies.length} Enforced</span>
      </div>

      {/* ── Policies Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 18 }}>
        {policies.map((policy) => (
          <div key={policy.id} className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 15.5, fontWeight: 800 }}>{policy.title}</h4>
                <span className="badge" style={{ fontSize: 11, marginTop: 4 }}>{policy.category}</span>
              </div>

              <span className={`pill ${policy.enabled ? "approved" : "rejected"}`} style={{ fontSize: 11.5 }}>
                {policy.enabled ? "ENFORCED" : "DISABLED"}
              </span>
            </div>

            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, margin: 0 }}>
              {policy.description}
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
              <span className={`sev ${policy.severity === "CRITICAL" ? "high" : "medium"}`} style={{ fontSize: 11 }}>
                {policy.severity}
              </span>

              <button
                className={`btn ${policy.enabled ? "btn-ghost" : "btn-primary"} btn-sm`}
                onClick={() => handleToggle(policy.id)}
              >
                {policy.enabled ? "Disable Rule" : "Enforce Rule"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
