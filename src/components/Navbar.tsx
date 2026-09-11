'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: string;
    name?: string;
    username?: string;
    email: string;
    role: string;
    balance: number;
    earn_balance: number;
}

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Lấy thông tin user đăng nhập
    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me', {
                method: 'GET',
                cache: 'no-store',
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user || null);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [pathname]);

    // Đóng menu khi chuyển trang
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            // Bỏ qua lỗi mạng khi logout
        } finally {
            setUser(null);
            router.push('/login');
            router.refresh();
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-[#0c101c]/90 backdrop-blur-md border-b border-gray-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-xl sm:text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow-sm">
                                Komura Shop
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links & Social Icons */}
                    <div className="hidden md:flex items-center gap-5 lg:gap-6">
                        <Link
                            href="/"
                            className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                                }`}
                        >
                            Trang chủ
                        </Link>
                        <Link
                            href="/deposit"
                            className={`text-sm font-medium transition-colors ${pathname === '/deposit' ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                                }`}
                        >
                            Nạp tiền
                        </Link>
                        <Link
                            href="/earn"
                            className={`text-sm font-medium transition-colors ${pathname === '/earn' ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                                }`}
                        >
                            Vượt link kiếm tiền
                        </Link>
                        {user?.role === 'admin' && (
                            <Link
                                href="/admin"
                                className={`text-sm font-medium transition-colors ${pathname?.startsWith('/admin') ? 'text-amber-400' : 'text-amber-500 hover:text-amber-300'
                                    }`}
                            >
                                Quản trị
                            </Link>
                        )}

                        {/* Desktop Social Icons (Chỉ hiện Icon) */}
                        <div className="flex items-center gap-2 pl-3 border-l border-gray-800/80">
                            <a
                                href="https://discord.gg/2WKkw8VPs"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Discord Server"
                                className="w-7 h-7 rounded-lg overflow-hidden border border-gray-700/60 bg-gray-800/50 p-0.5 hover:scale-110 hover:border-indigo-500/80 transition-all duration-200"
                            >
                                <img
                                    src="https://cdn.upanhlaylink.com/i/refZcEng.png"
                                    alt="Discord"
                                    className="w-full h-full object-cover rounded-md"
                                />
                            </a>

                            <a
                                href="https://www.facebook.com/share/19aDyCaWnJ/?mibextid=wwXIfr"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Facebook Cá Nhân"
                                className="w-7 h-7 rounded-lg overflow-hidden border border-gray-700/60 bg-gray-800/50 p-0.5 hover:scale-110 hover:border-blue-500/80 transition-all duration-200"
                            >
                                <img
                                    src="https://cdn.upanhlaylink.com/i/3n0VitIs.jpeg"
                                    alt="Facebook"
                                    className="w-full h-full object-cover rounded-md"
                                />
                            </a>

                            <a
                                href="https://www.tiktok.com/@ltpkomuraa"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="TikTok"
                                className="w-7 h-7 rounded-lg overflow-hidden border border-gray-700/60 bg-gray-800/50 p-0.5 hover:scale-110 hover:border-pink-500/80 transition-all duration-200"
                            >
                                <img
                                    src="https://cdn.upanhlaylink.com/i/IkhzdA8U.png"
                                    alt="TikTok"
                                    className="w-full h-full object-cover rounded-md"
                                />
                            </a>
                        </div>
                    </div>

                    {/* Right Section: Wallets & Auth State */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {!loading && (
                            <>
                                {user ? (
                                    <div className="flex items-center gap-2">
                                        {/* Ví Nạp (Deposit Wallet) */}
                                        <Link
                                            href="/deposit"
                                            title="Số dư Ví Nạp"
                                            className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all text-xs sm:text-sm font-semibold flex items-center gap-1"
                                        >
                                            <span className="text-[10px] sm:text-xs text-blue-300/70 font-normal">Nạp:</span>
                                            <span>{(user.balance || 0).toLocaleString('vi-VN')}đ</span>
                                        </Link>

                                        {/* Ví Vượt Link (Earn Wallet) */}
                                        <Link
                                            href="/earn"
                                            title="Số dư Ví Vượt Link"
                                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all text-xs sm:text-sm font-semibold flex items-center gap-1"
                                        >
                                            <span className="text-[10px] sm:text-xs text-emerald-300/70 font-normal">Vượt link:</span>
                                            <span>{(user.earn_balance || 0).toLocaleString('vi-VN')}đ</span>
                                        </Link>

                                        {/* Desktop Profile & Logout */}
                                        <div className="hidden md:flex items-center gap-2 ml-2">
                                            <Link
                                                href="/profile"
                                                className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-gray-800/70 hover:bg-gray-700/70 rounded-lg border border-gray-700 transition-colors"
                                            >
                                                {user.username || user.name || 'Tài khoản'}
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="p-1.5 text-gray-400 hover:text-red-400 bg-gray-800/40 hover:bg-red-500/10 rounded-lg border border-gray-700/60 transition-colors"
                                                title="Đăng xuất"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="hidden md:flex items-center gap-2">
                                        <Link
                                            href="/login"
                                            className="px-3.5 py-1.5 text-sm font-medium text-gray-200 hover:text-white hover:bg-gray-800/70 rounded-lg transition-colors"
                                        >
                                            Đăng nhập
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="px-3.5 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg shadow-md transition-all"
                                        >
                                            Đăng ký
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg bg-gray-800/80 border border-gray-700/70 text-gray-300 hover:text-white hover:bg-gray-700/80 focus:outline-none transition-colors"
                            aria-label="Toggle Menu"
                        >
                            {isMenuOpen ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Drawer Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-800 bg-[#0c101c]/98 px-4 pt-3 pb-5 space-y-2.5 shadow-2xl">
                    <Link
                        href="/"
                        className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${pathname === '/' ? 'bg-purple-600/20 text-purple-400' : 'text-gray-300 hover:bg-gray-800'
                            }`}
                    >
                        Trang chủ
                    </Link>
                    <Link
                        href="/deposit"
                        className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${pathname === '/deposit' ? 'bg-purple-600/20 text-purple-400' : 'text-gray-300 hover:bg-gray-800'
                            }`}
                    >
                        Nạp tiền
                    </Link>
                    <Link
                        href="/earn"
                        className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${pathname === '/earn' ? 'bg-purple-600/20 text-purple-400' : 'text-gray-300 hover:bg-gray-800'
                            }`}
                    >
                        Vượt link kiếm tiền
                    </Link>

                    {/* Mobile Social Icons */}
                    <div className="pt-2 pb-1 border-t border-gray-800/80 flex items-center justify-center gap-4">
                        <a
                            href="https://discord.gg/2WKkw8VPs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg overflow-hidden border border-gray-700 bg-gray-800 p-0.5"
                        >
                            <img src="https://cdn.upanhlaylink.com/i/refZcEng.png" alt="Discord" className="w-full h-full object-cover rounded-md" />
                        </a>
                        <a
                            href="https://www.facebook.com/share/19aDyCaWnJ/?mibextid=wwXIfr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg overflow-hidden border border-gray-700 bg-gray-800 p-0.5"
                        >
                            <img src="https://cdn.upanhlaylink.com/i/3n0VitIs.jpeg" alt="Facebook" className="w-full h-full object-cover rounded-md" />
                        </a>
                        <a
                            href="https://www.tiktok.com/@ltpkomura"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg overflow-hidden border border-gray-700 bg-gray-800 p-0.5"
                        >
                            <img src="https://cdn.upanhlaylink.com/i/IkhzdA8U.png" alt="TikTok" className="w-full h-full object-cover rounded-md" />
                        </a>
                    </div>

                    {user && (
                        <>
                            <Link
                                href="/profile"
                                className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${pathname === '/profile' ? 'bg-purple-600/20 text-purple-400' : 'text-gray-300 hover:bg-gray-800'
                                    }`}
                            >
                                Hồ sơ & Lịch sử
                            </Link>
                            {user.role === 'admin' && (
                                <Link
                                    href="/admin"
                                    className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${pathname?.startsWith('/admin') ? 'bg-amber-600/20 text-amber-400' : 'text-amber-500 hover:bg-gray-800'
                                        }`}
                                >
                                    Quản trị hệ thống
                                </Link>
                            )}
                            <div className="pt-2 border-t border-gray-800/80">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        </>
                    )}

                    {!user && !loading && (
                        <div className="pt-3 border-t border-gray-800/80 grid grid-cols-2 gap-2">
                            <Link
                                href="/login"
                                className="w-full text-center py-2 text-sm font-medium text-gray-200 bg-gray-800/80 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                href="/register"
                                className="w-full text-center py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg shadow-md transition-all"
                            >
                                Đăng ký
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
