import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    // 1. Lấy thông tin tài khoản và số dư thực tế mới nhất
    const { data: dbUser } = await (supabase as any)
      .from('users')
      .select('id, email, name, balance, role')
      .eq('id', user.id)
      .single();

    // 2. Lấy sản phẩm để đối chiếu tên & nội dung
    const { data: products } = await (supabase as any)
      .from('products')
      .select('*');

    const prodMap: Record<string, any> = {};
    (products || []).forEach((p: any) => {
      prodMap[p.id] = p;
    });

    // 3. Lấy đơn hàng đã mua
    const { data: orders } = await (supabase as any)
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // 4. Lấy lịch sử nạp tiền
    const { data: deposits } = await (supabase as any)
      .from('deposits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const resolvedOrders = (orders || []).map((o: any) => {
      const prod = prodMap[o.product_id] || {};
      const productName =
        o.product_name ||
        o.title ||
        o.name ||
        prod.name ||
        prod.title ||
        'Sản phẩm số';

      const productContent =
        o.content ||
        o.key ||
        prod.content ||
        prod.key ||
        prod.data ||
        (productName.toLowerCase().includes('donate')
          ? `CẢM ƠN BẠN ĐÃ DONATE ${(o.amount || o.price || 2000).toLocaleString('vi-VN')}Đ! KOMURA SHOP`
          : 'Giao dịch hoàn tất thành công');

      return {
        ...o,
        product_name: productName,
        content: productContent,
        key: productContent,
        price: o.price || o.amount || prod.price || 0,
        amount: o.amount || o.price || prod.price || 0,
      };
    });

    return new NextResponse(
      JSON.stringify({
        user: dbUser || user,
        orders: resolvedOrders,
        deposits: deposits || [],
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Lỗi nạp hồ sơ' }, { status: 500 });
  }
}
