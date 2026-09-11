import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPassword, createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const { data: user, error } = await (supabase as any)
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: 'Email hoặc mật khẩu không chính xác' }, { status: 401 });
    }

    // KIỂM TRA TÀI KHOẢN BỊ KHÓA / CHẶN
    if (user.is_banned) {
      return NextResponse.json(
        { error: `Tài khoản đã bị khóa! Lý do: ${user.ban_reason || 'Vi phạm chính sách cửa hàng.'}` },
        { status: 403 }
      );
    }

    // Lấy IP đăng nhập thực tế
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

    // Lưu IP và mốc thời gian đăng nhập
    await (supabase as any)
      .from('users')
      .update({
        last_login_ip: clientIp,
        last_login_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // Tạo phiên làm việc
    const token = createToken(user.id);
    cookies().set('shop_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 14 * 24 * 3600,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, balance: user.balance },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi đăng nhập' }, { status: 500 });
  }
}
