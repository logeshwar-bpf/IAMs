'use client';

import { useActionState } from 'react';
import { login } from './actions';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="center-screen">
      <div className="signin-card">
        {/* Brand logo */}
        <div
          style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 22,
            boxShadow: '0 4px 16px rgba(91,91,214,.4)',
          }}
        >
          ◆
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>Claude Plans</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600, marginTop: 2 }}>
            Anthropic Internal Admin Portal
          </div>
        </div>

        {state?.error && (
          <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, color: '#ef4444', fontSize: 13, textAlign: 'center' }}>
            {state.error}
          </div>
        )}

        <form action={formAction} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label className="field">
            <span>Username</span>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="admin"
              required
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>

          <button type="submit" disabled={isPending} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}