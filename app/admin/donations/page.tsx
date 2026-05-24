'use client';

import React, { useState, useRef } from 'react';

const MOCK_DONATIONS = [
  { id: 'd1', donor_name: 'Ramesh Kumar', donor_email: 'ramesh@email.com', donor_phone: '9848012345', amount_paise: 200000, cause: "Children's Education", frequency: 'one-time', payment_status: 'paid', razorpay_payment_id: 'pay_QAB123xyz', receipt_sent: true, created_at: '2025-05-21T09:12:00Z' },
  { id: 'd2', donor_name: 'Anjali Sharma', donor_email: 'anjali@email.com', donor_phone: '9845067890', amount_paise: 100000, cause: 'Where needed most', frequency: 'monthly', payment_status: 'paid', razorpay_payment_id: 'pay_QBC456abc', receipt_sent: true, created_at: '2025-05-21T08:45:00Z' },
  { id: 'd3', donor_name: 'TCS CSR Fund', donor_email: 'csr@tcs.com', donor_phone: '', amount_paise: 5000000, cause: 'Infrastructure', frequency: 'one-time', payment_status: 'paid', razorpay_payment_id: 'pay_QCD789def', receipt_sent: false, created_at: '2025-05-20T14:30:00Z' },
  { id: 'd4', donor_name: 'Pradeep Nair', donor_email: 'pradeep@email.com', donor_phone: '9840034567', amount_paise: 50000, cause: 'Elderly Medical Care', frequency: 'monthly', payment_status: 'paid', razorpay_payment_id: 'pay_QDE012ghi', receipt_sent: true, created_at: '2025-05-20T11:15:00Z' },
  { id: 'd5', donor_name: 'Vidya Rao', donor_email: 'vidya@email.com', donor_phone: '9846078901', amount_paise: 250000, cause: 'Food & Nutrition', frequency: 'one-time', payment_status: 'paid', razorpay_payment_id: 'pay_QEF345jkl', receipt_sent: true, created_at: '2025-05-19T16:20:00Z' },
];

type Donation = {
  id: string; donor_name: string; donor_email: string; donor_phone: string;
  amount_paise: number; cause: string; frequency: string; payment_status: string;
  razorpay_payment_id: string; receipt_sent: boolean; created_at: string;
};

// ─── CSV helpers ──────────────────────────────────────────────────────────────

const CSV_COLUMNS = [
  { key: 'donor_name',          label: 'donor_name',         required: true,  example: 'Ramesh Kumar' },
  { key: 'donor_email',         label: 'donor_email',        required: false, example: 'ramesh@email.com' },
  { key: 'donor_phone',         label: 'donor_phone',        required: false, example: '9848000000' },
  { key: 'amount_rupees',       label: 'amount_rupees',      required: true,  example: '2000' },
  { key: 'cause',               label: 'cause',              required: false, example: "Children's Education" },
  { key: 'frequency',           label: 'frequency',          required: false, example: 'one-time' },
  { key: 'payment_status',      label: 'payment_status',     required: false, example: 'paid' },
  { key: 'razorpay_payment_id', label: 'razorpay_payment_id',required: false, example: 'pay_XXXXXX' },
  { key: 'date',                label: 'date',               required: false, example: '2025-05-21' },
];

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    return row;
  });
}

