'use client';

import { useState, useEffect } from 'react';
import { Settings, Share2, Grid, Calendar, MapPin, ChevronRight, Zap, Award, Star, X, ThumbsUp } from 'lucide-react';
import FeedCard from '@/components/feed-card';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'moments' | 'joined'>('moments');
    const [joinedMeets, setJoinedMeets] = useState<any[]>([]);
    const [profilePosts, setProfilePosts] = useState<any[]>([]);
    const [selectedPost, setSelectedPost] = useState<any>(null);

    const [meetingScore, setMeetingScore] = useState('-'); // Default to '-' for no history
    const [followingCount, setFollowingCount] = useState(0);
    const [followersCount, setFollowersCount] = useState(0);

    // Default User Data (Empty/Loading state)
    const [user, setUser] = useState<any>({
        name: '',
        handle: '',
        avatar: '',
        bio: '',
        stats: { posts: 0, followers: 0, following: 0 },
        sports: [],
        vibe: '',
        awards: { starPlayer: 0, mannerPlayer: 0 }
    });

    const [currentUser, setCurrentUser] = useState<any>(null);

    // Hydrate Data from Supabase
    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                setCurrentUser(authUser);
                // 1. Profile
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (profile) {
                    setUser((prev: any) => ({
                        ...prev,
                        name: profile.nickname || 'User',
                        handle: `@${profile.nickname || 'user'}`,
                        avatar: profile.avatar_url || '',
                        bio: profile.bio || 'Ready to capture the moment.',
                        sports: (profile.interests || []).map((s: string) => ({
                            name: s,
                            level: (profile.skill_levels as any)?.[s] || 'Beginner'
                        })),
                        vibe: profile.vibe ? (profile.vibe.charAt(0).toUpperCase() + profile.vibe.slice(1)) : 'Fun',
                        awards: {
                            starPlayer: profile.star_player_count || 0,
                            mannerPlayer: profile.manner_player_count || 0
                        }
                    }));

                    // Calc Score heuristic
                    const star = profile.star_player_count || 0;
                    const manner = profile.manner_player_count || 0;

                    if (star > 0 || manner > 0) {
                        const score = Math.min(5.0, 3.5 + (star * 0.1) + (manner * 0.05));
                        setMeetingScore(score.toFixed(1));
                    } else {
                        setMeetingScore('-');
                    }
                }

                // 2. Posts (My Moments)
                const { data: posts } = await supabase
                    .from('highlights')
                    .select('*')
                    .eq('user_id', authUser.id)
                    .order('created_at', { ascending: false });

                if (posts) {
                    setProfilePosts(posts.map(p => ({
                        id: p.id,
                        userId: authUser.id,
                        image: p.media_url,
                        user: profile?.nickname || 'Me',
                        userImg: profile?.avatar_url || '',
                        caption: p.caption,
                        likes: 0,
                        comments: [],
                        type: (p.media_url.match(/\.(mp4|webm|mov)$/i) || p.category === 'video') ? 'video' : 'image',
                        location: p.location_name,
                        sport: p.category,
                        time: new Date(p.created_at).toLocaleDateString()
                    })));

                    setUser((prev: any) => ({
                        ...prev,
                        stats: { ...prev.stats, posts: posts.length }
                    }));
                }

                // 3. Joined Meetups
                const { data: participants } = await supabase
                    .from('meetup_participants')
                    .select('meetup:meetups(*)')
                    .eq('user_id', authUser.id);

                if (participants) {
                    const activeMeets = participants
                        .map((p: any) => p.meetup)
                        .filter((m: any) => m && m.status !== 'finished');

                    setJoinedMeets(activeMeets.map((m: any) => ({
                        id: m.id,
                        title: m.title,
                        date: m.start_time, // Use ISO string for reliable parsing
                        start_time: m.start_time,
                        loc: m.location_name || 'Unknown',
                        sport: m.category || 'Event'
                    })));
                }
            }
        };

        fetchData();
    }, []);

    const handlePostDelete = (postId: string) => {
        setProfilePosts(prev => prev.filter(p => p.id !== postId));
        if (selectedPost?.id === postId) setSelectedPost(null);
    };

    // Helper to format date string ISO -> { month: 'MAY', day: '20' }
    const formatDate = (dateStr: string) => {
        try {
            if (!dateStr) return { month: 'DATE', day: 'DD' };
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) throw new Error("Invalid Date");
            return {
                month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
                day: date.getDate().toString()
            };
        } catch (e) {
            return { month: 'DATE', day: 'DD' };
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative">
            {/* Header */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex justify-between items-center border-b border-gray-900">
                <h1 className="font-bold text-lg">{user.handle}</h1>
                <div className="flex gap-4">
                    <button className="text-gray-300 hover:text-white"><Share2 size={24} /></button>
                    <button className="text-gray-300 hover:text-white"><Settings size={24} /></button>
                </div>
            </header>

            <main>

                {/* Refined Profile Info */}
                <div className="p-5 pb-2 space-y-5">

                    {/* Top Row: Avatar & Stats */}
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gray-800 p-0.5 border-2 border-neon-green shrink-0 relative flex items-center justify-center overflow-hidden">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                                    <span className="text-4xl">👤</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 flex justify-around text-center">
                            <div className="flex flex-col">
                                <span className="font-bold text-xl">{user.stats.posts}</span>
                                <span className="text-xs text-gray-500">Posts</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl">{user.stats.followers}</span>
                                <span className="text-xs text-gray-500">Followers</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl">{followingCount}</span>
                                <span className="text-xs text-gray-500">Following</span>
                            </div>
                        </div>
                    </div>

                    {/* Bio & Details */}
                    <div className="space-y-3">
                        <div>
                            <h2 className="font-bold text-lg">{user.name}</h2>
                            <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed mt-1">
                                {user.bio}
                            </p>
                        </div>

                        {/* Badges: Star & Manner */}
                        <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
                            {/* Meeting Score */}
                            <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2 shrink-0">
                                <ThumbsUp size={14} className="text-blue-500 fill-blue-500" />
                                <div className="text-xs">
                                    <span className="text-gray-400">Meeting Score</span>
                                    <span className="font-bold ml-1 text-white">{meetingScore}</span>
                                </div>
                            </div>

                            <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                <div className="text-xs">
                                    <span className="text-gray-400">Star Player</span>
                                    <span className="font-bold ml-1 text-white">x{user.awards.starPlayer}</span>
                                </div>
                            </div>
                            <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
                                <Award size={14} className="text-neon-green" />
                                <div className="text-xs">
                                    <span className="text-gray-400">Manner Player</span>
                                    <span className="font-bold ml-1 text-white">x{user.awards.mannerPlayer}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sports & Vibe */}
                        <div className="flex flex-wrap gap-2 pt-1">
                            {user.sports.map((sport: any, idx: number) => (
                                <span key={idx} className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-200 border border-gray-700 font-medium">
                                    {sport.name} <span className="text-neon-green ml-1">{sport.level}</span>
                                </span>
                            ))}
                            <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 border border-gray-700 italic">
                                {user.vibe}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push('/profile/edit')}
                            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl py-2 text-sm font-bold hover:bg-gray-800 hover:border-gray-700 transition-colors"
                        >
                            Edit Profile
                        </button>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert("Profile Link Copied to Clipboard!");
                            }}
                            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl py-2 text-sm font-bold hover:bg-gray-800 hover:border-gray-700 transition-colors"
                        >
                            Share Profile
                        </button>
                    </div>
                </div>

                {/* Simplified Tabs */}
                <div className="mt-2 border-t border-gray-800 bg-black sticky top-[60px] z-30">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('moments')}
                            className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${activeTab === 'moments' ? 'border-neon-green text-neon-green' : 'border-transparent text-gray-500'}`}
                        >
                            <Grid size={24} />
                        </button>
                        <button
                            onClick={() => setActiveTab('joined')}
                            className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${activeTab === 'joined' ? 'border-neon-green text-neon-green' : 'border-transparent text-gray-500'}`}
                        >
                            <Calendar size={24} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[300px]">
                    {activeTab === 'moments' && (
                        <div className="grid grid-cols-3 gap-0.5">
                            {profilePosts.map((post, i) => (
                                <button
                                    key={i}
                                    className="aspect-square bg-gray-900 relative group overflow-hidden focus:outline-none"
                                    onClick={() => setSelectedPost(post)}
                                >
                                    <img src={post.image} alt="Moment" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'joined' && (
                        <div className="p-4 space-y-3">
                            {joinedMeets.length > 0 ? joinedMeets.map((meet) => {
                                const { month, day } = formatDate(meet.date);
                                return (
                                    <Link href={`/meet/${meet.id}`} key={meet.id}>
                                        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 flex items-center justify-between group hover:border-gray-700 transition-all mb-3">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-800 flex flex-col items-center justify-center border border-gray-700 shrink-0">
                                                    <span className="text-[10px] font-bold text-red-500 uppercase">{month}</span>
                                                    <span className="text-lg font-bold leading-none mt-0.5">{day}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm mb-0.5 group-hover:text-neon-green transition-colors">{meet.title}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <span className="flex items-center gap-0.5"><MapPin size={10} /> {meet.loc}</span>
                                                        <span className="w-0.5 h-0.5 rounded-full bg-gray-600"></span>
                                                        <span>{meet.sport}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight size={20} className="text-gray-600 group-hover:text-white" />
                                        </div>
                                    </Link>
                                );
                            }) : (
                                <div className="text-center py-10 text-gray-500">
                                    <p className="mb-2">You haven't joined any sessions yet.</p>
                                    <Link href="/meet" className="text-neon-green text-sm font-bold hover:underline">Find a Session</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Post Detail Modal */}
            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-black rounded-3xl overflow-hidden relative shadow-2xl border border-gray-800">
                        <button
                            onClick={() => setSelectedPost(null)}
                            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* Reusing FeedCard logic but slightly adapted styles if needed via prop */}
                        <FeedCard
                            post={selectedPost}
                            isModal={true}
                            onUserClick={() => setSelectedPost(null)}
                            currentUser={currentUser}
                            onDelete={handlePostDelete}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
