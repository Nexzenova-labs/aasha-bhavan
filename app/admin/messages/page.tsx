'use client';

import React, { useState } from 'react';

const MOCK_MESSAGES = [
  { id: 'm1', name: 'Suresh Babu', email: 'suresh@email.com', phone: '9840023456', intent: 'Corporate CSR partnership', message: 'We are a 200-person company looking to partner with an NGO for our CSR activities. Can we schedule a call?', is_read: false, created_at: '2025-05-21T11:00:00Z' },
  { id: 'm2', name: 'Kavitha Iyer', email: 'kavitha@email.com', phone: '9845089012', intent: 'Volunteer my time', message: 'I am a retired teacher with 20 years of experience. I would love to teach English to the children on weekends.', is_read: false, created_at: '2025-05-21T09:30:00Z' },
  { id: 'm3', name: 'Dr. Ramana Murthy', email: 'dr.ramana@hospital.com', phone: '9841067890', intent: 'Donate goods / items', message: 'Our hospital has extra medicines and medical equipment that we would like to donate. Can you arrange a pickup?', is_read: false, created_at: '2025-05-20T16:45:00Z' },
  { id: 'm4', name: 'Anand Krishnan', email: 'anand@email.com', phone: '9847012345', intent: 'Sponsor a child / elder', message: 'I want to sponsor a child for their full education. Please tell me how to set up a monthly recurring donation.', is_read: false, created_at: '2025-05-20T14:15:00Z' },
  { id: 'm5', name: 'Padmini Rao', email: 'padmini@email.com', phone: '', intent: 'Just say hello', message: 'Your work is truly inspiring. My grandfather spent his last years in an old age home that was not kind to him. I am glad places like Aasha Bhavan exist.', is_read: true, created_at: '2025-05-19T10:00:00Z' },
];

const intentColors: Record<string, { bg: string; color: string }> = {
  'Corporate CSR partnership': { bg: '#EEEDFE', color: '#534AB7' },
  'Volunteer my time': { bg: '#E1F5EE', color: '#1D9E75' },
  'Donate goods / items': { bg: '#E1F5EE', color: '#1D9E75' },
  'Sponsor a child / elder': { bg: '#FEF3E2', color: '#E8860A' },
  'Donate money': { bg: '#FEF3E2', color: '#E8860A' },
  'Just say hello': { bg: '#F3F1EC', color: '#5C5852' },
};

export default function MessagesPage() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');

  const markRead = (id: string) => setMessages(m => m.map(x => x.id === id ? { ...x, is_read: true } : x));
  const handleDelete = (id: string) => {
    if (!confirm('Delete this message? This cannot be undone.')) return;
    if (selected === id) setSelected(null);
    setMessages(m => m.filter(x => x.id !== id));
  };
  const unread = messages.filter(m => !m.is_read).length;

  const filtered = filter === 'Unread' ? messages.filter(m => !m.is_read) : messages;
  const selectedMsg = messages.find(m => m.id === selected);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Contact Inbox</h1>
          <p style={{ fontSize: 13, color: '#9C9890' }}>{unread} unread messages</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['All', 'Unread'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #E5E0D6', background: filter === f ? '#2A2825' : '#fff', color: filter === f ? '#fff' : '#5C5852', fontSize: 12, cursor: 'pointer' }}>
              {f} {f === 'Unread' ? `(${unread})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedMsg ? '1fr 1.5fr' : '1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(m => (
            <div key={m.id}
              onClick={() => { setSelected(m.id); markRead(m.id); }}
              style={{ background: '#fff', border: `1px solid ${selected === m.id ? '#E8860A' : '#E5E0D6'}`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer', transition: 'border .15s', position: 'relative' }}>
              {!m.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8860A', position: 'absolute', top: 14, right: 36 }}></div>}
              <button onClick={e => { e.stopPropagation(); handleDelete(m.id); }} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#D1CDCA', fontSize: 15, lineHeight: 1, padding: 2 }} title="Delete">
                <i className="ti ti-trash"></i>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F3F1EC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C5852', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                  {m.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: m.is_read ? 400 : 600, color: '#2A2825', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: '#9C9890' }}>{new Date(m.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: intentColors[m.intent]?.bg || '#F3F1EC', color: intentColors[m.intent]?.color || '#5C5852', fontWeight: 500 }}>
                {m.intent}
              </span>
              <div style={{ fontSize: 12, color: '#9C9890', marginTop: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {m.message}
              </div>
            </div>
          ))}
        </div>

        {selectedMsg && (
          <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 500 }}>{selectedMsg.name}</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => handleDelete(selectedMsg.id)} style={{ background: '#FCEEF3', border: 'none', color: '#C84B6E', cursor: 'pointer', fontSize: 13, padding: '5px 12px', borderRadius: 7, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="ti ti-trash" style={{ fontSize: 13 }}></i> Delete
                </button>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#9C9890', cursor: 'pointer', fontSize: 18 }}>
                  <i className="ti ti-x"></i>
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, padding: '14px', background: '#FAF9F6', borderRadius: 10 }}>
              {selectedMsg.email && <div style={{ fontSize: 13 }}><span style={{ color: '#9C9890', marginRight: 8 }}>Email:</span><a href={`mailto:${selectedMsg.email}`} style={{ color: '#E8860A' }}>{selectedMsg.email}</a></div>}
              {selectedMsg.phone && <div style={{ fontSize: 13 }}><span style={{ color: '#9C9890', marginRight: 8 }}>Phone:</span><a href={`tel:${selectedMsg.phone}`}>{selectedMsg.phone}</a></div>}
              <div style={{ fontSize: 13 }}><span style={{ color: '#9C9890', marginRight: 8 }}>Intent:</span>
                <span style={{ padding: '2px 10px', borderRadius: 20, background: intentColors[selectedMsg.intent]?.bg, color: intentColors[selectedMsg.intent]?.color, fontSize: 12, fontWeight: 500 }}>
                  {selectedMsg.intent}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#9C9890' }}>{new Date(selectedMsg.created_at).toLocaleString('en-IN')}</div>
            </div>
            <div style={{ fontSize: 14, color: '#2A2825', lineHeight: 1.8, whiteSpace: 'pre-wrap', padding: '16px', background: '#FAF9F6', borderRadius: 10, marginBottom: 20 }}>
              {selectedMsg.message}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {selectedMsg.email && (
                <a href={`mailto:${selectedMsg.email}?subject=Re: Your message to Aasha Bhavan`} style={{ padding: '8px 18px', background: '#E8860A', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="ti ti-mail"></i> Reply via Email
                </a>
              )}
              {selectedMsg.phone && (
                <a href={`https://wa.me/${selectedMsg.phone.replace(/\D/g, '')}?text=Hello ${selectedMsg.name}, thank you for contacting Aasha Bhavan!`} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 18px', background: '#25D366', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="ti ti-brand-whatsapp"></i> WhatsApp
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
