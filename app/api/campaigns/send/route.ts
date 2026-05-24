import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { id, test_email, subject: directSubject, html_body: directHtml } = await req.json();

    const { sendToSubscribers, sendSingleEmail } = await import('@/lib/mailer');

    // Direct test (from settings page — no campaign ID needed)
    if (test_email && directSubject && directHtml) {
      await sendSingleEmail(test_email, `[TEST] ${directSubject}`, directHtml);
      return NextResponse.json({ ok: true, message: `Test sent to ${test_email}` });
    }

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { createAdminClient } = await import('@/lib/supabase-admin');
    const supabase = createAdminClient();

    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    if (test_email) {
      await sendSingleEmail(test_email, `[TEST] ${campaign.subject}`, campaign.html_body);
      return NextResponse.json({ ok: true, message: `Test sent to ${test_email}` });
    }

    const { sent, failed, errors } = await sendToSubscribers(campaign.subject, campaign.html_body);

    await supabase
      .from('email_campaigns')
      .update({ status: 'sent', sent_at: new Date().toISOString(), recipient_count: sent })
      .eq('id', id);

    return NextResponse.json({ ok: true, sent, failed, errors });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