function rowToDonation(row: Record<string, string>): Donation | null {
  const name = row['donor_name']?.trim();
  const amtRs = parseFloat(row['amount_rupees'] || row['amount'] || '0');
  if (!name || !amtRs) return null;
  return {
    id: `imp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    donor_name: name,
    donor_email: row['donor_email'] || '',
    donor_phone: row['donor_phone'] || '',
    amount_paise: Math.round(amtRs * 100),
    cause: row['cause'] || 'Where needed most',
    frequency: row['frequency'] || 'one-time',
    payment_status: row['payment_status'] || 'paid',
    razorpay_payment_id: row['razorpay_payment_id'] || '',
    receipt_sent: false,
    created_at: row['date'] ? new Date(row['date']).toISOString() : new Date().toISOString(),
  };
}

const SAMPLE_CSV = `donor_name,donor_email,donor_phone,amount_rupees,cause,frequency,payment_status,razorpay_payment_id,date
Ramesh Kumar,ramesh@email.com,9848000000,2000,Children's Education,one-time,paid,pay_XXXXXX,2025-05-21
Anjali Sharma,anjali@email.com,9845000000,1000,Food & Nutrition,monthly,paid,,2025-05-20`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>(MOCK_DONATIONS);
  const [search, setSearch] = useState('');
  const [causeFilter, setCauseFilter] = useState('All');
  const [freqFilter, setFreqFilter] = useState('All');
  const [showImport, setShowImport] = useState(false);
  const [preview, setPreview] = useState<Donation[]>([]);
  const [parseError, setParseError] = useState('');
  const [imported, setImported] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = donations.filter(d => {
    const matchSearch = !search || d.donor_name.toLowerCase().includes(search.toLowerCase()) || d.donor_email.toLowerCase().includes(search.toLowerCase());
    const matchCause = causeFilter === 'All' || d.cause === causeFilter;
    const matchFreq = freqFilter === 'All' || d.frequency === freqFilter;
    return matchSearch && matchCause && matchFreq;
  });

  const total = filtered.reduce((sum, d) => sum + d.amount_paise, 0);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete donation record from ${name}? This cannot be undone.`)) return;
    setDonations(prev => prev.filter(d => d.id !== id));
  };

  const exportCsv = () => {
    const headers = ['ID', 'Donor Name', 'Email', 'Phone', 'Amount (₹)', 'Cause', 'Frequency', 'Status', 'Payment ID', 'Receipt Sent', 'Date'];
    const rows = filtered.map(d => [d.id, d.donor_name, d.donor_email, d.donor_phone, d.amount_paise / 100, d.cause, d.frequency, d.payment_status, d.razorpay_payment_id, d.receipt_sent ? 'Yes' : 'No', new Date(d.created_at).toLocaleDateString('en-IN')]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `donations-${Date.now()}.csv`; a.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseError(''); setPreview([]); setImported(false);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      if (!rows.length) { setParseError('No data rows found. Check file format.'); return; }
      const parsed = rows.map(rowToDonation).filter(Boolean) as Donation[];
      if (!parsed.length) { setParseError('No valid rows. Ensure donor_name and amount_rupees columns exist.'); return; }
      setPreview(parsed);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    setDonations(prev => [...preview, ...prev]);
    setPreview([]); setImported(true);
    if (fileRef.current) fileRef.current.value = '';
  };

  const downloadSample = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([SAMPLE_CSV], { type: 'text/csv' }));
    a.download = 'donations_import_sample.csv'; a.click();
  };

  const inp: React.CSSProperties = { padding: '8px 14px', border: '1px solid #E5E0D6', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Donations</h1>
          <p style={{ fontSize: 13, color: '#9C9890' }}>{filtered.length} records · Total: ₹{(total / 100).toLocaleString('en-IN')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setShowImport(v => !v); setPreview([]); setImported(false); setParseError(''); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: showImport ? '#2A2825' : '#fff', color: showImport ? '#fff' : '#5C5852', border: '1px solid #E5E0D6', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            <i className="ti ti-table-import"></i> Bulk Import
          </button>
          <button onClick={exportCsv} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            <i className="ti ti-download"></i> Export CSV
          </button>
        </div>
      </div>

      {/* Bulk Import Panel */}
      {showImport && (
        <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Bulk Import Donations</div>
          <p style={{ fontSize: 13, color: '#9C9890', marginBottom: 20 }}>Upload a CSV file. First row must be column headers exactly as shown below.</p>

          {/* Column structure */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5C5852', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>Required CSV Structure</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#FAF9F6' }}>
                    {['Column Name', 'Required', 'Allowed Values / Example'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#5C5852', borderBottom: '1px solid #E5E0D6', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CSV_COLUMNS.map(c => (
                    <tr key={c.key} style={{ borderBottom: '1px solid #F3F1EC' }}>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#2A2825', fontWeight: 500 }}>{c.key}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: c.required ? '#FCEEF3' : '#F3F1EC', color: c.required ? '#C84B6E' : '#9C9890', fontWeight: 500 }}>
                          {c.required ? 'Required' : 'Optional'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#5C5852', fontFamily: 'monospace', fontSize: 11 }}>{c.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <i className="ti ti-info-circle" style={{ color: '#E8860A', fontSize: 14 }}></i>
              <span style={{ fontSize: 12, color: '#9C9890' }}>
                <strong>cause</strong> options: {["Children's Education", 'Elderly Medical Care', 'Food & Nutrition', 'Infrastructure', 'Where needed most'].join(' | ')}
              </span>
            </div>
            <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
              <i className="ti ti-info-circle" style={{ color: '#E8860A', fontSize: 14 }}></i>
              <span style={{ fontSize: 12, color: '#9C9890' }}>
                <strong>frequency</strong>: one-time | monthly &nbsp;·&nbsp; <strong>payment_status</strong>: paid | pending | failed
              </span>
            </div>
          </div>

          {/* Upload area */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFile}
              style={{ padding: '7px 12px', border: '1.5px dashed #E5E0D6', borderRadius: 8, fontSize: 13, flex: 1, minWidth: 240, cursor: 'pointer' }} />
            <button onClick={downloadSample} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#F3F1EC', color: '#5C5852', border: '1px solid #E5E0D6', borderRadius: 8, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <i className="ti ti-file-download"></i> Download Sample CSV
            </button>
          </div>

          {parseError && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#B91C1C', marginBottom: 12 }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 15 }}></i> {parseError}
            </div>
          )}

          {imported && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, fontSize: 13, color: '#166534', marginBottom: 12 }}>
              <i className="ti ti-circle-check" style={{ fontSize: 15 }}></i> Records imported successfully.
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, color: '#2A2825' }}>
                Preview — {preview.length} record{preview.length > 1 ? 's' : ''} ready to import
              </div>
              <div style={{ overflowX: 'auto', maxHeight: 220, overflowY: 'auto', border: '1px solid #E5E0D6', borderRadius: 8, marginBottom: 14 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#FAF9F6', zIndex: 1 }}>
                    <tr>
                      {['Donor', 'Amount', 'Cause', 'Frequency', 'Status', 'Date'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '7px 12px', color: '#9C9890', fontWeight: 600, textTransform: 'uppercase', fontSize: 10, letterSpacing: '.04em', borderBottom: '1px solid #E5E0D6', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map(d => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #F3F1EC' }}>
                        <td style={{ padding: '7px 12px', fontWeight: 500, color: '#2A2825' }}>{d.donor_name}<br /><span style={{ fontSize: 10, color: '#9C9890' }}>{d.donor_email}</span></td>
                        <td style={{ padding: '7px 12px', color: '#E8860A', fontWeight: 600 }}>₹{(d.amount_paise / 100).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '7px 12px', color: '#5C5852' }}>{d.cause}</td>
                        <td style={{ padding: '7px 12px', color: '#5C5852' }}>{d.frequency}</td>
                        <td style={{ padding: '7px 12px' }}>
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12, background: d.payment_status === 'paid' ? '#E1F5EE' : '#FEF3E2', color: d.payment_status === 'paid' ? '#1D9E75' : '#E8860A' }}>{d.payment_status}</span>
                        </td>
                        <td style={{ padding: '7px 12px', color: '#9C9890' }}>{new Date(d.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={handleImport} style={{ padding: '9px 24px', background: 'linear-gradient(135deg,#7A430A,#E8860A)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-table-import"></i> Import {preview.length} Record{preview.length > 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search donor name or email..." style={{ ...inp, width: 260 }} />
        <select value={causeFilter} onChange={e => setCauseFilter(e.target.value)} style={inp}>
          <option>All</option>
          {["Children's Education", 'Elderly Medical Care', 'Food & Nutrition', 'Infrastructure', 'Where needed most'].map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={freqFilter} onChange={e => setFreqFilter(e.target.value)} style={inp}>
          <option>All</option>
          <option>one-time</option>
          <option>monthly</option>
        </select>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#FAF9F6', borderBottom: '1px solid #E5E0D6' }}>
              {['Donor', 'Amount', 'Cause', 'Frequency', 'Payment ID', 'Receipt', 'Date', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: '#9C9890', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid #F3F1EC' }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#2A2825' }}>{d.donor_name}</div>
                  <div style={{ fontSize: 11, color: '#9C9890' }}>{d.donor_email}</div>
                </td>
                <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 600, color: '#E8860A' }}>₹{(d.amount_paise / 100).toLocaleString('en-IN')}</td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: '#5C5852' }}>{d.cause}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: d.frequency === 'monthly' ? '#EEEDFE' : '#F3F1EC', color: d.frequency === 'monthly' ? '#534AB7' : '#5C5852', fontWeight: 500 }}>
                    {d.frequency}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', fontSize: 11, color: '#9C9890', fontFamily: 'monospace' }}>{d.razorpay_payment_id || '—'}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: d.receipt_sent ? '#E1F5EE' : '#FCEEF3', color: d.receipt_sent ? '#1D9E75' : '#C84B6E', fontWeight: 500 }}>
                    {d.receipt_sent ? 'Sent' : 'Pending'}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: '#9C9890' }}>
                  {new Date(d.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <button onClick={() => handleDelete(d.id, d.donor_name)} style={{ padding: '5px 10px', background: '#FCEEF3', color: '#C84B6E', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="ti ti-trash" style={{ fontSize: 12 }}></i> Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9C9890', fontSize: 13 }}>No records match the current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
