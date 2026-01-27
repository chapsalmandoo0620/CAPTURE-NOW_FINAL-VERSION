'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, LogOut, User, Bell, Shield, HelpCircle, FileText } from 'lucide-react';

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

    const MENU_ITEMS = [
        { label: 'Edit Profile', icon: User, href: '/profile/edit' },
        { label: 'Notifications', icon: Bell, href: '/notifications' },
        { label: 'Privacy & Security', icon: Shield, href: '/privacy' },
        { label: 'Help & Support', icon: HelpCircle, href: '/support' },
        { label: 'Terms of Service', icon: FileText, href: '/terms' },
    ];

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 border-b border-gray-900">
                <h1 className="font-bold text-lg">Menu</h1>
            </header>

            <main className="p-4 space-y-6">

                {/* Account Section */}
                <div className="space-y-2">
                    <h2 className="text-xs font-bold text-gray-500 uppercase ml-1">Account</h2>
                    <div className="bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800">
                        {MENU_ITEMS.slice(0, 3).map((item, i) => (
                            <button
                                key={item.label}
                                className={`w-full flex items-center justify-between p-4 hover:bg-gray-800 transition-colors ${i !== 2 ? 'border-b border-gray-800' : ''}`}
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

                {/* Support Section */}
                <div className="space-y-2">
                    <h2 className="text-xs font-bold text-gray-500 uppercase ml-1">Support</h2>
                    <div className="bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800">
                        {MENU_ITEMS.slice(3).map((item, i) => (
                            <button
                                key={item.label}
                                className={`w-full flex items-center justify-between p-4 hover:bg-gray-800 transition-colors ${i !== 1 ? 'border-b border-gray-800' : ''}`}
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

                {/* Danger Zone */}
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

                <div className="text-center">
                    <p className="text-[10px] text-gray-600">
                        CAPTURE NOW v1.0.0<br />
                        Powered by Antigravity
                    </p>
                </div>
            </main>
        </div>
    );
}
