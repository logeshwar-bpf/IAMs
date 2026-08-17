'use client';

import { SideNav } from './SideNav';
import { ThemeToggle } from './ThemeToggle';

/**
 * AdminShell — Global IAM-style sidebar shell.
 * Wraps all pages with .app > .sidebar + .main layout.
 */
export default function AdminShell({ children, driftCount = 0, pendingCount = 0 }) {
  const counts = {
    '/drift': driftCount,
  };

  return (
    <div className="app">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="brand">
          <div className="brand-logo">◆</div>
          <div>
            <div className="brand-name">Claude Plans</div>
            <div className="brand-sub">Anthropic Internal</div>
          </div>
        </div>

        {/* Navigation */}
        <SideNav counts={counts} />

        {/* Footer */}
        <div className="sidebar-foot">
          <ThemeToggle />
          <div className="user-card">
            <div
              className="avatar"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-2))' }}
            >
              A
            </div>
            <div className="user-meta">
              <div className="user-email">admin@anthropic.internal</div>
              <div className="user-roles">super_admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main">{children}</main>
    </div>
  );
}
