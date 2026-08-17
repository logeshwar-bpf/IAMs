'use client';

import React, { useState } from 'react';
import { Topbar } from '@/components/Topbar';
import {
  Layers,
  Sparkles,
  Mail,
  HardDrive,
  Video,
  PlaySquare,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Users,
  Shield,
  Sliders,
  Check,
  Search
} from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  icon: any;
  color: string;
  bg: string;
  assignedUsers: number;
  totalSeats: number;
  licenseTier: string;
  status: 'ACTIVE' | 'RESTRICTED';
  description: string;
}

export default function ServicesPage() {
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [toast, setToast] = useState<string | null>(null);

  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: 'gmail',
      name: 'Gmail Workspace Enterprise',
      category: 'Communication',
      icon: Mail,
      color: '#EA4335',
      bg: 'rgba(234, 67, 53, 0.12)',
      assignedUsers: 48,
      totalSeats: 50,
      licenseTier: 'Enterprise Plus',
      status: 'ACTIVE',
      description: 'Corporate email routing, custom domains, DLP compliance & spam filters.',
    },
    {
      id: 'drive',
      name: 'Google Drive & Docs Cloud',
      category: 'Storage & Collaboration',
      icon: HardDrive,
      color: '#34A853',
      bg: 'rgba(52, 168, 83, 0.12)',
      assignedUsers: 44,
      totalSeats: 50,
      licenseTier: 'Unlimited Cloud Storage',
      status: 'ACTIVE',
      description: 'Shared Team Drives, fine-grained access control and encrypted document storage.',
    },
    {
      id: 'meet',
      name: 'Google Meet HD Conferencing',
      category: 'Audio / Video',
      icon: Video,
      color: '#4285F4',
      bg: 'rgba(66, 133, 244, 0.12)',
      assignedUsers: 38,
      totalSeats: 50,
      licenseTier: '1080p Stream & Recording',
      status: 'ACTIVE',
      description: 'Encrypted meetings, noise cancellation, breakout rooms, and live transcripts.',
    },
    {
      id: 'youtube',
      name: 'YouTube Work Enterprise',
      category: 'Media & Internal Video',
      icon: PlaySquare,
      color: '#FBBC04',
      bg: 'rgba(251, 188, 4, 0.15)',
      assignedUsers: 24,
      totalSeats: 50,
      licenseTier: 'Domain-Restricted Channels',
      status: 'ACTIVE',
      description: 'Internal company training broadcasts, town hall archives, and unlisted team video hosting.',
    },
    {
      id: 'gemini',
      name: 'Gemini 1.5 Pro AI Enterprise',
      category: 'Generative AI & LLM',
      icon: Sparkles,
      color: 'var(--primary)',
      bg: 'var(--primary-soft)',
      assignedUsers: 18,
      totalSeats: 50,
      licenseTier: 'Enterprise AI Add-on',
      status: 'ACTIVE',
      description: 'Integrated workspace generative AI with zero training on customer business data.',
    },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleStatus = (id: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'ACTIVE' ? 'RESTRICTED' : 'ACTIVE' }
          : s
      )
    );
    showToast('✓ Updated service entitlement status across domain');
  };

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar
        title="Workspace App Services & Entitlements"
        subtitle="Manage seat allocations, quotas, and licensing for Google Workspace core apps"
        searchValue={search}
        onSearchChange={setSearch}
      />

      <div className="content">
        {/* Top Summary Banner */}
        <div className="card" style={{ padding: '24px 28px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="stat-chip primary" style={{ width: '48px', height: '48px', borderRadius: '14px' }}>
              <Layers size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                Enterprise Google Workspace License Portfolio
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--text-2)' }}>
                5 core services active across 50 directory employees with centralized IAM governance.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => showToast('↻ Refreshed Google Admin SDK License status')}
            >
              <RefreshCw size={14} />
              Sync Licenses
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => showToast('✓ All available seats verified & synchronized')}
            >
              <Shield size={14} />
              Enforce Entitlement Baselines
            </button>
          </div>
        </div>

        {/* Service Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          {filteredServices.map((svc) => {
            const Icon = svc.icon;
            const pct = Math.round((svc.assignedUsers / svc.totalSeats) * 100);

            return (
              <div key={svc.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: svc.bg, color: svc.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800 }}>{svc.name}</h4>
                      <span className="badge" style={{ fontSize: '11px', marginTop: '4px' }}>{svc.category}</span>
                    </div>
                  </div>

                  <span className={`pill ${svc.status === 'ACTIVE' ? 'approved' : 'rejected'}`} style={{ fontSize: '11.5px' }}>
                    {svc.status}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
                  {svc.description}
                </p>

                {/* Quota & Utilization Progress */}
                <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 600 }}>
                    <span>Seat Allocation</span>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>
                      {svc.assignedUsers} / {svc.totalSeats} ({pct}%)
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '8px', borderRadius: '99px', background: 'var(--card)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '99px',
                        background: svc.color,
                        width: `${pct}%`,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-3)' }}>
                    <span>Tier: <strong>{svc.licenseTier}</strong></span>
                    <span>{svc.totalSeats - svc.assignedUsers} seats available</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleToggleStatus(svc.id)}
                  >
                    {svc.status === 'ACTIVE' ? 'Restrict Access' : 'Enable Service'}
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => showToast(`✓ Seat pool for ${svc.name} expanded`)}
                  >
                    Manage Pool
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
