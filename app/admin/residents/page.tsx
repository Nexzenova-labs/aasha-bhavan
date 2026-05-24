'use client';

import React, { useState, useRef } from 'react';

const INITIAL_RESIDENTS = [
  { id: 'r1', display_name: 'Arjun', type: 'child', age: 9, admission_year: 2020, short_bio: 'Loves cricket and drawing', needs: 'School fees & books', monthly_amount: 1200, is_sponsored: false, is_featured: true },
  { id: 'r2', display_name: 'Priya', type: 'child', age: 13, admission_year: 2017, short_bio: 'Aspiring doctor, class topper', needs: 'Tuition support', monthly_amount: 1500, is_sponsored: false, is_featured: true },
  { id: 'r3', display_name: 'Kavitha', type: 'child', age: 15, admission_year: 2014, short_bio: 'Board exams this year, loves computers', needs: 'Higher studies support', monthly_amount: 2000, is_sponsored: true, is_featured: false },
  { id: 'r4', display_name: 'Lakshmi Amma', type: 'elder', age: 74, admission_year: 2019, short_bio: 'Retired teacher, teaches Kannada', needs: 'Monthly medication', monthly_amount: 800, is_sponsored: false, is_featured: true },
  { id: 'r5', display_name: 'Subramaniam Garu', type: 'elder', age: 82, admission_year: 2016, short_bio: 'Former engineer, loves chess', needs: 'Physiotherapy', monthly_amount: 1200, is_sponsored: false, is_featured: true },
];

type Resident = {
  id: string; display_name: string; type: string; age: number;
  admission_year: number; short_bio: string; needs: string;
  monthly_amount: number; is_sponsored: boolean; is_featured: boolean;
};

// ─── CSV helpers ──────────────────────────────────────────────────────────────

const CSV_COLUMNS = [
  { key: 'display_name',    required: true,  example: 'Arjun',            note: 'First name or nickname only' },
  { key: 'type',            required: true,  example: 'child',            note: 'child | elder' },
  { key: 'age',             required: true,  example: '9',                note: 'Number' },
  { key: 'admission_year',  required: false, example: '2020',             note: 'Year admitted (e.g. 2018)' },
  { key: 'short_bio',       required: false, example: 'Loves cricket',    note: 'One sentence, shown publicly' },
  { key: 'needs',           required: false, example: 'School fees',      note: 'What support is needed' },
  { key: 'monthly_amount',  required: false, example: '1200',             note: 'Monthly sponsorship in ₹ (default 1000)' },
  { key: 'is_sponsored',    required: false, example: 'false',            note: 'true | false' },
  { key: 'is_featured',     required: false, example: 'true',             note: 'true | false — show on homepage' },
];

const SAMPLE_CSV = `display_name,type,age,admission_year,short_bio,needs,monthly_amount,is_sponsored,is_featured
Arjun,child,9,2020,Loves cricket and drawing,School fees & books,1200,false,true
Ravi,child,7,2022,Full of energy loves singing,Monthly sponsorship,1000,false,false
Lakshmi Amma,elder,74,2019,Retired teacher teaches Kannada,Monthly medication,800,false,true
Gopala Rao,elder,79,2017,Former farmer tends the garden,Knee treatment,1100,false,false`;

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

