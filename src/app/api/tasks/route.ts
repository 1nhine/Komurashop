import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const TOKENS = {
  link4m: '68d13426bb4e7c362714953a',
  layma: '85bba00132c866c4e8676dd5a6fc1eef',
  traffictop: 'eEJwEYTM7deWHbr4bhmP9DCg',
};

function getStartOfTodayVN(): string {
  const VN_OFFSET = 7 * 60 * 60 * 1000;
  const nowVN = new Date(Date.now() + VN_OFFSET);
  nowVN.setUTCHours(0, 0, 0, 0);
  return new Date(nowVN.getTime() - VN_OFFSET).toISOString();
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ counts: { layma: 0, traffictop: 0, link4m: 0 } });

  const startOfDayVN = getStartOfTodayVN();
  const { data: completedTasks } = await (supabase as any)
    .from('user_tasks')
    .select('service')
    .eq('user_id', user.id)
    .eq('status', 'COMPLETED')
    .gte('completed_at', startOfDayVN);

  const counts = { layma: 0, traffictop: 0, link4m: 0 };
  (completedTasks || []).forEach((task: any) => {
    if (counts[task.service as keyof typeof counts] !== undefined) {
      counts[task.service as keyof typeof counts]++;
    }
  });

  return NextResponse.json({ counts });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });

    // KIỂM TRA CHẶN TÀI KHOẢN
    const { data: dbUser } = await (supabase as any)
      .from('users')
      .select('is_banned, ban_reason')
      .eq('id', user.id)
      .single();

    if (dbUser?.is_banned) {
      return NextResponse.json(
        { error: `Tài khoản đã bị khóa! Lý do: ${dbUser.ban_reason || 'Vi phạm quy định'}` },
        { status: 403 }
      );
    }

    const { service } = await req.json();
    if (!['layma', 'traffictop', 'link4m'].includes(service)) {
      return NextResponse.json({ error: 'Dịch vụ không hợp lệ' }, { status: 400 });
    }

    const startOfDayVN = getStartOfTodayVN();
    const { count } = await (supabase as any)
      .from('user_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('service', service)
      .eq('status', 'COMPLETED')
      .gte('completed_at', startOfDayVN);

    if (count !== null && count >= 2) {
      return NextResponse.json(
        { error: 'Bạn đã làm tối đa 2/2 lượt hôm nay cho nhiệm vụ này!' },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(16).toString('hex');
    const reward = 1000;

    const { error: dbError } = await (supabase as any).from('user_tasks').insert({
      user_id: user.id,
      service,
      token,
      reward,
      status: 'PENDING',
    });

    if (dbError) return NextResponse.json({ error: 'Lỗi khởi tạo nhiệm vụ' }, { status: 500 });

    const verifyUrl = `https://komurashop.vercel.app/earn/verify?token=${token}`;
    let shortenedUrl = '';

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
    };

    if (service === 'layma') {
      shortenedUrl = `https://api.layma.net/api/admin/shortlink/quicklink?tokenUser=${TOKENS.layma}&url=${encodeURIComponent(verifyUrl)}`;
    } else if (service === 'traffictop') {
      const res = await fetch(
        `https://traffictop.net/api?api=${TOKENS.traffictop}&url=${encodeURIComponent(verifyUrl)}&sub_link=${encodeURIComponent('https://komurashop.vercel.app')}`,
        { headers, cache: 'no-store' }
      );
      const data = await res.json().catch(() => null);
      if (data?.status === 'success' && data.shortenedUrl) shortenedUrl = data.shortenedUrl;
    } else if (service === 'link4m') {
      const res = await fetch(
        `https://link4m.co/api-shorten/v2?api=${TOKENS.link4m}&url=${encodeURIComponent(verifyUrl)}`,
        { headers, cache: 'no-store' }
      );
      const data = await res.json().catch(() => null);
      if (data?.status === 'success' && data.shortenedUrl) shortenedUrl = data.shortenedUrl;
    }

    if (!shortenedUrl) {
      return NextResponse.json({ error: 'Hệ thống rút gọn đang bận, vui lòng thử lại sau!' }, { status: 502 });
    }

    return NextResponse.json({ shortenedUrl });
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ kết nối' }, { status: 500 });
  }
}
