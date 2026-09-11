import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ error: 'Thiếu ID' }, { status: 400 });

    // Tìm theo id, deposit_code hoặc code
    const { data: deposit, error } = await (supabase as any)
      .from('deposits')
      .select('*')
      .or(`id.eq.${id},code.eq.${id},deposit_code.eq.${id}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !deposit) {
      return NextResponse.json({ error: 'Không tìm thấy giao dịch' }, { status: 404 });
    }

    const isCompleted =
      deposit.status === 'COMPLETED' ||
      deposit.status === 'SUCCESS' ||
      deposit.status === 'PAID';

    return new NextResponse(
      JSON.stringify({
        status: isCompleted ? 'COMPLETED' : deposit.status,
        deposit: {
          ...deposit,
          status: isCompleted ? 'COMPLETED' : deposit.status,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Lỗi kiểm tra giao dịch' }, { status: 500 });
  }
}
