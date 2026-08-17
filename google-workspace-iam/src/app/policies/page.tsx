'use client';

import React, { useState } from 'react';
import { Topbar } from '@/components/Topbar';
import {
  ShieldCheck,
  Lock,
  Key,
  Globe,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  FileCheck
} from 'lucide-react';

interface PolicyRule {
  id: string;
  title: string;
  category: string;
  icon: any;
  enabled: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'RECOMMENDED';
  description: string;
}

export default function PoliciesPage() {
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const [policies, setPolicies] = useState<PolicyRule[]>([
    {
      id: 'pol-2fa',
      title: 'Mandatory 2-Step Verification (2FA)',
      category: 'Authentication',
      icon: Key,
      enabled: true,
      severity: 'CRITICAL',
      description: 'Enforces hardware security keys or Google Authenticator prompts across all 50 directory users.',
    },
    {
      id: 'pol-drive-ext',
      title: 'External Drive Link Sharing Restrictions',
      category: 'Data Loss Prevention',
      icon: Globe,
      enabled: true,
      severity: 'HIGH',
      description: 'Blocks public "Anyone with link" Drive sharing outside of authorized company domain users.',
    },
    {
      id: 'pol-gemini-shield',
      title: 'Gemini AI Enterprise Zero-Retention Shield',
      category: 'AI Governance',
      icon: Sparkles,
      enabled: true,
      severity: 'CRITICAL',
      description: 'Guarantees employee prompts and workspace documents are never logged or used to train public LLMs.',
    },
    {
      id: 'pol-session-timeout',
      title: 'Admin Web Session Expiry (12 Hours)',
      category: 'Access Control',
      icon: Clock,
      enabled: true,
      severity: 'RECOMMENDED',
      description: 'Forces re-authentication when Google Workspace Admin Console sessions remain idle for > 12 hours.',
    },
    {
      id: 'pol-oauth-whitelist',
      title: 'Third-Party OAuth API Scope Whitelisting',
      category: 'API Security',
      icon: Lock,
      enabled: false,
      severity: 'HIGH',
      description: 'Restricts third-party web apps from requesting Gmail and Drive API access without admin approval.',
    },
    {
      id: 'pol-pass-rotation',
      title: '90-Day Password Renewal Policy',
      category: 'Authentication',
      icon: ShieldCheck,
      enabled: false,
      severity: 'RECOMMENDED',
      description: 'Prompts users to reset credentials every 90 days with minimum 16-character length requirements.',
    },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleTogglePolicy = (id: string) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
    showToast('✓ Security policy setting updated & deployed to Google Workspace');
  };

  const filteredPolicies = policies.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar
        title="Security & Compliance Policies"
        subtitle="Enforce domain-wide authentication rules, DLP restrictions, and AI safety baselines"
        searchValue={search}
        onSearchChange={setSearch}
      />

      <div className="content">
        {/* Top Summary Banner */}
        <div className="card" style={{ padding: '24px 28px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="stat-chip ok" style={{ width: '48px', height: '48px', borderRadius: '14px' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                Domain Security Posture: Compliant (83%)
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--text-2)' }}>
                4 of 6 core Google Workspace security policies actively enforced across organization.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => showToast('↻ Audited security policy telemetry against Google Cloud Security Command Center')}
            >
              <RefreshCw size={14} />
              Audit Compliance
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setPolicies((prev) => prev.map((p) => ({ ...p, enabled: true })));
                showToast('✓ All recommended security baselines enforced domain-wide');
              }}
            >
              <Lock size={14} />
              Enforce All Baselines
            </button>
          </div>
        </div>

        {/* Policies Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredPolicies.map((policy) => {
            const Icon = policy.icon;

            return (
              <div key={policy.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: policy.enabled ? 'var(--ok-soft)' : 'var(--warn-soft)', color: policy.enabled ? 'var(--ok)' : 'var(--warn)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800 }}>{policy.title}</h4>
                      <span className="badge" style={{ fontSize: '11px', marginTop: '4px' }}>{policy.category}</span>
                    </div>
                  </div>

                  <span className={`pill ${policy.enabled ? 'approved' : 'rejected'}`} style={{ fontSize: '11.5px' }}>
                    {policy.enabled ? 'ENFORCED' : 'DISABLED'}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
                  {policy.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  <span className={`sev ${policy.severity === 'CRITICAL' ? 'high' : 'medium'}`} style={{ fontSize: '11px' }}>
                    {policy.severity}
                  </span>

                  <button
                    className={`btn ${policy.enabled ? 'btn-ghost' : 'btn-primary'} btn-sm`}
                    onClick={() => handleTogglePolicy(policy.id)}
                  >
                    {policy.enabled ? 'Disable Policy' : 'Enforce Policy'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
