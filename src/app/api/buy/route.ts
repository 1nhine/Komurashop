import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Vui lòng đăng nhập để mua hàng' }, { status: 401 });
        }

        // 1. Lấy cả 2 ví balance và earn_balance
        const { data: dbUser, error: userErr } = await (supabase as any)
            .from('users')
            .select('id, balance, earn_balance, is_banned, ban_reason')
            .eq('id', user.id)
            .single();

        if (userErr || !dbUser) {
            return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 });
        }

        if (dbUser.is_banned) {
            return NextResponse.json(
                { error: `Tài khoản bị khóa! Lý do: ${dbUser.ban_reason || 'Vi phạm chính sách'}` },
                { status: 403 }
            );
        }

        // 2. Nhận productId và walletType (mặc định là 'deposit' nếu không truyền)
        const { productId, walletType = 'deposit' } = await req.json();
        if (!productId) {
            return NextResponse.json({ error: 'Thiếu mã sản phẩm' }, { status: 400 });
        }

        const isEarnWallet = walletType === 'earn';

        // 3. Lấy thông tin sản phẩm
        const { data: product, error: prodErr } = await (supabase as any)
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (prodErr || !product) {
            return NextResponse.json({ error: 'Sản phẩm không tồn tại hoặc đã bị gỡ' }, { status: 404 });
        }

        const price = Number(product.price || product.amount || 0);
        const depositBalance = Number(dbUser.balance || 0);
        const earnBalance = Number(dbUser.earn_balance || 0);

        // 4. Kiểm tra số dư theo đúng loại ví được chọn
        if (isEarnWallet) {
            if (earnBalance < price) {
                return NextResponse.json(
                    { error: `Số dư Ví Vượt Link (${earnBalance.toLocaleString('vi-VN')}đ) không đủ để thanh toán!` },
                    { status: 400 }
                );
            }
        } else {
            if (depositBalance < price) {
                return NextResponse.json(
                    { error: `Số dư Ví Nạp (${depositBalance.toLocaleString('vi-VN')}đ) không đủ để thanh toán!` },
                    { status: 400 }
                );
            }
        }

        // 5. Xác định nội dung trả về cho đơn hàng
        const keyData =
            product.content ||
            product.key ||
            product.data ||
            product.license ||
            product.code ||
            (product.name?.toLowerCase().includes('donate')
                ? `CẢM ƠN BẠN ĐÃ DONATE ${price.toLocaleString('vi-VN')}Đ! KOMURA SHOP`
                : 'Giao dịch hoàn tất thành công!');

        const numericOrderCode = Math.floor(100000000 + Math.random() * 899999999);
        const keyString = typeof keyData === 'object' ? JSON.stringify(keyData) : String(keyData);

        const orderPayload = {
            order_code: numericOrderCode,
            user_id: user.id,
            product_id: product.id,
            product_name: product.name || product.title || 'Sản phẩm số',
            amount: price,
            price: price,
            content: keyString,
            key: keyString,
        };

        const { data: order, error: orderErr } = await (supabase as any)
            .from('orders')
            .insert(orderPayload)
            .select()
            .single();

        if (orderErr) {
            return NextResponse.json({ error: `Lỗi lưu đơn hàng: ${orderErr.message}` }, { status: 500 });
        }

        // 6. Trừ tiền chuẩn xác vào đúng ví đã chọn
        if (isEarnWallet) {
            const newEarnBalance = earnBalance - price;
            await (supabase as any)
                .from('users')
                .update({ earn_balance: newEarnBalance })
                .eq('id', user.id);
        } else {
            const newDepositBalance = depositBalance - price;
            await (supabase as any)
                .from('users')
                .update({ balance: newDepositBalance })
                .eq('id', user.id);
        }

        return NextResponse.json({
            success: true,
            message: `Mua hàng thành công bằng ${isEarnWallet ? 'Ví Vượt Link' : 'Ví Nạp'}!`,
            order: {
                ...(order || orderPayload),
                product_name: product.name || 'Sản phẩm số',
                content: keyString,
                key: keyString,
                price: price,
                amount: price,
                order_code: numericOrderCode,
            },
        });
    } catch {
        return NextResponse.json({ error: 'Lỗi xử lý mua hàng trên máy chủ' }, { status: 500 });
    }
}