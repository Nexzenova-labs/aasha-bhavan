import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { createAdminClient } = await import('@/lib/supabase-admin');
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .order('uploaded_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ photos: data || [] });
  } catch (e: unknown) {
    return NextResponse.json({ photos: [], error: e instanceof Error ? e.message : String(e) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const caption = (formData.get('caption') as string) || '';
    const category = (formData.get('category') as string) || 'activity';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const { createAdminClient } = await import('@/lib/supabase-admin');
    const supabase = createAdminClient();

    // Upload to Supabase Storage
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;

    // Build public URL
    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(path);

    // Save to gallery_photos table
    const { data, error: dbError } = await supabase
      .from('gallery_photos')
      .insert({ url: publicUrl, caption, category, is_featured: false, sort_order: 0 })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ photo: { ...data, storage_path: path } });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, is_featured } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { createAdminClient } = await import('@/lib/supabase-admin');
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('gallery_photos')
      .update({ is_featured })
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, storage_path } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { createAdminClient } = await import('@/lib/supabase-admin');
    const supabase = createAdminClient();

    // Remove from storage if path known
    if (storage_path) {
      await supabase.storage.from('gallery').remove([storage_path]);
    }

    const { error } = await supabase.from('gallery_photos').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
