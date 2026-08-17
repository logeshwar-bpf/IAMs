'use client';

import React, { useEffect, useState } from 'react';
import AuthPortal from '@/components/AuthPortal';
import Dashboard from '@/components/Dashboard';
import { UserSession } from '@/lib/auth';
import { Shield } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [gcpTokenConfigured, setGcpTokenConfigured] = useState(false);
  const [gcpTokenPreview, setGcpTokenPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();

      if (res.ok && data.authenticated) {
        setUser(data.user);
        setGcpTokenConfigured(Boolean(data.gcpTokenConfigured));
        setGcpTokenPreview(data.gcpTokenPreview);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (loggedInUser: UserSession) => {
    setUser(loggedInUser);
    checkSession();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07090e' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '1rem',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            marginBottom: '1rem'
          }}>
            <Shield style={{ width: '28px', height: '28px', color: '#60a5fa' }} />
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>
            Verifying GCP IAM Security Session...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPortal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Dashboard
      user={user}
      gcpTokenConfigured={gcpTokenConfigured}
      gcpTokenPreview={gcpTokenPreview}
      onLogout={handleLogout}
    />
  );
}
