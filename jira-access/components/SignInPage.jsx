"use client";

import React, { useState } from "react";
import { 
  Shield, 
  KeyRound, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Lock, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Database, 
  Sparkles,
  History,
  CheckCircle2,
  Fingerprint
} from "lucide-react";

export default function SignInPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || "Invalid username or password");
      }
    } catch (err) {
      setError("Login request failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      <div className="auth-split-container">
        
        {/* ── Left Column: Sign In Card ── */}
        <div className="auth-card">
          <div>
            {/* Brand Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 19,
                  boxShadow: '0 4px 16px rgba(79, 70, 229, 0.4)',
                  flexShrink: 0,
                }}
              >
                ◆
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-.02em', color: 'var(--text)' }}>
                  Jira Access
                </h1>
                <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, margin: '2px 0 0' }}>
                  Bipolar Factory Provisioning Console
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 22 }}>
              <div className="pill primary" style={{ width: 'fit-content', gap: 6, fontSize: 11 }}>
                <Shield style={{ width: 12, height: 12 }} />
                <span>Single Admin Authentication</span>
              </div>
              <h2 style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-.02em', margin: '4px 0 0', color: 'var(--text)' }}>
                Sign In to Provisioning
              </h2>
              <p style={{ fontSize: 12.5, color: 'var(--text-2)', margin: 0, lineHeight: 1.4 }}>
                Authorized administrator portal for project provisioning and user access control.
              </p>
            </div>

            {/* Single User Lock Notice */}
            <div style={{
              padding: '11px 14px',
              borderRadius: 12,
              background: 'var(--primary-soft)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
            }}>
              <Lock style={{ width: 14, height: 14, color: 'var(--primary)', flexShrink: 0 }} />
              <div style={{ fontSize: 11.5, color: 'var(--text-2)' }}>
                Only <strong style={{ color: 'var(--primary)' }}>admin@jira.internal</strong> has master authorization to sign in.
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'var(--risk-soft)',
                  border: '1px solid var(--risk)',
                  color: 'var(--risk)',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {/* Email Field */}
              <div className="field" style={{ margin: 0 }}>
                <span>Administrator Email</span>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail
                    style={{
                      position: 'absolute',
                      left: 12,
                      width: 15,
                      height: 15,
                      color: 'var(--text-3)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@jira.internal"
                    required
                    autoComplete="email"
                    style={{ paddingLeft: 36, fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="field" style={{ margin: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ margin: 0 }}>Security Passcode</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Master Secret Key</span>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <KeyRound
                    style={{
                      position: 'absolute',
                      left: 12,
                      width: 15,
                      height: 15,
                      color: 'var(--text-3)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
                    style={{ paddingLeft: 36, fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px 18px', marginTop: 6, fontWeight: 700 }}
              >
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="spinner" />
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Authenticate &amp; Launch Console</span>
                    <ArrowRight style={{ width: 15, height: 15 }} />
                  </span>
                )}
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-3)', fontWeight: 600, paddingTop: 14 }}>
            <Lock style={{ width: 12, height: 12 }} />
            <span>Single-User Master Vault Protection</span>
          </div>
        </div>

        {/* ── Right Column: Grand Orbital Circle Showcase ── */}
        <div className="auth-showcase-card">
          {/* Header */}
          <div>
            <div className="pill info" style={{ width: 'fit-content', margin: '0 auto 10px', gap: 6, fontSize: 11 }}>
              <Sparkles style={{ width: 12, height: 12 }} />
              <span>Jira Provisioning Engine</span>
            </div>
            <h3 style={{ fontSize: 21, fontWeight: 800, margin: '0 0 6px', color: 'var(--text)', letterSpacing: '-.02em' }}>
              Unified Access Governance
            </h3>
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', margin: 0, lineHeight: 1.45, maxWidth: 360 }}>
              Enterprise access control matrix and automated task provisioning console.
            </p>
          </div>

          {/* Grand Orbital Graphic */}
          <div className="orbital-showcase">
            <div className="orbital-glow-ambient" />
            <div className="orbital-ring-outer" />
            <div className="orbital-ring-mid" />
            <div className="orbital-ring-inner" />

            {/* Orbiting Satellite Pills */}
            <div className="orbital-satellite-badge satellite-pos-top">
              <Layers style={{ width: 13, height: 13, color: 'var(--primary)' }} />
              <span>Task Projects</span>
            </div>

            <div className="orbital-satellite-badge satellite-pos-right">
              <ShieldCheck style={{ width: 13, height: 13, color: '#10b981' }} />
              <span>Single-User Vault</span>
            </div>

            <div className="orbital-satellite-badge satellite-pos-bottom">
              <History style={{ width: 13, height: 13, color: '#f59e0b' }} />
              <span>Audit Trail</span>
            </div>

            <div className="orbital-satellite-badge satellite-pos-left">
              <Cpu style={{ width: 13, height: 13, color: '#8b5cf6' }} />
              <span>Access Matrix</span>
            </div>

            {/* Central Core Emblem */}
            <div className="orbital-core-card">
              <ShieldCheck style={{ width: 42, height: 42 }} />
              <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.08em', marginTop: 4 }}>
                PROVISION
              </span>
            </div>
          </div>

          {/* Non-Clickable Bottom Security Specs */}
          <div className="showcase-chips-row">
            <div className="showcase-chip">
              <CheckCircle2 style={{ width: 13, height: 13, color: '#10b981' }} />
              <span>Enterprise Zero-Trust</span>
            </div>
            <div className="showcase-chip">
              <Fingerprint style={{ width: 13, height: 13, color: 'var(--primary)' }} />
              <span>256-Bit Master Key</span>
            </div>
            <div className="showcase-chip">
              <History style={{ width: 13, height: 13, color: '#f59e0b' }} />
              <span>Real-Time Audit</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
