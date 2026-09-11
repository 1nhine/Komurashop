'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ShoppingBag,
    CheckCircle2,
    Copy,
    X,
    Loader2,
    Check,
    Wallet,
} from 'lucide-react';

interface Product {
    id: string;
    name: string;
    title?: string;
    description?: string;
    price: number;
    image?: string;
    image_url?: string;
    category?: string;
}

interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    balance: number;
    earn_balance: number;
}

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserProfile | null>(null);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [walletType, setWalletType] = useState<'deposit' | 'earn'>('deposit');
    const [buying, setBuying] = useState(false);
    const [boughtOrder, setBoughtOrder] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const loadData = async () => {
        try {
            const [prodRes, userRes] = await Promise.all([
                fetch('/api/products?t=' + Date.now(), { cache: 'no-store' }),
                fetch('/api/auth/me?t=' + Date.now(), { cache: 'no-store' }),
            ]);

            if (prodRes.ok) {
                const prodData = await prodRes.json();
                setProducts(Array.isArray(prodData) ? prodData : prodData.products || []);
            }

            if (userRes.ok) {
                const userData = await userRes.json();
                if (userData.user) setUser(userData.user);
            }
        } catch (err) {
            console.error('Lỗi nạp dữ liệu:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenBuyModal = (prod: Product) => {
        setSelectedProduct(prod);
        // Nếu ví nạp không đủ tiền mà ví vượt link đủ, tự động gợi ý chuyển sang ví vượt link
        if (user && (user.balance || 0) < prod.price && (user.earn_balance || 0) >= prod.price) {
            setWalletType('earn');
        } else {
            setWalletType('deposit');
        }
    };

    const handleConfirmBuy = async () => {
        if (!selectedProduct || buying) return;
        setBuying(true);

        try {
            const res = await fetch('/api/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: selectedProduct.id,
                    walletType: walletType,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Giao dịch không thành công');
                return;
            }

            const activeProduct = selectedProduct;

            // Cập nhật lại số dư trên trang và đồng bộ dữ liệu
            await loadData();

            // Bắn tín hiệu để các component khác tự cập nhật nếu cần
            window.dispatchEvent(new CustomEvent('balanceUpdate'));

            setSelectedProduct(null);

            // Mở popup thông báo thành công
            setBoughtOrder({
                ...(data.order || {}),
                product_name: activeProduct.name || activeProduct.title || 'Sản phẩm số',
                price: activeProduct.price,
                content: data.order?.content || data.order?.key || 'Giao dịch hoàn tất!',
                order_code: data.order?.order_code || data.order?.id || Date.now().toString().slice(-6),
                wallet_used: walletType === 'earn' ? 'Ví Vượt Link' : 'Ví Nạp',
            });
        } catch {
            alert('Không thể kết nối đến máy chủ thanh toán!');
        } finally {
            setBuying(false);
        }
    };

    const handleCopyKey = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const currentWalletBalance =
        walletType === 'earn' ? Number(user?.earn_balance || 0) : Number(user?.balance || 0);
    const isInsufficient = selectedProduct ? currentWalletBalance < selectedProduct.price : false;

    return (
        <div className="min-h-screen pb-20">
            <div className="max-w-6xl mx-auto px-4 pt-8 pb-10 text-center">
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
                    KOMURA <span className="text-sky-400">SHOP</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                    Hệ thống cung cấp dịch vụ & tài nguyên số tự động 24/7. Nhận hàng ngay lập tức sau khi thanh toán.
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-6 bg-sky-500 rounded-full" />
                    <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wide">
                        Danh mục sản phẩm
                    </h2>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin text-sky-400 mx-auto mb-2" />
                        Đang tải danh sách sản phẩm...
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
                        Hiện chưa có sản phẩm nào được mở bán.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {products.map((prod) => (
                            <div
                                key={prod.id}
                                className="bg-slate-900/70 border border-slate-800/80 rounded-3xl overflow-hidden hover:border-slate-700 transition flex flex-col shadow-xl"
                            >
                                <div className="aspect-[16/10] bg-slate-950 relative overflow-hidden flex items-center justify-center">
                                    {prod.image || prod.image_url ? (
                                        <img
                                            src={prod.image || prod.image_url}
                                            alt={prod.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <ShoppingBag className="w-12 h-12 text-slate-700" />
                                    )}
                                </div>

                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-base font-bold text-white mb-1 line-clamp-1">
                                            {prod.name || prod.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                                            {prod.description || 'Sản phẩm số tự động nhận hàng lập tức.'}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                                        <div>
                                            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Giá bán</span>
                                            <span className="text-base font-black text-sky-400">
                                                {(prod.price || 0).toLocaleString('vi-VN')} đ
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleOpenBuyModal(prod)}
                                            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-sky-500/20"
                                        >
                                            Mua ngay
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL 1: XÁC NHẬN MUA & CHỌN VÍ */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 relative shadow-2xl">
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                            XÁC NHẬN ĐƠN HÀNG
                        </span>
                        <h3 className="text-xl font-bold text-white mt-0.5 mb-3">
                            {selectedProduct.name || selectedProduct.title}
                        </h3>

                        {/* Khối thông tin giá */}
                        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 mb-4 flex justify-between items-center text-xs">
                            <span className="text-slate-400">Giá thanh toán:</span>
                            <span className="font-bold text-sky-400 text-sm">
                                {(selectedProduct.price || 0).toLocaleString('vi-VN')} đ
                            </span>
                        </div>

                        {/* Chọn loại ví */}
                        <div className="mb-4">
                            <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center gap-1.5">
                                <Wallet className="w-3.5 h-3.5 text-slate-400" /> Chọn nguồn tiền:
                            </label>

                            <div className="grid grid-cols-2 gap-2.5">
                                {/* Ví Nạp */}
                                <button
                                    type="button"
                                    onClick={() => setWalletType('deposit')}
                                    className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between ${walletType === 'deposit'
                                            ? 'bg-blue-500/15 border-blue-500/70 text-blue-400 shadow-md shadow-blue-500/10'
                                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-white">Ví Nạp</span>
                                        <div
                                            className={`w-3 h-3 rounded-full border flex items-center justify-center ${walletType === 'deposit' ? 'border-blue-400 bg-blue-400' : 'border-slate-600'
                                                }`}
                                        >
                                            {walletType === 'deposit' && (
                                                <div className="w-1 h-1 rounded-full bg-slate-950" />
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-semibold text-blue-300/80">
                                        {(user?.balance || 0).toLocaleString('vi-VN')} đ
                                    </span>
                                </button>

                                {/* Ví Vượt Link */}
                                <button
                                    type="button"
                                    onClick={() => setWalletType('earn')}
                                    className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between ${walletType === 'earn'
                                            ? 'bg-emerald-500/15 border-emerald-500/70 text-emerald-400 shadow-md shadow-emerald-500/10'
                                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-white">Ví Vượt Link</span>
                                        <div
                                            className={`w-3 h-3 rounded-full border flex items-center justify-center ${walletType === 'earn' ? 'border-emerald-400 bg-emerald-400' : 'border-slate-600'
                                                }`}
                                        >
                                            {walletType === 'earn' && (
                                                <div className="w-1 h-1 rounded-full bg-slate-950" />
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-semibold text-emerald-300/80">
                                        {(user?.earn_balance || 0).toLocaleString('vi-VN')} đ
                                    </span>
                                </button>
                            </div>

                            {isInsufficient && (
                                <p className="text-[11px] text-red-400 mt-2 text-center font-medium">
                                    Số dư trong {walletType === 'earn' ? 'Ví Vượt Link' : 'Ví Nạp'} không đủ để thanh toán!
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleConfirmBuy}
                            disabled={buying || isInsufficient || !user}
                            className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                        >
                            {buying ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...
                                </>
                            ) : !user ? (
                                'Vui lòng đăng nhập'
                            ) : isInsufficient ? (
                                'Số dư không đủ'
                            ) : (
                                `Xác nhận mua bằng ${walletType === 'earn' ? 'Ví Vượt Link' : 'Ví Nạp'}`
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL 2: POPUP MUA HÀNG THÀNH CÔNG */}
            {boughtOrder && (
                <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>

                        <h3 className="text-xl font-black text-white text-center mb-1">
                            Mua Hàng Thành Công!
                        </h3>
                        <p className="text-xs text-slate-400 text-center mb-5">
                            Đơn hàng của bạn đã hoàn tất và được ghi nhận vào hệ thống.
                        </p>

                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-5 space-y-2.5 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Sản phẩm:</span>
                                <span className="font-bold text-white">{boughtOrder.product_name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Nguồn thanh toán:</span>
                                <span className="font-bold text-sky-400">{boughtOrder.wallet_used || 'Ví Nạp'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Giá thanh toán:</span>
                                <span className="font-bold text-emerald-400">
                                    {(boughtOrder.price || boughtOrder.amount || 0).toLocaleString('vi-VN')} đ
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Mã đơn hàng:</span>
                                <span className="font-mono text-slate-400">#{boughtOrder.order_code}</span>
                            </div>

                            <div className="pt-2 border-t border-slate-800/80">
                                <span className="text-slate-400 block mb-1.5 font-semibold">Nội dung / Key nhận được:</span>
                                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-2 font-mono text-emerald-400 text-[11px] break-all">
                                    <span>{boughtOrder.content || boughtOrder.key || 'Giao dịch thành công'}</span>
                                    <button
                                        onClick={() => handleCopyKey(boughtOrder.content || boughtOrder.key || '')}
                                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition shrink-0"
                                        title="Sao chép"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2.5">
                            <button
                                onClick={() => setBoughtOrder(null)}
                                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                            >
                                Đóng
                            </button>
                            <Link
                                href="/profile"
                                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition text-center flex items-center justify-center"
                            >
                                Xem trong Hồ sơ
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}