'use client';

import React, { useState } from 'react';

const MOCK_VOLUNTEERS = [
  { id: 'v1', name: 'Divya Menon', email: 'divya@email.com', phone: '9840056789', availability: 'Weekends', skills: 'Teaching, Music', message: 'I want to teach children music every Sunday.', status: 'pending', created_at: '2025-05-21T10:00:00Z' },
  { id: 'v2', name: 'Kiran Reddy', email: 'kiran@email.com', phone: '9845012345', availability: 'Weekends', skills: 'Medical (MBBS)', message: 'I can conduct monthly health check-ups.', status: 'approved', created_at: '2025-05-19T15:00:00Z' },
  { id: 'v3', name: 'Srinivas Rao', email: 'srini@email.com', phone: '9847034567', availability: 'Evenings', skills: 'Computers, Teaching', message: 'Can teach basic computer skills to older children.', status: 'pending', created_at: '2025-05-18T12:00:00Z' },
  { id: 'v4', name: 'Meera Iyer', email: 'meera@email.com', phone: '9841078901', availability: 'Weekends', skills: 'Cooking, General', message: 'Happy to help in the kitchen on festival days.', status: 'active', created_at: '2025-05-10T09:00:00Z' },
];

type Status = 'pending' | 'approved' | 'active' | 'rejected';

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState(MOCK_VOLUNTEERS);
  const [statusFilter, setStatusFilter] = useState('All');

  const updateStatus = (id: string, status: Status) => {
    setVolunteers(v => v.map(x => x.id === id ? { ...x, status } : x));
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Remove ${name} from volunteers? This cannot be undone.`)) return;
    setVolunteers(v => v.filter(x => x.id !== id));
  };

  const filtered = statusFilter === 'All' ? volunteers : volunteers.filter(v => v.status === statusFilter);

  const statusColor: Record<string, { bg: string; color: string }> = {
    pending: { bg: '#FEF3E2', color: '#E8860A' },
    approved: { bg: '#EEEDFE', color: '#534AB7' },
    active: { bg: '#E1F5EE', color: '#1D9E75' },
    rejected: { bg: '#FCEEF3', color: '#C84B6E' },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Volunteers</h1>
          <p style={{ fontSize: 13, color: '#9C9890' }}>{volunteers.filter(v => v.status === 'pending').length} pending review</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['All', 'pending', 'approved', 'active', 'rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #E5E0D6', background: statusFilter === s ? '#2A2825' : '#fff', color: statusFilter === s ? '#fff' : '#5C5852', fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(v => (
          <div key={v.id} style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, padding: '18px 20px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#534AB7', fontSize: 16 }}>
                  <i className="ti ti-user"></i>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#2A2825' }}>{v.name}</div>
                  <div style={{ fontSize: 12, color: '#9C9890' }}>{v.email} · {v.phone}</div>
                </div>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: statusColor[v.status]?.bg, color: statusColor[v.status]?.color, fontWeight: 500, marginLeft: 8, textTransform: 'capitalize' }}>
                  {v.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#5C5852', marginBottom: 8 }}>
                <span><i className="ti ti-clock" style={{ fontSize: 12, marginRight: 4 }}></i>{v.availability}</span>
                <span><i className="ti ti-tools" style={{ fontSize: 12, marginRight: 4 }}></i>{v.skills}</span>
              </div>
              {v.message && <div style={{ fontSize: 12, color: '#9C9890', fontStyle: 'italic', padding: '8px 12px', background: '#FAF9F6', borderRadius: 8, borderLeft: '3px solid #E5E0D6' }}>"{v.message}"</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {v.status === 'pending' && (
                <>
                  <button onClick={() => updateStatus(v.id, 'approved')} style={{ padding: '6px 14px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                    <i className="ti ti-check"></i> Approve
                  </button>
                  <button onClick={() => updateStatus(v.id, 'rejected')} style={{ padding: '6px 14px', background: '#FCEEF3', color: '#C84B6E', border: '1px solid #F7C4D0', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                    Reject
                  </button>
                </>
              )}
              {v.status === 'approved' && (
                <button onClick={() => updateStatus(v.id, 'active')} style={{ padding: '6px 14px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                  Mark Active
                </button>
              )}
              <button onClick={() => handleDelete(v.id, v.name)} style={{ padding: '6px 12px', background: '#FCEEF3', color: '#C84B6E', border: '1px solid #F7C4D0', borderRadius: 8, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <i className="ti ti-trash" style={{ fontSize: 13 }}></i> Delete
              </button>
              <div style={{ fontSize: 11, color: '#9C9890', marginTop: 4, textAlign: 'right', width: '100%' }}>
                {new Date(v.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
