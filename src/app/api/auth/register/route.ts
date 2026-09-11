import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu phải từ 6 ký tự trở lên' }, { status: 400 });
    }

    // Kiểm tra email tồn tại
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Email này đã được đăng ký' }, { status: 400 });
    }

    // Tạo user mới
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashPassword(password),
        balance: 0,
      })
      .select('id, email, name, balance')
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Lỗi đăng ký Supabase' }, { status: 500 });
    }

    const token = createToken(user.id);
    cookies().set('shop_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 14 * 24 * 3600,
      path: '/',
    });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
