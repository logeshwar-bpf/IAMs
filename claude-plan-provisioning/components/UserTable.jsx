'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';
import { getUsers } from '@/lib/api-client';
import { Icon } from '@/components/Icons';

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}

const AVATAR_COLORS = [
  '#5B5BD6', '#0E9D63', '#C77C0A', '#2A7FFF', '#DD3E45',
  '#7C3AED', '#0891B2', '#D97706', '#059669', '#DC2626',
];
function avatarColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function planPillClass(plan) {
  if (plan === 'Claude Pro') return 'pill primary';
  if (plan === 'Claude Team') return 'pill info';
  if (plan === 'Enterprise') return 'pill active';
  if (plan === 'No Access') return 'pill revoked';
  return 'pill';
}

function statusClass(status) {
  return status === 'Active' ? 'pill active' : 'pill revoked';
}

const PLANS = ['All', 'Claude Pro', 'Claude Team', 'Enterprise', 'No Access'];

export default function UserTable({ initialData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState(
    initialData || { users: [], total: 0, page: 1, totalPages: 1, from: 0, to: 0 }
  );
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const load = (newSearch, newPlan, newPage) => {
    startTransition(async () => {
      try {
        const res = await getUsers({ search: newSearch, plan: newPlan, page: newPage, limit: 10 });
        if (res && res.users) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to fetch users from API server:', err);
      }
    });
  };

  useEffect(() => {
    if (!initialData || !initialData.users || initialData.users.length === 0) {
      load('', 'All', 1);
    }
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    setCurrentPage(1);
    load(val, selectedPlan, 1);
  };

  const handlePlan = (plan) => {
    setSelectedPlan(plan);
    setCurrentPage(1);
    load(search, plan, 1);
  };

  const handlePage = (p) => {
    if (p < 1 || p > data.totalPages) return;
    setCurrentPage(p);
    load(search, selectedPlan, p);
  };

  return (
    <div>
      {/* ── Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h3 className="section-title" style={{ margin: 0 }}>
            User directory
            <span style={{ marginLeft: 10, fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600 }}>
              · {data.total} users
            </span>
          </h3>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
            Search, manage, and grant Claude plan access to team members
          </div>
        </div>

        {/* Search */}
        <div className="search">
          <Icon name="search" size={16} />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search name or email…"
          />
        </div>
      </div>

      {/* ── Plan filter ── */}
      <div className="filter-row">
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 700 }}>Plan:</span>
        {PLANS.map((p) => (
          <button
            key={p}
            className={`filter-btn${selectedPlan === p ? ' active' : ''}`}
            onClick={() => handlePlan(p)}
          >
            {p}
          </button>
        ))}
        {isPending && (
          <span style={{ fontSize: 12.5, color: 'var(--warn)', fontWeight: 700, marginLeft: 8 }}>
            <span className="spinner" style={{ marginRight: 6 }} />
            Updating…
          </span>
        )}
      </div>

      {/* ── Table ── */}
      <div className="reqtable">
        {/* Header */}
        <div
          className="reqtable-head"
          style={{ gridTemplateColumns: '1.6fr 1.8fr 1fr 0.8fr 1fr' }}
        >
          <span>User</span>
          <span>Role & Email</span>
          <span>Current Plan</span>
          <span>Status</span>
          <span className="cell-right">Action</span>
        </div>

        {/* Rows */}
        {data.users.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-3)', fontWeight: 600 }}>
            No users found matching your query.
          </div>
        ) : (
          data.users.map((user) => (
            <div
              className="reqtable-row"
              key={user.id}
              style={{ gridTemplateColumns: '1.6fr 1.8fr 1fr 0.8fr 1fr', cursor: 'pointer' }}
              onClick={() => router.push(`/users/${user.id}`)}
            >
              {/* Name + avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div
                  className="avatar sq"
                  style={{ background: avatarColor(user.name) }}
                >
                  {initials(user.name)}
                </div>
                <div>
                  <div className="cell-strong">{user.name}</div>
                  <div className="cell-sub">ID: {user.id}</div>
                </div>
              </div>

              {/* Role + email */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{user.role}</div>
                <div className="cell-sub" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </div>
              </div>

              {/* Plan pill */}
              <div>
                <span className={planPillClass(user.plan)}>
                  <span
                    style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'currentColor', flexShrink: 0,
                    }}
                  />
                  {user.plan}
                </span>
              </div>

              {/* Status */}
              <div>
                <span className={statusClass(user.status)}>{user.status}</span>
              </div>

              {/* Action */}
              <div className="cell-right" onClick={(e) => e.stopPropagation()}>
                <Link
                  href={`/users/${user.id}`}
                  className="btn btn-ghost btn-sm"
                >
                  Manage →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)',
        }}
      >
        <span style={{ fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600 }}>
          Showing {data.from}–{data.to} of {data.total}
        </span>
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => handlePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`page-btn${currentPage === p ? ' active' : ''}`}
              onClick={() => handlePage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="page-btn"
            onClick={() => handlePage(currentPage + 1)}
            disabled={currentPage === data.totalPages}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
