'use client';

import React, { useState } from 'react';
import { AlertCircle, Key } from 'lucide-react';
import { UserSession } from '@/lib/auth';

interface AuthPortalProps {
  onLoginSuccess: (user: UserSession) => void;
}

export default function AuthPortal({ onLoginSuccess }: AuthPortalProps) {
  const [activeTab, setActiveTab] = useState<'credentials' | 'google'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCredentialsLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuthLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || 'logeshwar2525@gmail.com',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google OAuth failed');

      onLoginSuccess(data.user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Google OAuth failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="signin-card">
        {/* Brand logo */}
        <div className="brand-logo" style={{ width: 52, height: 52, fontSize: 24, borderRadius: 16 }}>
          ◆
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>GCP IAM Console</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600, marginTop: 2 }}>
            Google Cloud Identity & Access Management Engine
          </div>
        </div>

        {/* Tab switchers */}
        <div style={{ display: 'flex', gap: 8, width: '100%', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`btn btn-sm ${activeTab === 'credentials' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Email & Password
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`btn btn-sm ${activeTab === 'google' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Google OAuth 2.0
          </button>
        </div>

        {error && (
          <div className="note" style={{ background: 'var(--risk-soft)', color: 'var(--risk)', margin: 0, width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'credentials' ? (
          <form onSubmit={handleCredentialsLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label className="field" style={{ margin: 0 }}>
              <span>Account Email</span>
              <input
                type="email"
                required
                placeholder="logeshwar2525@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="field" style={{ margin: 0 }}>
              <span>Password</span>
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? <><span className="spinner" /> Authenticating…</> : <><Key style={{ width: 15, height: 15 }} /> Sign In with JWT</>}
            </button>
          </form>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--text-2)', textAlign: 'center', margin: 0 }}>
              Authenticate via Google Cloud OAuth 2.0 single sign-on.
            </p>
            <button
              type="button"
              onClick={handleGoogleOAuthLogin}
              disabled={loading}
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              {loading ? 'Connecting Google OAuth...' : 'Sign in with Google OAuth'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
