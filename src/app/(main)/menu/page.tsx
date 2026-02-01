'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, LogOut, User, Bell, Shield, HelpCircle, FileText, Bookmark, History, Megaphone, ShieldCheck } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

export default function MenuPage() {
    const router = useRouter();

    const handleDeleteAccount = async () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.') &&
            confirm('Really delete? All your data will be permanently removed.')) {

            try {
                const response = await fetch('/api/auth/delete-account', {
                    method: 'POST',
                });

                if (response.ok) {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    alert('Account deleted successfully.');
                    router.push('/login');
                } else {
                    const data = await response.json();
                    alert(`Failed to delete account: ${data.error}`);
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('An error occurred while deleting account.');
            }
        }
    };

    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push('/login');
        }
    };

    const ACTIVITY_ITEMS = [
        { label: 'Bookmarks', icon: Bookmark, href: '/menu/bookmarks' },
        { label: 'Meeting History', icon: History, href: '/menu/history' },
    ];

    const INFO_ITEMS = [
        { label: 'Tutorial', icon: Play, href: '/tutorial' },
        { label: 'Announcements', icon: Megaphone, href: '/menu/notice' },
        { label: 'Terms of Service', icon: FileText, href: '/menu/terms' },
        { label: 'Privacy Policy', icon: ShieldCheck, href: '/menu/privacy' },
        { label: 'Notifications', icon: Bell, href: '/notifications' },
    ];

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 border-b border-gray-900">
                <h1 className="font-bold text-lg">Menu</h1>
            </header>

            <main className="p-4 space-y-6">

                {/* My Activity Section */}
                <div className="space-y-2">
                    <h2 className="text-xs font-bold text-gray-500 uppercase ml-1">My Activity</h2>
                    <div className="bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800">
                        {ACTIVITY_ITEMS.map((item, i) => (
                            <button
                                key={item.label}
                                onClick={() => router.push(item.href)}
                                className={`w-full flex items-center justify-between p-4 hover:bg-gray-800 transition-colors ${i !== ACTIVITY_ITEMS.length - 1 ? 'border-b border-gray-800' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                                        <item.icon size={16} />
                                    </div>
                                    <span className="font-medium text-sm">{item.label}</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-600" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* App Info Section */}
                <div className="space-y-2">
                    <h2 className="text-xs font-bold text-gray-500 uppercase ml-1">App Info</h2>
                    <div className="bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800">
                        {INFO_ITEMS.map((item, i) => (
                            <button
                                key={item.label}
                                onClick={() => router.push(item.href)}
                                className={`w-full flex items-center justify-between p-4 hover:bg-gray-800 transition-colors ${i !== INFO_ITEMS.length - 1 ? 'border-b border-gray-800' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                                        <item.icon size={16} />
                                    </div>
                                    <span className="font-medium text-sm">{item.label}</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-600" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Account Actions */}
                <div className="mt-8 space-y-3">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-gray-900/50 text-gray-400 font-bold hover:bg-gray-800 border border-gray-800 transition-all"
                    >
                        <LogOut size={18} />
                        Log Out
                    </button>

                    <button
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 border border-red-500/50 transition-all"
                    >
                        <Shield size={18} />
                        Delete Account
                    </button>
                </div>

                <div className="text-center pt-4">
                    <p className="text-[10px] text-gray-600">
                        CAPTURE NOW v1.0.0<br />
                        Powered by Antigravity
                    </p>
                </div>
            </main>
        </div>
    );
}
