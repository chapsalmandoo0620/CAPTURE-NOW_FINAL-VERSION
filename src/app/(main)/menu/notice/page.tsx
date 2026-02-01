'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, Megaphone } from 'lucide-react';

export default function NoticePage() {
    const router = useRouter();

    const NOTICES = [
        {
            id: 1,
            title: "Welcome to CAPTURE NOW!",
            date: "2026-02-01",
            content: "We are excited to launch the official version of Capture Now. Share your sports moments and join meetups!"
        },
        {
            id: 2,
            title: "Community Guidelines",
            date: "2026-01-20",
            content: "Please be respectful to other members. Report any inappropriate behavior."
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex items-center gap-4 border-b border-gray-900">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                    <ChevronLeft size={28} />
                </button>
                <div className="flex items-center gap-2">
                    <Megaphone className="text-neon-green" size={20} />
                    <h1 className="font-bold text-lg">Announcements</h1>
                </div>
            </header>

            <main className="p-4 space-y-4">
                {NOTICES.map(notice => (
                    <div key={notice.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 space-y-2">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg">{notice.title}</h3>
                            <span className="text-xs text-gray-500">{notice.date}</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{notice.content}</p>
                    </div>
                ))}
            </main>
        </div>
    );
}
