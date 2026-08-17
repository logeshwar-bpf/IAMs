'use client';

import { useEffect, useState } from 'react';
import { Icon } from './Icons';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('iam-theme');
      if (savedTheme === 'dark') {
        document.documentElement.dataset.theme = 'dark';
        setDark(true);
      } else {
        delete document.documentElement.dataset.theme;
        setDark(false);
      }
    } catch (e) {}
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    try {
      if (next) {
        document.documentElement.dataset.theme = 'dark';
        localStorage.setItem('iam-theme', 'dark');
      } else {
        delete document.documentElement.dataset.theme;
        localStorage.setItem('iam-theme', 'light');
      }
    } catch (e) {}
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      type="button"
      title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div
        className="theme-toggle-icon-box"
        style={{
          background: dark ? 'rgba(245, 158, 11, 0.15)' : 'var(--primary-soft)',
        }}
      >
        <Icon
          name={dark ? 'sun' : 'moon'}
          size={15}
          style={{ color: dark ? '#f59e0b' : 'var(--primary)', flexShrink: 0 }}
        />
      </div>
      <span style={{ fontWeight: 600, fontSize: 13, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {dark ? 'Dark Mode' : 'Light Mode'}
      </span>
    </button>
  );
}
