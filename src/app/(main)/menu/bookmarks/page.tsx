'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, X, Bookmark } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import FeedCard from '@/components/feed-card';

export default function BookmarksPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setCurrentUser(user);
                // Fetch Bookmarks
                // Join bookmarks -> highlights
                const { data: bookmarks } = await supabase
                    .from('bookmarks')
                    .select(`
                        created_at,
                        post:highlights(*)
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (bookmarks) {
                    // Enrich with User data for modal display
                    const enrichedPosts = await Promise.all(bookmarks.map(async (b: any) => {
                        const p = b.post;
                        if (!p) return null;

                        const { data: author } = await supabase
                            .from('users')
                            .select('nickname, avatar_url')
                            .eq('id', p.user_id)
                            .single();

                        return {
                            id: p.id,
                            userId: p.user_id,
                            user: author?.nickname || 'Unknown',
                            userImg: author?.avatar_url || '',
                            image: p.media_url,
                            type: (p.media_url.match(/\.(mp4|webm|mov)$/i) || p.category === 'video') ? 'video' : 'image',
                            likes: 0, // Ideally fetch real likes count
                            caption: p.caption,
                            location: p.location_name || 'Unknown',
                            sport: p.category || 'General',
                            level: 'Any',
                            time: new Date(p.created_at).toLocaleDateString()
                        };
                    }));

                    setPosts(enrichedPosts.filter(Boolean));
                }
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const handlePostDelete = (postId: string) => {
        // If deleted (unbookmarked/deleted), remove from list
        setPosts(prev => prev.filter(p => p.id !== postId));
        if (selectedPost?.id === postId) setSelectedPost(null);
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative">
            {/* Header */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex items-center gap-4 border-b border-gray-900">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                    <ChevronLeft size={28} />
                </button>
                <div className="flex items-center gap-2">
                    <Bookmark className="text-neon-green fill-neon-green" size={20} />
                    <h1 className="font-bold text-lg">Bookmarks</h1>
                </div>
            </header>

            <main className="min-h-[60vh]">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : posts.length > 0 ? (
                    <div className="grid grid-cols-3 gap-0.5">
                        {posts.map((post, i) => (
                            <button
                                key={i}
                                className="aspect-square bg-gray-900 relative group overflow-hidden focus:outline-none"
                                onClick={() => setSelectedPost(post)}
                            >
                                <img src={post.image} alt="Moment" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                {post.type === 'video' && (
                                    <div className="absolute top-1 right-1 bg-black/50 rounded-full p-1">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                            <Bookmark className="text-gray-700" size={32} />
                        </div>
                        <p>No bookmarks yet.<br />Save moments to see them here.</p>
                    </div>
                )}
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
