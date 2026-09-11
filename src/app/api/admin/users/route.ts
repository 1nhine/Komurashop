import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

        const { data: dbUser } = await (supabase as any)
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!dbUser || dbUser.role !== 'admin') {
            return NextResponse.json({ error: 'Từ chối quyền truy cập' }, { status: 403 });
        }

        // 1. Lấy toàn bộ người dùng kèm cả 2 cột balance và earn_balance
        const { data: users } = await (supabase as any)
            .from('users')
            .select('id, email, name, balance, earn_balance, role, created_at, last_login_ip, last_login_at, is_banned, ban_reason')
            .order('created_at', { ascending: false });

        // 2. Lấy dữ liệu sản phẩm để map tên
        const { data: products } = await (supabase as any)
            .from('products')
            .select('*');

        const prodMap: Record<string, any> = {};
        (products || []).forEach((p: any) => {
            prodMap[p.id] = p;
        });

        // 3. Lấy nhiệm vụ vượt link
        const { data: tasks } = await (supabase as any)
            .from('user_tasks')
            .select('*')
            .order('created_at', { ascending: false });

        // 4. Lấy đơn hàng và gán tên sản phẩm
        const { data: orders } = await (supabase as any)
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        // 5. Lấy lịch sử nạp
        const { data: deposits } = await (supabase as any)
            .from('deposits')
            .select('*')
            .order('created_at', { ascending: false });

        const userTasksMap: Record<string, any[]> = {};
        (tasks || []).forEach((t: any) => {
            if (!userTasksMap[t.user_id]) userTasksMap[t.user_id] = [];
            userTasksMap[t.user_id].push(t);
        });

        const userOrdersMap: Record<string, any[]> = {};
        (orders || []).forEach((o: any) => {
            if (!userOrdersMap[o.user_id]) userOrdersMap[o.user_id] = [];
            const prod = prodMap[o.product_id] || {};
            userOrdersMap[o.user_id].push({
                ...o,
                resolved_name: o.product_name || o.title || o.name || prod.name || prod.title || 'Sản phẩm số',
            });
        });

        const userDepositsMap: Record<string, any[]> = {};
        (deposits || []).forEach((d: any) => {
            if (!userDepositsMap[d.user_id]) userDepositsMap[d.user_id] = [];
            userDepositsMap[d.user_id].push(d);
        });

        const fullUsers = (users || []).map((u: any) => {
            const uTasks = userTasksMap[u.id] || [];
            const uOrders = userOrdersMap[u.id] || [];
            const uDeposits = userDepositsMap[u.id] || [];
            return {
                ...u,
                earn_balance: Number(u.earn_balance || 0),
                tasks: uTasks,
                completedTasksCount: uTasks.filter((t: any) => t.status === 'COMPLETED').length,
                orders: uOrders,
                deposits: uDeposits,
            };
        });

        return NextResponse.json({ users: fullUsers });
    } catch {
        return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Từ chối quyền' }, { status: 401 });

        const { data: dbUser } = await (supabase as any)
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!dbUser || dbUser.role !== 'admin') {
            return NextResponse.json({ error: 'Từ chối quyền' }, { status: 403 });
        }

        const { userId, newBalance, newEarnBalance, is_banned, ban_reason } = await req.json();
        if (!userId) return NextResponse.json({ error: 'Thiếu mã người dùng' }, { status: 400 });

        const updatePayload: Record<string, any> = {};
        if (typeof newBalance === 'number') updatePayload.balance = newBalance;
        if (typeof newEarnBalance === 'number') updatePayload.earn_balance = newEarnBalance;
        if (typeof is_banned === 'boolean') {
            updatePayload.is_banned = is_banned;
            updatePayload.ban_reason = is_banned ? (ban_reason || 'Vi phạm điều khoản cửa hàng') : null;
        }

        const { error } = await (supabase as any)
            .from('users')
            .update(updatePayload)
            .eq('id', userId);

        if (error) return NextResponse.json({ error: 'Cập nhật thất bại' }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Lỗi cập nhật' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Từ chối quyền' }, { status: 401 });

        const { data: dbUser } = await (supabase as any)
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!dbUser || dbUser.role !== 'admin') {
            return NextResponse.json({ error: 'Từ chối quyền' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        if (!userId) return NextResponse.json({ error: 'Thiếu ID người dùng' }, { status: 400 });

        const { error } = await (supabase as any)
            .from('users')
            .delete()
            .eq('id', userId);

        if (error) return NextResponse.json({ error: 'Xóa thất bại' }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Lỗi khi xóa' }, { status: 500 });
    }
}