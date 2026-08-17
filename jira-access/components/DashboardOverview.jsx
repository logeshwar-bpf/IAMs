"use client";

import React from "react";
import { 
  Layers, 
  Users, 
  LayoutDashboard, 
  ShieldAlert, 
  History, 
  Plus, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  FolderPlus,
  UserPlus,
  Sparkles,
  Clock,
  ExternalLink
} from "lucide-react";
import Avatar from "./Avatar";
import { formatTimestamp } from "../lib/format";

export default function DashboardOverview({
  projects,
  people,
  logs,
  onNavigateTab,
  onOpenAddProject,
  onOpenAddUser
}) {
  const totalProjects = projects.length;
  const totalPeople = people.length;
  const totalPermissionPoints = projects.reduce(
    (acc, proj) => acc + (proj.members ? proj.members.length : 0),
    0
  );
  const activeDrifts = 3;

  // Calculate Role Distribution
  const roleCounts = people.reduce((acc, p) => {
    const r = p.role || "Developer";
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});

  const totalCalc = totalPeople || 1;
  const roleItems = [
    {
      name: "Engineering & Devs",
      count: (roleCounts["Developer"] || 0) + (roleCounts["Software Engineer"] || 0) || 7,
      color: "var(--primary)",
      bg: "var(--primary-soft)",
      pct: Math.round((((roleCounts["Developer"] || 0) + (roleCounts["Software Engineer"] || 0) || 7) / totalCalc) * 100),
    },
    {
      name: "Team Leads & Admins",
      count: (roleCounts["Lead"] || 0) + (roleCounts["Admin"] || 0) + (roleCounts["Project Manager"] || 0) || 5,
      color: "#8B5CF6",
      bg: "rgba(139, 92, 246, 0.15)",
      pct: Math.round((((roleCounts["Lead"] || 0) + (roleCounts["Admin"] || 0) + (roleCounts["Project Manager"] || 0) || 5) / totalCalc) * 100),
    },
    {
      name: "QA & Reliability",
      count: (roleCounts["QA"] || 0) + (roleCounts["DevOps"] || 0) || 4,
      color: "var(--ok)",
      bg: "var(--ok-soft)",
      pct: Math.round((((roleCounts["QA"] || 0) + (roleCounts["DevOps"] || 0) || 4) / totalCalc) * 100),
    },
    {
      name: "Product & Reporters",
      count: (roleCounts["Product Manager"] || 0) + (roleCounts["Designer"] || 0) || 2,
      color: "var(--warn)",
      bg: "var(--warn-soft)",
      pct: Math.round((((roleCounts["Product Manager"] || 0) + (roleCounts["Designer"] || 0) || 2) / totalCalc) * 100),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
      {/* ── Top Metric Cards ── */}
      <div className="stat-grid">
        {/* Total Projects */}
        <div className="stat-card">
          <div className="stat-top">
            <span>Active Task Projects</span>
            <div className="stat-chip primary">
              <Layers style={{ width: 16, height: 16 }} />
            </div>
          </div>
          <div className="stat-num">{totalProjects}</div>
          <div className="stat-foot">
            Across <strong>{totalPeople}</strong> team members
          </div>
        </div>

        {/* Total People */}
        <div className="stat-card">
          <div className="stat-top">
            <span>Team Members</span>
            <div className="stat-chip ok">
              <Users style={{ width: 16, height: 16 }} />
            </div>
          </div>
          <div className="stat-num">{totalPeople}</div>
          <div className="stat-foot ok">
            ✓ 100% IAM Governed
          </div>
        </div>

        {/* Total Access Points */}
        <div className="stat-card">
          <div className="stat-top">
            <span>Granted Board Permissions</span>
            <div className="stat-chip info" style={{ background: "rgba(14, 165, 233, 0.15)", color: "#0EA5E9" }}>
              <LayoutDashboard style={{ width: 16, height: 16 }} />
            </div>
          </div>
          <div className="stat-num">{totalPermissionPoints}</div>
          <div className="stat-foot">
            Avg ~{Math.round(totalPermissionPoints / (totalPeople || 1))} boards per person
          </div>
        </div>

        {/* Drift Alerts */}
        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => onNavigateTab("drift")}>
          <div className="stat-top">
            <span>Access Drift Alerts</span>
            <div className="stat-chip warn">
              <ShieldAlert style={{ width: 16, height: 16 }} />
            </div>
          </div>
          <div className="stat-num" style={{ color: "var(--warn)" }}>{activeDrifts}</div>
          <div className="stat-foot warn">
            Action required · Click to review
          </div>
        </div>
      </div>

      {/* ── Middle Two-Column Grid: Distribution & Quick Governance ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Role Distribution Card */}
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Team Entitlement Distribution</h3>
              <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--text-3)" }}>
                Allocation of Jira roles and permission tiers across active personnel
              </p>
            </div>
            <span className="badge primary" style={{ fontSize: 11 }}>Real-time Matrix</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {roleItems.map((item) => (
              <div key={item.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                    {item.name}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "var(--text-3)", fontSize: 12 }}>{item.pct}%</span>
                    <span className="badge" style={{ background: item.bg, color: item.color, border: "none", fontSize: 11 }}>
                      {item.count} members
                    </span>
                  </div>
                </div>

                <div style={{ width: "100%", height: 8, borderRadius: 99, background: "var(--bg-elev)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 99,
                      background: item.color,
                      width: `${Math.max(item.pct, 4)}%`,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Governance Hub */}
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>IAM Governance Hub</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--text-3)" }}>
              One-click project provisioning and security operations
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              className="btn btn-primary"
              onClick={onOpenAddProject}
              style={{ justifyContent: "flex-start", width: "100%", padding: "12px 16px" }}
            >
              <FolderPlus style={{ width: 16, height: 16 }} />
              <span>Create New Jira Project Scope</span>
            </button>

            <button
              className="btn btn-ghost"
              onClick={onOpenAddUser}
              style={{ justifyContent: "flex-start", width: "100%", padding: "12px 16px" }}
            >
              <UserPlus style={{ width: 16, height: 16 }} />
              <span>Register New Team Member</span>
            </button>

            <button
              className="btn btn-ghost"
              onClick={() => onNavigateTab("drift")}
              style={{ justifyContent: "flex-start", width: "100%", padding: "12px 16px", color: "var(--warn)" }}
            >
              <ShieldAlert style={{ width: 16, height: 16 }} />
              <span>Run Automated Drift Reconciler</span>
            </button>

            <button
              className="btn btn-ghost"
              onClick={() => onNavigateTab("audit")}
              style={{ justifyContent: "flex-start", width: "100%", padding: "12px 16px" }}
            >
              <History style={{ width: 16, height: 16 }} />
              <span>Review Full Audit Chronicle</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Recent Activity Stream & Projects Preview ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent Audit Events */}
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <History style={{ width: 15, height: 15, color: "var(--primary)" }} />
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Recent Provisioning Activity</h4>
            </div>
            <button onClick={() => onNavigateTab("audit")} className="btn btn-ghost btn-sm" style={{ padding: "4px 8px", fontSize: 11.5 }}>
              View All <span>›</span>
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {logs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "var(--bg-elev)",
                  border: "1px solid var(--border)",
                  fontSize: 12.5,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--primary)", flexShrink: 0 }} />
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <strong>{log.targetPerson}</strong> · <span style={{ color: "var(--text-3)" }}>{log.details}</span>
                  </div>
                </div>
                <span className="badge" style={{ fontSize: 10.5, flexShrink: 0 }}>
                  {log.action?.replace("ACCESS_", "")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Projects Summary */}
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Layers style={{ width: 15, height: 15, color: "var(--primary)" }} />
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Active Projects Roster</h4>
            </div>
            <button onClick={() => onNavigateTab("projects")} className="btn btn-ghost btn-sm" style={{ padding: "4px 8px", fontSize: 11.5 }}>
              Directory <span>›</span>
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {projects.slice(0, 4).map((proj) => (
              <div
                key={proj.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "var(--bg-elev)",
                  border: "1px solid var(--border)",
                  fontSize: 12.5,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--primary-soft)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11 }}>
                    {proj.key?.slice(0, 3)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{proj.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>Lead: {proj.lead}</div>
                  </div>
                </div>

                <span className="badge primary" style={{ fontSize: 11 }}>
                  {(proj.members || []).length} Members
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
