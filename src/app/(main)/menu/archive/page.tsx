'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, MapPin, Award } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ArchivePage() {
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Fetch meetups I participated in that are finished
                const { data, error } = await supabase
                    .from('meetup_participants')
                    .select(`
                        meetup:meetups(*)
                    `)
                    .eq('user_id', user.id);

                if (data) {
                    // Extract meetups and filter for 'finished' status
                    // Note: Supabase types might verify 'meetup' presence
                    const finished = data
                        .map((item: any) => item.meetup)
                        .filter((m: any) => m && m.status === 'finished');

                    setHistory(finished.map((m: any) => ({
                        id: m.id,
                        title: m.title,
                        date: new Date(m.start_time).toLocaleDateString(),
                        loc: m.location_name || 'Unknown',
                        sport: m.category || 'Event'
                    })));
                }
            }
            setLoading(false);
        };
        fetchHistory();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex items-center gap-4 border-b border-gray-900">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="font-bold text-lg">My Meetup History</h1>
            </header>

            <main className="p-4 space-y-4">
                {loading ? (
                    <div className="text-center text-gray-500 py-10">Loading history...</div>
                ) : history.length > 0 ? (
                    history.map((meet) => (
                        <div key={meet.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex gap-4">
                            <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center text-2xl border border-gray-700">
                                <Award className="text-neon-green" />
                            </div>
                            <div className="flex-1">
                                <div className="text-neon-green text-xs font-bold uppercase mb-1">{meet.sport}</div>
                                <h3 className="font-bold text-lg leading-tight">{meet.title}</h3>
                                <div className="flex items-center gap-4 mt-2 text-gray-400 text-xs">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        <span>{meet.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin size={12} />
                                        <span>{meet.loc}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-10 space-y-2">
                        <Award size={48} className="mx-auto opacity-20" />
                        <p>No finished meetups yet.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
