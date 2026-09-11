import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { token } = await req.json();
        if (!token) return NextResponse.json({ error: 'Thiếu mã xác nhận' }, { status: 400 });

        const { data: task, error: findError } = await (supabase as any)
            .from('user_tasks')
            .select('*')
            .eq('token', token)
            .single();

        if (findError || !task) {
            return NextResponse.json({ error: 'Nhiệm vụ không tồn tại hoặc mã không hợp lệ!' }, { status: 404 });
        }

        if (task.status === 'COMPLETED') {
            return NextResponse.json({ error: 'Nhiệm vụ này đã được cộng tiền trước đó rồi!' }, { status: 400 });
        }

        // KIỂM TRA CHẶN TÀI KHOẢN TRƯỚC KHI CỘNG TIỀN
        const { data: userData, error: userFindErr } = await (supabase as any)
            .from('users')
            .select('earn_balance, is_banned, ban_reason')
            .eq('id', task.user_id)
            .single();

        if (userFindErr || !userData) {
            return NextResponse.json({ error: 'Không tìm thấy tài khoản người dùng' }, { status: 404 });
        }

        if (userData.is_banned) {
            return NextResponse.json(
                { error: `Tài khoản đã bị khóa, từ chối trả thưởng! Lý do: ${userData.ban_reason || 'Vi phạm quy định'}` },
                { status: 403 }
            );
        }

        // Đánh dấu hoàn thành
        await (supabase as any)
            .from('user_tasks')
            .update({
                status: 'COMPLETED',
                completed_at: new Date().toISOString(),
            })
            .eq('id', task.id);

        // Cộng tiền vào Ví Vượt Link (earn_balance)
        const newEarnBalance = (Number(userData.earn_balance) || 0) + (task.reward || 1000);
        await (supabase as any)
            .from('users')
            .update({ earn_balance: newEarnBalance })
            .eq('id', task.user_id);

        return NextResponse.json({
            success: true,
            reward: task.reward || 1000,
            message: 'Cộng tiền thành công!',
        });
    } catch {
        return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
    }
}