'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function VerifyBox() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [reward, setReward] = useState(1000);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setMessage('Thiếu mã xác nhận nhiệm vụ');
      return;
    }

    fetch('/api/tasks/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSuccess(true);
          setReward(data.reward || 1000);
          window.dispatchEvent(new Event('user_balance_updated'));
        } else {
          setSuccess(false);
          setMessage(data.error || 'Nhiệm vụ không hợp lệ');
        }
      })
      .catch(() => {
        setSuccess(false);
        setMessage('Lỗi đường truyền máy chủ');
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-sky-400 mx-auto mb-4" />
        <h2 className="text-base font-bold text-white">Đang kiểm tra kết quả vượt link...</h2>
        <p className="text-xs text-slate-500 mt-1">Hệ thống đang đối soát và cộng tiền vào ví của bạn.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
        {success ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-black text-white">Vượt Link Thành Công!</h1>
            <p className="text-sm text-slate-300 mt-2">
              Bạn đã nhận được{' '}
              <span className="text-emerald-400 font-extrabold text-base">
                +{reward.toLocaleString('vi-VN')} đ
              </span>{' '}
              vào ví tiền cá nhân.
            </p>

            <div className="mt-8 flex gap-3">
              <Link
                href="/earn"
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Vượt tiếp
              </Link>
              <Link
                href="/"
                className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
              >
                Mua hàng ngay
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-9 h-9" />
            </div>
            <h1 className="text-xl font-bold text-white">Xác nhận thất bại</h1>
            <p className="text-xs text-slate-400 mt-2">{message}</p>

            <div className="mt-8">
              <Link
                href="/earn"
                className="inline-block w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Quay lại danh sách nhiệm vụ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400">Đang tải...</div>}>
      <VerifyBox />
    </Suspense>
  );
}
