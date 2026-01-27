'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, MessageCircle, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function MessagesInboxPage() {
    const router = useRouter();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // New Chat State
    const [showNewChat, setShowNewChat] = useState(false);
    const [followingList, setFollowingList] = useState<any[]>([]);

    useEffect(() => {
        const fetchConversations = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }
            setCurrentUser(user);

            // Fetch all messages where I am sender OR receiver
            const { data: sent } = await supabase
                .from('direct_messages')
                .select('created_at, text, receiver_id, receiver:users!receiver_id(nickname, avatar_url)')
                .eq('sender_id', user.id)
                .order('created_at', { ascending: false });

            const { data: received } = await supabase
                .from('direct_messages')
                .select('created_at, text, sender_id, sender:users!sender_id(nickname, avatar_url)')
                .eq('receiver_id', user.id)
                .order('created_at', { ascending: false });

            // Normalize and Merge
            const all = [];
            if (sent) all.push(...sent.map(m => ({
                partnerId: m.receiver_id,
                partnerName: (m.receiver as any)?.nickname || 'User',
                partnerAvatar: (m.receiver as any)?.avatar_url || '',
                lastMessage: m.text,
                time: new Date(m.created_at),
                isMe: true
            })));

            if (received) all.push(...received.map(m => ({
                partnerId: m.sender_id,
                partnerName: (m.sender as any)?.nickname || 'User',
                partnerAvatar: (m.sender as any)?.avatar_url || '',
                lastMessage: m.text,
                time: new Date(m.created_at),
                isMe: false
            })));

            // Group by Partner ID (Take latest)
            const grouped = new Map();
            all.forEach(msg => {
                const existing = grouped.get(msg.partnerId);
                if (!existing || msg.time > existing.time) {
                    grouped.set(msg.partnerId, msg);
                }
            });

            const sorted = Array.from(grouped.values()).sort((a, b) => b.time.getTime() - a.time.getTime());
            setConversations(sorted);
            setLoading(false);

            // Fetch Following List for "New Chat"
            // We use a 2-step process to avoid complex join limitations or RLS issues on joining tables
            const { data: followRows } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', user.id);

            if (followRows && followRows.length > 0) {
                const followingIds = followRows.map((f: any) => f.following_id);

                const { data: followingUsers } = await supabase
                    .from('users')
                    .select('id, nickname, avatar_url')
                    .in('id', followingIds);

                if (followingUsers) {
                    setFollowingList(followingUsers.map((u: any) => ({
                        id: u.id,
                        name: u.nickname,
                        avatar: u.avatar_url
                    })));
                }
            }
        };

        fetchConversations();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex items-center gap-3 border-b border-gray-900">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="font-bold text-lg">Messages</h1>
            </header>

            {/* Search (Visual Only for MVP) */}
            <div className="p-4">
                <div className="bg-gray-900 rounded-xl flex items-center px-4 py-3 gap-2 border border-gray-800">
                    <Search size={18} className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        className="bg-transparent border-none focus:outline-none text-sm w-full"
                    />
                </div>
            </div>

            {/* List */}
            <div className="px-4 space-y-1">
                {!loading && conversations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center">
                            <MessageCircle size={32} className="opacity-20" />
                        </div>
                        <p>No messages yet.</p>
                    </div>
                )}

                {conversations.map(conv => (
                    <Link key={conv.partnerId} href={`/messages/${conv.partnerId}`}>
                        <div className="flex items-center gap-4 py-3 border-b border-gray-900 hover:bg-gray-900/40 -mx-2 px-2 rounded-xl transition-colors">
                            <div className="w-12 h-12 rounded-full bg-gray-800 shrink-0 overflow-hidden border border-gray-700">
                                {conv.partnerAvatar ? (
                                    <img src={conv.partnerAvatar} alt={conv.partnerName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">IMG</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h3 className="font-bold text-sm truncate">{conv.partnerName}</h3>
                                    <span className="text-[10px] text-gray-500">
                                        {conv.time.toLocaleDateString() === new Date().toLocaleDateString()
                                            ? conv.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : conv.time.toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 truncate">
                                    {conv.isMe && <span className="text-gray-600 mr-1">You:</span>}
                                    {conv.lastMessage}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}

                {/* New Chat FAB */}
                <button
                    onClick={() => setShowNewChat(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-neon-green rounded-full flex items-center justify-center text-black shadow-lg shadow-neon-green/20 hover:scale-105 transition-transform z-50"
                >
                    <Plus size={28} strokeWidth={2.5} />
                </button>

                {/* New Chat Modal (Followers) */}
                {showNewChat && (
                    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
                        <div className="w-full max-w-md bg-gray-900 h-[80vh] sm:h-auto sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl border border-gray-800 flex flex-col shadow-2xl">
                            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                                <h2 className="font-bold text-lg">New Message</h2>
                                <button onClick={() => setShowNewChat(false)} className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                                <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Following</p>
                                {followingList.length > 0 ? (
                                    <div className="space-y-1">
                                        {followingList.map((f: any) => (
                                            <button
                                                key={f.id}
                                                onClick={() => router.push(`/messages/${f.id}`)}
                                                className="w-full flex items-center gap-3 p-2 hover:bg-black/30 rounded-xl transition-colors text-left"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
                                                    {f.avatar ? (
                                                        <img src={f.avatar} alt={f.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px]">👤</div>
                                                    )}
                                                </div>
                                                <span className="font-bold text-sm">{f.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-gray-500">
                                        <p>You aren't following anyone yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
