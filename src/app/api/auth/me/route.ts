import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const { data: user, error } = await (supabase as any)
      .from('users')
        .select('id, email, name, balance, earn_balance, role, is_banned, ban_reason')
      .eq('id', sessionUser.id)
      .single();

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    if (user.is_banned) {
      cookies().delete('shop_session');
      return NextResponse.json(
        { error: `Tài khoản đã bị khóa! Lý do: ${user.ban_reason || 'Vi phạm quy định.'}`, is_banned: true },
        { status: 403 }
      );
    }

    return new NextResponse(JSON.stringify({ user }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
