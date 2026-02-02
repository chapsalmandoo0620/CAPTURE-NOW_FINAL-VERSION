'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, CircuitBoard } from 'lucide-react';
import { GoogleSignInButton, KakaoSignInButton } from '@/components/social-login-buttons';
import { useLanguage } from '@/context/language-context';
import { dictionaries } from '@/lib/i18n/dictionaries';
import AuthLanguageSwitcher from '@/components/auth-language-switcher';

export default function LoginPage() {
    const router = useRouter();
    const { language } = useLanguage();
    const t = dictionaries[language].auth.login;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const supabase = createClient();

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Check for profile
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Check Supabase first
                const { data: profile } = await supabase
                    .from('users')
                    .select('nickname')
                    .eq('id', user.id)
                    .single();

                // Check Local Database (Primary Source of Truth)
                const userEmail = user.email || email; // Fallback to state email
                const dbKey = `db_profile_${userEmail}`;
                const persistentProfile = localStorage.getItem(dbKey);

                let hasProfile = false;

                if (persistentProfile) {
                    try {
                        const parsed = JSON.parse(persistentProfile);
                        if (parsed) {
                            hasProfile = true;
                            // Hydrate Session: Copy DB data to Session
                            // Also sync ID in case it changed (Mock env)
                            parsed.id = user.id;
                            localStorage.setItem('my_profile', JSON.stringify(parsed));
                        }
                    } catch (e) { console.error("Profile parse error", e); }
                }

                // Supabase profile check (Secondary/Legacy)
                if ((profile && profile.nickname) || hasProfile) {
                    localStorage.setItem('capture_now_auth', 'true');
                    router.push('/');
                } else {
                    // New user or no local data found -> Onboarding
                    localStorage.setItem('capture_now_auth', 'true');
                    router.push('/onboarding');
                }
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'kakao') => {
        setLoading(true);
        const supabase = createClient();
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            alert(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-green rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500 rounded-full blur-[80px]" />
            </div>

            <AuthLanguageSwitcher />

            <div className="w-full max-w-md z-10 space-y-8">
                {/* Logo / Header */}
                <div className="text-center space-y-4 flex flex-col items-center">
                    <div className="w-40 h-auto">
                        <img src="/logo.jpg" alt="CAPTURE NOW Logo" className="w-full h-full object-contain" />
                    </div>
                    {/* <h1 className="text-4xl font-bold tracking-tighter text-white">
            CAPTURE <span className="text-neon-green">NOW</span>
          </h1> */}
                    <p className="text-gray-400">
                        {t.title}
                    </p>
                </div>

                {/* Input Form */}
                <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">{t.email}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">{t.password}</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-neon w-full mt-2 disabled:opacity-50">
                            {loading ? t.signingIn : t.signIn}
                        </button>
                    </form>

                    {/* Social Login */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-gray-900 px-2 text-gray-500 rounded-full">{t.or}</span>
                        </div>
                    </div>





                    <div className="space-y-3">
                        <GoogleSignInButton onClick={() => handleSocialLogin('google')} label={t.google} />
                        <KakaoSignInButton onClick={() => handleSocialLogin('kakao')} label={t.kakao} />
                    </div>
                </div>

                {/* Footer Toggle */}
                <div className="text-center">
                    <Link
                        href="/signup"
                        className="text-sm text-gray-400 hover:text-neon-green transition-colors"
                    >
                        {t.noAccount}
                    </Link>
                </div>
            </div>
        </div>
    );
}
