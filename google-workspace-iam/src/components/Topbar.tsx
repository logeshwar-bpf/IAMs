'use client';

import React, { useState } from 'react';
import { Search, Server, Key } from 'lucide-react';
import { CredentialsModal } from './CredentialsModal';

interface Props {
  title: string;
  subtitle: string;
  onSearchChange?: (val: string) => void;
  searchValue?: string;
}

export const Topbar = ({ title, subtitle, onSearchChange, searchValue }: Props) => {
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);

  return (
    <div className="page-header">
      <div className="page-header-text">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>

      <div className="page-actions">
        {onSearchChange !== undefined && (
          <div className="search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search employees by name, email, OU..."
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        <button
          className="mode-badge"
          onClick={() => setIsCredModalOpen(true)}
          title="Click to view Google API Credentials & Delegation Guide"
        >
          <span className="dot"></span>
          <span>Local Mock Server Active</span>
          <Server size={14} style={{ marginLeft: '4px' }} />
        </button>
      </div>

      <CredentialsModal isOpen={isCredModalOpen} onClose={() => setIsCredModalOpen(false)} />
    </div>
  );
};