function rowToResident(row: Record<string, string>): Resident | null {
  const name = row['display_name']?.trim();
  const type = row['type']?.trim().toLowerCase();
  const age = parseInt(row['age'] || '0');
  if (!name || !['child', 'elder'].includes(type) || !age) return null;
  return {
    id: `imp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    display_name: name,
    type,
    age,
    admission_year: parseInt(row['admission_year'] || '') || new Date().getFullYear(),
    short_bio: row['short_bio'] || '',
    needs: row['needs'] || '',
    monthly_amount: parseInt(row['monthly_amount'] || '1000') || 1000,
    is_sponsored: row['is_sponsored']?.toLowerCase() === 'true',
    is_featured: row['is_featured']?.toLowerCase() === 'true',
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

const blank: Partial<Resident> = {
  display_name: '', type: 'child', age: 0,
  admission_year: new Date().getFullYear(),
  short_bio: '', needs: '', monthly_amount: 1000,
  is_sponsored: false, is_featured: false,
};

export default function ResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>(INITIAL_RESIDENTS);
  const [typeFilter, setTypeFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Partial<Resident> | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [preview, setPreview] = useState<Resident[]>([]);
  const [parseError, setParseError] = useState('');
  const [imported, setImported] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = typeFilter === 'All' ? residents : residents.filter(r => r.type === typeFilter);

  const handleSave = () => {
    if (!editing) return;
    if (editing.id) {
      setResidents(r => r.map(x => x.id === editing.id ? { ...x, ...editing } as Resident : x));
    } else {
      setResidents(r => [...r, { ...blank, ...editing, id: `r${Date.now()}` } as Resident]);
    }
    setShowForm(false); setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this resident entry?')) setResidents(r => r.filter(x => x.id !== id));
  };

  const toggleFeatured = (id: string) => {
    setResidents(r => r.map(x => x.id === id ? { ...x, is_featured: !x.is_featured } : x));
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
      const parsed = rows.map(rowToResident).filter(Boolean) as Resident[];
      if (!parsed.length) { setParseError('No valid rows. Ensure display_name, type (child/elder), and age columns exist.'); return; }
      setPreview(parsed);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    setResidents(prev => [...prev, ...preview]);
    setPreview([]); setImported(true);
    if (fileRef.current) fileRef.current.value = '';
  };

  const downloadSample = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([SAMPLE_CSV], { type: 'text/csv' }));
    a.download = 'residents_import_sample.csv'; a.click();
  };

  const inp: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #E5E0D6', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Residents</h1>
          <p style={{ fontSize: 13, color: '#9C9890' }}>{residents.filter(r => r.type === 'child').length} children · {residents.filter(r => r.type === 'elder').length} elders</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['All', 'child', 'elder'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #E5E0D6', background: typeFilter === t ? '#2A2825' : '#fff', color: typeFilter === t ? '#fff' : '#5C5852', fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}>
              {t === 'child' ? 'Children' : t === 'elder' ? 'Elders' : t}
            </button>
          ))}
          <button onClick={() => { setShowImport(v => !v); setPreview([]); setImported(false); setParseError(''); }} style={{ padding: '6px 14px', border: '1px solid #E5E0D6', background: showImport ? '#2A2825' : '#fff', color: showImport ? '#fff' : '#5C5852', borderRadius: 8, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <i className="ti ti-table-import"></i> Bulk Import
          </button>
          <button onClick={() => { setEditing({ ...blank }); setShowForm(true); setShowImport(false); }} style={{ padding: '6px 16px', background: '#E8860A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-plus"></i> Add Resident
          </button>
        </div>
      </div>

      {/* Bulk Import Panel */}
      {showImport && (
        <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Bulk Import Residents</div>
          <p style={{ fontSize: 13, color: '#9C9890', marginBottom: 20 }}>Upload a CSV. First row must be column headers exactly as shown. Use first names / nicknames only — no full names for privacy.</p>

          {/* Column structure */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5C5852', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>Required CSV Structure</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#FAF9F6' }}>
                    {['Column Name', 'Required', 'Example', 'Notes'].map(h => (
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
                      <td style={{ padding: '8px 12px', color: '#9C9890', fontSize: 11 }}>{c.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upload */}
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
              <i className="ti ti-circle-check" style={{ fontSize: 15 }}></i> Residents imported successfully.
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>{preview.length} resident{preview.length > 1 ? 's' : ''} ready to import</div>
              <div style={{ overflowX: 'auto', maxHeight: 220, overflowY: 'auto', border: '1px solid #E5E0D6', borderRadius: 8, marginBottom: 14 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#FAF9F6', zIndex: 1 }}>
                    <tr>
                      {['Name', 'Type', 'Age', 'Bio', 'Monthly ₹', 'Featured'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '7px 12px', color: '#9C9890', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid #E5E0D6', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #F3F1EC' }}>
                        <td style={{ padding: '7px 12px', fontWeight: 500, color: '#2A2825' }}>{r.display_name}</td>
                        <td style={{ padding: '7px 12px' }}>
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12, background: r.type === 'child' ? '#FEF3E2' : '#EEEDFE', color: r.type === 'child' ? '#E8860A' : '#534AB7' }}>{r.type}</span>
                        </td>
                        <td style={{ padding: '7px 12px', color: '#5C5852' }}>{r.age}</td>
                        <td style={{ padding: '7px 12px', color: '#9C9890', maxWidth: 200 }}>{r.short_bio}</td>
                        <td style={{ padding: '7px 12px', color: '#E8860A', fontWeight: 500 }}>₹{r.monthly_amount.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '7px 12px', textAlign: 'center' }}>
                          {r.is_featured ? <i className="ti ti-star-filled" style={{ color: '#F5A623' }}></i> : <i className="ti ti-star" style={{ color: '#D1CDCA' }}></i>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={handleImport} style={{ padding: '9px 24px', background: 'linear-gradient(135deg,#7A430A,#E8860A)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-table-import"></i> Import {preview.length} Resident{preview.length > 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && editing && (
        <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>{editing.id ? 'Edit Resident' : 'Add New Resident'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#5C5852', display: 'block', marginBottom: 4 }}>Display Name</label>
              <input value={editing.display_name || ''} onChange={e => setEditing(x => ({ ...x!, display_name: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#5C5852', display: 'block', marginBottom: 4 }}>Type</label>
              <select value={editing.type || 'child'} onChange={e => setEditing(x => ({ ...x!, type: e.target.value }))} style={inp}>
                <option value="child">Child</option>
                <option value="elder">Elder</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#5C5852', display: 'block', marginBottom: 4 }}>Age</label>
              <input type="number" value={editing.age || ''} onChange={e => setEditing(x => ({ ...x!, age: Number(e.target.value) }))} style={inp} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#5C5852', display: 'block', marginBottom: 4 }}>Short Bio</label>
              <input value={editing.short_bio || ''} onChange={e => setEditing(x => ({ ...x!, short_bio: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#5C5852', display: 'block', marginBottom: 4 }}>Monthly Sponsorship (₹)</label>
              <input type="number" value={editing.monthly_amount || ''} onChange={e => setEditing(x => ({ ...x!, monthly_amount: Number(e.target.value) }))} style={inp} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ padding: '8px 20px', background: '#E8860A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Save</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} style={{ padding: '8px 20px', background: '#F3F1EC', color: '#5C5852', border: '1px solid #E5E0D6', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#FAF9F6', borderBottom: '1px solid #E5E0D6' }}>
              {['Name', 'Type', 'Age', 'Bio', 'Monthly Sponsor', 'Status', 'Featured', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: '#9C9890', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #F3F1EC' }}>
                <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 500, color: '#2A2825' }}>{r.display_name}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: r.type === 'child' ? '#FEF3E2' : '#EEEDFE', color: r.type === 'child' ? '#E8860A' : '#534AB7', fontWeight: 500, textTransform: 'capitalize' }}>{r.type}</span>
                </td>
                <td style={{ padding: '12px 14px', fontSize: 13, color: '#5C5852' }}>{r.age}</td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: '#9C9890', maxWidth: 180 }}>{r.short_bio}</td>
                <td style={{ padding: '12px 14px', fontSize: 13, color: '#E8860A', fontWeight: 500 }}>₹{r.monthly_amount.toLocaleString('en-IN')}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: r.is_sponsored ? '#E1F5EE' : '#FEF3E2', color: r.is_sponsored ? '#1D9E75' : '#E8860A', fontWeight: 500 }}>
                    {r.is_sponsored ? 'Sponsored' : 'Needs Sponsor'}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                  <button onClick={() => toggleFeatured(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                    {r.is_featured
                      ? <i className="ti ti-star-filled" style={{ color: '#F5A623' }}></i>
                      : <i className="ti ti-star" style={{ color: '#D1CDCA' }}></i>}
                  </button>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditing(r); setShowForm(true); setShowImport(false); }} style={{ padding: '5px 12px', background: '#EEEDFE', color: '#534AB7', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(r.id)} style={{ padding: '5px 12px', background: '#FCEEF3', color: '#C84B6E', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9C9890', fontSize: 13 }}>No residents found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
