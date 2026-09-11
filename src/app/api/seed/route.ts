import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secretKey = searchParams.get('key');

  // Khóa bảo mật: Phải truyền đúng ?key=komura_admin_2026 mới chạy
  if (secretKey !== 'komura_admin_2026') {
    return NextResponse.json({ error: 'Không có quyền truy cập!' }, { status: 403 });
  }

  try {
    const { data: pDonate } = await supabase
      .from('products')
      .insert({
        name: 'Donate',
        price: 2000,
        description: 'Ủng hộ trà đá cho Admin duy trì shop.',
        category: 'Ủng Hộ',
        badge: 'Yêu thích ❤️',
        image: 'https://cdn.upanhlaylink.com/i/ydPjyArS.png',
      })
      .select()
      .single();

    if (pDonate) {
      await supabase.from('inventory').insert([
        { product_id: pDonate.id, content: 'CẢM ƠN BẠN ĐÃ DONATE 2K! Chúc bạn ngày mới may mắn!', is_sold: false },
      ]);
    }

    return NextResponse.json({ success: true, message: 'Đã nạp sản phẩm thành công!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
