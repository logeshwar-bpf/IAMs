"use client";

import React, { useState, useEffect } from "react";
import { X, Layers, LayoutDashboard, Plus, Trash2, Search, ShieldCheck, Sparkles } from "lucide-react";
import Avatar from "./Avatar";
import { matchesQuery } from "../lib/format";

export default function UserDrawer({ user, projects, onClose, onToggleAccess }) {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!user) return null;

  // Filter projects user has access to (always live)
  const userProjectIds = user.accessibleProjectIds || [];
  
  // Calculate total accessible dashboards for this user across all granted projects
  const totalAccessibleDashboards = projects
    .filter((proj) => userProjectIds.includes(proj.id))
    .reduce((sum, proj) => sum + (proj.accessibleDashboards || 0), 0);

  const filteredProjects = projects.filter(
    (proj) =>
      matchesQuery(proj.name, searchTerm) ||
      matchesQuery(proj.key, searchTerm) ||
      matchesQuery(proj.category, searchTerm) ||
      matchesQuery(proj.description, searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative z-10 w-full max-w-2xl h-full bg-[var(--bg)] border-l border-[var(--border)] p-6 flex flex-col shadow-2xl overflow-y-auto">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} bg={user.avatarBg} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--primary)] font-bold">{user.role}</span>
                <span className="badge">User ID: {user.id}</span>
              </div>
              <h2 className="text-xl font-bold text-[var(--text)] mt-0.5">{user.name}</h2>
              <p className="text-xs text-[var(--text-3)]">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            aria-label="Close user drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Summary Stats */}
        <div className="mt-5 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] grid grid-cols-2 gap-4 text-xs shadow-sm">
          <div className="p-3 rounded-xl bg-[var(--bg-elev)] border border-[var(--border)] flex items-center gap-3">
            <div className="stat-chip primary">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[var(--text-3)] text-[11px] block">Accessible Projects</span>
              <p className="text-base font-extrabold text-[var(--text)] mt-0.5">
                {userProjectIds.length} <span className="text-xs font-semibold text-[var(--text-3)]">Projects</span>
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-elev)] border border-[var(--border)] flex items-center gap-3">
            <div className="stat-chip ok">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[var(--text-3)] text-[11px] block">Accessible Dashboards</span>
              <p className="text-base font-extrabold text-[var(--text)] mt-0.5">
                {totalAccessibleDashboards} <span className="text-xs font-semibold text-[var(--text-3)]">Views</span>
              </p>
            </div>
          </div>
        </div>

        {/* Access Matrix Search Header */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
              Project Access Matrix
            </h3>
            <p className="text-xs text-[var(--text-3)]">Toggle project authorization for {user.name}</p>
          </div>

          <div className="search">
            <Search className="w-3.5 h-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search project..."
            />
          </div>
        </div>

        {/* Projects Permission Matrix List */}
        <div className="mt-4 flex-1 space-y-3">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => {
              const hasAccess = userProjectIds.includes(project.id);

              return (
                <div
                  key={project.id}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between shadow-sm ${
                    hasAccess
                      ? "bg-[var(--card)] border-[var(--primary)]"
                      : "bg-[var(--bg-elev)] border-[var(--border)] opacity-80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`stat-chip ${hasAccess ? "primary" : "ghost"}`}>
                      <Layers className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="badge role font-mono">{project.key}</span>
                        <span className="badge">{project.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--text)] mt-0.5">{project.name}</h4>
                      <p className="text-xs text-[var(--text-3)] flex items-center gap-1 mt-0.5">
                        <LayoutDashboard className="w-3 h-3 text-[var(--info)]" />
                        Grants access to <strong>{project.accessibleDashboards}</strong> dashboards
                      </p>
                    </div>
                  </div>

                  {/* Grant / Revoke Toggle Button */}
                  {hasAccess ? (
                    <button
                      onClick={() => onToggleAccess(user.id, project.id, "REVOKE")}
                      className="btn btn-danger btn-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Revoke</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onToggleAccess(user.id, project.id, "GRANT")}
                      className="btn btn-primary btn-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Grant Access</span>
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[var(--text-3)] bg-[var(--card)] rounded-2xl border border-dashed border-[var(--border)]">
              No projects match filter &quot;{searchTerm}&quot;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-3)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <span>Changes persist immediately to Jira Audit Log</span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
}
