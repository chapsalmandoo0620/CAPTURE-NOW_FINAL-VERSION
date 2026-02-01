'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Bell, Heart, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface NotificationItem {
    id: string;
    type: 'like' | 'comment' | 'reminder' | 'feedback';
    title: string;
    message: string;
    time: string;
    timestamp: number;
    link: string;
    read: boolean;
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

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart size={16} className="text-neon-green fill-neon-green" />;
            case 'comment': return <MessageSquare size={16} className="text-blue-400 fill-blue-400" />;
            case 'reminder': return <Clock size={16} className="text-yellow-400" />;
            case 'feedback': return <AlertCircle size={16} className="text-red-500" />;
            default: return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
        }
    };

    const checkMeetupReminders = (meetups: any[]) => {
        const reminders: NotificationItem[] = [];
        const now = new Date().getTime();

        meetups.forEach(meet => {
            const startStr = meet.start_time;
            if (!startStr) return;
            const start = new Date(startStr).getTime();
            const diffMs = start - now;
            const diffHours = diffMs / (1000 * 60 * 60);

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
                    timestamp: now,
                    time: 'Upcoming',
                    link: `/meet/${meet.id}`,
                    read: false
                });
            }
        });
        return reminders;
    };

    const checkFeedbackNeeded = async (userId: string, supabase: any) => {
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

            const isExpired = m.end_time && new Date(m.end_time) < now;
            if (isExpired) {
                const { data: fb } = await supabase
                    .from('meetup_feedback')
                    .select('id')
                    .match({ meetup_id: m.id, reviewer_id: userId })
                    .single();

                if (!fb) {
                    feedbackNotifs.push({
                        id: `feedback-${m.id}`,
                        type: 'feedback',
                        title: 'Meeting Ended',
                        message: `${m.title} has ended. Please leave feedback!`,
                        timestamp: new Date(m.end_time || now).getTime(),
                        time: getTimeAgo(m.end_time || now.toISOString()),
                        link: `/meet/${m.id}`,
                        read: false
                    });
                }
            }
        }
        return feedbackNotifs;
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
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
                        .neq('user_id', user.id)
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
                                link: `/profile`,
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

                // Read Status from LocalStorage
                const lastReadTime = localStorage.getItem('last_notif_read_time');
                const lastReadTs = lastReadTime ? parseInt(lastReadTime) : 0;

                const markedNotifs = allNotifs.map(n => ({
                    ...n,
                    read: n.timestamp <= lastReadTs
                }));

                // Mark all as read when opening page (Logic from drawer)
                const now = new Date().getTime();
                localStorage.setItem('last_notif_read_time', now.toString()); // Update read time immediately

                setNotifications(markedNotifs);
            }
            setLoading(false);
        };

        fetchNotifications();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex items-center gap-4 border-b border-gray-900">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                    <ChevronLeft size={28} />
                </button>
                <div className="flex items-center gap-2">
                    <Bell className="text-neon-green" size={20} />
                    <h1 className="font-bold text-lg">Notifications</h1>
                </div>
            </header>

            <main className="p-4 space-y-2 min-h-[60vh]">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <Link href={notif.link} key={notif.id}>
                            <div className="w-full text-left p-4 rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-neon-green transition-all flex items-start gap-4 mb-2">
                                <div className={`w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center shrink-0 bg-gray-900 ${!notif.read ? 'ring-1 ring-neon-green' : ''}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-200 mb-0.5 truncate">{notif.title}</p>
                                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{notif.message}</p>
                                    <span className="text-[10px] text-gray-600 mt-2 block">{notif.time}</span>
                                </div>
                                {!notif.read && (
                                    <span className="w-2 h-2 bg-neon-green rounded-full shrink-0 mt-2"></span>
                                )}
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                            <Bell className="text-gray-700" size={32} />
                        </div>
                        <p>No notifications yet.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
