'use client';

import React from 'react';
import { X, Server, Key, ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CredentialsModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Server color="var(--primary)" size={22} />
            <h3 className="modal-title">Google Admin API Integration Guide</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div
            style={{
              background: 'var(--ok-soft)',
              color: 'var(--ok)',
              padding: '14px 18px',
              borderRadius: '12px',
              border: '1px solid color-mix(in srgb, var(--ok) 30%, transparent)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <CheckCircle2 size={20} style={{ flex: 'none', marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px' }}>Local Mock Server Active</div>
              <div style={{ fontSize: '12.5px', marginTop: '2px', opacity: 0.9 }}>
                The backend is currently simulating all Google Admin SDK (Directory API) and Google License Manager API responses for 50 company users. You do NOT need any real credentials or organization mail access to develop and test right now.
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 8px' }}>
              Production Setup Guide (Domain-Wide Delegation)
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-2)', margin: '0 0 12px' }}>
              To connect this application to your live Google Workspace organization in production, follow these steps:
            </p>

            <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <li>
                <strong>Create Service Account in GCP Console:</strong> Go to Google Cloud Console &gt; IAM & Admin &gt; Service Accounts. Create a new Service Account and download its JSON Private Key.
              </li>
              <li>
                <strong>Enable Domain-Wide Delegation (DWD):</strong> In GCP Console, edit the Service Account and check <em>&quot;Enable Google Workspace Domain-wide Delegation&quot;</em>. Note down its <strong>Client ID</strong>.
              </li>
              <li>
                <strong>Grant API Authorizations in Admin Console:</strong> Log into Google Admin Console (<a href="https://admin.google.com" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>admin.google.com</a>) with a Super Admin account.
                <div style={{ background: 'var(--bg)', padding: '10px', borderRadius: '8px', marginTop: '6px', fontSize: '12px', fontFamily: 'var(--mono)' }}>
                  Security &gt; Access and data control &gt; API controls &gt; Manage Domain Wide Delegation
                </div>
              </li>
              <li>
                <strong>Add Required OAuth Scopes:</strong> Add a new API Client with your Service Account Client ID and the following scopes:
                <ul style={{ paddingLeft: '18px', marginTop: '6px', fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--primary)' }}>
                  <li>https://www.googleapis.com/auth/admin.directory.user</li>
                  <li>https://www.googleapis.com/auth/admin.directory.orgunit</li>
                  <li>https://www.googleapis.com/auth/admin.directory.rolemanagement</li>
                  <li>https://www.googleapis.com/auth/apps.licensing</li>
                </ul>
              </li>
              <li>
                <strong>Set Environment Variables in <code>.env.local</code>:</strong>
                <pre style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', fontSize: '11.5px', marginTop: '6px', overflowX: 'auto' }}>
{`MOCK_MODE=false
GOOGLE_ADMIN_SERVICE_ACCOUNT_EMAIL="sa@your-project.iam.gserviceaccount.com"
GOOGLE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"
GOOGLE_ADMIN_DELEGATED_USER_EMAIL="superadmin@company.com"`}
                </pre>
              </li>
            </ol>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Got It! Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
