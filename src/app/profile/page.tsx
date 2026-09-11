'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  CreditCard,
  Copy,
  Check,
  Loader2,
  Plus,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface OrderItem {
  id: string;
  order_code?: number | string;
  product_name?: string;
  price?: number;
  amount?: number;
  content?: string;
  key?: string;
  created_at: string;
}

interface DepositItem {
  id: string;
  amount: number;
  code?: string | number;
  deposit_code?: string | number;
  status: string;
  created_at: string;
}

interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  balance: number;
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'orders' | 'deposits'>('orders');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/profile?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          // Bắn tín hiệu đồng bộ ngay sang Navbar
          window.dispatchEvent(new Event('balanceUpdate'));
        }
        if (data.orders) setOrders(data.orders);
        if (data.deposits) setDeposits(data.deposits);
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400 mr-2" />
        Đang nạp dữ liệu hồ sơ...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* THẺ TỔNG QUAN TÀI KHOẢN */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-600/30">
            {(user?.name || user?.email || 'K')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-black text-white">{user?.name || 'Komura Member'}</h1>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold mt-1.5 uppercase">
              {user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
            </span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 w-full sm:w-auto flex items-center justify-between sm:justify-start gap-5">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Số dư ví</span>
            <span className="text-xl font-black text-emerald-400">
              {(user?.balance || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>
          <Link
            href="/deposit"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-lg shadow-sky-600/20"
          >
            <Plus className="w-3.5 h-3.5" /> Nạp thêm
          </Link>
        </div>
      </div>

      {/* NÚT CHUYỂN TAB */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6">
        <button
          onClick={() => setTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            tab === 'orders'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Sản phẩm đã mua ({orders.length})
        </button>

        <button
          onClick={() => setTab('deposits')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            tab === 'deposits'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Lịch sử nạp tiền ({deposits.length})
        </button>
      </div>

      {/* DANH SÁCH ĐƠN HÀNG */}
      {tab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800 text-xs">
              Bạn chưa mua sản phẩm nào.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => {
                const productName = o.product_name || 'Sản phẩm số';
                const contentDisplay = o.content || o.key || 'Giao dịch hoàn tất';
                const orderCode = o.order_code || o.id.slice(0, 8);
                const price = Number(o.price || o.amount || 0);

                return (
                  <div
                    key={o.id}
                    className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{productName}</span>
                        <span className="font-mono text-[11px] text-indigo-400 font-semibold">
                          #{orderCode}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>Mua lúc: {new Date(o.created_at).toLocaleString('vi-VN')}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">
                          Trừ ví: {price.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 max-w-full sm:max-w-md">
                      <span className="font-mono text-emerald-400 text-xs truncate select-all" title={contentDisplay}>
                        {contentDisplay}
                      </span>
                      <button
                        onClick={() => handleCopy(contentDisplay, o.id)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition shrink-0"
                        title="Sao chép"
                      >
                        {copiedId === o.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DANH SÁCH NẠP TIỀN */}
      {tab === 'deposits' && (
        <div>
          {deposits.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800 text-xs">
              Chưa có giao dịch nạp tiền nào.
            </div>
          ) : (
            <div className="space-y-3">
              {deposits.map((d) => {
                const isPaid = d.status === 'COMPLETED' || d.status === 'SUCCESS';
                const codeStr = d.code
                  ? String(d.code).startsWith('NAP')
                    ? d.code
                    : `NAP${d.code}`
                  : `NAP${d.deposit_code || d.id.slice(0, 6)}`;

                return (
                  <div
                    key={d.id}
                    className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">Nạp tiền qua Chuyển Khoản</span>
                        <span className="font-mono text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {codeStr}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Thời gian tạo: {new Date(d.created_at).toLocaleString('vi-VN')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="text-base font-black text-emerald-400 whitespace-nowrap">
                        +{Number(d.amount || 0).toLocaleString('vi-VN')} đ
                      </span>

                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold whitespace-nowrap">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Thành công
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5" /> Chờ xử lý
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
