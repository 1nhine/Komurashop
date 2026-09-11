'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    Search,
    Wallet,
    ShieldCheck,
    Award,
    Loader2,
    Pencil,
    Check,
    X,
    RefreshCw,
    Eye,
    Globe,
    ShoppingBag,
    Ban,
    Unlock,
    Trash2,
    CreditCard,
    CheckCircle2,
    Clock,
    Filter,
} from 'lucide-react';

interface TaskItem {
    id: string;
    service: string;
    token: string;
    reward: number;
    status: string;
    created_at: string;
}

interface OrderItem {
    id: string;
    resolved_name?: string;
    price?: number;
    amount?: number;
    created_at: string;
    [key: string]: any;
}

interface DepositItem {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    trans_id?: string;
    code?: string;
    [key: string]: any;
}

interface UserRecord {
    id: string;
    email: string;
    name: string | null;
    balance: number;
    earn_balance: number;
    role: string;
    created_at: string;
    last_login_ip: string | null;
    last_login_at: string | null;
    is_banned: boolean;
    ban_reason: string | null;
    tasks: TaskItem[];
    completedTasksCount: number;
    orders: OrderItem[];
    deposits: DepositItem[];
}

function findOrderKey(order: OrderItem): string {
    const priorityCols = [
        'key', 'code', 'license', 'license_key', 'item', 'content',
        'data', 'value', 'account', 'secret', 'info', 'keys', 'result', 'card_code'
    ];

    for (const col of priorityCols) {
        if (order[col]) {
            return typeof order[col] === 'object' ? JSON.stringify(order[col]) : String(order[col]);
        }
    }

    const systemCols = ['id', 'user_id', 'product_id', 'price', 'amount', 'created_at', 'updated_at', 'status', 'resolved_name'];
    for (const [k, v] of Object.entries(order)) {
        if (!systemCols.includes(k) && v !== null && v !== undefined && v !== '') {
            return typeof v === 'object' ? JSON.stringify(v) : String(v);
        }
    }

    return 'Không có key';
}

