'use client';

import React, { useState } from 'react';
import { X, Layers, Users } from 'lucide-react';
import { ServiceName, ServiceFlags } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedUserIds: string[];
  orgUnits?: any[];
  onBulkUpdated?: () => void;
  onUpdated?: () => void;
}

const availableServices: { key: ServiceName; name: string }[] = [
  { key: 'gmail', name: 'Gmail' },
  { key: 'drive', name: 'Google Drive' },
  { key: 'meet', name: 'GMeet' },
  { key: 'youtube', name: 'YouTube' },
  { key: 'gemini', name: 'Gemini Enterprise' },
  { key: 'calendar', name: 'Google Calendar' },
  { key: 'chat', name: 'Google Chat' },
  { key: 'keep', name: 'Google Keep' },
  { key: 'vault', name: 'Google Vault' },
];

export const BulkServiceModal = ({
  isOpen,
  onClose,
  selectedUserIds,
  onBulkUpdated,
  onUpdated,
}: Props) => {
  const [serviceUpdates, setServiceUpdates] = useState<Record<string, 'enable' | 'disable' | 'nochange'>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleActionChange = (key: ServiceName, action: 'enable' | 'disable' | 'nochange') => {
    setServiceUpdates((prev) => ({
      ...prev,
      [key]: action,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const servicesPayload: Partial<ServiceFlags> = {};
    Object.entries(serviceUpdates).forEach(([k, action]) => {
      if (action === 'enable') servicesPayload[k as ServiceName] = true;
      if (action === 'disable') servicesPayload[k as ServiceName] = false;
    });

    if (Object.keys(servicesPayload).length === 0) {
      setError('Please select at least one service to Grant or Revoke');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        userIds: selectedUserIds,
        services: servicesPayload,
      };

      const res = await fetch('/api/users/bulk-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Bulk service update failed');
      }

      if (onBulkUpdated) onBulkUpdated();
      if (onUpdated) onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during bulk update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* FIXED MODAL HEADER */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers color="var(--primary)" size={22} />
            <h3 className="modal-title">Bulk Access Grant / Revoke</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* FORM / SCROLLABLE BODY */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            {error && (
              <div className="badge badge-risk" style={{ padding: '10px 14px', width: '100%' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
              <Users size={16} />
              <span>Targeting {selectedUserIds.length} Selected People</span>
            </div>

            {/* Service Actions list */}
            <div className="form-group">
              <label className="form-label">Select App Access Action</label>
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  background: 'var(--bg)',
                }}
              >
                {availableServices.map((svc) => {
                  const currentSetting = serviceUpdates[svc.key] || 'nochange';

                  return (
                    <div
                      key={svc.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--card)',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '13.5px' }}>{svc.name}</span>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className={`btn ${currentSetting === 'enable' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '4px 10px', fontSize: '11.5px' }}
                          onClick={() => handleActionChange(svc.key, 'enable')}
                        >
                          Grant (ON)
                        </button>
                        <button
                          type="button"
                          className={`btn ${currentSetting === 'disable' ? 'btn-danger' : 'btn-secondary'}`}
                          style={{ padding: '4px 10px', fontSize: '11.5px' }}
                          onClick={() => handleActionChange(svc.key, 'disable')}
                        >
                          Revoke (OFF)
                        </button>
                        <button
                          type="button"
                          className={`btn ${currentSetting === 'nochange' ? 'btn-secondary' : 'btn-secondary'}`}
                          style={{ padding: '4px 10px', fontSize: '11.5px', opacity: currentSetting === 'nochange' ? 0.6 : 1 }}
                          onClick={() => handleActionChange(svc.key, 'nochange')}
                        >
                          No Change
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FIXED MODAL FOOTER */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Applying Changes...' : 'Apply Bulk Access Updates'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
