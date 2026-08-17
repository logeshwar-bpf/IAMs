'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Topbar } from '@/components/Topbar';
import { User, ServiceName } from '@/lib/types';
import { CreateUserModal } from '@/components/CreateUserModal';
import { UserDetailModal } from '@/components/UserDetailModal';
import { BulkServiceModal } from '@/components/BulkServiceModal';
import {
  Users,
  UserPlus,
  Layers,
  Sparkles,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  Mail,
  HardDrive,
  Video,
  PlaySquare,
  LayoutGrid,
  List,
  FolderTree,
  CheckCircle2,
  XCircle,
  Building,
  Shield,
  Calendar,
  Clock,
  X
} from 'lucide-react';

type ViewMode = 'grid' | 'table' | 'grouped';

export default function PeopleMatrixPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  // View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [ouFilter, setOuFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 16;
  const [orgStats, setOrgStats] = useState({ geminiActiveCount: 0, meetActiveCount: 0, totalUsersCount: 0 });

  // Selection & Modals
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [inspectUser, setInspectUser] = useState<User | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter === 'active') params.set('suspended', 'false');
      if (statusFilter === 'suspended') params.set('suspended', 'true');
      if (serviceFilter) {
        params.set('service', serviceFilter as ServiceName);
        params.set('serviceState', 'true');
      }
      if (ouFilter !== 'all') {
        params.set('orgUnitPath', ouFilter);
      }
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      const res = await fetch(`/api/users?${params.toString()}`);
      const data = await res.json();
      setUsers(data.data || []);
      setTotalUsers(data.total || 0);
      if (data.orgStats) {
        setOrgStats(data.orgStats);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter, serviceFilter, ouFilter, page]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(users.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds((prev) => [...prev, id]);
    } else {
      setSelectedUserIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleQuickToggleGemini = async (user: User) => {
    const nextState = !user.services?.gemini;
    try {
      const res = await fetch(`/api/users/${user.id}/services`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gemini: nextState }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? { ...u, services: { ...u.services, gemini: nextState } }
              : u
          )
        );
        showToast(`✓ Gemini AI ${nextState ? 'enabled' : 'disabled'} for ${getUserFullName(user)}`);
      }
    } catch (err) {
      console.error('Failed to toggle Gemini:', err);
    }
  };

  const getUserFullName = (u: User) => {
    const rawName: any = u.name;
    if (typeof rawName === 'string') return rawName;
    if (u.name?.fullName) return u.name.fullName;
    const parts = [u.name?.givenName, u.name?.familyName].filter(Boolean);
    if (parts.length > 0) return parts.join(' ');
    return u.primaryEmail || (u as any).email || 'Unknown User';
  };

  const getUserInitials = (u: User) => {
    const rawName: any = u.name;
    if (typeof rawName === 'string') {
      return rawName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
    }
    if (u.name?.givenName && u.name?.familyName) {
      return `${u.name.givenName[0]}${u.name.familyName[0]}`.toUpperCase();
    }
    if (u.name?.fullName) {
      return u.name.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
    }
    return (u.primaryEmail || 'U').slice(0, 2).toUpperCase();
  };

  const totalPages = Math.ceil(totalUsers / limit) || 1;

  // Grouped by Org Unit
  const groupedUsers = useMemo(() => {
    const map = new Map<string, User[]>();
    users.forEach((u) => {
      const ou = u.orgUnitPath || '/General';
      if (!map.has(ou)) map.set(ou, []);
      map.get(ou)!.push(u);
    });
    return Array.from(map.entries());
  }, [users]);

  return (
    <>
      <Topbar
        title="People &amp; App Access Matrix"
        subtitle="Manage employee directory, organizational units, and granular Google Workspace service permissions"
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
      />

      <div className="content">
        {/* KPI Insight Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div
            className="stat-card"
            style={{ padding: '16px 20px', cursor: 'pointer' }}
            onClick={() => {
              setStatusFilter('all');
              setServiceFilter('');
              setOuFilter('all');
            }}
          >
            <div className="stat-top">
              <span style={{ fontSize: '12px' }}>Total Directory</span>
              <div className="stat-chip primary"><Users size={14} /></div>
            </div>
            <div className="stat-num" style={{ fontSize: '24px' }}>{totalUsers}</div>
            <div className="stat-foot ok">All registered identities</div>
          </div>

          <div
            className="stat-card"
            style={{ padding: '16px 20px', cursor: 'pointer' }}
            onClick={() => {
              setStatusFilter('active');
              setPage(1);
            }}
          >
            <div className="stat-top">
              <span style={{ fontSize: '12px' }}>Active Accounts</span>
              <div className="stat-chip ok"><ShieldCheck size={14} /></div>
            </div>
            <div className="stat-num" style={{ fontSize: '24px', color: 'var(--ok)' }}>
              {totalUsers ? totalUsers - 2 : 48}
            </div>
            <div className="stat-foot ok">Compliant &amp; Active</div>
          </div>

          <div
            className="stat-card"
            style={{ padding: '16px 20px', cursor: 'pointer' }}
            onClick={() => {
              setServiceFilter('gemini');
              setPage(1);
            }}
          >
            <div className="stat-top">
              <span style={{ fontSize: '12px' }}>Gemini AI Seats</span>
              <div className="stat-chip primary"><Sparkles size={14} /></div>
            </div>
            <div className="stat-num" style={{ fontSize: '24px', color: 'var(--primary)' }}>
              {orgStats.geminiActiveCount || 25} <span style={{ fontSize: '14px', color: 'var(--text-3)' }}>/ {totalUsers}</span>
            </div>
            <div className="stat-foot ok">{Math.round(((orgStats.geminiActiveCount || 25) / (totalUsers || 1)) * 100)}% AI Provisioned</div>
          </div>

          <div
            className="stat-card"
            style={{ padding: '16px 20px', cursor: 'pointer' }}
            onClick={() => {
              setStatusFilter('suspended');
              setPage(1);
            }}
          >
            <div className="stat-top">
              <span style={{ fontSize: '12px' }}>Suspended</span>
              <div className="stat-chip risk"><ShieldAlert size={14} /></div>
            </div>
            <div className="stat-num" style={{ fontSize: '24px', color: 'var(--risk)' }}>2</div>
            <div className="stat-foot" style={{ color: 'var(--risk)' }}>Action required</div>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="card" style={{ padding: '18px 24px', marginBottom: '22px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            
            {/* Left Filter Controls */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
              <select
                className="form-select"
                style={{ width: '145px', padding: '7px 12px', fontSize: '13px' }}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>

              <select
                className="form-select"
                style={{ width: '160px', padding: '7px 12px', fontSize: '13px' }}
                value={serviceFilter}
                onChange={(e) => {
                  setServiceFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Services</option>
                <option value="gemini">✦ Gemini AI Active</option>
                <option value="gmail">Gmail Granted</option>
                <option value="drive">Drive Granted</option>
                <option value="meet">GMeet Granted</option>
                <option value="youtube">YouTube Granted</option>
              </select>

              <select
                className="form-select"
                style={{ width: '160px', padding: '7px 12px', fontSize: '13px' }}
                value={ouFilter}
                onChange={(e) => {
                  setOuFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Departments</option>
                <option value="/Engineering">/Engineering</option>
                <option value="/Sales">/Sales</option>
                <option value="/Marketing">/Marketing</option>
                <option value="/Finance">/Finance</option>
                <option value="/Executive">/Executive</option>
              </select>

              {(search || statusFilter !== 'all' || serviceFilter || ouFilter !== 'all') && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setServiceFilter('');
                    setOuFilter('all');
                    setPage(1);
                  }}
                  style={{ fontSize: '12px', gap: '4px' }}
                >
                  <X size={13} /> Clear
                </button>
              )}
            </div>

            {/* Right Action & View Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* View Switcher Segmented Control */}
              <div className="view-btn-group">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Profile Cards Grid"
                >
                  <LayoutGrid size={15} />
                  Cards
                </button>
                <button
                  className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Compact Table Matrix"
                >
                  <List size={15} />
                  Table
                </button>
                <button
                  className={`view-btn ${viewMode === 'grouped' ? 'active' : ''}`}
                  onClick={() => setViewMode('grouped')}
                  title="Group by Department"
                >
                  <FolderTree size={15} />
                  By Org Unit
                </button>
              </div>

              <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
                <UserPlus size={15} />
                Provision Person
              </button>
            </div>
          </div>

          {/* Quick Filter Tag Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-3)', marginRight: '4px' }}>Quick Tags:</span>
            
            <button
              className={`quick-filter-chip ${statusFilter === 'all' && !serviceFilter && ouFilter === 'all' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('all');
                setServiceFilter('');
                setOuFilter('all');
              }}
            >
              All Directory
            </button>

            <button
              className={`quick-filter-chip ${serviceFilter === 'gemini' ? 'active' : ''}`}
              onClick={() => {
                setServiceFilter(serviceFilter === 'gemini' ? '' : 'gemini');
                setPage(1);
              }}
            >
              <Sparkles size={13} color="var(--primary)" />
              Gemini AI Users ({orgStats.geminiActiveCount || 25})
            </button>

            <button
              className={`quick-filter-chip ${ouFilter === '/Engineering' ? 'active' : ''}`}
              onClick={() => {
                setOuFilter(ouFilter === '/Engineering' ? 'all' : '/Engineering');
                setPage(1);
              }}
            >
              <Building size={13} />
              Engineering
            </button>

            <button
              className={`quick-filter-chip ${ouFilter === '/Executive' ? 'active' : ''}`}
              onClick={() => {
                setOuFilter(ouFilter === '/Executive' ? 'all' : '/Executive');
                setPage(1);
              }}
            >
              <Shield size={13} />
              Executive
            </button>

            <button
              className={`quick-filter-chip ${statusFilter === 'suspended' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter(statusFilter === 'suspended' ? 'all' : 'suspended');
                setPage(1);
              }}
            >
              <ShieldAlert size={13} color="var(--risk)" />
              Suspended Only
            </button>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px', width: '36px', height: '36px' }} />
            <h4 style={{ margin: 0, fontWeight: 700 }}>Loading employee access directory…</h4>
            <p style={{ color: 'var(--text-3)', fontSize: '13px', marginTop: '6px' }}>Fetching permissions and identity tokens</p>
          </div>
        ) : users.length === 0 ? (
          /* EMPTY STATE */
          <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
            <Users size={40} color="var(--text-3)" style={{ margin: '0 auto 14px' }} />
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: '17px' }}>No people matched your filter query</h4>
            <p style={{ color: 'var(--text-3)', fontSize: '13.5px', marginTop: '6px' }}>
              Try searching with a different name, email, or clearing your active filters.
            </p>
            <button
              className="btn btn-secondary"
              style={{ marginTop: '16px' }}
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setServiceFilter('');
                setOuFilter('all');
              }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          /* VIEW MODE: CARDS GRID (DEFAULT) */
          viewMode === 'grid' ? (
            <div className="people-grid">
              {users.map((u) => {
                const fullName = getUserFullName(u);
                const initials = getUserInitials(u);
                const isChecked = selectedUserIds.includes(u.id);

                return (
                  <div
                    key={u.id}
                    className={`people-card ${isChecked ? 'selected' : ''}`}
                  >
                    {/* Header: Checkbox + Avatar + Basic info */}
                    <div>
                      <div className="people-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="people-avatar-wrap">
                            <div className="people-avatar">{initials}</div>
                            <div
                              className={`people-status-dot ${u.suspended ? 'suspended' : 'active'}`}
                              title={u.suspended ? 'Suspended Account' : 'Active Account'}
                            />
                          </div>

                          <div>
                            <h4
                              style={{
                                margin: 0,
                                fontSize: '15px',
                                fontWeight: 700,
                                color: 'var(--text)',
                                cursor: 'pointer',
                              }}
                              onClick={() => setInspectUser(u)}
                            >
                              {fullName}
                            </h4>
                            <div style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--mono)', marginTop: '2px' }}>
                              {u.primaryEmail}
                            </div>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectOne(u.id, e.target.checked)}
                          aria-label={`Select ${fullName}`}
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                      </div>

                      {/* Tag strip: Department & Status */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px' }}>
                        <span className="badge" style={{ fontSize: '11px', background: 'var(--bg-elev)', color: 'var(--text-2)' }}>
                          <Building size={11} style={{ marginRight: '4px' }} />
                          {u.orgUnitPath || '/Engineering'}
                        </span>

                        <span className={`badge ${u.suspended ? 'badge-risk' : 'badge-ok'}`} style={{ fontSize: '11px' }}>
                          {u.suspended ? 'Suspended' : 'Active'}
                        </span>
                      </div>

                      {/* Service Entitlements Strip */}
                      <div style={{ marginTop: '14px' }}>
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                          Google App Entitlements:
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          <span className={`people-service-chip ${u.services.gmail ? 'enabled' : 'disabled'}`}>
                            <Mail size={12} color={u.services.gmail ? '#EA4335' : 'inherit'} />
                            Gmail
                          </span>

                          <span className={`people-service-chip ${u.services.drive ? 'enabled' : 'disabled'}`}>
                            <HardDrive size={12} color={u.services.drive ? '#34A853' : 'inherit'} />
                            Drive
                          </span>

                          <span className={`people-service-chip ${u.services.meet ? 'enabled' : 'disabled'}`}>
                            <Video size={12} color={u.services.meet ? '#00897B' : 'inherit'} />
                            GMeet
                          </span>

                          <span className={`people-service-chip ${u.services.youtube ? 'enabled' : 'disabled'}`}>
                            <PlaySquare size={12} color={u.services.youtube ? '#FF0000' : 'inherit'} />
                            YouTube
                          </span>

                          <span className={`people-service-chip ${u.services.gemini ? 'gemini-chip' : 'disabled'}`}>
                            <Sparkles size={12} color={u.services.gemini ? 'var(--primary)' : 'inherit'} />
                            Gemini AI
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Quick Gemini Toggle & Configure CTA */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border)',
                        marginTop: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label className="toggle-switch" title="Quick toggle Gemini AI license">
                          <input
                            type="checkbox"
                            checked={Boolean(u.services.gemini)}
                            onChange={() => handleQuickToggleGemini(u)}
                          />
                          <span className="toggle-slider" />
                        </label>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: u.services.gemini ? 'var(--primary)' : 'var(--text-3)' }}>
                          Gemini AI
                        </span>
                      </div>

                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setInspectUser(u)}
                        style={{ fontSize: '12px' }}
                      >
                        Configure Access
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : viewMode === 'table' ? (
            /* VIEW MODE: COMPACT MATRIX TABLE */
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedUserIds.length === users.length && users.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        aria-label="Select all people"
                      />
                    </th>
                    <th>Person &amp; Directory ID</th>
                    <th>Department</th>
                    <th>Gmail</th>
                    <th>Drive</th>
                    <th>GMeet</th>
                    <th>YouTube</th>
                    <th>Gemini AI</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isChecked = selectedUserIds.includes(u.id);
                    const fullName = getUserFullName(u);
                    const initials = getUserInitials(u);

                    return (
                      <tr key={u.id} className={isChecked ? 'row-selected' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleSelectOne(u.id, e.target.checked)}
                            aria-label={`Select ${fullName}`}
                          />
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              className="avatar"
                              style={{
                                width: '34px',
                                height: '34px',
                                fontSize: '12px',
                                fontWeight: 700,
                                background: 'var(--primary-soft)',
                                color: 'var(--primary)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '13.5px' }}>{fullName}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>{u.primaryEmail}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="badge" style={{ fontSize: '11.5px', background: 'var(--bg-elev)', color: 'var(--text-2)' }}>
                            {u.orgUnitPath || '/Engineering'}
                          </span>
                        </td>

                        <td>
                          <span className={`pill ${u.services.gmail ? 'approved' : 'rejected'}`}>
                            {u.services.gmail ? 'Granted' : 'Revoked'}
                          </span>
                        </td>

                        <td>
                          <span className={`pill ${u.services.drive ? 'approved' : 'rejected'}`}>
                            {u.services.drive ? 'Granted' : 'Revoked'}
                          </span>
                        </td>

                        <td>
                          <span className={`pill ${u.services.meet ? 'approved' : 'rejected'}`}>
                            {u.services.meet ? 'Granted' : 'Revoked'}
                          </span>
                        </td>

                        <td>
                          <span className={`pill ${u.services.youtube ? 'approved' : 'rejected'}`}>
                            {u.services.youtube ? 'Granted' : 'Revoked'}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                checked={Boolean(u.services.gemini)}
                                onChange={() => handleQuickToggleGemini(u)}
                              />
                              <span className="toggle-slider" />
                            </label>
                            {u.services.gemini && <Sparkles size={13} color="var(--primary)" />}
                          </div>
                        </td>

                        <td>
                          <span className={`badge ${u.suspended ? 'badge-risk' : 'badge-ok'}`} style={{ fontSize: '11px' }}>
                            {u.suspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setInspectUser(u)}
                            style={{ fontSize: '12px' }}
                          >
                            Configure
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* VIEW MODE: GROUPED BY DEPARTMENT / ORG UNIT */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {groupedUsers.map(([ouName, deptUsers]) => {
                const geminiCount = deptUsers.filter((u) => u.services.gemini).length;

                return (
                  <div key={ouName} className="card" style={{ padding: '22px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'var(--primary-soft)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Building size={18} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{ouName}</h3>
                          <div style={{ fontSize: '12.5px', color: 'var(--text-3)' }}>
                            {deptUsers.length} active employees · {geminiCount} with Gemini AI enabled ({Math.round((geminiCount / (deptUsers.length || 1)) * 100)}%)
                          </div>
                        </div>
                      </div>

                      <span className="badge badge-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                        {deptUsers.length} Accounts
                      </span>
                    </div>

                    {/* Department Users Grid */}
                    <div className="people-grid">
                      {deptUsers.map((u) => {
                        const fullName = getUserFullName(u);
                        const initials = getUserInitials(u);
                        const isChecked = selectedUserIds.includes(u.id);

                        return (
                          <div key={u.id} className={`people-card ${isChecked ? 'selected' : ''}`}>
                            <div className="people-card-header">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="people-avatar-wrap">
                                  <div className="people-avatar">{initials}</div>
                                  <div
                                    className={`people-status-dot ${u.suspended ? 'suspended' : 'active'}`}
                                  />
                                </div>

                                <div>
                                  <h4
                                    style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, cursor: 'pointer' }}
                                    onClick={() => setInspectUser(u)}
                                  >
                                    {fullName}
                                  </h4>
                                  <div style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
                                    {u.primaryEmail}
                                  </div>
                                </div>
                              </div>

                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleSelectOne(u.id, e.target.checked)}
                              />
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
                              <span className={`people-service-chip ${u.services.gmail ? 'enabled' : 'disabled'}`}>Gmail</span>
                              <span className={`people-service-chip ${u.services.drive ? 'enabled' : 'disabled'}`}>Drive</span>
                              <span className={`people-service-chip ${u.services.meet ? 'enabled' : 'disabled'}`}>GMeet</span>
                              <span className={`people-service-chip ${u.services.gemini ? 'gemini-chip' : 'disabled'}`}>✦ Gemini</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                              <span className={`badge ${u.suspended ? 'badge-risk' : 'badge-ok'}`} style={{ fontSize: '11px' }}>
                                {u.suspended ? 'Suspended' : 'Active'}
                              </span>

                              <button className="btn btn-ghost btn-sm" onClick={() => setInspectUser(u)} style={{ fontSize: '12px' }}>
                                Configure
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Pagination Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', padding: '0 4px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-3)' }}>
            Showing <strong>{users.length}</strong> of <strong>{totalUsers}</strong> directory people
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span style={{ fontSize: '13px', color: 'var(--text-2)', padding: '0 8px' }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Bar for Selected Accounts */}
      {selectedUserIds.length > 0 && (
        <div className="floating-action-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 700 }}>
            <Users size={16} color="var(--primary)" />
            <span>{selectedUserIds.length} employees selected</span>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsBulkOpen(true)}
            style={{ fontSize: '12.5px' }}
          >
            <Layers size={14} />
            Bulk Grant / Revoke Access
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setSelectedUserIds([])}
            style={{ fontSize: '12.5px' }}
          >
            Deselect All
          </button>
        </div>
      )}

      {/* Modals & Drawers */}
      {isCreateOpen && (
        <CreateUserModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={fetchUsers}
        />
      )}

      {isBulkOpen && (
        <BulkServiceModal
          isOpen={isBulkOpen}
          onClose={() => {
            setIsBulkOpen(false);
            setSelectedUserIds([]);
          }}
          selectedUserIds={selectedUserIds}
          onUpdated={fetchUsers}
        />
      )}

      {inspectUser && (
        <UserDetailModal
          user={inspectUser}
          isOpen={Boolean(inspectUser)}
          onClose={() => setInspectUser(null)}
          onUpdated={fetchUsers}
        />
      )}

      {/* Toast Alert */}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
