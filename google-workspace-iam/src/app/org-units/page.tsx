'use client';

import React, { useState } from 'react';
import { Topbar } from '@/components/Topbar';
import {
  Building2,
  Users,
  FolderTree,
  Plus,
  ChevronRight,
  Shield,
  Sparkles,
  Mail,
  HardDrive,
  Video,
  CheckCircle2,
  Sliders,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface OrgUnit {
  id: string;
  name: string;
  path: string;
  memberCount: number;
  lead: string;
  defaultServices: string[];
  riskLevel: 'LOW' | 'STANDARD' | 'HIGH';
  description: string;
}

export default function OrgUnitsPage() {
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([
    {
      id: 'ou-eng',
      name: 'Engineering & R&D',
      path: '/Engineering',
      memberCount: 18,
      lead: 'Devin Vance',
      defaultServices: ['Gmail', 'Drive', 'Meet', 'Gemini AI Pro'],
      riskLevel: 'STANDARD',
      description: 'Core software developers, architects, and site reliability engineers.',
    },
    {
      id: 'ou-prod',
      name: 'Product & Design',
      path: '/Product',
      memberCount: 8,
      lead: 'Priya Sharma',
      defaultServices: ['Gmail', 'Drive', 'Meet', 'Gemini AI Pro'],
      riskLevel: 'LOW',
      description: 'Product managers, UX researchers, and UI systems designers.',
    },
    {
      id: 'ou-sec',
      name: 'Security & Cloud Infra',
      path: '/Security',
      memberCount: 6,
      lead: 'Alex Johnson',
      defaultServices: ['Gmail', 'Drive', 'Meet', 'Gemini AI Pro', 'YouTube Work'],
      riskLevel: 'HIGH',
      description: 'Information security, IAM operations, and infrastructure custodians.',
    },
    {
      id: 'ou-sales',
      name: 'Sales & Commercial',
      path: '/Sales',
      memberCount: 10,
      lead: 'Elena Rostova',
      defaultServices: ['Gmail', 'Drive', 'Meet'],
      riskLevel: 'LOW',
      description: 'Account executives, client success, and enterprise partnerships.',
    },
    {
      id: 'ou-mktg',
      name: 'Marketing & Media',
      path: '/Marketing',
      memberCount: 5,
      lead: 'Marcus Brody',
      defaultServices: ['Gmail', 'Drive', 'Meet', 'YouTube Work'],
      riskLevel: 'LOW',
      description: 'Brand campaigns, developer relations, and content production.',
    },
    {
      id: 'ou-exec',
      name: 'Executive & Legal Operations',
      path: '/Executive',
      memberCount: 3,
      lead: 'Logeshwar Admin',
      defaultServices: ['Gmail', 'Drive', 'Meet', 'Gemini AI Pro'],
      riskLevel: 'HIGH',
      description: 'Senior management, corporate counsel, and financial controllers.',
    },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredOUs = orgUnits.filter(
    (ou) =>
      ou.name.toLowerCase().includes(search.toLowerCase()) ||
      ou.path.toLowerCase().includes(search.toLowerCase()) ||
      ou.lead.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar
        title="Organizational Units & Department Hierarchy"
        subtitle="Structure Google Workspace directory groups and automatic app baseline policies"
        searchValue={search}
        onSearchChange={setSearch}
      />

      <div className="content">
        {/* Banner */}
        <div className="card" style={{ padding: '24px 28px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="stat-chip info" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(14, 165, 233, 0.15)', color: '#0EA5E9' }}>
              <FolderTree size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                Hierarchical Organizational Units (OUs)
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--text-2)' }}>
                6 active OUs mapping 50 enterprise users to automatic Google service policies.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => showToast('↻ Synced OUs with Google Workspace Admin directory')}
            >
              <RefreshCw size={14} />
              Sync Directory OUs
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => showToast('✓ New Organizational Unit creation wizard initiated')}
            >
              <Plus size={14} />
              Create Sub-OU
            </button>
          </div>
        </div>

        {/* OUs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredOUs.map((ou) => (
            <div key={ou.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{ou.name}</h4>
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--primary)', fontWeight: 700, marginTop: '4px' }}>
                    {ou.path}
                  </div>
                </div>

                <span className={`badge ${ou.riskLevel === 'HIGH' ? 'role' : 'primary'}`} style={{ fontSize: '11px' }}>
                  {ou.riskLevel} PRIVILEGE
                </span>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
                {ou.description}
              </p>

              {/* OU Meta */}
              <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <span style={{ color: 'var(--text-3)' }}>Assigned Members</span>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>
                    <Users size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    {ou.memberCount} Employees
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <span style={{ color: 'var(--text-3)' }}>OU Lead</span>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{ou.lead}</span>
                </div>

                <div style={{ paddingTop: '6px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-3)', display: 'block', marginBottom: '6px' }}>
                    Auto-Provisioned Service Baseline:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {ou.defaultServices.map((svc) => (
                      <span key={svc} className="badge" style={{ fontSize: '11px', background: 'var(--card)' }}>
                        ✓ {svc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => showToast(`↻ Reapplied ${ou.name} baseline policy across ${ou.memberCount} members`)}
                >
                  Enforce Baseline
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => showToast(`Opening ${ou.name} membership list`)}
                >
                  View Roster
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
