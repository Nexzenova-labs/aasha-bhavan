'use client';

import React, { useState, useEffect } from 'react';

interface Stats {
  totalDonations: number; donationsToday: number; donationsThisMonth: number;
  totalDonors: number; pendingVolunteers: number; unreadMessages: number;
  activeSponsors: number; totalResidents: number;
}

interface RecentDonation {
  id: string; donor_name: string; amount_paise: number; cause: string;
  payment_status: string; created_at: string;
}

const MOCK_STATS: Stats = {
  totalDonations: 1842600, donationsToday: 15000, donationsThisMonth: 287400,
  totalDonors: 342, pendingVolunteers: 7, unreadMessages: 4,
  activeSponsors: 23, totalResidents: 115,
};

const MOCK_RECENT: RecentDonation[] = [
  { id: '1', donor_name: 'Ramesh Kumar', amount_paise: 200000, cause: "Children's Education", payment_status: 'paid', created_at: '2025-05-21T09:12:00Z' },
  { id: '2', donor_name: 'Anjali Sharma', amount_paise: 100000, cause: 'Where needed most', payment_status: 'paid', created_at: '2025-05-21T08:45:00Z' },
  { id: '3', donor_name: 'TCS CSR Fund', amount_paise: 5000000, cause: 'Infrastructure', payment_status: 'paid', created_at: '2025-05-20T14:30:00Z' },
  { id: '4', donor_name: 'Pradeep Nair', amount_paise: 50000, cause: 'Elderly Medical Care', payment_status: 'paid', created_at: '2025-05-20T11:15:00Z' },
  { id: '5', donor_name: 'Vidya Rao', amount_paise: 250000, cause: 'Food & Nutrition', payment_status: 'paid', created_at: '2025-05-19T16:20:00Z' },
];

const MONTHLY_DATA = [
  { month: 'Jan', amount: 180000 }, { month: 'Feb', amount: 220000 },
  { month: 'Mar', amount: 315000 }, { month: 'Apr', amount: 198000 },
  { month: 'May', amount: 287400 }, { month: 'Jun', amount: 0 },
];

export default function AdminDashboard() {
  const [stats] = useState<Stats>(MOCK_STATS);
  const [recent] = useState<RecentDonation[]>(MOCK_RECENT);
  const maxMonthly = Math.max(...MONTHLY_DATA.map(d => d.amount));

  const formatRs = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

  const statCards = [
    { icon: 'ti-heart-filled', label: 'Total Donations', val: formatRs(stats.totalDonations), sub: `Today: ${formatRs(stats.donationsToday)}`, color: '#E8860A', bg: '#FEF3E2' },
    { icon: 'ti-calendar-month', label: 'This Month', val: formatRs(stats.donationsThisMonth), sub: `${stats.totalDonors} donors`, color: '#534AB7', bg: '#EEEDFE' },
    { icon: 'ti-users', label: 'Active Sponsors', val: String(stats.activeSponsors), sub: `${stats.totalResidents} residents`, color: '#1D9E75', bg: '#E1F5EE' },
    { icon: 'ti-mail', label: 'Pending Actions', val: String(stats.pendingVolunteers + stats.unreadMessages), sub: `${stats.pendingVolunteers} volunteers, ${stats.unreadMessages} messages`, color: '#C84B6E', bg: '#FCEEF3' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Good morning, Admin 👋</h1>
      <p style={{ fontSize: 13, color: '#9C9890', marginBottom: 28 }}>Here's what's happening at Aasha Bhavan today.</p>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map(c => (
          <div key={c.label} style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, padding: '20px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, fontSize: 20 }}>
                <i className={`ti ${c.icon}`}></i>
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#2A2825', marginBottom: 4 }}>{c.val}</div>
            <div style={{ fontSize: 11, color: '#9C9890', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 11, color: '#9C9890' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Monthly Chart */}
        <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Donations This Year</div>
            <div style={{ fontSize: 11, color: '#9C9890' }}>2025</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {MONTHLY_DATA.map(d => (
              <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', background: d.amount ? '#FEF3E2' : '#F3F1EC', borderRadius: '4px 4px 0 0', height: d.amount ? `${(d.amount / maxMonthly) * 100}px` : '4px', border: d.amount ? '1px solid #F5A623' : 'none', position: 'relative' }}>
                  {d.amount > 0 && (
                    <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: '#E8860A', whiteSpace: 'nowrap' }}>
                      ₹{(d.amount / 1000).toFixed(0)}k
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 10, color: '#9C9890' }}>{d.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: 'ti-users', label: `Review ${stats.pendingVolunteers} pending volunteer applications`, href: '/admin/volunteers', color: '#534AB7', bg: '#EEEDFE' },
              { icon: 'ti-mail', label: `${stats.unreadMessages} unread contact messages`, href: '/admin/messages', color: '#C84B6E', bg: '#FCEEF3' },
              { icon: 'ti-download', label: 'Export donations to CSV', href: '/admin/donations', color: '#1D9E75', bg: '#E1F5EE' },
              { icon: 'ti-user-plus', label: 'Add a new resident', href: '/admin/residents', color: '#E8860A', bg: '#FEF3E2' },
            ].map(a => (
              <a key={a.label} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1px solid #E5E0D6', borderRadius: 10, cursor: 'pointer', transition: 'background .15s' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color, fontSize: 16, flexShrink: 0 }}>
                  <i className={`ti ${a.icon}`}></i>
                </div>
                <span style={{ fontSize: 13, color: '#2A2825' }}>{a.label}</span>
                <i className="ti ti-chevron-right" style={{ fontSize: 14, color: '#9C9890', marginLeft: 'auto' }}></i>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Donations */}
      <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, padding: 24, marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Recent Donations</div>
          <a href="/admin/donations" style={{ fontSize: 12, color: '#E8860A' }}>View all →</a>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E0D6' }}>
              {['Donor', 'Amount', 'Cause', 'Status', 'Date'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: '#9C9890', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid #F3F1EC' }}>
                <td style={{ padding: '12px', fontSize: 13, color: '#2A2825', fontWeight: 500 }}>{d.donor_name}</td>
                <td style={{ padding: '12px', fontSize: 13, color: '#E8860A', fontWeight: 500 }}>{formatRs(d.amount_paise)}</td>
                <td style={{ padding: '12px', fontSize: 12, color: '#5C5852' }}>{d.cause}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#E1F5EE', color: '#1D9E75', fontWeight: 500 }}>
                    <i className="ti ti-circle-check" style={{ fontSize: 11, marginRight: 4 }}></i>{d.payment_status}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: 12, color: '#9C9890' }}>
                  {new Date(d.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
