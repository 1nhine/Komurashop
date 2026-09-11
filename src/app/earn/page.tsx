'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gift, ExternalLink, ShieldAlert, Loader2 } from 'lucide-react';

interface TaskCounts {
  layma: number;
  traffictop: number;
  link4m: number;
}

export default function EarnPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<TaskCounts>({ layma: 0, traffictop: 0, link4m: 0 });
  const [activeLoading, setActiveLoading] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [uRes, cRes] = await Promise.all([
        fetch('/api/auth/me?t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/tasks?t=' + Date.now(), { cache: 'no-store' }),
      ]);
      if (uRes.ok) {
        const u = await uRes.json();
        setUser(u.user);
      }
      if (cRes.ok) {
        const c = await cRes.json();
        setCounts(c.counts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartTask = async (service: 'layma' | 'traffictop' | 'link4m') => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (counts[service] >= 2) {
      alert('Bạn đã làm tối đa 2 lần hôm nay cho nhiệm vụ này!');
      return;
    }

    setActiveLoading(service);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Có lỗi xảy ra khi tạo nhiệm vụ');
        return;
      }

      // Điều hướng trực tiếp sang trang vượt link (hoạt động tốt trên mọi trình duyệt điện thoại và PC)
      window.location.href = data.shortenedUrl;
    } catch {
      alert('Không thể kết nối đến máy chủ');
    } finally {
      setActiveLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400 mx-auto mb-2" />
        Đang tải thông tin nhiệm vụ...
      </div>
    );
  }

  const tasks = [
    {
      id: 'layma',
      name: 'Nhiệm vụ Layma',
      desc: 'Vượt liên kết nhanh qua hệ thống Layma.net để nhận tiền.',
      count: counts.layma,
    },
    {
      id: 'traffictop',
      name: 'Nhiệm vụ TrafficTop',
      desc: 'Lấy mã tìm kiếm qua Traffictop.net, hoàn thành trong 1 phút.',
      count: counts.traffictop,
    },
    {
      id: 'link4m',
      name: 'Nhiệm vụ Link4m',
      desc: 'Vượt liên kết đối tác Link4m.co an toàn và nhanh chóng.',
      count: counts.link4m,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold">
          <Gift className="w-4 h-4" /> Vượt link nhận tiền miễn phí
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Kiếm Số Dư Miễn Phí</h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
          Mỗi dịch vụ tối đa <strong>2 lượt/ngày</strong>. Nhận ngay <strong>1.000đ</strong> cho mỗi lần vượt thành công.
        </p>
      </div>

      {/* DANH SÁCH 3 NHIỆM VỤ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {tasks.map((t) => {
          const isDone = t.count >= 2;
          return (
            <div
              key={t.id}
              className={`p-6 rounded-3xl bg-slate-900 border flex flex-col justify-between transition ${
                isDone ? 'border-slate-800/50 opacity-60' : 'border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                    +1.000 VNĐ
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      isDone
                        ? 'border-slate-700 bg-slate-800 text-slate-400'
                        : 'border-sky-500/30 bg-sky-500/10 text-sky-400'
                    }`}
                  >
                    Đã làm: {t.count}/2
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{t.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => handleStartTask(t.id as any)}
                  disabled={isDone || activeLoading === t.id}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                    isDone
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                  }`}
                >
                  {activeLoading === t.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isDone ? (
                    'Hôm nay đã hết lượt'
                  ) : (
                    <>
                      Vượt link (+1.000đ) <ExternalLink className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* LƯU Ý */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" /> Lưu ý khi làm nhiệm vụ
        </h3>
        <ul className="space-y-2 list-disc list-inside text-slate-400">
          <li>Không bật VPN, 1.1.1.1 hoặc ứng dụng chặn quảng cáo để tránh lỗi lấy mã.</li>
          <li>Mỗi web rút gọn được phép thực hiện tối đa <strong>2 lần/ngày</strong> (kiếm tối đa 6.000đ/ngày).</li>
          <li>Sau khi hoàn thành vượt link, bạn sẽ được tự động chuyển hướng về trang cộng 1.000đ vào ví ngay lập tức.</li>
        </ul>
      </div>
    </div>
  );
}
