import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Called daily by Vercel Cron or cron-job.org
// Authorization: Bearer <CRON_SECRET>
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { createAdminClient } = await import('@/lib/supabase-admin');
    const supabase = createAdminClient();

    // Find all campaigns due now
    const { data: due, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString());

    if (error) throw error;
    if (!due?.length) return NextResponse.json({ ok: true, message: 'No campaigns due', processed: 0 });

    const { sendToSubscribers } = await import('@/lib/mailer');
    const results: Array<{ id: string; subject: string; sent: number; failed: number }> = [];

    for (const campaign of due) {
      try {
        await supabase.from('email_campaigns').update({ status: 'sending' }).eq('id', campaign.id);
        const { sent, failed } = await sendToSubscribers(campaign.subject, campaign.html_body);
        await supabase.from('email_campaigns').update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          recipient_count: sent,
        }).eq('id', campaign.id);
        results.push({ id: campaign.id, subject: campaign.subject, sent, failed });
      } catch (err) {
        await supabase.from('email_campaigns').update({ status: 'failed' }).eq('id', campaign.id);
        results.push({ id: campaign.id, subject: campaign.subject, sent: 0, failed: -1 });
      }
    }

    return NextResponse.json({ ok: true, processed: results.length, results });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
