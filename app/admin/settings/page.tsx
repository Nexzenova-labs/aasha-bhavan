'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function supabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type SettingsMap = Record<string, string>;

const DEFAULTS: SettingsMap = {
  smtp_host: '',
  smtp_port: '587',
  smtp_user: '',
  smtp_pass: '',
  smtp_from: '',
  org_name: 'Aasha Bhavan',
  org_tagline: 'A Home of Hope for Children & Elders',
  org_address: 'Hyderabad, Telangana, India',
  reg_number: '',
  g80_number: '',
  founded_year: '2010',
  org_phone: '+91 98480 00000',
  org_whatsapp: '+919848000000',
  org_email: 'care@aashabhavanhyderabad.org',
  org_website: 'https://aashabhavan.org',
  bank_name: '',
  account_name: 'Aasha Bhavan Trust',
  account_number: '',
  ifsc_code: '',
  upi_id: '',
  instagram_url: '',
  facebook_url: '',
  youtube_url: '',
};

// ─── Toast ───────────────────────────────────────────────────────────────────

interface ToastState { msg: string; type: 'success' | 'error' | null }

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  useEffect(() => {
    if (!toast.type) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast.type) return null;
  const isOk = toast.type === 'success';
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 200,
      background: isOk ? '#1D9E75' : '#C84B6E',
      color: '#fff', borderRadius: 10, padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
      boxShadow: '0 4px 24px rgba(0,0,0,.18)',
      animation: 'slideUp .2s ease',
    }}>
      <i className={`ti ${isOk ? 'ti-circle-check' : 'ti-alert-circle'}`} style={{ fontSize: 18 }}></i>
      {toast.msg}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', cursor: 'pointer', fontSize: 16, marginLeft: 8, lineHeight: 1 }}>×</button>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

// ─── Field Components ─────────────────────────────────────────────────────────

