'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, LogOut, User, Bell, Shield, HelpCircle, FileText, Bookmark, History, Megaphone, ShieldCheck, Globe, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/language-context';
import { Locale } from '@/lib/i18n/dictionaries';

export default function MenuPage() {
    const router = useRouter();
    const { t, language, setLanguage } = useLanguage();
    const [showLangModal, setShowLangModal] = useState(false);

    const handleDeleteAccount = async () => {
        if (confirm(t('common.confirm') + '?') &&
            confirm(t('menu.deleteAccount') + '?')) {

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
        if (confirm(t('menu.logout') + '?')) {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push('/login');
        }
    };

    const ACTIVITY_ITEMS = [
        { label: t('menu.bookmarks'), icon: Bookmark, href: '/menu/bookmarks' },
        { label: t('menu.history'), icon: History, href: '/menu/history' },
    ];

    const INFO_ITEMS = [
        { label: t('menu.tutorial'), icon: HelpCircle, href: '/tutorial' },
        { label: t('menu.announcements'), icon: Megaphone, href: '/menu/notice' },
        { label: t('menu.terms'), icon: FileText, href: '/menu/terms' },
        { label: t('menu.privacy'), icon: ShieldCheck, href: '/menu/privacy' },
        { label: t('menu.notifications'), icon: Bell, href: '/notifications' },
    ];

    const currentFlag = {
        en: '🇺🇸 English',
        ko: '🇰🇷 한국어',
        ja: '🇯🇵 日本語',
        zh: '🇨🇳 中文'
    }[language];

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 border-b border-gray-900">
                <h1 className="font-bold text-lg">{t('menu.title')}</h1>
            </header>

            <main className="p-4 space-y-6">

                {/* My Activity Section */}
                <div className="space-y-2">
                    <h2 className="text-xs font-bold text-gray-500 uppercase ml-1">{t('menu.myActivity')}</h2>
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
                    <h2 className="text-xs font-bold text-gray-500 uppercase ml-1">{t('menu.appInfo')}</h2>
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

                {/* Language Settings */}
                <div className="space-y-2">
                    <h2 className="text-xs font-bold text-gray-500 uppercase ml-1">{t('common.language')}</h2>
                    <button
                        onClick={() => setShowLangModal(true)}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-900/50 hover:bg-gray-800 border border-gray-800 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                                <Globe size={16} />
                            </div>
                            <span className="font-medium text-sm">{currentFlag}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-600" />
                    </button>
                </div>

                {/* Account Actions */}
                <div className="mt-8 space-y-3">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-gray-900/50 text-gray-400 font-bold hover:bg-gray-800 border border-gray-800 transition-all"
                    >
                        <LogOut size={18} />
                        {t('menu.logout')}
                    </button>

                    <button
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 border border-red-500/50 transition-all"
                    >
                        <Shield size={18} />
                        {t('menu.deleteAccount')}
                    </button>
                </div>

                <div className="text-center pt-4">
                    <p className="text-[10px] text-gray-600">
                        {t('menu.version')}<br />
                        {t('menu.poweredBy')}
                    </p>
                </div>
            </main>

            {/* Language Modal */}
            {showLangModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-6 relative shadow-2xl">
                        <button
                            onClick={() => setShowLangModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold mb-6 text-center">{t('common.language')}</h2>

                        <div className="space-y-3">
                            {[
                                { code: 'en', label: 'English', flag: '🇺🇸' },
                                { code: 'ko', label: '한국어', flag: '🇰🇷' },
                                { code: 'ja', label: '日本語', flag: '🇯🇵' },
                                { code: 'zh', label: '中文', flag: '🇨🇳' }
                            ].map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLanguage(lang.code as Locale);
                                        setShowLangModal(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all
                                        ${language === lang.code
                                            ? 'bg-neon-green/10 border-neon-green text-neon-green'
                                            : 'bg-gray-800/50 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{lang.flag}</span>
                                        <span className="font-bold">{lang.label}</span>
                                    </div>
                                    {language === lang.code && <div className="w-2 h-2 rounded-full bg-neon-green" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
