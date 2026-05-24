import type { Transporter } from 'nodemailer';

async function getSmtpConfig(): Promise<Record<string, string>> {
  const { createAdminClient } = await import('./supabase-admin');
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('org_settings')
    .select('key, value')
    .in('key', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from', 'smtp_secure', 'org_name']);
  const cfg: Record<string, string> = {};
  data?.forEach((r: { key: string; value: string }) => { cfg[r.key] = r.value ?? ''; });
  return cfg;
}

export async function createTransporter(): Promise<{ transporter: Transporter; from: string; orgName: string }> {
  const nodemailer = await import('nodemailer');
  const cfg = await getSmtpConfig();

  if (!cfg.smtp_host || !cfg.smtp_user || !cfg.smtp_pass) {
    throw new Error('SMTP not configured. Add SMTP details in Admin → Settings.');
  }

  const port = parseInt(cfg.smtp_port || '587');
  const transporter = nodemailer.default.createTransport({
    host: cfg.smtp_host,
    port,
    secure: port === 465,
    auth: { user: cfg.smtp_user, pass: cfg.smtp_pass },
    tls: { rejectUnauthorized: false },
  });

  const orgName = cfg.org_name || 'Aasha Bhavan';
  const from = `"${orgName}" <${cfg.smtp_from || cfg.smtp_user}>`;
  return { transporter, from, orgName };
}

export async function sendToSubscribers(
  subject: string,
  html: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const { createAdminClient } = await import('./supabase-admin');
  const supabase = createAdminClient();

  const { data: subscribers } = await supabase
    .from('newsletter_subscribers')
    .select('email')
    .eq('subscribed', true);

  if (!subscribers?.length) return { sent: 0, failed: 0, errors: [] };

  const { transporter, from } = await createTransporter();
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const sub of subscribers) {
    try {
      await transporter.sendMail({ from, to: sub.email, subject, html });
      sent++;
    } catch (e: unknown) {
      failed++;
      errors.push(`${sub.email}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return { sent, failed, errors };
}

export async function sendSingleEmail(to: string, subject: string, html: string): Promise<void> {
  const { transporter, from } = await createTransporter();
  await transporter.sendMail({ from, to, subject, html });
}
