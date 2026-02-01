'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, FileText } from 'lucide-react';

export default function TermsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex items-center gap-4 border-b border-gray-900">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                    <ChevronLeft size={28} />
                </button>
                <div className="flex items-center gap-2">
                    <FileText className="text-neon-green" size={20} />
                    <h1 className="font-bold text-lg">Terms of Service</h1>
                </div>
            </header>

            <main className="p-4 text-gray-300 text-sm leading-relaxed space-y-4">
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                    <h2 className="font-bold text-white mb-2">1. Introduction</h2>
                    <p>Welcome to CAPTURE NOW. By using our app, you agree to these terms.</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                    <h2 className="font-bold text-white mb-2">2. User Conduct</h2>
                    <p>You agree not to post harmful or illegal content. Respect others in the community.</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                    <h2 className="font-bold text-white mb-2">3. Content</h2>
                    <p>You retain rights to your content but grant us a license to display it.</p>
                </div>
            </main>
        </div>
    );
}
