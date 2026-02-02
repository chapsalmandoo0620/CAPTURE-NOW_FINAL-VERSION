'use client';

import { useState, useEffect } from 'react';
import { Bell, MessageCircle, Heart, MessageSquare, Send, Aperture, MapPin, Clock, Zap, MoreHorizontal, Copy, Edit, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import FeedCard from '@/components/feed-card';
import NotificationDrawer, { NotificationItem } from '@/components/notification-drawer';
import { useLanguage } from '@/context/language-context';

// Helper for Emojis
function getEmoji(sport: string) {
    const s = sport.toLowerCase();
    if (s.includes('run')) return '🏃';
    if (s.includes('soccer')) return '⚽';
    if (s.includes('tennis')) return '🎾';
    if (s.includes('cycle') || s.includes('bik')) return '🚴';
    if (s.includes('hik') || s.includes('moun')) return '⛰️';
    if (s.includes('swim')) return '';
    if (s.includes('golf')) return '⛳';
    if (s.includes('basket')) return '🏀';
    return '⚡';
}

// Helper: Haversine Distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 'Unknown';
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
}

// Time Helper
function getTimeAgo(isoString: string) {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
}

export default function HomePage() {
    const { t } = useLanguage();
    const [posts, setPosts] = useState<any[]>([]);
    const [quickMeets, setQuickMeets] = useState<any[]>([]);
    const [liveMeet, setLiveMeet] = useState<any>(null);
    const [isLiveJoined, setIsLiveJoined] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Notification State
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const checkMeetupReminders = (meetups: any[]) => {
        const reminders: NotificationItem[] = [];
        const now = new Date().getTime();

        meetups.forEach(meet => {
            const startStr = meet.start_time; // assuming UTC generic
            if (!startStr) return;
            const start = new Date(startStr).getTime();
            const diffMs = start - now;
            const diffHours = diffMs / (1000 * 60 * 60);

            // Logic: 24h, 12h, 6h, 1h
            let reminderType = null;
            if (diffHours > 0 && diffHours <= 1.1) reminderType = "Starting in 1 hour!";
            else if (diffHours > 5 && diffHours <= 6.1) reminderType = "Starting in 6 hours!";
            else if (diffHours > 11 && diffHours <= 12.5) reminderType = "Starting in 12 hours";
            else if (diffHours > 23 && diffHours <= 24.5) reminderType = "Starting tomorrow (24h)";

            if (reminderType) {
                reminders.push({
                    id: `reminder-${meet.id}-${reminderType}`,
                    type: 'reminder',
                    title: reminderType,
                    message: `Get ready for ${meet.title}!`,
                    timestamp: now, // Show as "Now" relevant
                    time: 'Upcoming',
                    link: `/meet/${meet.id}`,
                    read: false // managed by timestamp check
                });
            }
        });
        return reminders;
    };

    const checkFeedbackNeeded = async (userId: string, supabase: any) => {
        // Find joined meetups that are Finished (or past end_time)
        // AND user has NOT given feedback
        const now = new Date();
        const { data: joined } = await supabase
            .from('meetup_participants')
            .select('meetup_id, meetups(*)')
            .eq('user_id', userId);

        if (!joined) return [];

        const feedbackNotifs: NotificationItem[] = [];

        for (const record of joined) {
            const m = record.meetups;
            if (!m) continue;

            // manually check expired if status isn't reliable
            const isExpired = m.end_time && new Date(m.end_time) < now;
            if (isExpired) {
                // Check if feedback exists
                const { data: fb } = await supabase
                    .from('meetup_feedback')
                    .select('id')
                    .match({ meetup_id: m.id, reviewer_id: userId })
                    .single();

                if (!fb) {
                    feedbackNotifs.push({
                        id: `feedback-${m.id}`,
                        type: 'feedback',
                        title: 'Meeting Ended', // could act locally here but notifications are complex
                        message: `${m.title} has ended. Please leave feedback!`,
                        timestamp: new Date(m.end_time || now).getTime(),
                        time: getTimeAgo(m.end_time || now.toISOString()),
                        link: `/meet/${m.id}`, // Detail page opens feedback modal
                        read: false
                    });
                }
            }
        }
        return feedbackNotifs;
    }

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
                    userId: post.user_id,
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
                }));
                setPosts(formattedPosts);
            }

            // 1.5 Get User Location for Distance Calc
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUser(user);

                // --- NOTIFICATION AGGREGATION ---
                const fetchNotifications = async () => {
                    const allNotifs: NotificationItem[] = [];

                    // A. Social (Likes & Comments on MY posts)
                    const { data: myPosts } = await supabase
                        .from('highlights')
                        .select('id, caption')
                        .eq('user_id', user.id);

                    if (myPosts && myPosts.length > 0) {
                        const myPostIds = myPosts.map(p => p.id);

                        // Likes
                        const { data: likes } = await supabase
                            .from('post_likes')
                            .select('created_at, user:users(nickname), post_id')
                            .in('post_id', myPostIds)
                            .neq('user_id', user.id) // Not my own like
                            .order('created_at', { ascending: false })
                            .limit(20);

                        if (likes) {
                            likes.forEach(like => {
                                allNotifs.push({
                                    id: `like-${like.post_id}-${like.created_at}`,
                                    type: 'like',
                                    title: 'New Like',
                                    message: `${(like.user as any)?.nickname || 'Someone'} liked your post.`,
                                    timestamp: new Date(like.created_at).getTime(),
                                    time: getTimeAgo(like.created_at),
                                    link: `/profile`, // ideally jump to post, strictly profile for MVP
                                    read: false
                                });
                            });
                        }

                        // Comments
                        const { data: comments } = await supabase
                            .from('post_comments')
                            .select('created_at, text, user:users(nickname), post_id')
                            .in('post_id', myPostIds)
                            .neq('user_id', user.id)
                            .order('created_at', { ascending: false })
                            .limit(20);

                        if (comments) {
                            comments.forEach(c => {
                                allNotifs.push({
                                    id: `comment-${c.post_id}-${c.created_at}`,
                                    type: 'comment',
                                    title: 'New Comment',
                                    message: `${(c.user as any)?.nickname || 'Someone'} commented: "${c.text}"`,
                                    timestamp: new Date(c.created_at).getTime(),
                                    time: getTimeAgo(c.created_at),
                                    link: `/profile`,
                                    read: false
                                });
                            });
                        }
                    }

                    // B. Meetup Reminders & Feedback
                    // Get Joined Active Meetups
                    const { data: joined } = await supabase
                        .from('meetup_participants')
                        .select('meetups(*)')
                        .eq('user_id', user.id);

                    if (joined) {
                        const myMeets = joined.map((j: any) => j.meetups).filter(Boolean);
                        const reminders = checkMeetupReminders(myMeets);
                        allNotifs.push(...reminders);
                    }

                    const feedbacks = await checkFeedbackNeeded(user.id, supabase);
                    allNotifs.push(...feedbacks);

                    // Sort
                    allNotifs.sort((a, b) => b.timestamp - a.timestamp);

                    // Read Status Logic
                    // We use LocalStorage to store the "last read timestamp". 
                    // Anything newer than that is unread.
                    const lastReadTime = localStorage.getItem('last_notif_read_time');
                    const lastReadTs = lastReadTime ? parseInt(lastReadTime) : 0;

                    const markedNotifs = allNotifs.map(n => ({
                        ...n,
                        read: n.timestamp <= lastReadTs
                    }));

                    const unread = markedNotifs.filter(n => !n.read).length;

                    setNotifications(markedNotifs);
                    setUnreadCount(unread);
                }

                fetchNotifications();
            }

            let userLat = 0;
            let userLng = 0;
            if (user) {
                const { data: profile } = await supabase.from('users').select('latitude, longitude').eq('id', user.id).single();
                if (profile) {
                    userLat = profile.latitude;
                    userLng = profile.longitude;
                }
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
                setQuickMeets(meetsData.slice(1).map(m => {
                    const dist = calculateDistance(userLat, userLng, m.latitude, m.longitude);
                    return {
                        id: m.id,
                        sport: m.category,
                        emoji: getEmoji(m.category || ''),
                        time: new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        loc: m.location_name?.split(' ')[0] || 'Loc',
                        dist: dist
                    };
                }));

                // Check Join Status for Live Meet
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
            alert(t('upload.loginReq'));
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

    const handlePostDelete = (postId: string) => {
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    // Notification Logic
    const toggleNotifications = () => {
        if (!showNotifications) {
            // Opening: Mark all as read
            const now = new Date().getTime();
            localStorage.setItem('last_notif_read_time', now.toString());
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
        setShowNotifications(!showNotifications);
    };

    return (
        <div className="bg-black text-white min-h-screen pb-24 relative overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex justify-between items-center border-b border-gray-900">
                <div className="flex items-center gap-0.5">
                    <Aperture className="text-neon-green w-8 h-8" strokeWidth={2.5} />
                    <Zap className="text-neon-green w-6 h-6 fill-neon-green/20" strokeWidth={2.5} />
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={toggleNotifications}
                        className="relative group p-1"
                    >
                        <Bell size={24} className="text-gray-300 group-hover:text-neon-green transition-colors" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-neon-green rounded-full border-2 border-black animate-pulse"></span>
                        )}
                    </button>
                    <Link href="/messages">
                        <button className="group">
                            <MessageCircle size={24} className="text-gray-300 group-hover:text-neon-green transition-colors" />
                        </button>
                    </Link>
                </div>
            </header>

            <NotificationDrawer
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                notifications={notifications}
            />

            {/* Banner */}
            {liveMeet && (
                <section className="p-4 pt-6">
                    <Link href={`/meet/${liveMeet.id}`}>
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-4 flex items-center justify-between border border-gray-800 shadow-lg relative overflow-hidden group cursor-pointer hover:border-gray-700 transition-all">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-neon-green/20"></div>

                            <div className="z-10">
                                <h2 className="text-neon-green font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
                                    {t('home.upNext')}
                                </h2>
                                <p className="font-bold text-lg truncate max-w-[180px]">{liveMeet.title}</p>
                                <p className="text-gray-400 text-xs mt-1">{liveMeet.max_participants || 10} {t('home.spotsAvailable')}</p>
                            </div>
                            <button
                                onClick={handleJoinLive}
                                className={`z-10 text-xs font-bold px-4 py-2 rounded-full transition-colors ${isLiveJoined
                                    ? 'bg-white text-black hover:bg-gray-200'
                                    : 'bg-neon-green text-black hover:bg-white'
                                    }`}
                            >
                                {isLiveJoined ? t('home.joined') : t('home.join')}
                            </button>
                        </div>
                    </Link>
                </section>
            )}

            {/* Quick Join */}
            <section className="mb-4">
                <div className="px-4 mb-2 flex justify-between items-end">
                    <h3 className="font-bold text-lg">{t('home.upcomingNearby')}</h3>
                    <Link href="/meet" className="text-xs text-gray-400 hover:text-white">{t('home.seeAll')}</Link>
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
                        {t('home.noMeets')} <br /> <Link href="/meet/create" className="text-neon-green underline">{t('home.createOne')}</Link>
                    </div>
                )}
            </section>

            {/* Feed */}
            <section className="pb-24 space-y-6">
                {posts.length > 0 ? (
                    posts.map(post => <FeedCard key={post.id} post={post} currentUser={currentUser} onDelete={handlePostDelete} />)
                ) : (
                    <div className="px-4 py-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4">
                            <Aperture className="text-gray-600" />
                        </div>
                        <h3 className="text-gray-400 font-bold">{t('home.noPosts')}</h3>
                        <p className="text-gray-600 text-sm mt-1">{t('home.beFirst')}</p>
                        <Link href="/upload" className="mt-4 px-6 py-2 bg-neon-green text-black font-bold rounded-full">{t('home.shareNow')}</Link>
                    </div>
                )}
            </section>
        </div>
    );
}
