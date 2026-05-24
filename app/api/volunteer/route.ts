import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, availability, skills, message } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const { createAdminClient } = await import('@/lib/supabase-admin');
    const supabase = createAdminClient();

    const { error } = await supabase.from('volunteers').insert({
      name, email: email || null, phone,
      availability: availability || null,
      skills: skills || null,
      message: message || null,
      status: 'pending',
    });

    if (error) throw error;

    const { notifyAdmin } = await import('@/lib/email');
    await notifyAdmin(
      `New Volunteer Application — ${name}`,
      `<p><strong>${name}</strong> (${phone}) wants to volunteer.<br/>Availability: ${availability}<br/>Skills: ${skills || 'Not specified'}</p>`
    ).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('volunteer error:', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { createAdminClient } = await import('@/lib/supabase-admin');
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch volunteers' }, { status: 500 });
  }
}
