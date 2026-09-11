import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const content = String(body.content || body.description || '');
    const transferAmount = Number(body.transferAmount || body.amount || 0);

    // Tìm cú pháp: NAP + 6 số
    const match = content.match(/NAP\s*(\d{6})/i);
    if (!match) {
      return NextResponse.json({ message: 'Không phát hiện mã nạp dạng NAP xxxxxx' });
    }

    const depositCode = parseInt(match[1]);

    const { data: deposit } = await supabase
      .from('deposits')
      .select('*')
      .eq('deposit_code', depositCode)
      .single();

    if (!deposit) {
      return NextResponse.json({ message: 'Không tìm thấy yêu cầu nạp' }, { status: 404 });
    }

    if (deposit.status === 'SUCCESS') {
      return NextResponse.json({ message: 'Giao dịch nạp đã được cộng tiền trước đó' });
    }

    if (transferAmount < deposit.amount) {
      return NextResponse.json({ message: 'Số tiền chuyển không khớp' }, { status: 400 });
    }

    // 1. Cập nhật trạng thái SUCCESS cho deposit
    await supabase
      .from('deposits')
      .update({ status: 'SUCCESS' })
      .eq('id', deposit.id);

    // 2. Lấy số dư hiện tại và cộng thêm tiền
    const { data: user } = await supabase
      .from('users')
      .select('balance')
      .eq('id', deposit.user_id)
      .single();

    const currentBalance = user?.balance || 0;
    await supabase
      .from('users')
      .update({ balance: currentBalance + deposit.amount })
      .eq('id', deposit.user_id);

    console.log(`Đã nạp thành công ${deposit.amount}đ cho User: ${deposit.user_id}`);
    return NextResponse.json({ success: true, message: 'Nạp tiền thành công' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi webhook' }, { status: 500 });
  }
}
