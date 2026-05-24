// ─── Shared wrapper ──────────────────────────────────────────────────────────

function wrap(content: string, orgName = 'Aasha Bhavan', unsubUrl = '#'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${orgName}</title></head>
<body style="margin:0;padding:0;background:#F3F1EC;font-family:'DM Sans',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F1EC;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(42,40,37,.08);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#2A2825,#3D3A35);padding:28px 36px;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:10px;">
          <div style="width:40px;height:40px;background:linear-gradient(135deg,#7A430A,#E8860A);border-radius:10px;display:inline-block;line-height:40px;text-align:center;font-size:20px;">🏠</div>
          <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-.3px;">${orgName}</span>
        </div>
      </td></tr>
      <!-- Content -->
      <tr><td style="padding:36px;">
        ${content}
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#FAF9F6;padding:24px 36px;border-top:1px solid #E5E0D6;text-align:center;">
        <p style="margin:0 0 8px;font-size:12px;color:#9C9890;">You are receiving this because you subscribed to updates from ${orgName}.</p>
        <p style="margin:0;font-size:12px;color:#9C9890;">
          <a href="${unsubUrl}" style="color:#E8860A;text-decoration:none;">Unsubscribe</a> &nbsp;·&nbsp;
          Aasha Bhavan, Hyderabad, Telangana
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function badge(text: string, color: string, bg: string): string {
  return `<span style="display:inline-block;padding:4px 14px;background:${bg};color:${color};border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">${text}</span>`;
}

function ctaButton(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#7A430A,#E8860A);color:#fff;text-decoration:none;border-radius:9px;font-size:15px;font-weight:600;margin:8px 0;">${text}</a>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #E5E0D6;margin:28px 0;">`;
}

// ─── Template definitions ──────────────────────────────────────────────────

export interface TemplateVar {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'number' | 'url';
  defaultValue?: string;
}

export interface EmailTemplate {
  type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  variables: TemplateVar[];
  defaultSubject: (vars: Record<string, string>) => string;
  render: (vars: Record<string, string>, orgName?: string) => string;
}

// ─── 1. Monthly Newsletter ────────────────────────────────────────────────────

const monthlyNewsletter: EmailTemplate = {
  type: 'monthly_update',
  name: 'Monthly Newsletter',
  description: 'Regular updates — stories, events, impact numbers.',
  icon: '📰',
  color: '#E8860A',
  variables: [
    { key: 'month_year', label: 'Month & Year', placeholder: 'June 2025', type: 'text', defaultValue: 'June 2025' },
    { key: 'opening_message', label: 'Opening Message', placeholder: 'This month was filled with joy...', type: 'textarea', defaultValue: 'This month was filled with joy and milestones at Aasha Bhavan.' },
    { key: 'highlight_1', label: 'Highlight 1', placeholder: '6 children cleared board exams', type: 'text', defaultValue: '6 children cleared board exams with distinction' },
    { key: 'highlight_2', label: 'Highlight 2', placeholder: 'Medical camp for 47 elderly', type: 'text', defaultValue: 'Monthly medical camp covered all 47 elderly residents' },
    { key: 'highlight_3', label: 'Highlight 3', placeholder: 'New kitchen inaugurated', type: 'text', defaultValue: 'New eco-friendly kitchen inaugurated by donors' },
    { key: 'children_count', label: 'Children Count', placeholder: '68', type: 'number', defaultValue: '68' },
    { key: 'elders_count', label: 'Elders Count', placeholder: '47', type: 'number', defaultValue: '47' },
    { key: 'cta_url', label: 'Donate Button URL', placeholder: 'https://aashabhavan.org/#donate', type: 'url', defaultValue: 'https://aashabhavan.org/#donate' },
  ],
  defaultSubject: v => `${v.month_year || 'Monthly'} Update from Aasha Bhavan`,
  render: (v, orgName = 'Aasha Bhavan') => wrap(`
    <p style="margin:0 0 6px;">${badge('Monthly Update', '#E8860A', '#FEF3E2')}</p>
    <h1 style="margin:14px 0 8px;font-size:26px;font-weight:700;color:#2A2825;line-height:1.3;">${v.month_year || 'Monthly'} Updates from Our Family</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#5C5852;line-height:1.7;">${v.opening_message || ''}</p>
    ${divider()}
    <h2 style="margin:0 0 16px;font-size:17px;font-weight:600;color:#2A2825;">✨ This Month's Highlights</h2>
    ${[v.highlight_1, v.highlight_2, v.highlight_3].filter(Boolean).map(h =>
      `<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;">
        <div style="width:22px;height:22px;background:#E8860A;border-radius:50%;flex-shrink:0;margin-top:2px;text-align:center;line-height:22px;color:#fff;font-size:12px;font-weight:700;">✓</div>
        <p style="margin:0;font-size:14px;color:#2A2825;line-height:1.6;">${h}</p>
      </div>`
    ).join('')}
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td width="50%" style="padding:16px;background:#FEF3E2;border-radius:10px;text-align:center;">
          <div style="font-size:32px;font-weight:700;color:#E8860A;">${v.children_count || '68'}</div>
          <div style="font-size:12px;color:#7A5A10;text-transform:uppercase;letter-spacing:.05em;margin-top:4px;">Children in Our Care</div>
        </td>
        <td width="8px"></td>
        <td width="50%" style="padding:16px;background:#EEEDFE;border-radius:10px;text-align:center;">
          <div style="font-size:32px;font-weight:700;color:#534AB7;">${v.elders_count || '47'}</div>
          <div style="font-size:12px;color:#3A336A;text-transform:uppercase;letter-spacing:.05em;margin-top:4px;">Elders in Our Care</div>
        </td>
      </tr>
    </table>
    <div style="text-align:center;padding:8px 0;">
      <p style="margin:0 0 16px;font-size:14px;color:#5C5852;">Every contribution makes these numbers possible. Thank you.</p>
      ${ctaButton('Donate Now', v.cta_url || '#')}
    </div>
  `, orgName),
};

// ─── 2. Event Invitation ──────────────────────────────────────────────────────

const eventInvitation: EmailTemplate = {
  type: 'event_invitation',
  name: 'Event Invitation',
  description: 'Open house, volunteer drives, celebrations, camps.',
  icon: '🎉',
  color: '#534AB7',
  variables: [
    { key: 'event_name', label: 'Event Name', placeholder: 'Annual Day Celebration 2025', type: 'text', defaultValue: 'Annual Day Celebration 2025' },
    { key: 'event_date', label: 'Event Date', placeholder: '21 June 2025', type: 'text', defaultValue: '21 June 2025' },
    { key: 'event_time', label: 'Event Time', placeholder: '5:00 PM – 8:00 PM', type: 'text', defaultValue: '5:00 PM – 8:00 PM' },
    { key: 'event_venue', label: 'Venue', placeholder: 'Aasha Bhavan, Banjara Hills', type: 'text', defaultValue: 'Aasha Bhavan, Hyderabad' },
    { key: 'description', label: 'Description', placeholder: 'Our children perform music, dance...', type: 'textarea', defaultValue: 'Our children will perform music, dance, and drama. Come celebrate with our family and see the impact of your support firsthand.' },
    { key: 'rsvp_contact', label: 'RSVP Contact Name', placeholder: 'Priya (Admin)', type: 'text', defaultValue: 'Admin Team' },
    { key: 'rsvp_phone', label: 'RSVP Phone', placeholder: '+91 98480 00000', type: 'text', defaultValue: '+91 98480 00000' },
    { key: 'rsvp_url', label: 'RSVP Link (optional)', placeholder: 'https://aashabhavan.org/events', type: 'url', defaultValue: 'https://aashabhavan.org/#events' },
  ],
  defaultSubject: v => `You're Invited: ${v.event_name || 'Event'} — Aasha Bhavan`,
  render: (v, orgName = 'Aasha Bhavan') => wrap(`
    <p style="margin:0 0 6px;">${badge('You\'re Invited', '#534AB7', '#EEEDFE')}</p>
    <h1 style="margin:14px 0 8px;font-size:26px;font-weight:700;color:#2A2825;line-height:1.3;">${v.event_name || 'Event Invitation'}</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#5C5852;line-height:1.7;">${v.description || ''}</p>
    <div style="background:#F8F7FF;border:1px solid #D9D7F5;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;font-size:14px;color:#5C5852;width:90px;">📅 <strong>Date</strong></td><td style="padding:6px 0;font-size:14px;color:#2A2825;font-weight:500;">${v.event_date || ''}</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#5C5852;">⏰ <strong>Time</strong></td><td style="padding:6px 0;font-size:14px;color:#2A2825;font-weight:500;">${v.event_time || ''}</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#5C5852;">📍 <strong>Venue</strong></td><td style="padding:6px 0;font-size:14px;color:#2A2825;font-weight:500;">${v.event_venue || ''}</td></tr>
      </table>
    </div>
    <div style="background:#FAF9F6;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:13px;color:#9C9890;text-transform:uppercase;letter-spacing:.05em;">RSVP / Contact</p>
      <p style="margin:0;font-size:14px;color:#2A2825;">${v.rsvp_contact || ''} &nbsp;·&nbsp; <a href="tel:${v.rsvp_phone || ''}" style="color:#E8860A;">${v.rsvp_phone || ''}</a></p>
    </div>
    <div style="text-align:center;">${ctaButton('RSVP Now', v.rsvp_url || '#')}</div>
  `, orgName),
};

// ─── 3. Urgent Appeal ────────────────────────────────────────────────────────

const urgentAppeal: EmailTemplate = {
  type: 'urgent_appeal',
  name: 'Urgent Appeal',
  description: 'Emergency medical fund, monsoon prep, urgent need.',
  icon: '🆘',
  color: '#C84B6E',
  variables: [
    { key: 'appeal_title', label: 'Appeal Title', placeholder: 'Medical Fund for 12 Elderly Residents', type: 'text', defaultValue: 'Urgent Medical Fund for Our Elderly' },
    { key: 'situation', label: 'Situation Description', placeholder: 'Twelve of our elderly residents require...', type: 'textarea', defaultValue: 'Twelve of our elderly residents require urgent specialist treatment this month. Without your help, we cannot cover the full medical expenses.' },
    { key: 'goal_amount', label: 'Goal Amount (₹)', placeholder: '1,80,000', type: 'text', defaultValue: '1,80,000' },
    { key: 'raised_amount', label: 'Raised So Far (₹)', placeholder: '72,000', type: 'text', defaultValue: '72,000' },
    { key: 'deadline', label: 'Deadline', placeholder: '30 June 2025', type: 'text', defaultValue: '30 June 2025' },
    { key: 'donate_url', label: 'Donate Button URL', placeholder: 'https://aashabhavan.org/#donate', type: 'url', defaultValue: 'https://aashabhavan.org/#donate' },
  ],
  defaultSubject: v => `Urgent: ${v.appeal_title || 'We Need Your Help'} — Aasha Bhavan`,
  render: (v, orgName = 'Aasha Bhavan') => {
    const goal = parseFloat((v.goal_amount || '180000').replace(/[^0-9.]/g, '')) || 180000;
    const raised = parseFloat((v.raised_amount || '72000').replace(/[^0-9.]/g, '')) || 72000;
    const pct = Math.min(100, Math.round((raised / goal) * 100));
    return wrap(`
    <p style="margin:0 0 6px;">${badge('Urgent Appeal', '#C84B6E', '#FCEEF3')}</p>
    <h1 style="margin:14px 0 8px;font-size:24px;font-weight:700;color:#2A2825;line-height:1.3;">${v.appeal_title || 'We Need Your Help'}</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#5C5852;line-height:1.7;">${v.situation || ''}</p>
    <div style="background:#FEF9F0;border:1px solid #F5D9A0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <span style="font-size:13px;color:#9C9890;">Raised: <strong style="color:#2A2825;">₹${v.raised_amount || '0'}</strong></span>
        <span style="font-size:13px;color:#9C9890;">Goal: <strong style="color:#2A2825;">₹${v.goal_amount || '0'}</strong></span>
      </div>
      <div style="background:#E5E0D6;border-radius:20px;height:10px;overflow:hidden;">
        <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#E8860A,#F5A623);border-radius:20px;"></div>
      </div>
      <p style="margin:10px 0 0;font-size:12px;color:#9C9890;text-align:right;">${pct}% funded · Deadline: ${v.deadline || ''}</p>
    </div>
    <div style="text-align:center;">
      <p style="margin:0 0 16px;font-size:14px;color:#C84B6E;font-weight:500;">⏰ Time is running out. Every rupee matters.</p>
      ${ctaButton('Donate Now', v.donate_url || '#')}
    </div>
  `, orgName);
  },
};

// ─── 4. Festival Greetings ────────────────────────────────────────────────────

const festivalGreetings: EmailTemplate = {
  type: 'festival_greetings',
  name: 'Festival Greetings',
  description: 'Diwali, Eid, Christmas, New Year, Ugadi wishes.',
  icon: '🪔',
  color: '#1D9E75',
  variables: [
    { key: 'festival_name', label: 'Festival Name', placeholder: 'Diwali', type: 'text', defaultValue: 'Diwali' },
    { key: 'greeting_heading', label: 'Greeting Heading', placeholder: 'Wishing You a Bright Diwali', type: 'text', defaultValue: 'Wishing You a Bright Diwali' },
    { key: 'greeting_message', label: 'Message', placeholder: 'This Diwali, our children lit diyas...', type: 'textarea', defaultValue: 'This Diwali, our 68 children and 47 elders lit diyas together in our courtyard. May this festival bring light, joy, and warmth to your home just as you bring it to ours through your support.' },
    { key: 'from_team', label: 'From (signature)', placeholder: 'The Aasha Bhavan Family', type: 'text', defaultValue: 'The Aasha Bhavan Family' },
  ],
  defaultSubject: v => `Happy ${v.festival_name || 'Festive Season'} from Aasha Bhavan 🪔`,
  render: (v, orgName = 'Aasha Bhavan') => wrap(`
    <div style="text-align:center;padding:16px 0 24px;">
      <div style="font-size:56px;margin-bottom:8px;">🪔</div>
      <p style="margin:0 0 6px;">${badge(v.festival_name || 'Festival', '#1D9E75', '#E1F5EE')}</p>
      <h1 style="margin:14px 0 8px;font-size:26px;font-weight:700;color:#2A2825;line-height:1.3;">${v.greeting_heading || 'Warm Festival Wishes'}</h1>
    </div>
    ${divider()}
    <p style="font-size:16px;color:#5C5852;line-height:1.8;text-align:center;margin:0 0 28px;">${v.greeting_message || ''}</p>
    ${divider()}
    <p style="text-align:center;margin:0;font-size:15px;color:#2A2825;font-weight:600;">With love,<br><span style="color:#E8860A;">${v.from_team || orgName}</span></p>
  `, orgName),
};

// ─── 5. Volunteer Drive ───────────────────────────────────────────────────────

const volunteerDrive: EmailTemplate = {
  type: 'volunteer_drive',
  name: 'Volunteer Drive',
  description: 'Recruit volunteers for a specific day or ongoing program.',
  icon: '🤝',
  color: '#534AB7',
  variables: [
    { key: 'drive_title', label: 'Drive Title', placeholder: 'Weekend Volunteer Drive — June 8', type: 'text', defaultValue: 'Weekend Volunteer Drive' },
    { key: 'drive_date', label: 'Date', placeholder: '8 June 2025', type: 'text', defaultValue: '8 June 2025' },
    { key: 'drive_time', label: 'Time', placeholder: '9:00 AM – 4:00 PM', type: 'text', defaultValue: '9:00 AM – 4:00 PM' },
    { key: 'skills_needed', label: 'Skills / Roles Needed', placeholder: 'Teaching, medical, cooking, storytelling', type: 'text', defaultValue: 'Teaching, medical support, cooking, storytelling' },
    { key: 'description', label: 'Description', placeholder: 'Spend a Saturday making a real difference...', type: 'textarea', defaultValue: 'Spend a Saturday making a real difference. Our children love meeting new people and our elders cherish conversation and companionship. Come with an open heart.' },
    { key: 'contact_name', label: 'Contact Name', placeholder: 'Priya — Volunteer Coordinator', type: 'text', defaultValue: 'Volunteer Coordinator' },
    { key: 'contact_phone', label: 'Contact Phone', placeholder: '+91 98480 00000', type: 'text', defaultValue: '+91 98480 00000' },
    { key: 'signup_url', label: 'Signup Link', placeholder: 'https://aashabhavan.org/#volunteer', type: 'url', defaultValue: 'https://aashabhavan.org/#volunteer' },
  ],
  defaultSubject: v => `Join Us: ${v.drive_title || 'Volunteer Drive'} — Aasha Bhavan`,
  render: (v, orgName = 'Aasha Bhavan') => wrap(`
    <p style="margin:0 0 6px;">${badge('Volunteer Drive', '#534AB7', '#EEEDFE')}</p>
    <h1 style="margin:14px 0 8px;font-size:26px;font-weight:700;color:#2A2825;line-height:1.3;">${v.drive_title || 'Join Us as a Volunteer'}</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#5C5852;line-height:1.7;">${v.description || ''}</p>
    <div style="background:#F8F7FF;border:1px solid #D9D7F5;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;font-size:14px;color:#5C5852;width:120px;">📅 <strong>Date</strong></td><td style="padding:6px 0;font-size:14px;color:#2A2825;">${v.drive_date || ''}</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#5C5852;">⏰ <strong>Time</strong></td><td style="padding:6px 0;font-size:14px;color:#2A2825;">${v.drive_time || ''}</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#5C5852;">🛠️ <strong>Roles</strong></td><td style="padding:6px 0;font-size:14px;color:#2A2825;">${v.skills_needed || ''}</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#5C5852;">📞 <strong>Contact</strong></td><td style="padding:6px 0;font-size:14px;color:#2A2825;">${v.contact_name || ''} · <a href="tel:${v.contact_phone}" style="color:#E8860A;">${v.contact_phone || ''}</a></td></tr>
      </table>
    </div>
    <div style="text-align:center;">${ctaButton('Sign Up to Volunteer', v.signup_url || '#')}</div>
  `, orgName),
};

// ─── 6. Annual Impact Report ──────────────────────────────────────────────────

const annualReport: EmailTemplate = {
  type: 'annual_report',
  name: 'Annual Impact Report',
  description: 'Year-end summary — numbers, achievements, gratitude.',
  icon: '📊',
  color: '#E8860A',
  variables: [
    { key: 'year', label: 'Year', placeholder: '2024-25', type: 'text', defaultValue: '2024–25' },
    { key: 'children_count', label: 'Children Supported', placeholder: '68', type: 'number', defaultValue: '68' },
    { key: 'elders_count', label: 'Elders Supported', placeholder: '47', type: 'number', defaultValue: '47' },
    { key: 'volunteers_count', label: 'Volunteers', placeholder: '120', type: 'number', defaultValue: '120' },
    { key: 'total_donations', label: 'Total Donations Received', placeholder: '₹18,42,600', type: 'text', defaultValue: '₹18,42,600' },
    { key: 'achievement_1', label: 'Achievement 1', placeholder: '12 children enrolled in college', type: 'text', defaultValue: '12 children enrolled in college for the first time' },
    { key: 'achievement_2', label: 'Achievement 2', placeholder: 'New kitchen inaugurated', type: 'text', defaultValue: 'State-of-the-art kitchen inaugurated, improving nutrition' },
    { key: 'achievement_3', label: 'Achievement 3', placeholder: '100% health checkup coverage', type: 'text', defaultValue: '100% of residents received quarterly health check-ups' },
    { key: 'thank_you_message', label: 'Thank You Message', placeholder: 'None of this would be possible...', type: 'textarea', defaultValue: 'None of this would be possible without you. Your generosity gives these 115 lives dignity, hope, and a future. Thank you from every member of our family.' },
    { key: 'donate_url', label: 'Donate URL', placeholder: 'https://aashabhavan.org/#donate', type: 'url', defaultValue: 'https://aashabhavan.org/#donate' },
  ],
  defaultSubject: v => `Our ${v.year || ''} Impact Report — Thank You from Aasha Bhavan`,
  render: (v, orgName = 'Aasha Bhavan') => wrap(`
    <p style="margin:0 0 6px;">${badge(`${v.year || ''} Annual Report`, '#E8860A', '#FEF3E2')}</p>
    <h1 style="margin:14px 0 8px;font-size:26px;font-weight:700;color:#2A2825;line-height:1.3;">A Year of Hope — Made Possible by You</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#5C5852;line-height:1.7;">Here's what we accomplished together in ${v.year || 'this year'}.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td width="24%" style="padding:14px;background:#FEF3E2;border-radius:10px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#E8860A;">${v.children_count || '68'}</div>
          <div style="font-size:11px;color:#7A5A10;text-transform:uppercase;letter-spacing:.04em;margin-top:4px;">Children</div>
        </td>
        <td width="4%"></td>
        <td width="24%" style="padding:14px;background:#EEEDFE;border-radius:10px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#534AB7;">${v.elders_count || '47'}</div>
          <div style="font-size:11px;color:#3A336A;text-transform:uppercase;letter-spacing:.04em;margin-top:4px;">Elders</div>
        </td>
        <td width="4%"></td>
        <td width="24%" style="padding:14px;background:#E1F5EE;border-radius:10px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#1D9E75;">${v.volunteers_count || '120'}</div>
          <div style="font-size:11px;color:#0D5C3E;text-transform:uppercase;letter-spacing:.04em;margin-top:4px;">Volunteers</div>
        </td>
        <td width="4%"></td>
        <td width="24%" style="padding:14px;background:#FCEEF3;border-radius:10px;text-align:center;">
          <div style="font-size:18px;font-weight:700;color:#C84B6E;">${v.total_donations || '₹18L'}</div>
          <div style="font-size:11px;color:#7A2040;text-transform:uppercase;letter-spacing:.04em;margin-top:4px;">Donations</div>
        </td>
      </tr>
    </table>
    ${divider()}
    <h2 style="margin:0 0 14px;font-size:17px;font-weight:600;color:#2A2825;">🏆 Key Achievements</h2>
    ${[v.achievement_1, v.achievement_2, v.achievement_3].filter(Boolean).map(a =>
      `<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;">
        <div style="width:22px;height:22px;background:#E8860A;border-radius:50%;flex-shrink:0;margin-top:2px;text-align:center;line-height:22px;color:#fff;font-size:12px;">★</div>
        <p style="margin:0;font-size:14px;color:#2A2825;line-height:1.6;">${a}</p>
      </div>`
    ).join('')}
    ${divider()}
    <p style="font-size:15px;color:#5C5852;line-height:1.8;margin:0 0 24px;">${v.thank_you_message || ''}</p>
    <div style="text-align:center;">${ctaButton('Support Us Again in ' + (new Date().getFullYear()), v.donate_url || '#')}</div>
  `, orgName),
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const TEMPLATES: EmailTemplate[] = [
  monthlyNewsletter,
  eventInvitation,
  urgentAppeal,
  festivalGreetings,
  volunteerDrive,
  annualReport,
];

export function getTemplate(type: string): EmailTemplate | undefined {
  return TEMPLATES.find(t => t.type === type);
}
