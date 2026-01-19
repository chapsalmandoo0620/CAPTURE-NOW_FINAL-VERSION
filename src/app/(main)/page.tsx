'use client';

import { useState, useEffect } from 'react';
import { Bell, MessageCircle, Heart, MessageSquare, Send, Aperture, MapPin, Clock, Zap, MoreHorizontal, Copy, Edit, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import FeedCard from '@/components/feed-card';

// Helper for Emojis
function getEmoji(sport: string) {
    const s = sport.toLowerCase();
    if (s.includes('run')) return '🏃';
    if (s.includes('soccer')) return '⚽';
    if (s.includes('tennis')) return '🎾';
    if (s.includes('cycle') || s.includes('bik')) return '🚴';
    if (s.includes('hik') || s.includes('moun')) return '⛰️';
    if (s.includes('swim')) return '�';
    if (s.includes('golf')) return '⛳';
    if (s.includes('basket')) return '🏀';
    return '⚡';
}

export default function HomePage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [quickMeets, setQuickMeets] = useState<any[]>([]);
    const [liveMeet, setLiveMeet] = useState<any>(null);
    const [isLiveJoined, setIsLiveJoined] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            // 1. Fetch Posts (Highlights)
            // Join users to get nickname/avatar
            const { data: postsData } = await supabase
                .from('highlights')
                .select(`
                    *,
                    user:users!user_id(nickname, avatar_url)
                `)
                .order('created_at', { ascending: false });

            if (postsData) {
                const formattedPosts = postsData.map(post => ({
                    id: post.id,
                    user: post.user?.nickname || 'Unknown',
                    userImg: post.user?.avatar_url || '',
                    image: post.media_url,
                    type: (post.media_url.match(/\.(mp4|webm|mov)$/i) || post.category === 'video') ? 'video' : 'image',
                    likes: 0,
                    caption: post.caption,
                    location: post.location_name || 'Unknown',
                    sport: post.category || 'General',
                    level: 'Any',
                    time: new Date(post.created_at).toLocaleDateString(),
                    timestamp: new Date(post.created_at).getTime(),
                    comments: []
                }));
                setPosts(formattedPosts);
            }

            // 2. Fetch Meetups (Live & Quick)
            const { data: meetsData } = await supabase
                .from('meetups')
                .select('*')
                .neq('status', 'finished')
                .order('start_time', { ascending: true })
                .limit(6);

            if (meetsData && meetsData.length > 0) {
                // First meet is "Live" (Nearest future)
                setLiveMeet(meetsData[0]);

                // Rest are Quick Meets
                setQuickMeets(meetsData.slice(1).map(m => ({
                    id: m.id,
                    sport: m.category,
                    emoji: getEmoji(m.category || ''),
                    time: new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    loc: m.location_name?.split(' ')[0] || 'Loc',
                    dist: '0.8km' // Mock
                })));

                // Check Join Status for Live Meet
                const { data: { user } } = await supabase.auth.getUser();
                if (user && meetsData[0]) {
                    const { data: participant } = await supabase
                        .from('meetup_participants')
                        .select('*')
                        .match({ meetup_id: meetsData[0].id, user_id: user.id })
                        .single();
                    if (participant) setIsLiveJoined(true);
                }
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const handleJoinLive = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!liveMeet) return;

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert('Please login join.');
            return;
        }

        if (isLiveJoined) {
            // Leave
            const { error } = await supabase
                .from('meetup_participants')
                .delete()
                .match({ meetup_id: liveMeet.id, user_id: user.id });
            if (!error) setIsLiveJoined(false);
        } else {
            // Join
            const { error } = await supabase
                .from('meetup_participants')
                .insert({ meetup_id: liveMeet.id, user_id: user.id });
            if (!error) setIsLiveJoined(true);
        }
    };

    return (
        <div className="bg-black text-white min-h-screen pb-24">
            {/* Header */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex justify-between items-center border-b border-gray-900">
                <div className="flex items-center gap-0.5">
                    <Aperture className="text-neon-green w-8 h-8" strokeWidth={2.5} />
                    <Zap className="text-neon-green w-6 h-6 fill-neon-green/20" strokeWidth={2.5} />
                </div>
                <div className="flex gap-4">
                    <button className="relative group">
                        <Bell size={24} className="text-gray-300 group-hover:text-neon-green transition-colors" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-neon-green rounded-full border border-black"></span>
                    </button>
                    <button className="group">
                        <MessageCircle size={24} className="text-gray-300 group-hover:text-neon-green transition-colors" />
                    </button>
                </div>
            </header>

            {/* Banner */}
            {liveMeet && (
                <section className="p-4 pt-6">
                    <Link href={`/meet/${liveMeet.id}`}>
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-4 flex items-center justify-between border border-gray-800 shadow-lg relative overflow-hidden group cursor-pointer hover:border-gray-700 transition-all">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-neon-green/20"></div>

                            <div className="z-10">
                                <h2 className="text-neon-green font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
                                    Up Next
                                </h2>
                                <p className="font-bold text-lg truncate max-w-[180px]">{liveMeet.title}</p>
                                <p className="text-gray-400 text-xs mt-1">{liveMeet.max_participants || 10} spots available</p>
                            </div>
                            <button
                                onClick={handleJoinLive}
                                className={`z-10 text-xs font-bold px-4 py-2 rounded-full transition-colors ${isLiveJoined
                                    ? 'bg-white text-black hover:bg-gray-200'
                                    : 'bg-neon-green text-black hover:bg-white'
                                    }`}
                            >
                                {isLiveJoined ? 'Joined' : 'Join'}
                            </button>
                        </div>
                    </Link>
                </section>
            )}

            {/* Quick Join */}
            <section className="mb-4">
                <div className="px-4 mb-2 flex justify-between items-end">
                    <h3 className="font-bold text-lg">Upcoming Nearby</h3>
                    <Link href="/meet" className="text-xs text-gray-400 hover:text-white">See all</Link>
                </div>
                {quickMeets.length > 0 ? (
                    <div className="flex px-4 gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {quickMeets.map(meet => (
                            <Link key={meet.id} href={`/meet/${meet.id}`} className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group">
                                <div className="w-[72px] h-[72px] rounded-full bg-gray-900 border border-gray-700 group-hover:border-neon-green transition-colors flex items-center justify-center text-3xl">
                                    {meet.emoji}
                                </div>
                                <div className="flex flex-col items-center gap-0.5 w-full">
                                    <span className="text-xs font-bold text-white truncate max-w-[72px]">{meet.sport}</span>
                                    <div className="flex items-center gap-1 text-[10px] text-neon-green font-medium">
                                        <Clock size={10} />
                                        <span>{meet.time}</span>
                                    </div>
                                    <div className="flex flex-col items-center text-[10px] text-gray-500 leading-none gap-0.5 mt-0.5">
                                        <span className="truncate max-w-[70px]">{meet.loc}</span>
                                        <div className="flex items-center gap-0.5">
                                            <MapPin size={8} />
                                            <span>{meet.dist}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm bg-gray-900/30 mx-4 rounded-xl border border-gray-800 border-dashed">
                        No upcoming meetups nearby. <br /> <Link href="/meet/create" className="text-neon-green underline">Create one!</Link>
                    </div>
                )}
            </section>

            {/* Feed */}
            <section className="pb-24 space-y-6">
                {posts.length > 0 ? (
                    posts.map(post => <FeedCard key={post.id} post={post} />)
                ) : (
                    <div className="px-4 py-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4">
                            <Aperture className="text-gray-600" />
                        </div>
                        <h3 className="text-gray-400 font-bold">No posts yet</h3>
                        <p className="text-gray-600 text-sm mt-1">Be the first to share a highlight!</p>
                        <Link href="/upload" className="mt-4 px-6 py-2 bg-neon-green text-black font-bold rounded-full">Share Now</Link>
                    </div>
                )}
            </section>
        </div>
    );
}
