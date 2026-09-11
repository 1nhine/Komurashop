import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// THÔNG TIN TÀI KHOẢN MBBANK CỦA BẠN
const BANK_CONFIG = {
  bankId: 'MB',
  bankName: 'MBBank (Ngân hàng Quân Đội)',
  accountNumber: '9006688668',
  accountName: 'NGO THI THUONG',
};

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });

    const { data: dbUser } = await (supabase as any)
      .from('users')
      .select('is_banned, ban_reason')
      .eq('id', user.id)
      .single();

    if (dbUser?.is_banned) {
      return NextResponse.json(
        { error: `Tài khoản bị khóa! Lý do: ${dbUser.ban_reason || 'Vi phạm quy định'}` },
        { status: 403 }
      );
    }

    const { amount } = await req.json();
    const numAmount = Number(amount);

    if (!numAmount || numAmount < 2000) {
      return NextResponse.json({ error: 'Số tiền nạp tối thiểu là 2.000 VNĐ' }, { status: 400 });
    }

    // Sinh mã nạp 6 số nguyên vừa vặn chuẩn INTEGER của DB
    const numericCode = Math.floor(100000 + Math.random() * 900000);
    const transferContent = `NAP${numericCode}`;

    // Tạo mã VietQR tự động điền sẵn STK, số tiền và nội dung CK
    const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNumber}-compact2.png?amount=${numAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

    const { data: deposit, error } = await (supabase as any)
      .from('deposits')
      .insert({
        user_id: user.id,
        amount: numAmount,
        deposit_code: numericCode,
        code: numericCode,
        trans_id: numericCode,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `Lỗi tạo giao dịch nạp: ${error.message}` }, { status: 500 });
    }

    // Trả về đầy đủ mọi biến để giao diện không bị rỗng bất kỳ dòng nào
    const resultPayload = {
      ...deposit,
      id: deposit.id,
      amount: numAmount,
      deposit_code: numericCode,
      code: transferContent,
      content: transferContent,
      transfer_content: transferContent,
      description: transferContent,

      bank: BANK_CONFIG.bankName,
      bank_name: BANK_CONFIG.bankName,
      bankName: BANK_CONFIG.bankName,
      bank_id: BANK_CONFIG.bankId,

      account_number: BANK_CONFIG.accountNumber,
      accountNumber: BANK_CONFIG.accountNumber,
      account_no: BANK_CONFIG.accountNumber,
      stk: BANK_CONFIG.accountNumber,

      account_name: BANK_CONFIG.accountName,
      accountName: BANK_CONFIG.accountName,
      account_holder: BANK_CONFIG.accountName,

      qr_code: qrUrl,
      qr_url: qrUrl,
      qrCode: qrUrl,
      qrUrl: qrUrl,
    };

    return NextResponse.json({
      ...resultPayload,
      deposit: resultPayload,
      data: resultPayload,
      success: true,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi xử lý yêu cầu nạp trên máy chủ' }, { status: 500 });
  }
}
