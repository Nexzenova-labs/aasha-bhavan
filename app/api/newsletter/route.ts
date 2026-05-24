import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const { createAdminClient } = await import('@/lib/supabase-admin');
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email, subscribed: true, subscribed_at: new Date().toISOString() }, { onConflict: 'email' });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('newsletter error:', err);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
