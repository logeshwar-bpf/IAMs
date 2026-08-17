"use client";

import React, { useState, useEffect } from "react";
import { X, Layers, Users, LayoutDashboard, Shield, Plus, Trash2, Search, Sparkles } from "lucide-react";
import Avatar from "./Avatar";
import { matchesQuery } from "../lib/format";

export default function ProjectDrawer({ project, people, onClose, onToggleAccess }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("members"); // 'members' | 'add_member'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  // Filter assigned members
  const assignedUsers = people.filter((p) => p.accessibleProjectIds?.includes(project.id));
  const unassignedUsers = people.filter((p) => !p.accessibleProjectIds?.includes(project.id));

  const filteredAssigned = assignedUsers.filter(
    (u) => matchesQuery(u.name, searchTerm) || matchesQuery(u.email, searchTerm) || matchesQuery(u.role, searchTerm)
  );

  const filteredUnassigned = unassignedUsers.filter(
    (u) => matchesQuery(u.name, searchTerm) || matchesQuery(u.email, searchTerm) || matchesQuery(u.role, searchTerm)
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
            <div className="brand-logo">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge role font-mono">{project.key}</span>
                <span className="badge">{project.category}</span>
              </div>
              <h2 className="text-xl font-bold mt-1 text-[var(--text)]">{project.name}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            aria-label="Close project drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Project Description & Specs */}
        <div className="mt-5 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-3 shadow-sm">
          <p className="text-xs text-[var(--text-2)] leading-relaxed">{project.description}</p>
          
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--border)] text-xs">
            <div className="flex flex-col">
              <span className="text-[var(--text-3)] text-[11px]">Assigned People</span>
              <span className="font-bold text-[var(--text)] flex items-center gap-1.5 mt-0.5">
                <Users className="w-3.5 h-3.5 text-[var(--primary)]" />
                {assignedUsers.length} Users
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[var(--text-3)] text-[11px]">Dashboard Access</span>
              <span className="font-bold text-[var(--text)] flex items-center gap-1.5 mt-0.5">
                <LayoutDashboard className="w-3.5 h-3.5 text-[var(--info)]" />
                {project.accessibleDashboards} Views
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[var(--text-3)] text-[11px]">Security Level</span>
              <span className="font-semibold text-[var(--primary)] flex items-center gap-1 mt-0.5">
                <Shield className="w-3.5 h-3.5" />
                {project.securityLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Tab & Search Navigation */}
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("members")}
              className={`btn btn-sm ${activeTab === "members" ? "btn-primary" : "btn-ghost"}`}
            >
              Assigned People ({assignedUsers.length})
            </button>
            <button
              onClick={() => setActiveTab("add_member")}
              className={`btn btn-sm ${activeTab === "add_member" ? "btn-primary" : "btn-ghost"}`}
            >
              Grant New Access ({unassignedUsers.length})
            </button>
          </div>

          {/* Search */}
          <div className="search">
            <Search className="w-3.5 h-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user..."
            />
          </div>
        </div>

        {/* Member Access List */}
        <div className="mt-4 flex-1 space-y-3">
          {activeTab === "members" ? (
            filteredAssigned.length > 0 ? (
              filteredAssigned.map((user) => (
                <div
                  key={user.id}
                  className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} bg={user.avatarBg} size="sm" />
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text)]">{user.name}</h4>
                      <p className="text-[11px] text-[var(--text-3)]">{user.email} • <span className="text-[var(--primary)]">{user.role}</span></p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleAccess(user.id, project.id, "REVOKE")}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke Access</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[var(--text-3)] bg-[var(--card)] rounded-2xl border border-dashed border-[var(--border)]">
                {searchTerm ? `No assigned users match "${searchTerm}".` : "No users assigned to this project yet."}
              </div>
            )
          ) : (
            filteredUnassigned.length > 0 ? (
              filteredUnassigned.map((user) => (
                <div
                  key={user.id}
                  className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} bg={user.avatarBg} size="sm" />
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text)]">{user.name}</h4>
                      <p className="text-[11px] text-[var(--text-3)]">{user.email} • {user.role}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleAccess(user.id, project.id, "GRANT")}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Grant Access</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[var(--text-3)] bg-[var(--card)] rounded-2xl border border-dashed border-[var(--border)]">
                {searchTerm ? `No unassigned users match "${searchTerm}".` : "All users currently have access to this project."}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-3)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <span>Audit log automatically synced on access updates</span>
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
