'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Ticket,
    BookOpen,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    Users,
    Building2
} from 'lucide-react';
import clsx from 'clsx';
import { User } from '@/types';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role?: 'USER' | 'IT_STAFF' | 'ADMIN';
}

export default function DashboardLayout({ children, role = 'USER' }: DashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const session = localStorage.getItem('user_session');
        if (!session) {
            router.push('/login');
            return;
        }
        setTimeout(() => {
            setUser(JSON.parse(session));
        }, 0);

        // Auto-close sidebar on mobile
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [router]);

    const handleLogout = () => {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('user_session');
            router.push('/login');
        }
    };

    const getNavItems = () => {

        if (role === 'ADMIN') {
            return [
                { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
                { name: 'Manage Users', href: '/admin/users', icon: Users },
                { name: 'Manage Rooms', href: '/admin/rooms', icon: Building2 },
                { name: 'Knowledge Base', href: '/knowledge-base', icon: BookOpen },
            ];
        } else if (role === 'IT_STAFF') {
            return [
                { name: 'Dashboard', href: '/it/dashboard', icon: LayoutDashboard },
                { name: 'Knowledge Base', href: '/knowledge-base', icon: BookOpen },
            ];
        } else {
            return [
                { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
                { name: 'Report Issue', href: '/dashboard/report', icon: Ticket },
                { name: 'Knowledge Base', href: '/knowledge-base', icon: BookOpen },
            ];
        }
    };

    const navItems = getNavItems();

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-blue-100 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-xl lg:shadow-none",
                    !isSidebarOpen && "-translate-x-full"
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-6 border-b border-blue-50 bg-white">
                        <div className="flex items-center gap-2 text-blue-800 font-bold text-xl">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">P</div>
                            PSUIC
                        </div>
                        <button
                            className="ml-auto lg:hidden text-gray-500"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                        <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Menu
                        </div>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={clsx(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon size={18} className={isActive ? "text-blue-600" : "text-gray-400"} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile Footer */}
                    <div className="p-4 border-t border-blue-50 bg-blue-50/30">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                                {user.name?.[0] || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{user.role?.toLowerCase().replace('_', ' ')}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                        >
                            <LogOut size={14} />
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-blue-100 flex items-center justify-between px-4 lg:px-8 shadow-sm z-40 sticky top-0">
                    <button
                        className="p-2 -ml-2 text-gray-500 lg:hidden hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={20} />
                    </button>

                    {/* Search / Breadcrumbs placeholder */}
                    <div className="flex-1 max-w-xl ml-4 hidden md:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search here..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
