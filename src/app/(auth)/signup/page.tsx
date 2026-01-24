'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const supabase = createClient();

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;

            if (error) throw error;

            // User requested explicit flow: Alert -> Login -> Input Info
            // Even if session is created (auto-login), we sign out to force manual login flow
            await supabase.auth.signOut();

            alert('회원가입이 완료되었습니다!\n개인 프로필 정보를 입력하기 위해 다시 로그인해주세요.');
            router.push('/login');

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

            <div className="w-full max-w-md z-10 space-y-8">
                {/* Logo / Header */}
                <div className="text-center space-y-4 flex flex-col items-center">
                    <div className="w-40 h-auto">
                        <img src="/logo.jpg" alt="CAPTURE NOW Logo" className="w-full h-full object-contain" />
                    </div>
                    <p className="text-gray-400">
                        Join the crew today.
                    </p>
                </div>

                {/* Input Form */}
                <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
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
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a password"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-neon w-full mt-2 disabled:opacity-50">
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Social Login */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-gray-900 px-2 text-gray-500 rounded-full">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleSocialLogin('google')} className="flex items-center justify-center py-2.5 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
                            <span className="text-sm font-bold">Google</span>
                        </button>
                        <button onClick={() => handleSocialLogin('kakao')} className="flex items-center justify-center py-2.5 border border-gray-700 rounded-lg hover:bg-[#FEE500] hover:text-black hover:border-[#FEE500] transition-colors">
                            <span className="text-sm font-bold">Kakao</span>
                        </button>
                    </div>
                </div>

                {/* Footer Toggle */}
                <div className="text-center">
                    <Link
                        href="/login"
                        className="text-sm text-gray-400 hover:text-neon-green transition-colors"
                    >
                        Already have an account? Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