export default function AdminPage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

    const [modalTab, setModalTab] = useState<'tasks' | 'orders' | 'deposits'>('orders');
    const [taskFilter, setTaskFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');
    const [depositFilter, setDepositFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');

    const [banningUser, setBanningUser] = useState<UserRecord | null>(null);
    const [banReasonInput, setBanReasonInput] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Chỉnh sửa số dư Ví Nạp hoặc Ví Vượt Link
    const [editingTarget, setEditingTarget] = useState<{ userId: string; field: 'balance' | 'earn_balance' } | null>(null);
    const [editAmount, setEditAmount] = useState<number>(0);
    const [updating, setUpdating] = useState(false);
    const router = useRouter();

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users?t=' + Date.now(), { cache: 'no-store' });
            if (res.status === 403 || res.status === 401) {
                alert('Tài khoản chưa có quyền Admin!');
                router.push('/');
                return;
            }
            const data = await res.json();
            if (data.users) setUsers(data.users);
        } catch {
            alert('Không thể kết nối máy chủ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleSaveBalance = async (userId: string, field: 'balance' | 'earn_balance') => {
        setUpdating(true);
        try {
            const payloadKey = field === 'earn_balance' ? 'newEarnBalance' : 'newBalance';
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, [payloadKey]: Number(editAmount) }),
            });
            if (res.ok) {
                setUsers((prev) =>
                    prev.map((u) => (u.id === userId ? { ...u, [field]: Number(editAmount) } : u))
                );
                if (selectedUser && selectedUser.id === userId) {
                    setSelectedUser({ ...selectedUser, [field]: Number(editAmount) });
                }
                setEditingTarget(null);
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleConfirmBan = async () => {
        if (!banningUser) return;
        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: banningUser.id,
                    is_banned: true,
                    ban_reason: banReasonInput.trim() || 'Vi phạm điều khoản cửa hàng',
                }),
            });
            if (res.ok) {
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === banningUser.id
                            ? { ...u, is_banned: true, ban_reason: banReasonInput.trim() || 'Vi phạm điều khoản cửa hàng' }
                            : u
                    )
                );
                setBanningUser(null);
                setBanReasonInput('');
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnban = async (userId: string) => {
        if (!confirm('Mở khóa tài khoản này?')) return;
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, is_banned: false }),
            });
            if (res.ok) {
                setUsers((prev) =>
                    prev.map((u) => (u.id === userId ? { ...u, is_banned: false, ban_reason: null } : u))
                );
            }
        } catch {
            alert('Lỗi thao tác');
        }
    };

    const handleDeletePermanent = async (userId: string) => {
        if (!confirm('CẢNH BÁO: Xóa vĩnh viễn tài khoản khỏi cơ sở dữ liệu? Dữ liệu không thể khôi phục!')) return;
        try {
            const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers((prev) => prev.filter((u) => u.id !== userId));
            }
        } catch {
            alert('Lỗi khi xóa');
        }
    };

    const filteredUsers = users.filter((u) => {
        const q = search.toLowerCase();
        return (
            (u.email || '').toLowerCase().includes(q) ||
            (u.id || '').toLowerCase().includes(q) ||
            (u.name || '').toLowerCase().includes(q) ||
            (u.last_login_ip || '').toLowerCase().includes(q)
        );
    });

    const filteredTasks = (selectedUser?.tasks || []).filter((t) => {
        if (taskFilter === 'COMPLETED') return t.status === 'COMPLETED';
        if (taskFilter === 'PENDING') return t.status !== 'COMPLETED';
        return true;
    });

    const filteredDeposits = (selectedUser?.deposits || []).filter((d) => {
        const isPaid = d.status === 'COMPLETED' || d.status === 'SUCCESS';
        if (depositFilter === 'COMPLETED') return isPaid;
        if (depositFilter === 'PENDING') return !isPaid;
        return true;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-sky-400" /> Quản Trị Hệ Thống (Admin)
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Kiểm soát tài khoản, số dư 2 ví, đơn hàng và lịch sử nạp tiền.
                    </p>
                </div>
                <button
                    onClick={loadUsers}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Tải lại
                </button>
            </div>

            <div className="mb-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm theo Email, Tên, User ID hoặc IP..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                />
            </div>

            {loading ? (
                <div className="py-24 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-sky-400 mx-auto mb-2" />
                    Đang nạp dữ liệu...
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
                    <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="px-4 py-3.5">Người dùng</th>
                                <th className="px-4 py-3.5">Trạng thái</th>
                                <th className="px-4 py-3.5">IP gần nhất</th>
                                <th className="px-4 py-3.5">Số dư (2 Ví)</th>
                                <th className="px-4 py-3.5">Vượt link</th>
                                <th className="px-4 py-3.5">Đơn hàng</th>
                                <th className="px-4 py-3.5">Lịch sử nạp</th>
                                <th className="px-4 py-3.5 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className={`hover:bg-slate-800/40 transition ${u.is_banned ? 'bg-rose-950/20' : ''}`}>
                                    <td className="px-4 py-3.5">
                                        <div className="font-semibold text-white">{u.name || 'Chưa đặt tên'}</div>
                                        <div className="text-[11px] text-slate-400">{u.email}</div>
                                        <span className="text-[9px] font-mono text-slate-500">{u.id}</span>
                                    </td>

                                    <td className="px-4 py-3.5">
                                        {u.is_banned ? (
                                            <div>
                                                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                                                    ĐÃ BỊ CHẶN
                                                </span>
                                                <div className="text-[10px] text-rose-300/80 mt-1 max-w-[140px] truncate" title={u.ban_reason || ''}>
                                                    {u.ban_reason}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                                HOẠT ĐỘNG
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
                                            <Globe className="w-3.5 h-3.5 text-sky-400" />
                                            {u.last_login_ip || 'Chưa có'}
                                        </div>
                                    </td>

                                    {/* HIỂN THỊ CẢ VÍ NẠP VÀ VÍ VƯỢT LINK */}
                                    <td className="px-4 py-3.5 whitespace-nowrap space-y-1.5">
                                        {/* Ví Nạp */}
                                        {editingTarget?.userId === u.id && editingTarget?.field === 'balance' ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    value={editAmount}
                                                    onChange={(e) => setEditAmount(Number(e.target.value))}
                                                    className="w-20 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                                                />
                                                <button onClick={() => handleSaveBalance(u.id, 'balance')} className="p-1 bg-emerald-600 rounded text-white">
                                                    <Check className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => setEditingTarget(null)} className="p-1 bg-slate-800 rounded text-slate-400">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] text-slate-400">Nạp:</span>
                                                <span className="font-bold text-blue-400">{(u.balance || 0).toLocaleString('vi-VN')} đ</span>
                                                <button
                                                    onClick={() => {
                                                        setEditingTarget({ userId: u.id, field: 'balance' });
                                                        setEditAmount(u.balance || 0);
                                                    }}
                                                    className="p-0.5 text-slate-500 hover:text-white"
                                                    title="Sửa Ví Nạp"
                                                >
                                                    <Pencil className="w-2.5 h-2.5" />
                                                </button>
                                            </div>
                                        )}

                                        {/* Ví Vượt Link */}
                                        {editingTarget?.userId === u.id && editingTarget?.field === 'earn_balance' ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    value={editAmount}
                                                    onChange={(e) => setEditAmount(Number(e.target.value))}
                                                    className="w-20 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                                                />
                                                <button onClick={() => handleSaveBalance(u.id, 'earn_balance')} className="p-1 bg-emerald-600 rounded text-white">
                                                    <Check className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => setEditingTarget(null)} className="p-1 bg-slate-800 rounded text-slate-400">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] text-slate-400">Vượt:</span>
                                                <span className="font-bold text-emerald-400">{(u.earn_balance || 0).toLocaleString('vi-VN')} đ</span>
                                                <button
                                                    onClick={() => {
                                                        setEditingTarget({ userId: u.id, field: 'earn_balance' });
                                                        setEditAmount(u.earn_balance || 0);
                                                    }}
                                                    className="p-0.5 text-slate-500 hover:text-white"
                                                    title="Sửa Ví Vượt Link"
                                                >
                                                    <Pencil className="w-2.5 h-2.5" />
                                                </button>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-4 py-3.5 text-indigo-300 font-medium whitespace-nowrap">
                                        {u.completedTasksCount} lượt
                                    </td>

                                    <td className="px-4 py-3.5 text-purple-300 font-medium whitespace-nowrap">
                                        {u.orders?.length || 0} đơn
                                    </td>

                                    <td className="px-4 py-3.5 text-amber-300 font-medium whitespace-nowrap">
                                        {u.deposits?.length || 0} lần
                                    </td>

                                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(u);
                                                    setModalTab('orders');
                                                    setTaskFilter('ALL');
                                                    setDepositFilter('ALL');
                                                }}
                                                title="Soi chi tiết toàn diện"
                                                className="px-2 py-1 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 font-semibold text-xs flex items-center gap-1 transition"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> Soi
                                            </button>

                                            {u.is_banned ? (
                                                <button
                                                    onClick={() => handleUnban(u.id)}
                                                    title="Mở khóa"
                                                    className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                                >
                                                    <Unlock className="w-3.5 h-3.5" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setBanningUser(u);
                                                        setBanReasonInput('');
                                                    }}
                                                    title="Chặn tài khoản"
                                                    className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                                                >
                                                    <Ban className="w-3.5 h-3.5" />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDeletePermanent(u.id)}
                                                title="Xóa hẳn"
                                                className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL CHI TIẾT */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 relative max-h-[90vh] flex flex-col shadow-2xl">
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                Hồ Sơ: <span className="text-sky-400">{selectedUser.name || selectedUser.email}</span>
                            </h2>
                            <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-2 font-mono">
                                <span>User ID: <strong className="text-slate-200">{selectedUser.id}</strong></span>
                                <span>IP gần nhất: <strong className="text-emerald-400">{selectedUser.last_login_ip || 'Chưa ghi nhận'}</strong></span>
                                <span>Ví Nạp: <strong className="text-blue-400 font-bold">{(selectedUser.balance || 0).toLocaleString('vi-VN')} đ</strong></span>
                                <span>Ví Vượt Link: <strong className="text-emerald-400 font-bold">{(selectedUser.earn_balance || 0).toLocaleString('vi-VN')} đ</strong></span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                            <button
                                onClick={() => setModalTab('orders')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${modalTab === 'orders'
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                                    }`}
                            >
                                <ShoppingBag className="w-3.5 h-3.5" /> Đơn Đã Mua ({selectedUser.orders?.length || 0})
                            </button>

                            <button
                                onClick={() => setModalTab('tasks')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${modalTab === 'tasks'
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                                    }`}
                            >
                                <Award className="w-3.5 h-3.5" /> Vượt Link ({selectedUser.tasks?.length || 0})
                            </button>

                            <button
                                onClick={() => setModalTab('deposits')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${modalTab === 'deposits'
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                                    }`}
                            >
                                <CreditCard className="w-3.5 h-3.5" /> Lịch Sử Nạp ({selectedUser.deposits?.length || 0})
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 pr-1">

                            {/* TAB ĐƠN ĐÃ MUA */}
                            {modalTab === 'orders' && (
                                <div>
                                    {(!selectedUser.orders || selectedUser.orders.length === 0) ? (
                                        <div className="py-12 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                                            Chưa có đơn mua nào.
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                                                    <tr>
                                                        <th className="px-3 py-2.5">Tên sản phẩm</th>
                                                        <th className="px-3 py-2.5">Giá mua</th>
                                                        <th className="px-3 py-2.5">Key / Nội dung nhận được</th>
                                                        <th className="px-3 py-2.5">Thời gian mua</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/60">
                                                    {selectedUser.orders.map((o) => {
                                                        const keyVal = findOrderKey(o);
                                                        return (
                                                            <tr key={o.id} className="hover:bg-slate-900/40">
                                                                <td className="px-3 py-2.5 font-bold text-white">
                                                                    {o.resolved_name}
                                                                </td>
                                                                <td className="px-3 py-2.5 font-bold text-purple-400 whitespace-nowrap">
                                                                    {(o.price || o.amount || 0).toLocaleString('vi-VN')} đ
                                                                </td>
                                                                <td className="px-3 py-2.5 font-mono text-[11px] text-emerald-400 select-all max-w-[280px] break-all">
                                                                    {keyVal}
                                                                </td>
                                                                <td className="px-3 py-2.5 text-slate-500 text-[11px] whitespace-nowrap">
                                                                    {new Date(o.created_at).toLocaleString('vi-VN')}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB VƯỢT LINK */}
                            {modalTab === 'tasks' && (
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                                            <Filter className="w-3.5 h-3.5 text-sky-400" /> Lọc:
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => setTaskFilter('ALL')}
                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${taskFilter === 'ALL' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-400'
                                                    }`}
                                            >
                                                Tất cả ({selectedUser.tasks?.length || 0})
                                            </button>
                                            <button
                                                onClick={() => setTaskFilter('COMPLETED')}
                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${taskFilter === 'COMPLETED' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
                                                    }`}
                                            >
                                                Thành công ({selectedUser.tasks?.filter((t) => t.status === 'COMPLETED').length || 0})
                                            </button>
                                            <button
                                                onClick={() => setTaskFilter('PENDING')}
                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${taskFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'
                                                    }`}
                                            >
                                                Chưa xong ({selectedUser.tasks?.filter((t) => t.status !== 'COMPLETED').length || 0})
                                            </button>
                                        </div>
                                    </div>

                                    {filteredTasks.length === 0 ? (
                                        <div className="py-12 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                                            Không có nhiệm vụ nào.
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                                                    <tr>
                                                        <th className="px-3 py-2.5">Trạng thái</th>
                                                        <th className="px-3 py-2.5">Dịch vụ</th>
                                                        <th className="px-3 py-2.5">Token liên kết</th>
                                                        <th className="px-3 py-2.5">Tiền thưởng</th>
                                                        <th className="px-3 py-2.5">Thời gian tạo</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/60">
                                                    {filteredTasks.map((t) => {
                                                        const isDone = t.status === 'COMPLETED';
                                                        return (
                                                            <tr key={t.id} className="hover:bg-slate-900/40">
                                                                <td className="px-3 py-2.5 whitespace-nowrap">
                                                                    {isDone ? (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                                                            <CheckCircle2 className="w-3 h-3" /> Hoàn thành
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                                                                            <Clock className="w-3 h-3" /> Chưa hoàn thành
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2.5 font-bold uppercase text-sky-400">{t.service}</td>
                                                                <td className="px-3 py-2.5 font-mono text-[11px] text-slate-300 select-all max-w-[200px] truncate" title={t.token}>
                                                                    {t.token}
                                                                </td>
                                                                <td className="px-3 py-2.5 font-bold text-emerald-400">+{t.reward.toLocaleString('vi-VN')}đ</td>
                                                                <td className="px-3 py-2.5 text-slate-500 text-[11px] whitespace-nowrap">
                                                                    {new Date(t.created_at).toLocaleString('vi-VN')}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB NẠP TIỀN */}
                            {modalTab === 'deposits' && (
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                                            <Filter className="w-3.5 h-3.5 text-sky-400" /> Lọc nạp:
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => setDepositFilter('ALL')}
                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${depositFilter === 'ALL' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-400'
                                                    }`}
                                            >
                                                Tất cả ({selectedUser.deposits?.length || 0})
                                            </button>
                                            <button
                                                onClick={() => setDepositFilter('COMPLETED')}
                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${depositFilter === 'COMPLETED' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
                                                    }`}
                                            >
                                                Thành công ({selectedUser.deposits?.filter((d) => d.status === 'COMPLETED' || d.status === 'SUCCESS').length || 0})
                                            </button>
                                            <button
                                                onClick={() => setDepositFilter('PENDING')}
                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${depositFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'
                                                    }`}
                                            >
                                                Chờ xử lý ({selectedUser.deposits?.filter((d) => d.status !== 'COMPLETED' && d.status !== 'SUCCESS').length || 0})
                                            </button>
                                        </div>
                                    </div>

                                    {filteredDeposits.length === 0 ? (
                                        <div className="py-12 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                                            Không có giao dịch nạp tiền nào.
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                                                    <tr>
                                                        <th className="px-3 py-2.5">Trạng thái</th>
                                                        <th className="px-3 py-2.5">Số tiền nạp</th>
                                                        <th className="px-3 py-2.5">Mã giao dịch</th>
                                                        <th className="px-3 py-2.5">Thời gian nạp</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/60">
                                                    {filteredDeposits.map((d) => {
                                                        const isPaid = d.status === 'COMPLETED' || d.status === 'SUCCESS';
                                                        return (
                                                            <tr key={d.id} className="hover:bg-slate-900/40">
                                                                <td className="px-3 py-2.5 whitespace-nowrap">
                                                                    {isPaid ? (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                                                            <CheckCircle2 className="w-3 h-3" /> Thành công
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                                                                            <Clock className="w-3 h-3" /> Chờ xử lý
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2.5 font-bold text-emerald-400 whitespace-nowrap">
                                                                    +{Number(d.amount || 0).toLocaleString('vi-VN')} đ
                                                                </td>
                                                                <td className="px-3 py-2.5 font-mono text-[11px] text-slate-400 select-all max-w-[200px] truncate">
                                                                    {d.trans_id || d.code || d.id}
                                                                </td>
                                                                <td className="px-3 py-2.5 text-slate-500 text-[11px] whitespace-nowrap">
                                                                    {new Date(d.created_at).toLocaleString('vi-VN')}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CHẶN */}
            {banningUser && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-1">Chặn Tài Khoản</h3>
                        <p className="text-xs text-slate-400 mb-4">
                            Người dùng <strong className="text-white">{banningUser.email}</strong> sẽ không thể đăng nhập.
                        </p>

                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Lý do chặn:
                        </label>
                        <textarea
                            rows={3}
                            value={banReasonInput}
                            onChange={(e) => setBanReasonInput(e.target.value)}
                            placeholder="VD: Sử dụng tool gian lận vượt link..."
                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 mb-4"
                        />

                        <div className="flex gap-2">
                            <button
                                onClick={() => setBanningUser(null)}
                                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmBan}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                            >
                                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                                Xác nhận chặn
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}