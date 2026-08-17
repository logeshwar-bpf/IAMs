"use client";

import React, { useState } from "react";
import { 
  Building2, 
  Users, 
  Layers, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  FolderTree, 
  ChevronRight,
  RefreshCw,
  Search,
  ExternalLink
} from "lucide-react";
import Avatar from "./Avatar";

export default function TeamsView({ projects, people }) {
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const [teams, setTeams] = useState([
    {
      id: "team-infra",
      name: "Core Platform & Infrastructure",
      lead: "Alex Johnson",
      leadEmail: "alex.j@company.com",
      projects: ["CORE-INFRA", "CLOUD-OPS"],
      membersCount: 8,
      velocity: "42 pts/sprint",
      description: "Backend microservices, Kubernetes clusters, and cloud platform tooling.",
    },
    {
      id: "team-mobile",
      name: "Mobile & Client Apps Squad",
      lead: "Devin Vance",
      leadEmail: "devin.v@company.com",
      projects: ["MOBILE-APP", "DESIGN-SYS"],
      membersCount: 6,
      velocity: "36 pts/sprint",
      description: "iOS, Android, and cross-platform Flutter experience development.",
    },
    {
      id: "team-data",
      name: "Data Platform & Analytics",
      lead: "Priya Sharma",
      leadEmail: "priya.s@company.com",
      projects: ["DATA-ENG", "ML-PIPELINES"],
      membersCount: 7,
      velocity: "48 pts/sprint",
      description: "BigQuery telemetry, data pipelines, and internal business intelligence.",
    },
    {
      id: "team-sec",
      name: "Security & IAM Engineering",
      lead: "Logeshwar Admin",
      leadEmail: "logeshwar2424@gmail.com",
      projects: ["IAM-GOV", "SECURITY-OPS"],
      membersCount: 4,
      velocity: "28 pts/sprint",
      description: "Identity governance, single sign-on, and compliance audit frameworks.",
    },
  ]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.lead.toLowerCase().includes(search.toLowerCase()) ||
      t.projects.some((p) => p.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
      {/* ── Status Banner ── */}
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="stat-chip info" style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(14, 165, 233, 0.15)", color: "#0EA5E9" }}>
            <FolderTree style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Engineering Squads &amp; Department Structure</h3>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--text-2)" }}>
              Manage agile team allocations, assigned Jira project scopes, and squad leads.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => showToast("↻ Refreshed Jira team velocity & sprint telemetry")}
          >
            <RefreshCw style={{ width: 14, height: 14 }} />
            Sync Squads
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => showToast("✓ New Team Squad creation modal initiated")}
          >
            <Plus style={{ width: 14, height: 14 }} />
            Create Squad
          </button>
        </div>
      </div>

      {/* ── Section Header ── */}
      <div className="tab-header" style={{ marginBottom: 12 }}>
        <div className="section-title !mb-0">Active Engineering Squads</div>
        <span className="count-badge">{filteredTeams.length} Teams Configured</span>
      </div>

      {/* ── Teams Cards Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 18 }}>
        {filteredTeams.map((team) => (
          <div key={team.id} className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{team.name}</h4>
                <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 3 }}>
                  Lead: <strong style={{ color: "var(--text)" }}>{team.lead}</strong>
                </div>
              </div>
              <span className="badge primary" style={{ fontSize: 11 }}>
                {team.velocity}
              </span>
            </div>

            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, margin: 0 }}>
              {team.description}
            </p>

            <div style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12.5 }}>
                <span style={{ color: "var(--text-3)" }}>Squad Size:</span>
                <span style={{ fontWeight: 700, color: "var(--text)" }}>
                  <Users style={{ width: 13, height: 13, display: "inline", marginRight: 4 }} />
                  {team.membersCount} Members
                </span>
              </div>

              <div>
                <span style={{ fontSize: 11.5, color: "var(--text-3)", display: "block", marginBottom: 4 }}>
                  Assigned Jira Project Boards:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {team.projects.map((p) => (
                    <span key={p} className="badge role font-mono" style={{ fontSize: 11 }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => showToast(`Opening roster for ${team.name}`)}
              >
                View Members
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => showToast(`✓ Added board mapping for ${team.name}`)}
              >
                Assign Board
              </button>
            </div>
          </div>
        ))}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
