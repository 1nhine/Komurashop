'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Wallet,
  Copy,
  Check,
  Loader2,
  QrCode,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  balance: number;
}

export default function DepositPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [amount, setAmount] = useState<number>(10000);
  const [customAmount, setCustomAmount] = useState<string>('10000');
  const [creating, setCreating] = useState(false);
  const [depositData, setDepositData] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [successInfo, setSuccessInfo] = useState<any>(null);
  const initialBalanceRef = useRef<number>(0);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me?t=' + Date.now(), { cache: 'no-store' });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        initialBalanceRef.current = Number(data.user.balance || 0);
      } else {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (!depositData?.id || successInfo) return;

    const checkPayment = async () => {
      try {
        const resDep = await fetch(`/api/deposit/${depositData.id}?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (resDep.ok) {
          const dataDep = await resDep.json();
          const st = dataDep?.status || dataDep?.deposit?.status;
          if (st === 'COMPLETED' || st === 'SUCCESS' || st === 'PAID') {
            triggerSuccess(depositData.amount);
            return;
          }
        }

        const resUser = await fetch('/api/auth/me?t=' + Date.now(), { cache: 'no-store' });
        if (resUser.ok) {
          const dataUser = await resUser.json();
          if (dataUser?.user) {
            const currentBal = Number(dataUser.user.balance || 0);
            if (currentBal > initialBalanceRef.current) {
              setUser(dataUser.user);
              triggerSuccess(currentBal - initialBalanceRef.current);
            }
          }
        }
      } catch (err) {
        console.error('Lỗi kiểm tra giao dịch:', err);
      }
    };

    const interval = setInterval(checkPayment, 2500);
    return () => clearInterval(interval);
  }, [depositData, successInfo]);

  const triggerSuccess = (addedAmount: number) => {
    const updatedBal = (user?.balance || initialBalanceRef.current) + Number(addedAmount);
    setUser((prev) => (prev ? { ...prev, balance: updatedBal } : prev));

    // BẮN TÍN HIỆU ĐỔI TIỀN SANG NAVBAR TỨC THÌ
    window.dispatchEvent(new CustomEvent('balanceUpdate', { detail: { balance: updatedBal } }));

    setSuccessInfo({
      amount: addedAmount || depositData?.amount || 2000,
      code: depositData?.code || `NAP${depositData?.deposit_code}`,
      newBalance: updatedBal,
    });
    setDepositData(null);
  };

  const handleCreateDeposit = async () => {
    const num = Number(customAmount) || amount;
    if (num < 2000) {
      alert('Số tiền nạp tối thiểu là 2.000 VNĐ');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: num }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Lỗi tạo giao dịch');
        return;
      }

      initialBalanceRef.current = Number(user?.balance || 0);
      const activeDeposit = data.deposit || data.data || data;
      setDepositData(activeDeposit);
    } catch {
      alert('Không thể kết nối máy chủ tạo QR');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loadingUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400 mr-2" /> Đang tải...
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl backdrop-blur-md relative">
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              VÍ TIỀN CÁ NHÂN
            </span>
            <h1 className="text-xl font-black text-white mt-0.5">Nạp tiền vào tài khoản</h1>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Số dư hiện tại</span>
            <span className="font-bold text-emerald-400 text-sm">
              {(user?.balance || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        {!depositData && !successInfo && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Chọn hoặc nhập số tiền nạp (Tối thiểu 2.000 đ):
            </label>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[2000, 10000, 20000, 50000, 100000, 200000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setAmount(val);
                    setCustomAmount(String(val));
                  }}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition ${
                    Number(customAmount) === val
                      ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {val.toLocaleString('vi-VN')} đ
                </button>
              ))}
            </div>

            <div className="relative mb-6">
              <input
                type="number"
                min={2000}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Nhập số tiền..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-sky-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">
                VNĐ
              </span>
            </div>

            <button
              onClick={handleCreateDeposit}
              disabled={creating}
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
              Tạo mã QR thanh toán
            </button>
          </div>
        )}

        {depositData && !successInfo && (
          <div className="space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="bg-white p-3 rounded-2xl flex items-center justify-center mx-auto max-w-[240px] shadow-lg">
              <img
                src={
                  depositData.qr_code ||
                  depositData.qr_url ||
                  `https://img.vietqr.io/image/MB-9006688668-compact2.png?amount=${depositData.amount}&addInfo=${encodeURIComponent(depositData.code || depositData.content)}&accountName=NGO%20THI%20THUONG`
                }
                alt="VietQR"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>

            <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Ngân hàng:</span>
                <span className="font-bold text-white">MBBank (Quân Đội)</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Số tài khoản:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-sky-400">
                  <span>9006688668</span>
                  <button
                    onClick={() => handleCopy('9006688668', 'stk')}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  >
                    {copiedField === 'stk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Chủ tài khoản:</span>
                <span className="font-bold text-white uppercase">NGO THI THUONG</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Số tiền nạp:</span>
                <span className="font-black text-emerald-400">
                  {Number(depositData.amount || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 font-bold">Nội dung CK:</span>
                <div className="flex items-center gap-1.5 font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                  <span>
                    {depositData.code ||
                      depositData.content ||
                      depositData.transfer_content ||
                      `NAP${depositData.deposit_code}`}
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        depositData.code ||
                          depositData.content ||
                          depositData.transfer_content ||
                          `NAP${depositData.deposit_code}`,
                        'code'
                      )
                    }
                    className="p-1 hover:bg-amber-500/20 rounded text-amber-400"
                    title="Sao chép nội dung"
                  >
                    {copiedField === 'code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-xs text-sky-400 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Đang đợi hệ thống ngân hàng ghi nhận số dư...
              </div>
              <button
                onClick={() => setDepositData(null)}
                className="block mx-auto mt-3 text-[11px] text-slate-500 hover:text-slate-300 underline transition"
              >
                Hủy bước để đổi số tiền khác
              </button>
            </div>
          </div>
        )}

        {successInfo && (
          <div className="space-y-5 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">Nạp Tiền Thành Công!</h2>
              <p className="text-xs text-slate-400 mt-1">
                Hệ thống SePay đã khớp lệnh và cộng tiền vào tài khoản của bạn.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs text-left">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Số tiền đã nạp:</span>
                <span className="font-black text-emerald-400 text-sm">
                  +{Number(successInfo.amount).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Mã giao dịch:</span>
                <span className="font-mono text-slate-300 font-bold">{successInfo.code}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-slate-400">Số dư ví hiện tại:</span>
                <span className="font-black text-white text-sm">
                  {Number(successInfo.newBalance || user?.balance || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Link
                href="/"
                className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-sky-600/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Mua sắm ngay
              </Link>
              <Link
                href="/profile"
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                Xem hồ sơ <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
