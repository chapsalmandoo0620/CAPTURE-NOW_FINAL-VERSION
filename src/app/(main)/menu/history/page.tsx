'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, History, MapPin, ChevronRight, CalendarCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { dictionaries } from '@/lib/i18n/dictionaries';

export default function HistoryPage() {
    const router = useRouter();
    const { language } = useLanguage();
    const t = dictionaries[language].common;
    const tMenu = dictionaries[language].menu;
    const tFeed = dictionaries[language].feed;
    const tMeetup = dictionaries[language].meetup;
    const tHome = dictionaries[language].home;
    const tTutorial = dictionaries[language].tutorial;

    // Fallback for missing keys if any (partial dictionaries)
    // Using explicit strings from earlier analysis to map to dictionary keys

    const [meetups, setMeetups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setCurrentUser(user);
                // Fetch joined meetups
                const { data: participants } = await supabase
                    .from('meetup_participants')
                    .select('meetup:meetups(*)')
                    .eq('user_id', user.id);

                if (participants) {
                    // Filter for Finished meetups
                    const finishedMeets = participants
                        .map((p: any) => p.meetup)
                        .filter((m: any) => m && m.status === 'finished');

                    // Sort by Date Descending (Newest first)
                    finishedMeets.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

                    setMeetups(finishedMeets);
                }
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    // Helper to format date string ISO -> { month: 'MAY', day: '20' }
    const formatDate = (dateStr: string) => {
        try {
            if (!dateStr) return { month: 'DATE', day: 'DD' };
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) throw new Error("Invalid Date");
            return {
                month: date.toLocaleString(language === 'en' ? 'en-US' : (language === 'ko' ? 'ko-KR' : (language === 'ja' ? 'ja-JP' : 'zh-CN')), { month: 'short' }).toUpperCase(),
                day: date.getDate().toString()
            };
        } catch (e) {
            return { month: 'DATE', day: 'DD' };
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative">
            {/* Header */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex items-center gap-4 border-b border-gray-900">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                    <ChevronLeft size={28} />
                </button>
                <div className="flex items-center gap-2">
                    <History className="text-neon-green" size={20} />
                    <h1 className="font-bold text-lg">{tMenu.history}</h1>
                </div>
            </header>

            <main className="p-4 space-y-3 min-h-[60vh]">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">{t.loading}</div>
                ) : meetups.length > 0 ? (
                    meetups.map((meet) => {
                        const { month, day } = formatDate(meet.start_time);
                        const isHost = meet.host_id === currentUser?.id;

                        return (
                            <Link href={`/meet/${meet.id}`} key={meet.id}>
                                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 flex items-center justify-between group hover:border-neon-green transition-all mb-3 text-gray-400 hover:text-white">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gray-800 flex flex-col items-center justify-center border border-gray-700 shrink-0 opacity-70">
                                            <span className="text-[10px] font-bold uppercase">{month}</span>
                                            <span className="text-lg font-bold leading-none mt-0.5">{day}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm mb-0.5 group-hover:text-neon-green transition-colors flex items-center gap-2">
                                                {meet.title}
                                                {isHost && <span className="text-[10px] text-neon-green border border-neon-green px-1 rounded">HOST</span>}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-0.5"><MapPin size={10} /> {meet.location_name || t.unknown}</span>
                                                <span className="w-0.5 h-0.5 rounded-full bg-gray-600"></span>
                                                <span>{meet.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-600 font-bold border border-gray-700 px-2 py-1 rounded-full">Done</span>
                                        <ChevronRight size={20} className="text-gray-600 group-hover:text-white" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                            <CalendarCheck className="text-gray-700" size={32} />
                        </div>
                        <p>{tTutorial.step6.desc}</p>
                        <Link href="/meet" className="text-neon-green font-bold text-sm underline">{tHome.upcomingNearby}</Link>
                    </div>
                )}
            </main>
        </div>
    );
}
