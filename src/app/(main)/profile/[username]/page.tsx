'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Grid, MoreHorizontal, UserCheck, UserPlus, X, ThumbsUp, Star, Award, MessageCircle } from 'lucide-react';
import FeedCard from '@/components/feed-card';
import { createClient } from '@/lib/supabase/client';

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const router = useRouter();
    const { username } = use(params);
    const decodedUsername = decodeURIComponent(username);
    const [loading, setLoading] = useState(true);

    // State
    const [profileUser, setProfileUser] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Check Redirect
    useEffect(() => {
        const checkMe = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            if (user) {
                const { data: profile } = await supabase.from('users').select('nickname').eq('id', user.id).single();
                if (profile && profile.nickname === decodedUsername) {
                    router.replace('/profile');
                }
            }
        };
        checkMe();
    }, [decodedUsername, router]);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            // 1. Get User by Nickname
            const { data: user } = await supabase
                .from('users')
                .select('*')
                .eq('nickname', decodedUsername)
                .single();

            if (user) {
                // 2. Set Profile Data
                // 3. Fetch Meeting Score (Pure Average)
                let avgScore = '-';
                const { data: feedbackData } = await supabase
                    .from('meetup_feedback')
                    .select('rating, meetup:meetups!inner(host_id)')
                    .eq('meetup.host_id', user.id);

                if (feedbackData && feedbackData.length > 0) {
                    const total = feedbackData.reduce((acc: number, curr: any) => acc + (curr.rating || 0), 0);
                    const avg = total / feedbackData.length;
                    avgScore = avg.toFixed(1);
                }

                // 3. Follow Stats (Real Data)
                const { count: followersCount } = await supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('following_id', user.id);

                const { count: followingCount } = await supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('follower_id', user.id);

                setProfileUser({
                    id: user.id, // Store ID for follow action
                    username: user.nickname,
                    name: user.nickname,
                    avatar: user.avatar_url || '',
                    bio: user.bio || '',
                    stats: {
                        followers: followersCount || 0,
                        following: followingCount || 0
                    },
                    sports: (user.interests || []).map((s: string) => ({
                        name: s,
                        level: (user.skill_levels as any)?.[s] || 'Beginner'
                    })),
                    vibe: user.vibe || 'Friendly',
                    awards: {
                        starPlayer: user.star_player_count || 0,
                        mannerPlayer: user.manner_player_count || 0
                    },
                    meetingScore: avgScore
                });

                // 4. Fetch Posts
                const { data: posts } = await supabase
                    .from('highlights')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (posts) {
                    setUserPosts(posts.map(p => ({
                        id: p.id,
                        userId: user.id,
                        user: user.nickname,
                        userImg: user.avatar_url,
                        image: p.media_url,
                        caption: p.caption,
                        likes: 0,
                        comments: [],
                        type: (p.media_url.match(/\.(mp4|webm|mov)$/i) || p.category === 'video') ? 'video' : 'image',
                        location: p.location_name,
                        sport: p.category,
                        time: new Date(p.created_at).toLocaleDateString()
                    })));
                }
                setLoading(false);

                // 5. Check Follow Status (Real Data)
                const { data: currentUser } = await supabase.auth.getUser();
                if (currentUser.user) {
                    const { data: followRel } = await supabase
                        .from('follows')
                        .select('*')
                        .match({ follower_id: currentUser.user.id, following_id: user.id })
                        .single();
                    setIsFollowing(!!followRel);
                }

            } else {
                setLoading(false); // User not found
            }
        };
        fetchData();
    }, [decodedUsername]);

    const handleFollowToggle = async () => {
        if (!currentUser) {
            alert("Please login to follow.");
            return;
        }
        if (!profileUser?.id) {
            alert("User data missing.");
            return;
        }

        const supabase = createClient();

        if (isFollowing) {
            // Unfollow
            const { error } = await supabase
                .from('follows')
                .delete()
                .match({ follower_id: currentUser.id, following_id: profileUser.id });

            if (error) {
                console.error("Unfollow Error:", error);
                alert(`Error: ${error.message}`);
                return;
            }

            setIsFollowing(false);
            setProfileUser((prev: any) => ({
                ...prev,
                stats: { ...prev.stats, followers: Math.max(0, prev.stats.followers - 1) }
            }));
        } else {
            // Follow
            const { error } = await supabase
                .from('follows')
                .insert({ follower_id: currentUser.id, following_id: profileUser.id });

            if (error) {
                console.error("Follow Error:", error);
                alert(`Error: ${error.message}`);
                return;
            }

            setIsFollowing(true);
            setProfileUser((prev: any) => ({
                ...prev,
                stats: { ...prev.stats, followers: prev.stats.followers + 1 }
            }));
        }
    };

    const handlePostDelete = (postId: string) => {
        setUserPosts(prev => prev.filter(p => p.id !== postId));
        if (selectedPost?.id === postId) setSelectedPost(null);
    };

    if (loading) return <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">Loading...</div>;
    if (!profileUser) return <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center gap-4"><UserCheck size={48} className="text-gray-700" /><p>User not found</p><button onClick={() => router.back()} className="text-neon-green">Go Back</button></div>;

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative">
            {/* Header */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex items-center justify-between border-b border-gray-900">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="font-bold text-lg truncate max-w-[200px]">{profileUser.username}</h1>
                <button className="text-gray-400 hover:text-white">
                    <MoreHorizontal size={24} />
                </button>
            </header>

            <main>
                <div className="p-5 pb-2 space-y-5">
                    {/* Avatar & Stats */}
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gray-800 p-0.5 border border-gray-700 shrink-0 overflow-hidden">
                            {profileUser.avatar ? (
                                <img src={profileUser.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <img src="/default-profile.png" alt="Default" className="w-full h-full rounded-full object-cover" />
                            )}
                        </div>

                        <div className="flex-1 flex justify-around text-center">
                            <div className="flex flex-col">
                                <span className="font-bold text-xl">{userPosts.length}</span>
                                <span className="text-xs text-gray-500">Posts</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl">{profileUser.stats.followers}</span>
                                <span className="text-xs text-gray-500">Followers</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl">{profileUser.stats.following}</span>
                                <span className="text-xs text-gray-500">Following</span>
                            </div>
                        </div>
                    </div>

                    {/* Bio & Extended Details */}
                    <div className="space-y-3">
                        <div>
                            <h2 className="font-bold text-lg">{profileUser.name}</h2>
                            <p className="text-sm text-gray-300 whitespace-pre-line mt-1">{profileUser.bio}</p>
                        </div>

                        {/* Badges */}
                        <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
                            <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2 shrink-0">
                                <ThumbsUp size={14} className="text-blue-500 fill-blue-500" />
                                <div className="text-xs">
                                    <span className="text-gray-400">Meeting Score</span>
                                    <span className="font-bold ml-1 text-white">{profileUser.meetingScore}</span>
                                </div>
                            </div>

                            <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                <div className="text-xs">
                                    <span className="text-gray-400">Star Player</span>
                                    <span className="font-bold ml-1 text-white">x{profileUser.awards.starPlayer}</span>
                                </div>
                            </div>
                            <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
                                <Award size={14} className="text-neon-green" />
                                <div className="text-xs">
                                    <span className="text-gray-400">Manner Player</span>
                                    <span className="font-bold ml-1 text-white">x{profileUser.awards.mannerPlayer}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sports & Vibe */}
                        <div className="flex flex-wrap gap-2 pt-1">
                            {profileUser.sports.map((sport: any, idx: number) => (
                                <span key={idx} className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-200 border border-gray-700 font-medium">
                                    {sport.name} <span className="text-neon-green ml-1">{sport.level}</span>
                                </span>
                            ))}
                            <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 border border-gray-700 italic">
                                {profileUser.vibe}
                            </span>
                        </div>
                    </div>

                    {/* Follow Action */}
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleFollowToggle}
                            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isFollowing
                                ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50'
                                : 'bg-neon-green text-black hover:bg-[#32D612] shadow-[0_0_15px_rgba(57,255,20,0.3)]'
                                }`}
                        >
                            {isFollowing ? (
                                <>
                                    <UserCheck size={20} /> Following
                                </>
                            ) : (
                                <>
                                    <UserPlus size={20} /> Follow
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => router.push(`/messages/${profileUser.id}`)}
                            className="bg-gray-900 border border-gray-800 rounded-xl px-4 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                            <MessageCircle size={24} />
                        </button>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="mt-4 border-t border-gray-800">
                    <div className="flex justify-center border-b-2 border-white text-white py-3">
                        <Grid size={24} />
                    </div>

                    <div className="grid grid-cols-3 gap-0.5">
                        {userPosts.map((post, i) => (
                            <button
                                key={i}
                                className="aspect-square bg-gray-900 relative group overflow-hidden focus:outline-none"
                                onClick={() => setSelectedPost(post)}
                            >
                                <img src={post.image || 'https://via.placeholder.com/300'} alt="Moment" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            {/* Post Detail Modal (Read Only) */}
            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-black rounded-3xl overflow-hidden relative shadow-2xl border border-gray-800">
                        <button
                            onClick={() => setSelectedPost(null)}
                            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                        >
                            <X size={20} />
                        </button>
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