function Field({ label, id, value, onChange, type = 'text', placeholder = '' }: {
  label: string; id: string; value: string;
  onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5C5852', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>
        {label}
      </label>
      <input
        id={id} type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '9px 13px', border: '1.5px solid #E5E0D6', borderRadius: 8, fontSize: 13, color: '#2A2825', outline: 'none', boxSizing: 'border-box', background: '#FAFAF8' }}
        onFocus={e => (e.target.style.borderColor = '#E8860A')}
        onBlur={e => (e.target.style.borderColor = '#E5E0D6')}
      />
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #F3F1EC', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: '#FEF3E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8860A', fontSize: 17 }}>
          <i className={`ti ${icon}`}></i>
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#2A2825' }}>{title}</span>
      </div>
      <div style={{ padding: 24 }}>
        {children}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>({ msg: '', type: null });
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);

  const set = useCallback((key: string, val: string) => {
    setSettings(s => ({ ...s, [key]: val }));
  }, []);

  // Load from Supabase
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase()
          .from('org_settings')
          .select('key, value');
        if (error) throw error;
        if (data?.length) {
          const map: SettingsMap = { ...DEFAULTS };
          data.forEach((r: { key: string; value: string }) => { map[r.key] = r.value ?? ''; });
          setSettings(map);
        }
      } catch {
        // Table may not exist yet — defaults suffice
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const rows = Object.entries(settings).map(([key, value]) => ({
        key, value, updated_at: new Date().toISOString(),
      }));
      const { error } = await supabase()
        .from('org_settings')
        .upsert(rows, { onConflict: 'key' });
      if (error) throw error;
      setToast({ msg: 'Settings saved successfully', type: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      setToast({ msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ width: 32, height: 32, border: '3px solid #E5E0D6', borderTopColor: '#E8860A', borderRadius: '50%', animation: 'spin .7s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 780 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 13, color: '#9C9890' }}>Manage organisation details, contact info, bank account, and social links.</p>
      </div>

      {/* Organisation Info */}
      <SectionCard title="Organisation Info" icon="ti-building">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Organisation Name" id="org_name" value={settings.org_name} onChange={v => set('org_name', v)} />
          <Field label="Founded Year" id="founded_year" value={settings.founded_year} onChange={v => set('founded_year', v)} placeholder="2010" />
        </div>
        <div style={{ marginTop: 14 }}>
          <Field label="Tagline" id="org_tagline" value={settings.org_tagline} onChange={v => set('org_tagline', v)} placeholder="A Home of Hope..." />
        </div>
        <div style={{ marginTop: 14 }}>
          <Field label="Address" id="org_address" value={settings.org_address} onChange={v => set('org_address', v)} placeholder="City, State, India" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
          <Field label="Registration Number" id="reg_number" value={settings.reg_number} onChange={v => set('reg_number', v)} placeholder="Societies/Trust reg. no." />
          <Field label="80G Certificate Number" id="g80_number" value={settings.g80_number} onChange={v => set('g80_number', v)} placeholder="80G-XXXXXX" />
        </div>
      </SectionCard>

      {/* Contact Details */}
      <SectionCard title="Contact Details" icon="ti-address-book">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Phone" id="org_phone" value={settings.org_phone} onChange={v => set('org_phone', v)} placeholder="+91 98480 00000" />
          <Field label="WhatsApp Number" id="org_whatsapp" value={settings.org_whatsapp} onChange={v => set('org_whatsapp', v)} placeholder="+919848000000" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
          <Field label="Email" id="org_email" value={settings.org_email} onChange={v => set('org_email', v)} type="email" placeholder="care@..." />
          <Field label="Website" id="org_website" value={settings.org_website} onChange={v => set('org_website', v)} placeholder="https://..." />
        </div>
      </SectionCard>

      {/* Bank / Donation Details */}
      <SectionCard title="Bank & Donation Details" icon="ti-credit-card">
        <div style={{ background: '#FFFBF0', border: '1px solid #F5E0A0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <i className="ti ti-info-circle" style={{ color: '#E8860A', fontSize: 15, flexShrink: 0, marginTop: 1 }}></i>
          <span style={{ fontSize: 12, color: '#7A5A10' }}>These details appear on tax receipts sent to donors. Keep them accurate and up to date.</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Bank Name" id="bank_name" value={settings.bank_name} onChange={v => set('bank_name', v)} placeholder="State Bank of India" />
          <Field label="Account Holder Name" id="account_name" value={settings.account_name} onChange={v => set('account_name', v)} placeholder="Aasha Bhavan Trust" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
          <Field label="Account Number" id="account_number" value={settings.account_number} onChange={v => set('account_number', v)} placeholder="XXXXXXXXXXXXXXXX" />
          <Field label="IFSC Code" id="ifsc_code" value={settings.ifsc_code} onChange={v => set('ifsc_code', v)} placeholder="SBIN0XXXXXX" />
        </div>
        <div style={{ marginTop: 14, maxWidth: 340 }}>
          <Field label="UPI ID" id="upi_id" value={settings.upi_id} onChange={v => set('upi_id', v)} placeholder="aashabhavan@sbi" />
        </div>
      </SectionCard>

      {/* SMTP / Email */}
      <SectionCard title="Email (SMTP) Configuration" icon="ti-mail-cog">
        <div style={{ background: '#FFFBF0', border: '1px solid #F5E0A0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <i className="ti ti-info-circle" style={{ color: '#E8860A', fontSize: 15, flexShrink: 0, marginTop: 1 }}></i>
          <span style={{ fontSize: 12, color: '#7A5A10' }}>
            These credentials are used to send newsletter campaigns to subscribers. Use Gmail App Password, Zoho, or any SMTP provider.
            &nbsp;<strong>Gmail:</strong> smtp.gmail.com · port 587 &nbsp;|&nbsp; <strong>Zoho:</strong> smtp.zoho.in · port 587
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
          <Field label="SMTP Host" id="smtp_host" value={settings.smtp_host} onChange={v => set('smtp_host', v)} placeholder="smtp.gmail.com" />
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5C5852', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>SMTP Port</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={settings.smtp_port} onChange={e => set('smtp_port', e.target.value)}
                style={{ flex: 1, padding: '9px 13px', border: '1.5px solid #E5E0D6', borderRadius: 8, fontSize: 13, color: '#2A2825', outline: 'none', boxSizing: 'border-box' as const, background: '#FAFAF8' }} />
              {['587', '465', '25'].map(p => (
                <button key={p} onClick={() => set('smtp_port', p)}
                  style={{ padding: '8px 12px', border: '1px solid #E5E0D6', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: settings.smtp_port === p ? '#2A2825' : '#fff', color: settings.smtp_port === p ? '#fff' : '#5C5852' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
          <Field label="SMTP Username (Email)" id="smtp_user" value={settings.smtp_user} onChange={v => set('smtp_user', v)} placeholder="info@aashabhavan.org" />
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5C5852', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>SMTP Password</label>
            <div style={{ position: 'relative' as const }}>
              <input
                type={showSmtpPass ? 'text' : 'password'}
                value={settings.smtp_pass}
                onChange={e => set('smtp_pass', e.target.value)}
                placeholder="App password or SMTP password"
                style={{ width: '100%', padding: '9px 40px 9px 13px', border: '1.5px solid #E5E0D6', borderRadius: 8, fontSize: 13, color: '#2A2825', outline: 'none', boxSizing: 'border-box' as const, background: '#FAFAF8' }}
              />
              <button onClick={() => setShowSmtpPass(v => !v)}
                style={{ position: 'absolute' as const, right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9C9890', fontSize: 16, lineHeight: 1 }}>
                <i className={`ti ${showSmtpPass ? 'ti-eye-off' : 'ti-eye'}`}></i>
              </button>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 380 }}>
          <Field label="From Address (displayed to recipients)" id="smtp_from" value={settings.smtp_from} onChange={v => set('smtp_from', v)} placeholder="care@aashabhavan.org" />
        </div>

        {/* Test email */}
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #F3F1EC' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2825', marginBottom: 10 }}>Send a Test Email</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const }}>
            <input
              type="email"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ flex: 1, minWidth: 220, padding: '9px 13px', border: '1.5px solid #E5E0D6', borderRadius: 8, fontSize: 13, color: '#2A2825', outline: 'none', background: '#FAFAF8' }}
            />
            <button
              disabled={testSending || !testEmail}
              onClick={async () => {
                setTestSending(true);
                try {
                  await handleSave();
                  const res = await fetch('/api/campaigns/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: 'test', test_email: testEmail, subject: 'SMTP Test — Aasha Bhavan', html_body: '<p>SMTP is configured correctly ✓</p>' }),
                  });
                  const data = await res.json();
                  if (data.error) throw new Error(data.error);
                  setToast({ msg: `Test email sent to ${testEmail}`, type: 'success' });
                } catch (err: unknown) {
                  setToast({ msg: err instanceof Error ? err.message : 'Failed to send test', type: 'error' });
                } finally {
                  setTestSending(false);
                }
              }}
              style={{ padding: '9px 20px', background: testSending || !testEmail ? '#D1CDCA' : '#534AB7', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: testSending || !testEmail ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' as const }}>
              {testSending ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite' }}></div> Sending…</> : <><i className="ti ti-send"></i> Send Test</>}
            </button>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9C9890' }}>Saves settings first, then sends a test email to verify SMTP is working.</p>
        </div>
      </SectionCard>

      {/* Social Media */}
      <SectionCard title="Social Media" icon="ti-share">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5C5852', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              <i className="ti ti-brand-instagram" style={{ marginRight: 4, color: '#C84B6E' }}></i>Instagram
            </label>
            <input value={settings.instagram_url} onChange={e => set('instagram_url', e.target.value)}
              placeholder="https://instagram.com/aashabhavan"
              style={{ width: '100%', padding: '9px 13px', border: '1.5px solid #E5E0D6', borderRadius: 8, fontSize: 13, color: '#2A2825', outline: 'none', boxSizing: 'border-box', background: '#FAFAF8' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5C5852', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              <i className="ti ti-brand-facebook" style={{ marginRight: 4, color: '#534AB7' }}></i>Facebook
            </label>
            <input value={settings.facebook_url} onChange={e => set('facebook_url', e.target.value)}
              placeholder="https://facebook.com/aashabhavan"
              style={{ width: '100%', padding: '9px 13px', border: '1.5px solid #E5E0D6', borderRadius: 8, fontSize: 13, color: '#2A2825', outline: 'none', boxSizing: 'border-box', background: '#FAFAF8' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5C5852', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              <i className="ti ti-brand-youtube" style={{ marginRight: 4, color: '#C84B6E' }}></i>YouTube
            </label>
            <input value={settings.youtube_url} onChange={e => set('youtube_url', e.target.value)}
              placeholder="https://youtube.com/@aashabhavan"
              style={{ width: '100%', padding: '9px 13px', border: '1.5px solid #E5E0D6', borderRadius: 8, fontSize: 13, color: '#2A2825', outline: 'none', boxSizing: 'border-box', background: '#FAFAF8' }} />
          </div>
        </div>
      </SectionCard>

      {/* Save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 40 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '11px 32px', background: saving ? '#C8A97A' : 'linear-gradient(135deg,#7A430A,#E8860A)',
            color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          {saving ? (
            <><div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite' }}></div> Saving…</>
          ) : (
            <><i className="ti ti-device-floppy"></i> Save All Settings</>
          )}
        </button>
      </div>

      <Toast toast={toast} onClose={() => setToast({ msg: '', type: null })} />
    </div>
  );
}
