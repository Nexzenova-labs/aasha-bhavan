import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, intent, message } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const { createAdminClient } = await import('@/lib/supabase-admin');
    const supabase = createAdminClient();

    const { error } = await supabase.from('contact_messages').insert({
      name, email: email || null, phone: phone || null,
      intent: intent || 'other', message: message || null,
    });

    if (error) throw error;

    const { notifyAdmin, sendContactAck } = await import('@/lib/email');
    await Promise.allSettled([
      notifyAdmin(
        `New Contact Message from ${name}`,
        `<p><strong>Name:</strong> ${name}<br/><strong>Email:</strong> ${email}<br/><strong>Phone:</strong> ${phone || 'N/A'}<br/><strong>Intent:</strong> ${intent}<br/><strong>Message:</strong> ${message || 'N/A'}</p>`
      ),
      sendContactAck(email, name),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('contact error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
