import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MessageSquare, Send, MoreHorizontal, Edit, Trash2, X, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Post {
    id: string; // UUID
    user: string;
    userImg: string;
    image: string;
    type?: 'image' | 'video';
    likes: number;
    caption: string;
    location: string;
    time: string;
    height?: string;
    comments?: { user: string; text: string }[];
    sport?: string;
    level?: string;
}

export default function FeedCard({ post, isModal = false, onUserClick, currentUser, onDelete }: {
    post: Post;
    isModal?: boolean;
    onUserClick?: () => void;
    currentUser?: any;
    onDelete?: (id: string) => void;
}) {
    const supabase = createClient();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes || 0);
    const [showComments, setShowComments] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState<{ id: number, user: string, text: string }[]>([]);

    // Edit Mode
    const [isEditing, setIsEditing] = useState(false);
    const [editCaption, setEditCaption] = useState(post.caption);

    // 1. Fetch Interaction Data (Likes & Comments)
    useEffect(() => {
        const fetchInteractions = async () => {
            // Check if Liked
            if (currentUser) {
                const { data: likeData } = await supabase
                    .from('post_likes')
                    .select('*')
                    .match({ user_id: currentUser.id, post_id: post.id })
                    .single();
                if (likeData) setLiked(true);
            }

            // Get Real Like Count
            const { count } = await supabase
                .from('post_likes')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', post.id);
            if (count !== null) setLikeCount(count);

            // Get Comments
            const { data: commentsData } = await supabase
                .from('post_comments')
                .select('id, text, user:users(nickname)')
                .eq('post_id', post.id)
                .order('created_at', { ascending: true });

            if (commentsData) {
                setComments(commentsData.map(c => ({
                    id: c.id,
                    user: (c.user as any)?.nickname || 'Unknown',
                    text: c.text
                })));
            }
        };
        fetchInteractions();
    }, [post.id, currentUser]);

    const toggleLike = async () => {
        if (!currentUser) return alert('Please login to like.');

        const originalLiked = liked;
        const originalCount = likeCount;

        // Optimistic Update
        setLiked(!liked);
        setLikeCount(prev => !liked ? prev + 1 : prev - 1);

        if (!originalLiked) {
            // Add Like
            const { error } = await supabase.from('post_likes').insert({ user_id: currentUser.id, post_id: post.id });
            if (error) {
                setLiked(originalLiked);
                setLikeCount(originalCount);
            }
        } else {
            // Remove Like
            const { error } = await supabase.from('post_likes').delete().match({ user_id: currentUser.id, post_id: post.id });
            if (error) {
                setLiked(originalLiked);
                setLikeCount(originalCount);
            }
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !currentUser) return;

        const newTempComment = { id: Date.now(), user: currentUser.user_metadata?.nickname || 'Me', text: commentText };
        setComments([...comments, newTempComment]);
        setCommentText('');

        const { error } = await supabase.from('post_comments').insert({
            user_id: currentUser.id,
            post_id: post.id,
            text: newTempComment.text
        });

        if (error) {
            alert('Failed to post comment.');
            setComments(prev => prev.filter(c => c.id !== newTempComment.id));
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(`https://capturenow.app/post/${post.id}`);
        alert('Link copied to clipboard!');
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        const { error } = await supabase.from('highlights').delete().eq('id', post.id);
        if (error) {
            alert('Failed to delete post.');
        } else {
            onDelete?.(post.id);
            if (isModal) onUserClick?.(); // Close modal if delete
        }
    };

    const handleEdit = async () => {
        if (!editCaption.trim()) return;

        const { error } = await supabase.from('highlights').update({ caption: editCaption }).eq('id', post.id);
        if (error) {
            alert('Failed to update post.');
        } else {
            setIsEditing(false);
            post.caption = editCaption; // Update local prop ref visually (optional)
        }
    };

    const isOwner = currentUser && post.user === currentUser.user_metadata?.nickname;

    return (
        <article className={`relative bg-black ${isModal ? 'rounded-2xl overflow-hidden' : 'border-t border-gray-900 pt-4'}`}>
            {/* Post Header */}
            <div className="px-4 pb-3 pt-3 flex items-center justify-between">
                <Link
                    href={`/profile/${post.user}`}
                    className="flex items-center gap-3 group"
                    onClick={() => onUserClick?.()}
                >
                    <div className="w-9 h-9 rounded-full bg-gray-800 overflow-hidden border border-gray-700 group-hover:border-neon-green transition-colors">
                        <img src={post.userImg} alt={post.user} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm leading-none mb-1 group-hover:text-neon-green transition-colors">{post.user}</span>
                            {post.sport && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700 mb-1">
                                    {post.sport} <span className="text-neon-green">{post.level}</span>
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] text-gray-500">{post.location}</span>
                    </div>
                </Link>

                <div className="relative">
                    {isOwner && (
                        <button onClick={() => setShowOptions(!showOptions)} className="text-gray-500 hover:text-white p-1">
                            <MoreHorizontal size={20} />
                        </button>
                    )}

                    {showOptions && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)}></div>
                            <div className="absolute right-0 top-full mt-1 w-32 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-20 overflow-hidden">
                                <button
                                    onClick={() => { setIsEditing(true); setShowOptions(false); }}
                                    className="w-full px-4 py-3 text-left text-xs font-medium text-white hover:bg-gray-800 flex items-center gap-2"
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full px-4 py-3 text-left text-xs font-medium text-red-500 hover:bg-gray-800 flex items-center gap-2"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Post Content */}
            <div className={`w-full ${post.height || 'aspect-square'} bg-gray-900 relative group overflow-hidden`}>
                {post.type === 'video' ? (
                    <video
                        src={post.image}
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                        onContextMenu={(e) => e.preventDefault()}
                    />
                ) : (
                    <img src={post.image} alt="Post" className="w-full h-full object-cover" />
                )}
                {!isModal && post.type !== 'video' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                )}
            </div>

            {/* Actions */}
            <div className="px-3 py-3 space-y-2">
                <div className="flex justify-between items-center">
                    <div className="flex gap-5">
                        <button onClick={toggleLike} className="hover:scale-110 transition-transform active:scale-95">
                            <Heart size={26} className={`transition-colors ${liked ? 'fill-neon-green text-neon-green' : 'text-white hover:text-neon-green'}`} />
                        </button>
                        <button onClick={() => setShowComments(!showComments)} className="hover:scale-110 transition-transform active:scale-95">
                            <MessageSquare size={26} className="text-white hover:text-blue-400 transition-colors" />
                        </button>
                        <button onClick={handleShare} className="hover:scale-110 transition-transform active:scale-95">
                            <Send size={26} className="text-white hover:text-gray-300 transition-colors" />
                        </button>
                    </div>
                </div>

                <div className="font-bold text-sm px-1">{likeCount.toLocaleString()} likes</div>

                {isEditing ? (
                    <div className="flex gap-2 items-center px-1">
                        <input
                            type="text"
                            className="bg-gray-800 border border-gray-700 rounded text-sm w-full px-2 py-1 text-white focus:outline-none focus:border-neon-green"
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            autoFocus
                        />
                        <button onClick={handleEdit} className="text-neon-green"><Check size={18} /></button>
                        <button onClick={() => setIsEditing(false)} className="text-red-500"><X size={18} /></button>
                    </div>
                ) : (
                    <div className="px-1 text-sm leading-relaxed text-gray-200">
                        <span className="font-bold mr-2 text-white">{post.user}</span>
                        {editCaption}
                    </div>
                )}

                <div className="px-1 text-[10px] text-gray-500 uppercase tracking-wide">{post.time} AGO</div>

                {(showComments || isModal) && (
                    <div className={`mt-4 bg-gray-900/50 rounded-xl p-3 space-y-3 ${!isModal && 'animate-in fade-in slide-in-from-top-2'}`}>
                        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                            <span className="text-xs font-bold text-gray-400">Comments ({comments.length})</span>
                            {!isModal && <button onClick={() => setShowComments(false)}><X size={14} className="text-gray-500 hover:text-white" /></button>}
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                            {comments.map((c, i) => (
                                <div key={i} className="text-sm">
                                    <span className="font-bold text-xs mr-2">{c.user}</span>
                                    <span className="text-gray-300">{c.text}</span>
                                </div>
                            ))}
                            {comments.length === 0 && <p className="text-xs text-center text-gray-600 py-2">No comments yet.</p>}
                        </div>
                        <form onSubmit={handleAddComment} className="flex gap-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-black border border-gray-800 rounded-full px-3 py-2 text-xs focus:border-neon-green focus:outline-none"
                            />
                            <button type="submit" className="text-neon-green font-bold text-xs px-2">Post</button>
                        </form>
                    </div>
                )}
            </div>
        </article>
    );
}
