import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { data, error } = await (supabase as any)
      .from('site_stats')
      .select('views')
      .eq('key', 'bio')
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ views: 0 });
    }

    return NextResponse.json({ views: Number(data.views || 0) });
  } catch {
    return NextResponse.json({ views: 0 });
  }
}

export async function POST() {
  try {
    const { data } = await (supabase as any)
      .from('site_stats')
      .select('views')
      .eq('key', 'bio')
      .maybeSingle();

    const currentViews = Number(data?.views ?? 0);
    const newViews = currentViews + 1;

    await (supabase as any)
      .from('site_stats')
      .upsert({ key: 'bio', views: newViews }, { onConflict: 'key' });

    return NextResponse.json({ views: newViews });
  } catch {
    return NextResponse.json({ views: 1 });
  }
}
