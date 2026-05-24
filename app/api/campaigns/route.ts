import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { createAdminClient } = await import('@/lib/supabase-admin');
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ campaigns: data || [] });
  } catch (e: unknown) {
    return NextResponse.json({ campaigns: [], error: e instanceof Error ? e.message : String(e) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, template_type, html_body, scheduled_at, status } = body;
    if (!subject || !template_type || !html_body) {
      return NextResponse.json({ error: 'subject, template_type, html_body required' }, { status: 400 });
    }
    const { createAdminClient } = await import('@/lib/supabase-admin');
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert({ subject, template_type, html_body, scheduled_at: scheduled_at || null, status: status || 'draft' })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ campaign: data });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { createAdminClient } = await import('@/lib/supabase-admin');
    const supabase = createAdminClient();
    const { error } = await supabase.from('email_campaigns').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
