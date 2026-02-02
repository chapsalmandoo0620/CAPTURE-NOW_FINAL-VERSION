'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, MessageCircle, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';

export default function MessagesInboxPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

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

            // Fetch all messages where I am sender OR receiver (Raw Fetch)
            const { data: msgs, error: msgError } = await supabase
                .from('direct_messages')
                .select('*')
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (msgError) {
                console.error("Error fetching messages:", msgError);
            }

            const rawMsgs = msgs || [];

            // Group by Partner ID
            const grouped = new Map();
            rawMsgs.forEach(m => {
                const isMe = m.sender_id === user.id;
                const partnerId = isMe ? m.receiver_id : m.sender_id;

                // Since we ordered by created_at desc, the first one we find is the latest
                if (!grouped.has(partnerId)) {
                    grouped.set(partnerId, {
                        partnerId,
                        lastMessage: m.text,
                        time: new Date(m.created_at),
                        isMe
                    });
                }
            });

            const convs = Array.from(grouped.values());

            // Fetch User Details for Partners
            const partnerIds = convs.map(c => c.partnerId);

            if (partnerIds.length > 0) {
                const { data: partners } = await supabase
                    .from('users')
                    .select('id, nickname, avatar_url')
                    .in('id', partnerIds);

                const partnerMap = new Map();
                partners?.forEach(p => partnerMap.set(p.id, p));

                convs.forEach(c => {
                    const p = partnerMap.get(c.partnerId);
                    c.partnerName = p?.nickname || 'Unknown User';
                    c.partnerAvatar = p?.avatar_url || '';
                });
            }

            setConversations(convs);
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
                <h1 className="font-bold text-lg">{t('messages.title')}</h1>
            </header>

            {/* Search (Visual Only for MVP) -> Now Functional */}
            <div className="p-4">
                <div className="bg-gray-900 rounded-xl flex items-center px-4 py-3 gap-2 border border-gray-800">
                    <Search size={18} className="text-gray-500" />
                    <input
                        type="text"
                        placeholder={t('messages.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                        <p>{t('messages.noMessages')}</p>
                    </div>
                )}

                {conversations
                    .filter(c => c.partnerName.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(conv => (
                        <Link key={conv.partnerId} href={`/messages/${conv.partnerId}`}>
                            <div className="flex items-center gap-4 py-3 border-b border-gray-900 hover:bg-gray-900/40 -mx-2 px-2 rounded-xl transition-colors">
                                <div className="w-12 h-12 rounded-full bg-gray-800 shrink-0 overflow-hidden border border-gray-700">
                                    {conv.partnerAvatar ? (
                                        <img src={conv.partnerAvatar} alt={conv.partnerName} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src="/default-profile.png" alt="Default" className="w-full h-full object-cover" />
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
                                        {conv.isMe && <span className="text-gray-600 mr-1">{t('messages.you')}:</span>}
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
                                <h2 className="font-bold text-lg">{t('messages.newMessage')}</h2>
                                <button onClick={() => setShowNewChat(false)} className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                                <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">{t('messages.following')}</p>
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
                                                        <img src="/default-profile.png" alt="Default" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <span className="font-bold text-sm">{f.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-gray-500">
                                        <p>{t('messages.noFollowing')}</p>
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
