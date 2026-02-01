'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex items-center gap-4 border-b border-gray-900">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                    <ChevronLeft size={28} />
                </button>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="text-neon-green" size={20} />
                    <h1 className="font-bold text-lg">Privacy Policy</h1>
                </div>
            </header>

            <main className="p-4 text-gray-300 text-sm leading-relaxed space-y-4">
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                    <h2 className="font-bold text-white mb-2">1. Data Collection</h2>
                    <p>We collect information you provide, such as your profile and posts.</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                    <h2 className="font-bold text-white mb-2">2. Usage</h2>
                    <p>We use your data to provide and improve the service.</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                    <h2 className="font-bold text-white mb-2">3. Sharing</h2>
                    <p>We do not sell your personal data to users.</p>
                </div>
            </main>
        </div>
    );
}
