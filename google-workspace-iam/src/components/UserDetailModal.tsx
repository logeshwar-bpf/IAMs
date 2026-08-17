'use client';

import React, { useState } from 'react';
import {
  X,
  Sliders,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { User, ServiceName } from '@/lib/types';

interface Props {
  user: User | null;
  isOpen?: boolean;
  onClose: () => void;
  orgUnits?: any[];
  roles?: any[];
  licenses?: any[];
  onUserUpdated?: (updatedUser?: User) => void;
  onUpdated?: (updatedUser?: User) => void;
}

const serviceLabels: Record<ServiceName, { name: string; desc: string }> = {
  gmail: { name: 'Gmail', desc: 'Enterprise Email Service' },
  drive: { name: 'Google Drive', desc: 'Cloud Documents, Sheets & Slides' },
  meet: { name: 'GMeet', desc: 'HD Video Conferencing' },
  calendar: { name: 'Google Calendar', desc: 'Schedules & Meetings' },
  gemini: { name: 'Gemini Enterprise', desc: 'Generative AI Companion' },
  youtube: { name: 'YouTube', desc: 'Video Access & Corporate Channels' },
  maps: { name: 'Google Maps', desc: 'Location Platform Services' },
  news: { name: 'Google News', desc: 'Curated News Feed' },
  chat: { name: 'Google Chat', desc: 'Team Messaging & Spaces' },
  keep: { name: 'Google Keep', desc: 'Notes & Lists' },
  sites: { name: 'Google Sites', desc: 'Internal Intranet Pages' },
  vault: { name: 'Google Vault', desc: 'Legal Hold & Archiving' },
};

export const UserDetailModal = ({
  user,
  isOpen = true,
  onClose,
  onUserUpdated,
  onUpdated,
}: Props) => {
  const [localUser, setLocalUser] = useState<User | null>(user);
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  React.useEffect(() => {
    setLocalUser(user);
  }, [user]);

  if (!isOpen || !user) return null;
  const activeUser = localUser || user;

  const notifyUpdated = (updatedUser?: User) => {
    if (onUserUpdated) onUserUpdated(updatedUser);
    if (onUpdated) onUpdated(updatedUser);
  };

  const handleToggleService = async (serviceKey: ServiceName, currentVal: boolean) => {
    if (!activeUser) return;
    const nextVal = !currentVal;

    setUpdating(true);
    setMsg('');
    setIsError(false);

    // Optimistic local state update for immediate toggle switch reflection
    setLocalUser((prev) =>
      prev
        ? {
            ...prev,
            services: {
              ...prev.services,
              [serviceKey]: nextVal,
            },
          }
        : null
    );

    try {
      const res = await fetch(`/api/users/${activeUser.id}/services`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [serviceKey]: nextVal }),
      });

      if (!res.ok) throw new Error('Failed to update service permission');
      const updatedData = await res.json();
      if (updatedData && updatedData.id) {
        setLocalUser(updatedData);
        notifyUpdated(updatedData);
      } else {
        notifyUpdated();
      }
      setMsg(`Updated ${serviceLabels[serviceKey].name} access permission`);
    } catch (err: any) {
      setLocalUser(user);
      setMsg(`Error: ${err.message}`);
      setIsError(true);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleSuspend = async () => {
    if (!activeUser) return;
    setUpdating(true);
    setMsg('');
    setIsError(false);
    try {
      const res = await fetch(`/api/users/${activeUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: !activeUser.suspended }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updatedData = await res.json();
      if (updatedData && updatedData.id) {
        setLocalUser(updatedData);
        notifyUpdated(updatedData);
      } else {
        notifyUpdated();
      }
      setMsg(activeUser.suspended ? 'Account activated successfully' : 'Account suspended');
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
      setIsError(true);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!activeUser || !confirm(`Are you sure you want to delete ${activeUser.primaryEmail}?`)) return;
    setUpdating(true);
    setMsg('');
    setIsError(false);
    try {
      const res = await fetch(`/api/users/${activeUser.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      notifyUpdated();
      onClose();
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
      setIsError(true);
      setUpdating(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* FIXED MODAL HEADER */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '18px',
                flexShrink: 0,
              }}
            >
              {(activeUser.name?.givenName?.[0] || activeUser.name?.fullName?.[0] || activeUser.primaryEmail?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeUser.name?.fullName || `${activeUser.name?.givenName || ''} ${activeUser.name?.familyName || ''}`.trim() || activeUser.primaryEmail}
                {activeUser.suspended ? (
                  <span className="badge badge-risk">Suspended</span>
                ) : (
                  <span className="badge badge-ok">Active</span>
                )}
              </h3>
              <div style={{ fontSize: '12.5px', color: 'var(--text-2)', marginTop: '2px' }}>{activeUser.primaryEmail}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE MODAL BODY */}
        <div className="modal-body">
          {msg && (
            <div
              className={`badge ${isError ? 'badge-risk' : 'badge-info'}`}
              style={{
                padding: '10px 14px',
                width: '100%',
                borderRadius: '10px',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{msg}</span>
            </div>
          )}

          {/* Service Control Matrix Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={16} color="var(--primary)" />
                App Service Access Matrix
              </h4>
              <span style={{ fontSize: '11.5px', color: 'var(--text-3)', background: 'var(--bg)', padding: '3px 10px', borderRadius: '6px', border: '1px solid var(--border)', fontWeight: 600 }}>
                Direct Google Workspace API Sync
              </span>
            </div>

            {/* List View Container */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                overflow: 'hidden',
                background: 'var(--card)',
              }}
            >
              {(Object.keys(serviceLabels) as ServiceName[]).map((key, idx, arr) => {
                const info = serviceLabels[key];
                const isEnabled = !!activeUser.services[key];
                const isLast = idx === arr.length - 1;

                return (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 18px',
                      borderBottom: isLast ? 'none' : '1px solid var(--border)',
                      background: isEnabled ? 'color-mix(in srgb, var(--primary) 2.5%, var(--card))' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: isEnabled ? 'var(--primary-soft)' : 'var(--bg)',
                          color: isEnabled ? 'var(--primary)' : 'var(--text-3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '12px',
                          flexShrink: 0,
                          border: `1px solid ${isEnabled ? 'color-mix(in srgb, var(--primary) 20%, transparent)' : 'var(--border)'}`,
                        }}
                      >
                        {info.name.substring(0, 2).toUpperCase()}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '13.5px', color: isEnabled ? 'var(--text)' : 'var(--text-2)' }}>
                            {info.name}
                          </span>
                          {isEnabled && (
                            <span className="badge badge-ok" style={{ fontSize: '10px', padding: '1px 7px' }}>
                              Granted
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '1px' }}>
                          {info.desc}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: isEnabled ? 'var(--ok)' : 'var(--text-3)' }}>
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </span>

                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleToggleService(key, isEnabled)}
                          disabled={updating}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FIXED MODAL FOOTER */}
        <div className="modal-footer">
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`btn ${activeUser.suspended ? 'btn-secondary' : 'btn-danger'}`}
              onClick={handleToggleSuspend}
              disabled={updating}
              style={{ fontSize: '12.5px' }}
            >
              {activeUser.suspended ? <Unlock size={14} /> : <Lock size={14} />}
              {activeUser.suspended ? 'Unsuspend Account' : 'Suspend Account'}
            </button>

            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={updating}
              style={{ fontSize: '12.5px' }}
            >
              <Trash2 size={14} />
              Delete Person
            </button>
          </div>

          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
