'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  History,
  ShieldAlert,
  Building2,
  Layers,
  FolderTree,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const Sidebar = () => {
  const pathname = usePathname();

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedWidth = localStorage.getItem('iam-sidebar-width');
        if (savedWidth) return parseInt(savedWidth, 10);
      } catch (e) {}
    }
    return 240;
  });

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCollapsed = localStorage.getItem('iam-sidebar-collapsed');
        const savedWidth = localStorage.getItem('iam-sidebar-width');
        if (savedCollapsed === 'true' || (savedWidth && parseInt(savedWidth, 10) <= 80)) {
          return true;
        }
      } catch (e) {}
    }
    return false;
  });

  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem('iam-sidebar-width');
      const savedCollapsed = localStorage.getItem('iam-sidebar-collapsed');
      if (savedCollapsed === 'true' || (savedWidth && parseInt(savedWidth, 10) <= 80)) {
        setIsCollapsed(true);
        setSidebarWidth(64);
        document.documentElement.dataset.sidebarCollapsed = 'true';
      } else if (savedWidth) {
        const w = parseInt(savedWidth, 10);
        setSidebarWidth(w);
        setIsCollapsed(false);
        delete document.documentElement.dataset.sidebarCollapsed;
      }
    } catch (e) {}
  }, []);

  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
    const startX = mouseDownEvent.clientX;
    const startWidth = isCollapsed ? 64 : sidebarWidth;

    const doDrag = (mouseMoveEvent: MouseEvent) => {
      const calculatedWidth = startWidth + (mouseMoveEvent.clientX - startX);
      const clampedWidth = Math.min(360, Math.max(64, calculatedWidth));
      
      if (clampedWidth <= 88) {
        setIsCollapsed(true);
        setSidebarWidth(64);
        try {
          localStorage.setItem('iam-sidebar-collapsed', 'true');
          localStorage.setItem('iam-sidebar-width', '64');
          document.documentElement.dataset.sidebarCollapsed = 'true';
        } catch (e) {}
      } else {
        setIsCollapsed(false);
        setSidebarWidth(clampedWidth);
        try {
          localStorage.setItem('iam-sidebar-collapsed', 'false');
          localStorage.setItem('iam-sidebar-width', String(clampedWidth));
          delete document.documentElement.dataset.sidebarCollapsed;
        } catch (e) {}
      }
    };

    const stopDrag = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', doDrag);
      window.removeEventListener('mouseup', stopDrag);
    };

    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);
  };

  const resetSidebarWidth = () => {
    setSidebarWidth(240);
    setIsCollapsed(false);
    try {
      localStorage.setItem('iam-sidebar-width', '240');
      localStorage.setItem('iam-sidebar-collapsed', 'false');
      delete document.documentElement.dataset.sidebarCollapsed;
    } catch (e) {}
  };

  const navItems = [
    { href: '/', label: 'Dashboard Overview', icon: LayoutDashboard, count: null },
    { href: '/people', label: 'People & Access Matrix', icon: Users, count: '50' },
    { href: '/services', label: 'App Entitlements', icon: Layers, count: '5' },
    { href: '/org-units', label: 'Organizational Units', icon: FolderTree, count: '6' },
    { href: '/policies', label: 'Security Policies', icon: ShieldCheck, count: null },
    { href: '/drift', label: 'Drift Detection', icon: ShieldAlert, count: '4' },
    { href: '/audit-logs', label: 'Audit Chronicle', icon: History, count: null },
  ];

  return (
    <aside
      className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{ width: isCollapsed ? 64 : sidebarWidth }}
      suppressHydrationWarning
    >
      <div className="brand">
        <div className="brand-logo" title="Google Workspace">G</div>
        <div className="brand-text">
          <div className="brand-name">Google Workspace</div>
          <div className="brand-sub">Access &amp; Provisioning</div>
        </div>
      </div>

      <nav className="nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.count && (
                <span className={`nav-count ${item.href === '/drift' ? 'warn' : isActive ? 'primary' : ''}`}>
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <ThemeToggle />

        <div className="user-card" title="company.com (Workspace Active)">
          <div
            className="avatar"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-2))' }}
          >
            <Building2 size={15} color="#fff" />
          </div>
          <div className="user-meta">
            <div className="user-email">company.com</div>
            <div className="user-roles">Workspace Active</div>
          </div>
        </div>
      </div>

      {/* Drag Resizer Edge */}
      <div
        className="sidebar-resizer"
        onMouseDown={startResizing}
        onDoubleClick={resetSidebarWidth}
        title="Drag to resize / minimize sidebar (Double click to reset)"
      >
        <div className="resizer-handle" />
      </div>
    </aside>
  );
};
