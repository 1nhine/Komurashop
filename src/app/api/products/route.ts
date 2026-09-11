import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        description,
        category,
        badge,
        image,
        inventory (id, is_sold)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (products || []).map((p: any) => {
      const stock = (p.inventory || []).filter((inv: any) => !inv.is_sold).length;
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        category: p.category,
        badge: p.badge,
        image: p.image || null,
        stock,
      };
    });

    return NextResponse.json(formatted, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
