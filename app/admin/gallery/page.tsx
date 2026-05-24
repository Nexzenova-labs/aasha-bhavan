'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

type Photo = {
  id: string;
  url: string | null;
  storage_path?: string;
  caption: string;
  category: string;
  is_featured: boolean;
  uploaded_at: string;
};

const catColors: Record<string, string> = { children: '#FEF3E2', elderly: '#EEEDFE', activity: '#E1F5EE', event: '#FCEEF3' };
const catTextColors: Record<string, string> = { children: '#E8860A', elderly: '#534AB7', activity: '#1D9E75', event: '#C84B6E' };
const catIcons: Record<string, string> = { children: 'ti-friends', elderly: 'ti-yoga', activity: 'ti-school', event: 'ti-gift' };

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('All');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('children');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch { setPhotos([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPhotos(); }, [loadPhotos]);

  const filtered = catFilter === 'All' ? photos : photos.filter(p => p.category === catFilter);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return setUploadError('Select a photo file first.');
    if (!caption.trim()) return setUploadError('Add a caption first.');
    setUploadError('');
    setUploading(true);

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('caption', caption.trim());
      form.append('category', category);

      const res = await fetch('/api/gallery', { method: 'POST', body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setPhotos(p => [data.photo, ...p]);
      setCaption('');
      setCategory('children');
      if (fileRef.current) fileRef.current.value = '';
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (id: string, storage_path?: string) => {
    if (!confirm('Delete this photo permanently?')) return;
    const res = await fetch('/api/gallery', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, storage_path }),
    });
    if ((await res.json()).ok) setPhotos(p => p.filter(x => x.id !== id));
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    setPhotos(p => p.map(x => x.id === id ? { ...x, is_featured: !current } : x));
    await fetch('/api/gallery', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_featured: !current }),
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Gallery</h1>
          <p style={{ fontSize: 13, color: '#9C9890' }}>{photos.length} photos · {photos.filter(p => p.is_featured).length} featured on homepage</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['All', 'children', 'elderly', 'activity', 'event'].map(c => (
            <button key={c} onClick={() => setCatFilter(c)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #E5E0D6', background: catFilter === c ? '#2A2825' : '#fff', color: catFilter === c ? '#fff' : '#5C5852', fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Form */}
      <div style={{ background: '#fff', border: '2px dashed #E5E0D6', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={{ fontSize: 12, color: '#5C5852', display: 'block', marginBottom: 4 }}>Caption</label>
            <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="E.g. Children's Annual Day celebration"
              style={{ width: '100%', padding: '9px 14px', border: '1px solid #E5E0D6', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 12, color: '#5C5852', display: 'block', marginBottom: 4 }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ width: '100%', padding: '9px 14px', border: '1px solid #E5E0D6', borderRadius: 8, fontSize: 13, outline: 'none' }}>
              <option value="children">Children</option>
              <option value="elderly">Elderly</option>
              <option value="activity">Activity</option>
              <option value="event">Event</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 12, color: '#5C5852', display: 'block', marginBottom: 4 }}>Photo File</label>
            <input ref={fileRef} type="file" accept="image/*"
              style={{ width: '100%', padding: '7px 14px', border: '1px solid #E5E0D6', borderRadius: 8, fontSize: 12 }} />
          </div>
          <button onClick={handleUpload} disabled={uploading}
            style={{ padding: '9px 20px', background: uploading ? '#C8A97A' : '#E8860A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            {uploading
              ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite' }}></div> Uploading…</>
              : <><i className="ti ti-upload"></i> Upload Photo</>}
          </button>
        </div>
        {uploadError && (
          <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: '#C84B6E' }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 15 }}></i> {uploadError}
          </div>
        )}
        <p style={{ margin: '10px 0 0', fontSize: 12, color: '#9C9890' }}>
          ⭐ Star-featured photos appear on the homepage gallery. Supported: JPG, PNG, WebP · Max 5 MB.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #E5E0D6', borderTopColor: '#E8860A', borderRadius: '50%', animation: 'spin .7s linear infinite' }}></div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#2A2825', marginBottom: 6 }}>No photos yet</div>
          <p style={{ fontSize: 13, color: '#9C9890', margin: 0 }}>Upload photos above — they will appear on the homepage.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {filtered.map(p => (
              <div key={p.id} style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 10, overflow: 'hidden' }}>
                {/* Image or placeholder */}
                <div style={{ height: 140, background: catColors[p.category] || '#F3F1EC', position: 'relative', overflow: 'hidden' }}>
                  {p.url ? (
                    <img src={p.url} alt={p.caption}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`ti ${catIcons[p.category] || 'ti-photo'}`} style={{ fontSize: 40, color: catTextColors[p.category], opacity: .4 }}></i>
                    </div>
                  )}
                  {p.is_featured && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: '#F5A623', borderRadius: 6, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="ti ti-star-filled" style={{ fontSize: 12, color: '#fff' }}></i>
                    </div>
                  )}
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 12, color: '#2A2825', marginBottom: 4, lineHeight: 1.4 }}>{p.caption}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: catColors[p.category], color: catTextColors[p.category], textTransform: 'capitalize' }}>{p.category}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => toggleFeatured(p.id, p.is_featured)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.is_featured ? '#F5A623' : '#9C9890', fontSize: 16 }}
                        title={p.is_featured ? 'Remove from homepage' : 'Feature on homepage'}>
                        <i className={`ti ${p.is_featured ? 'ti-star-filled' : 'ti-star'}`}></i>
                      </button>
                      <button onClick={() => deletePhoto(p.id, p.storage_path)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C84B6E', fontSize: 16 }}>
                        <i className="ti ti-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </>
      )}
    </div>
  );
}
