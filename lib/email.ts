import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL || 'receipts@aashabhavan.org';
const ADMIN = process.env.ADMIN_EMAIL || 'admin@aashabhavan.org';

export async function sendDonationReceipt({
  to, name, amount, cause, paymentId, date, receiptUrl,
}: {
  to: string; name: string; amount: number; cause: string;
  paymentId: string; date: string; receiptUrl?: string;
}) {
  const amountInRupees = (amount / 100).toLocaleString('en-IN');
  await resend.emails.send({
    from: `Aasha Bhavan <${FROM}>`,
    to,
    subject: `80G Tax Receipt — Donation of ₹${amountInRupees} | Aasha Bhavan`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #E5E0D6;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#26215C,#7A430A);padding:32px;text-align:center">
          <h1 style="color:#fff;font-size:22px;margin:0">Aasha Bhavan</h1>
          <p style="color:rgba(255,255,255,.7);margin:4px 0 0;font-size:13px">Home of Hope · Est. 2008</p>
        </div>
        <div style="padding:32px">
          <h2 style="color:#2A2825;font-size:18px;margin:0 0 8px">Thank you, ${name}!</h2>
          <p style="color:#5C5852;font-size:14px;line-height:1.8">Your generous donation has been received. Every rupee goes directly to the 115 children and elders in our care.</p>
          <div style="background:#FAF9F6;border:1px solid #E5E0D6;border-radius:10px;padding:20px;margin:24px 0">
            <table style="width:100%;font-size:13px">
              <tr><td style="color:#9C9890;padding:6px 0">Donor Name</td><td style="color:#2A2825;font-weight:500;text-align:right">${name}</td></tr>
              <tr><td style="color:#9C9890;padding:6px 0">Amount</td><td style="color:#E8860A;font-weight:600;font-size:16px;text-align:right">₹${amountInRupees}</td></tr>
              <tr><td style="color:#9C9890;padding:6px 0">Purpose</td><td style="color:#2A2825;text-align:right">${cause}</td></tr>
              <tr><td style="color:#9C9890;padding:6px 0">Payment ID</td><td style="color:#2A2825;font-family:monospace;font-size:11px;text-align:right">${paymentId}</td></tr>
              <tr><td style="color:#9C9890;padding:6px 0">Date</td><td style="color:#2A2825;text-align:right">${date}</td></tr>
            </table>
          </div>
          ${receiptUrl ? `<p style="text-align:center;margin:20px 0"><a href="${receiptUrl}" style="background:#E8860A;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:500">Download 80G Receipt (PDF)</a></p>` : ''}
          <p style="font-size:12px;color:#9C9890;line-height:1.8">This donation is eligible for 80G tax deduction under the Income Tax Act. Please keep this email as proof of your donation. Our 80G registration number is AAATA0000A/2021-22.</p>
          <hr style="border:none;border-top:1px solid #E5E0D6;margin:24px 0"/>
          <p style="font-size:13px;color:#5C5852;text-align:center">Aasha Bhavan · Plot 47, Banjara Hills Road No.12, Hyderabad 500034<br/>
          <a href="mailto:care@aashabhavanhyderabad.org" style="color:#E8860A">care@aashabhavanhyderabad.org</a> · +91 98480 XXXXX</p>
        </div>
      </div>
    `,
  });
}

export async function notifyAdmin(subject: string, html: string) {
  await resend.emails.send({
    from: `Aasha Bhavan System <${FROM}>`,
    to: ADMIN,
    subject,
    html,
  });
}

export async function sendContactAck(to: string, name: string) {
  await resend.emails.send({
    from: `Aasha Bhavan <${FROM}>`,
    to,
    subject: 'We received your message — Aasha Bhavan',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#2A2825">Thank you, ${name}!</h2>
        <p style="color:#5C5852;font-size:14px;line-height:1.8">We've received your message and will get back to you within 24 hours. We're so glad you reached out — every connection brings us closer to giving every child and elder the life they deserve.</p>
        <p style="color:#5C5852;font-size:14px">With love,<br><strong>The Aasha Bhavan Team</strong></p>
      </div>
    `,
  });
}
