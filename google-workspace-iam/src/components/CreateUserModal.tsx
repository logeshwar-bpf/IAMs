'use client';

import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orgUnits?: any[];
  licenses?: any[];
  onUserCreated?: () => void;
  onCreated?: () => void;
}

export const CreateUserModal = ({ isOpen, onClose, onUserCreated, onCreated }: Props) => {
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!givenName || !familyName || !primaryEmail) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          givenName,
          familyName,
          primaryEmail: primaryEmail.includes('@') ? primaryEmail : `${primaryEmail}@company.com`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to provision user');
      }

      if (onUserCreated) onUserCreated();
      if (onCreated) onCreated();
      onClose();
      setGivenName('');
      setFamilyName('');
      setPrimaryEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to provision user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* FIXED MODAL HEADER */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserPlus color="var(--primary)" size={22} />
            <h3 className="modal-title">Provision New Person</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* FORM / SCROLLABLE BODY */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            {error && (
              <div className="badge badge-risk" style={{ padding: '10px 14px', fontSize: '12.5px', width: '100%' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sarah"
                  value={givenName}
                  onChange={(e) => setGivenName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Connor"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Company Email *</label>
              <input
                type="email"
                className="form-input"
                placeholder="sarah.connor@company.com"
                value={primaryEmail}
                onChange={(e) => setPrimaryEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ background: 'var(--bg)', padding: '12px 14px', borderRadius: '10px', fontSize: '12px', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
              <strong>Default Access Granted:</strong> Gmail, Google Drive, GMeet, Calendar, Chat, Keep. (Gemini AI & YouTube can be toggled after provisioning).
            </div>
          </div>

          {/* FIXED MODAL FOOTER */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Provisioning...' : 'Provision Person'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
