'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TEMPLATES, type EmailTemplate } from '@/lib/email-templates';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Campaign {
  id: string;
  subject: string;
  template_type: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduled_at: string | null;
  sent_at: string | null;
  recipient_count: number;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  draft:     { bg: '#F3F1EC', color: '#5C5852', label: 'Draft' },
  scheduled: { bg: '#EEEDFE', color: '#534AB7', label: 'Scheduled' },
  sending:   { bg: '#FEF3E2', color: '#E8860A', label: 'Sending…' },
  sent:      { bg: '#E1F5EE', color: '#1D9E75', label: 'Sent' },
  failed:    { bg: '#FCEEF3', color: '#C84B6E', label: 'Failed' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.draft;
  return (
    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 300, background: type === 'success' ? '#1D9E75' : '#C84B6E', color: '#fff', borderRadius: 10, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, boxShadow: '0 4px 24px rgba(0,0,0,.18)', animation: 'slideUp .2s ease' }}>
      <i className={`ti ${type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} style={{ fontSize: 18 }}></i>
      {msg}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', cursor: 'pointer', fontSize: 16, marginLeft: 8 }}>×</button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ─── Step 1: Template picker ──────────────────────────────────────────────────

function TemplatePicker({ onSelect }: { onSelect: (t: EmailTemplate) => void }) {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#2A2825', marginBottom: 4 }}>Choose a Template</div>
      <p style={{ fontSize: 13, color: '#9C9890', marginBottom: 24 }}>Pick the type of email you want to send.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {TEMPLATES.map(t => (
          <button key={t.type} onClick={() => onSelect(t)}
            style={{ background: '#fff', border: '1.5px solid #E5E0D6', borderRadius: 12, padding: '20px 18px', cursor: 'pointer', textAlign: 'left', transition: 'border .15s, box-shadow .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.color; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 16px ${t.color}22`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E0D6'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2825', marginBottom: 4 }}>{t.name}</div>
            <div style={{ fontSize: 11, color: '#9C9890', lineHeight: 1.5 }}>{t.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Fill variables + preview ────────────────────────────────────────

function CampaignEditor({
  template, onBack, onSave,
}: {
  template: EmailTemplate;
  onBack: () => void;
  onSave: (subject: string, html: string, vars: Record<string, string>, scheduleAt: string | null) => void;
}) {
  const initVars: Record<string, string> = {};
  template.variables.forEach(v => { initVars[v.key] = v.defaultValue ?? ''; });

  const [vars, setVars] = useState<Record<string, string>>(initVars);
  const [subject, setSubject] = useState(template.defaultSubject(initVars));
  const [scheduleMode, setScheduleMode] = useState<'now' | 'scheduled'>('now');
  const [scheduleAt, setScheduleAt] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testMsg, setTestMsg] = useState('');

  const setVar = useCallback((k: string, v: string) => {
    setVars(prev => {
      const next = { ...prev, [k]: v };
      setSubject(template.defaultSubject(next));
      return next;
    });
  }, [template]);

  const html = template.render(vars, 'Aasha Bhavan');

  const handleSend = async () => {
    setSaving(true);
    onSave(subject, html, vars, scheduleMode === 'scheduled' ? scheduleAt : null);
  };

  const handleTest = async () => {
    if (!testEmail) return;
    setTestSending(true); setTestMsg('');
    try {
      const res = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'preview', test_email: testEmail, subject: `[TEST] ${subject}`, html_body: html }),
      });
      const data = await res.json();
      setTestMsg(data.error ? `Error: ${data.error}` : `✓ Sent to ${testEmail}`);
    } catch { setTestMsg('Failed to send'); }
    finally { setTestSending(false); }
  };

  const inp: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1.5px solid #E5E0D6', borderRadius: 8, fontSize: 13, color: '#2A2825', outline: 'none', boxSizing: 'border-box', background: '#FAFAF8' };

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid #E5E0D6', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer', color: '#5C5852', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-arrow-left"></i> Back
        </button>
        <div style={{ fontSize: 20 }}>{template.icon}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#2A2825' }}>{template.name}</div>
          <div style={{ fontSize: 12, color: '#9C9890' }}>{template.description}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E5E0D6', marginBottom: 24 }}>
        {(['edit', 'preview'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #E8860A' : '2px solid transparent', fontSize: 13, fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? '#E8860A' : '#9C9890', cursor: 'pointer', textTransform: 'capitalize', marginBottom: -1 }}>
            <i className={`ti ${tab === 'edit' ? 'ti-edit' : 'ti-eye'}`} style={{ marginRight: 6 }}></i>{tab}
          </button>
        ))}
      </div>

      {activeTab === 'edit' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          {/* Subject */}
          <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, padding: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5C5852', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Email Subject Line</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} style={{ ...inp, fontSize: 14 }} />
          </div>

          {/* Variables */}
          <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#2A2825', marginBottom: 16 }}>Template Content</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {template.variables.map(v => (
                <div key={v.key} style={v.type === 'textarea' ? { gridColumn: '1 / -1' } : {}}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5C5852', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>{v.label}</label>
                  {v.type === 'textarea' ? (
                    <textarea value={vars[v.key] || ''} onChange={e => setVar(v.key, e.target.value)}
                      rows={3} placeholder={v.placeholder}
                      style={{ ...inp, resize: 'vertical' as const, fontFamily: 'inherit' }} />
                  ) : (
                    <input type={v.type} value={vars[v.key] || ''} onChange={e => setVar(v.key, e.target.value)}
                      placeholder={v.placeholder} style={inp} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Send test */}
          <div style={{ background: '#FAF9F6', border: '1px solid #E5E0D6', borderRadius: 12, padding: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <i className="ti ti-flask" style={{ color: '#534AB7', fontSize: 16 }}></i>
            <span style={{ fontSize: 13, color: '#5C5852', marginRight: 4 }}>Send test:</span>
            <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="your@email.com"
              style={{ ...inp, width: 220, flex: 'none' }} />
            <button onClick={handleTest} disabled={testSending || !testEmail}
              style={{ padding: '8px 16px', background: testSending || !testEmail ? '#D1CDCA' : '#534AB7', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
              {testSending ? 'Sending…' : 'Send Test'}
            </button>
            {testMsg && <span style={{ fontSize: 12, color: testMsg.startsWith('✓') ? '#1D9E75' : '#C84B6E' }}>{testMsg}</span>}
          </div>
        </div>
      ) : (
        <div style={{ border: '1px solid #E5E0D6', borderRadius: 12, overflow: 'hidden', background: '#F3F1EC' }}>
          <div style={{ padding: '10px 16px', background: '#FAF9F6', borderBottom: '1px solid #E5E0D6', fontSize: 12, color: '#9C9890', display: 'flex', gap: 8 }}>
            <i className="ti ti-mail"></i> Preview — Subject: <strong style={{ color: '#2A2825' }}>{subject}</strong>
          </div>
          <div style={{ padding: 24, maxHeight: 600, overflowY: 'auto' }}>
            <iframe srcDoc={html} style={{ width: '100%', minHeight: 500, border: 'none', borderRadius: 8, background: '#fff' }} title="Email Preview" />
          </div>
        </div>
      )}

      {/* Schedule + Send */}
      <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, padding: 20, marginTop: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#2A2825', marginBottom: 16 }}>Schedule & Send</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[{ val: 'now', label: '⚡ Send Now', sub: 'Sends immediately to all subscribers' }, { val: 'scheduled', label: '📅 Schedule', sub: 'Pick a date and time' }].map(opt => (
            <button key={opt.val} onClick={() => setScheduleMode(opt.val as 'now' | 'scheduled')}
              style={{ flex: 1, padding: '12px 16px', border: `2px solid ${scheduleMode === opt.val ? '#E8860A' : '#E5E0D6'}`, borderRadius: 10, background: scheduleMode === opt.val ? '#FEF3E2' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: scheduleMode === opt.val ? '#E8860A' : '#2A2825' }}>{opt.label}</div>
              <div style={{ fontSize: 11, color: '#9C9890', marginTop: 2 }}>{opt.sub}</div>
            </button>
          ))}
        </div>

        {scheduleMode === 'scheduled' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5C5852', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>Send Date & Time</label>
            <input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              style={{ padding: '9px 13px', border: '1.5px solid #E5E0D6', borderRadius: 8, fontSize: 13, color: '#2A2825', outline: 'none', background: '#FAFAF8' }} />
          </div>
        )}

        <button onClick={handleSend} disabled={saving || (scheduleMode === 'scheduled' && !scheduleAt)}
          style={{ padding: '11px 32px', background: saving ? '#D1CDCA' : 'linear-gradient(135deg,#7A430A,#E8860A)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          {saving
            ? <><div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite' }}></div> Saving…</>
            : scheduleMode === 'now'
              ? <><i className="ti ti-send"></i> Send to All Subscribers</>
              : <><i className="ti ti-calendar-event"></i> Schedule Campaign</>}
        </button>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'pick' | 'edit'>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [sending, setSending] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch { setCampaigns([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const handleSaveCampaign = async (
    subject: string, html: string,
    _vars: Record<string, string>, scheduleAt: string | null
  ) => {
    const status = scheduleAt ? 'scheduled' : 'draft';
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject, html_body: html,
          template_type: selectedTemplate!.type,
          scheduled_at: scheduleAt, status,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // If send now, immediately trigger send
      if (!scheduleAt && data.campaign?.id) {
        const sendRes = await fetch('/api/campaigns/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: data.campaign.id }),
        });
        const sendData = await sendRes.json();
        if (sendData.error) throw new Error(sendData.error);
        setToast({ msg: `Campaign sent to ${sendData.sent} subscribers`, type: 'success' });
      } else {
        setToast({ msg: `Campaign scheduled for ${new Date(scheduleAt!).toLocaleString('en-IN')}`, type: 'success' });
      }

      setView('list');
      setSelectedTemplate(null);
      loadCampaigns();
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Failed', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    await fetch('/api/campaigns', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setCampaigns(c => c.filter(x => x.id !== id));
  };

  const handleSendNow = async (id: string) => {
    if (!confirm('Send this campaign to all subscribers now?')) return;
    setSending(id);
    try {
      const res = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setToast({ msg: `Sent to ${data.sent} subscribers`, type: 'success' });
      loadCampaigns();
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Failed', type: 'error' });
    } finally { setSending(null); }
  };

  const templateMeta = (type: string) => TEMPLATES.find(t => t.type === type);

  return (
    <div>
      {/* Header */}
      {view === 'list' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Email Campaigns</h1>
              <p style={{ fontSize: 13, color: '#9C9890' }}>Create and send newsletters to all subscribers.</p>
            </div>
            <button onClick={() => setView('pick')}
              style={{ padding: '9px 20px', background: 'linear-gradient(135deg,#7A430A,#E8860A)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-plus"></i> New Campaign
            </button>
          </div>

          {/* Cron info */}
          <div style={{ background: '#F8F7FF', border: '1px solid #D9D7F5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <i className="ti ti-clock-play" style={{ color: '#534AB7', fontSize: 16, flexShrink: 0, marginTop: 1 }}></i>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#2A2825', marginBottom: 2 }}>Automatic Scheduling</div>
              <p style={{ margin: 0, fontSize: 12, color: '#9C9890', lineHeight: 1.6 }}>
                Scheduled campaigns are sent automatically when a cron hits <code style={{ background: '#EEEDFE', padding: '1px 6px', borderRadius: 4, color: '#534AB7' }}>/api/cron/send-campaigns</code> with header <code style={{ background: '#EEEDFE', padding: '1px 6px', borderRadius: 4, color: '#534AB7' }}>Authorization: Bearer YOUR_CRON_SECRET</code>.
                &nbsp;Set up a free daily cron at <strong>cron-job.org</strong> or add to <strong>vercel.json</strong>.
                &nbsp;CRON_SECRET is in your <code style={{ background: '#EEEDFE', padding: '1px 6px', borderRadius: 4, color: '#534AB7' }}>.env.local</code>.
              </p>
            </div>
          </div>

          {/* Campaigns table */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 32, height: 32, border: '3px solid #E5E0D6', borderTopColor: '#E8860A', borderRadius: '50%', animation: 'spin .7s linear infinite' }}></div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : campaigns.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#2A2825', marginBottom: 6 }}>No campaigns yet</div>
              <p style={{ fontSize: 13, color: '#9C9890', margin: '0 0 20px' }}>Create your first newsletter campaign to keep subscribers updated.</p>
              <button onClick={() => setView('pick')} style={{ padding: '9px 24px', background: '#E8860A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                Create First Campaign
              </button>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#FAF9F6', borderBottom: '1px solid #E5E0D6' }}>
                    {['Template', 'Subject', 'Status', 'Scheduled / Sent', 'Recipients', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: '#9C9890', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(c => {
                    const meta = templateMeta(c.template_type);
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #F3F1EC' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 18 }}>{meta?.icon || '📧'}</span>
                            <span style={{ fontSize: 12, color: '#5C5852' }}>{meta?.name || c.template_type}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 500, color: '#2A2825', maxWidth: 240 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.subject}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}><StatusBadge status={c.status} /></td>
                        <td style={{ padding: '12px 14px', fontSize: 12, color: '#9C9890' }}>
                          {c.sent_at
                            ? `Sent ${new Date(c.sent_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
                            : c.scheduled_at
                              ? `${new Date(c.scheduled_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                              : '—'}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: 13, color: c.recipient_count ? '#1D9E75' : '#9C9890', fontWeight: c.recipient_count ? 500 : 400 }}>
                          {c.recipient_count || '—'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {(c.status === 'draft' || c.status === 'scheduled') && (
                              <button onClick={() => handleSendNow(c.id)} disabled={sending === c.id}
                                style={{ padding: '5px 12px', background: '#FEF3E2', color: '#E8860A', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                                {sending === c.id ? '…' : <><i className="ti ti-send" style={{ fontSize: 11 }}></i> Send Now</>}
                              </button>
                            )}
                            <button onClick={() => handleDelete(c.id)}
                              style={{ padding: '5px 10px', background: '#FCEEF3', color: '#C84B6E', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>
                              <i className="ti ti-trash" style={{ fontSize: 12 }}></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {view === 'pick' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <button onClick={() => setView('list')} style={{ background: 'none', border: '1px solid #E5E0D6', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer', color: '#5C5852', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-arrow-left"></i> Back
            </button>
            <h1 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>New Campaign</h1>
          </div>
          <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, padding: 28 }}>
            <TemplatePicker onSelect={t => { setSelectedTemplate(t); setView('edit'); }} />
          </div>
        </div>
      )}

      {view === 'edit' && selectedTemplate && (
        <div style={{ background: '#fff', border: '1px solid #E5E0D6', borderRadius: 12, padding: 28 }}>
          <CampaignEditor
            template={selectedTemplate}
            onBack={() => setView('pick')}
            onSave={handleSaveCampaign}
          />
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
