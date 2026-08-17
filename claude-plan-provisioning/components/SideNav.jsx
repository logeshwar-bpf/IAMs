'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './Icons';

/**
 * NAV_ITEMS mirrors the Global IAM sidebar structure,
 * adapted for Claude Plan Provisioning routes.
 */
const NAV_ITEMS = [
  { href: '/',            label: 'Dashboard',          icon: 'dashboard' },
  { href: '/users',       label: 'Users & Provisioning', icon: 'users' },
  { href: '/plans',       label: 'Claude Plans',        icon: 'plans' },
  { href: '/drift',       label: 'Drift Alerts',        icon: 'drift' },
  { href: '/audit-logs',  label: 'Audit Log',           icon: 'audit' },
];

export function SideNav({ counts = {} }) {
  const pathname = usePathname() ?? '/';

  return (
    <nav className="nav">
      {NAV_ITEMS.map((n) => {
        const active = n.href === '/' ? pathname === '/' : pathname.startsWith(n.href);
        const count = counts[n.href];
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`nav-item${active ? ' active' : ''}`}
          >
            <Icon name={n.icon} size={18} />
            <span>{n.label}</span>
            {count > 0 && (
              <span className={`nav-count ${n.href === '/drift' ? 'risk' : 'warn'}`}>
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
