'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Send, MoreVertical, Phone, Video } from 'lucide-react';
import Image from 'next/image';

export default function ChatPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const targetUserId = params.id;

    // Unwrapped params handling for Next.js 15+ (if strictly enforced, but safe to treat as likely sync here or await if async)
    // We will assume standard behavior for now.

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [targetUser, setTargetUser] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const supabase = createClient();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setCurrentUser(user);

            // Fetch Target Profile
            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', targetUserId)
                .single();
            setTargetUser(profile);

            // Fetch Messages
            const { data: msgs } = await supabase
                .from('direct_messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            if (msgs) {
                setMessages(msgs);
            }

            // Realtime Subscription
            const channel = supabase
                .channel(`dm-${user.id}-${targetUserId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'direct_messages',
                        filter: `receiver_id=eq.${user.id}` // Listen for incoming
                    },
                    (payload) => {
                        if (payload.new.sender_id === targetUserId) {
                            setMessages(prev => [...prev, payload.new]);
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        init();
    }, [targetUserId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !currentUser) return;

        const text = inputText;
        setInputText('');

        // Optimistic update
        const tempMsg = {
            id: Date.now().toString(),
            sender_id: currentUser.id,
            receiver_id: targetUserId,
            text: text,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        const { error } = await supabase
            .from('direct_messages')
            .insert({
                sender_id: currentUser.id,
                receiver_id: targetUserId,
                text: text
            });

        if (error) {
            console.error(error);
            alert('Failed to send');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-black text-white">
            {/* Header */}
            <header className="shrink-0 flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-md border-b border-gray-900 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                        <ChevronLeft size={24} />
                    </button>
                    {targetUser ? (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
                                {targetUser.avatar_url ? (
                                    <img src={targetUser.avatar_url} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs">U</div>
                                )}
                            </div>
                            <span className="font-bold text-sm">{targetUser.nickname || 'User'}</span>
                        </div>
                    ) : (
                        <div className="w-24 h-4 bg-gray-800 rounded animate-pulse"></div>
                    )}
                </div>
                <div className="flex gap-4 text-neon-green">
                    <Phone size={20} className="opacity-50 cursor-not-allowed" />
                    <Video size={20} className="opacity-50 cursor-not-allowed" />
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${msg.sender_id === currentUser?.id
                                    ? 'bg-neon-green text-black rounded-tr-none'
                                    : 'bg-gray-800 text-white rounded-tl-none'
                                }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="shrink-0 p-4 bg-black border-t border-gray-900 flex gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-neon-green"
                />
                <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-11 h-11 rounded-full bg-neon-green flex items-center justify-center text-black disabled:opacity-50 hover:scale-105 transition-transform"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}
