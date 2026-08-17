'use client';

export default function StatsOverview({ stats }) {
  const { totalUsers = 50, activePlans = 42, noAccess = 8, distribution = {} } = stats || {};

  const proCount = distribution['Claude Pro'] ?? 24;
  const teamCount = distribution['Claude Team'] ?? 15;
  const enterpriseCount = distribution['Enterprise'] ?? 3;
  const noAccessCount = distribution['No Access'] ?? 8;

  const totalCalc = totalUsers || 1;

  const distItems = [
    {
      name: 'Claude Pro',
      count: proCount,
      color: 'bg-purple-500',
      textColor: 'text-purple-300',
      badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
      pct: Math.round((proCount / totalCalc) * 100)
    },
    {
      name: 'Claude Team',
      count: teamCount,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-300',
      badgeBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
      pct: Math.round((teamCount / totalCalc) * 100)
    },
    {
      name: 'Enterprise',
      count: enterpriseCount,
      color: 'bg-amber-500',
      textColor: 'text-amber-300',
      badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      pct: Math.round((enterpriseCount / totalCalc) * 100)
    },
    {
      name: 'No Access',
      count: noAccessCount,
      color: 'bg-rose-500',
      textColor: 'text-rose-300',
      badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      pct: Math.round((noAccessCount / totalCalc) * 100)
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* 3 Top Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Users */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-400">Total Users</p>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-lg">
              👥
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-4xl font-extrabold text-white tracking-tight">{totalUsers}</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Directory Total
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Registered accounts across organization</p>
        </div>

        {/* Active Plans */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-400">Active Plans</p>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-lg">
              ⚡
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-4xl font-extrabold text-emerald-400 tracking-tight">{activePlans}</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {Math.round((activePlans / totalCalc) * 100)}% Provisioned
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Users with active Claude subscriptions</p>
        </div>

        {/* No Access */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-400">No Access</p>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-lg">
              🚫
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-4xl font-extrabold text-rose-400 tracking-tight">{noAccess}</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Unassigned / Revoked
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Users currently without plan access</p>
        </div>
      </div>

      {/* Subscription Distribution Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Subscription Distribution</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono font-normal">
                Real-Time Data
              </span>
            </h3>
            <p className="text-xs text-slate-400">Overview of user allocations across Claude tiers</p>
          </div>
        </div>

        {/* Distribution Progress Bars & Rows */}
        <div className="space-y-4">
          {distItems.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className={`font-semibold ${item.textColor} flex items-center gap-2`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                  {item.name}
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-400">{item.pct}%</span>
                  <span className={`px-2.5 py-0.5 rounded-md border font-bold ${item.badgeBg}`}>
                    {item.count} users
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 overflow-hidden border border-slate-800/80">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.color} shadow-sm`}
                  style={{ width: `${Math.max(item.pct, 2)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
