'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MapPin, Calendar, Users, MessageCircle, Share2, MoreHorizontal, User, Send, Clock, Home } from 'lucide-react';
import MeetupFeedbackModal from '@/components/meetup-feedback-modal';
import { createClient } from '@/lib/supabase/client';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const MAP_CONTAINER_STYLE = {
    width: '100%',
    height: '100%',
    borderRadius: '1rem',
};

const MAP_OPTIONS = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
        },
        {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
        },
        {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
        },
        {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
        },
        {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
        },
        {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
        },
        {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
        },
        {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
        },
        {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
        },
    ]
};

const libraries: ("places")[] = ["places"];

export default function MeetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [isJoined, setIsJoined] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [meetData, setMeetData] = useState<any>(null);
    const [chatMessages, setChatMessages] = useState<any[]>([]);

    const [myProfile, setMyProfile] = useState<any>(null);

    // Map State
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries
    });

    // Map Handlers (Optional, mostly for cleanup)
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const onLoad = (map: google.maps.Map) => setMap(map);
    const onUnmount = () => setMap(null);

    // Fetch Meetup Data from Supabase
    useEffect(() => {
        const fetchMeetup = async () => {
            setLoading(true);
            const supabase = createClient();

            // 1. Get My Profile (for Host check & Join status)
            const { data: { user } } = await supabase.auth.getUser();
            let currentUserId = user?.id;

            if (user) {
                const { data: profile } = await supabase.from('users').select('id, nickname').eq('id', user.id).single();
                setMyProfile(profile);
            }

            // 2. Fetch Meetup + Host + Participants
            const { data, error } = await supabase
                .from('meetups')
                .select(`
                    *,
                    host:users!host_id(nickname, avatar_url),
                    participants:meetup_participants(
                        user:users(id, nickname, avatar_url)
                    )
                `)
                .eq('id', id)
                .single();

            if (error || !data) {
                console.error("Meetup load error:", error);
                setMeetData(null);
                setLoading(false);
                return;
            }

            // 3. Format Participants
            // Supabase returns participants as array of objects: { user: { ... } }
            // We flat map it to match UI
            const formattedParticipants = data.participants.map((p: any) => ({
                id: p.user.id,
                name: p.user.nickname,
                img: p.user.avatar_url,
                host: p.user.id === data.host_id
            }));

            setMeetData({
                id: data.id,
                title: data.title,
                host: data.host?.nickname || 'Unknown',
                hostId: data.host_id,
                sport: data.category,
                date: new Date(data.start_time).toISOString().split('T')[0],
                startTime: new Date(data.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                endTime: data.end_time ? new Date(data.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                loc: data.location_name,
                latitude: data.latitude,
                longitude: data.longitude,
                dist: '0.5km', // Mock for now
                level: data.level,
                vibe: data.vibe_tag,
                max: data.max_participants,
                participants: formattedParticipants,
                description: "Join us for an exciting session! Detailed plan will be discussed in the chat.", // Static fallback
                status: data.status,
                rawEndTime: data.end_time
            });

            // 4. Check Joined Status
            if (currentUserId) {
                const isPart = formattedParticipants.some((p: any) => p.id === currentUserId);
                setIsJoined(isPart);
            }

            setLoading(false);
        };

        fetchMeetup();
    }, [id]);


    const handleJoinToggle = async () => {
        if (!meetData || !myProfile) {
            alert("Please login to join.");
            return;
        }

        const supabase = createClient();

        // Prevent Host Leaving
        if (meetData.hostId === myProfile.id) {
            alert("Hosts cannot leave their own session.");
            return;
        }

        if (isJoined) {
            // LEAVE
            const { error } = await supabase
                .from('meetup_participants')
                .delete()
                .match({ meetup_id: id, user_id: myProfile.id });

            if (!error) {
                setIsJoined(false);
                setMeetData((prev: any) => ({
                    ...prev,
                    participants: prev.participants.filter((p: any) => p.id !== myProfile.id)
                }));
            } else {
                alert("Failed to leave session.");
            }
        } else {
            // JOIN
            const { error } = await supabase
                .from('meetup_participants')
                .insert({ meetup_id: id, user_id: myProfile.id });

            if (!error) {
                setIsJoined(true);
                // Optimistic Update
                setMeetData((prev: any) => ({
                    ...prev,
                    participants: [...prev.participants, {
                        id: myProfile.id,
                        name: myProfile.nickname,
                        img: '', // Avatar might be missing in minimal profile, acceptable for prototype
                        host: false
                    }]
                }));
            } else {
                alert("Failed to join session.");
            }
        }
    };

    // Realtime Chat Subscription & Fetch
    useEffect(() => {
        if (!id) return;
        const supabase = createClient();

        // A. Initial Fetch
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('meetup_messages')
                .select(`
                    id,
                    content,
                    created_at,
                    sender:users!sender_id(id, nickname, avatar_url)
                `)
                .eq('meetup_id', id)
                .order('created_at', { ascending: true });

            if (!error && data) {
                const formatted = data.map((m: any) => ({
                    id: m.id,
                    user: m.sender?.id === myProfile?.id ? 'Me' : m.sender?.nickname || 'Unknown',
                    userId: m.sender?.id, // Store ID for stable strict checks
                    text: m.content,
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    avatar: m.sender?.avatar_url
                }));
                setChatMessages(formatted);
            }
        };

        fetchMessages();

        // B. Realtime Subscription
        const channel = supabase
            .channel(`meetup_chat_${id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'meetup_messages',
                    filter: `meetup_id=eq.${id}`
                },
                async (payload) => {
                    const newMsg = payload.new as any;
                    // Fetch sender info for the new message
                    const { data: senderData } = await supabase
                        .from('users')
                        .select('id, nickname, avatar_url')
                        .eq('id', newMsg.sender_id)
                        .single();

                    const formattedMsg = {
                        id: newMsg.id,
                        user: senderData?.id === myProfile?.id ? 'Me' : senderData?.nickname || 'Unknown',
                        userId: senderData?.id,
                        text: newMsg.content,
                        time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        avatar: senderData?.avatar_url
                    };

                    setChatMessages((prev) => [...prev, formattedMsg]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id, myProfile?.id]); // Re-run if myProfile loads late

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !myProfile) return;

        const supabase = createClient();

        // Optimistic UI Update (Optional, but let's wait for Realtime to be safe/simple first, or strict optimistic)
        // We'll rely on Realtime for consistency unless latency is high.
        // Actually, for better UX, let's just clear input.

        const msgText = message;
        setMessage('');

        const { error } = await supabase
            .from('meetup_messages')
            .insert({
                meetup_id: id,
                sender_id: myProfile.id,
                content: msgText
            });

        if (error) {
            console.error('Send message failed:', error);
            alert('Failed to send message.');
            setMessage(msgText); // Revert on fail
        }
    };

    const handleFeedbackSubmit = async (rating: number, starName: string | null, mannerName: string | null) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // 1. Resolve Names to IDs
        let starId = null;
        let mannerId = null;

        if (starName) {
            const target = meetData.participants.find((p: any) => p.name === starName);
            if (target) starId = target.id;
        }
        if (mannerName) {
            const target = meetData.participants.find((p: any) => p.name === mannerName);
            if (target) mannerId = target.id;
        }

        // 2. Insert Feedback
        const { error: feedError } = await supabase
            .from('meetup_feedback')
            .insert({
                meetup_id: id,
                reviewer_id: user.id,
                rating: rating,
                star_player_id: starId,
                manner_player_id: mannerId
            });

        if (feedError) {
            console.error("Feedback error details:", feedError);
            alert(`Failed to submit feedback: ${feedError.message || 'Unknown error'} (Hint: Check DB permissions)`);
            return;
        }

        // 3. Increment Badges (Manual Increment)
        if (starId) {
            const { data: sUser } = await supabase.from('users').select('star_player_count').eq('id', starId).single();
            if (sUser) {
                await supabase.from('users').update({ star_player_count: (sUser.star_player_count || 0) + 1 }).eq('id', starId);
            }
        }
        if (mannerId) {
            const { data: mUser } = await supabase.from('users').select('manner_player_count').eq('id', mannerId).single();
            if (mUser) {
                await supabase.from('users').update({ manner_player_count: (mUser.manner_player_count || 0) + 1 }).eq('id', mannerId);
            }
        }

        // 4. Close Meetup
        await supabase.from('meetups').update({ status: 'finished' }).eq('id', id);

        alert('Feedback submitted and session ended!');
        router.push('/meet');
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    if (!meetData) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
            <h2 className="text-xl font-bold">Session not found</h2>
            <button onClick={() => router.back()} className="px-4 py-2 bg-gray-800 rounded-xl hover:bg-gray-700">Go Back</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex items-center justify-between border-b border-gray-900">
                <button onClick={() => router.back()} className="p-1 text-gray-400 hover:text-white">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="font-bold text-lg truncate max-w-[200px]">{meetData.title}</h1>
                <button className="p-1 text-gray-400 hover:text-white">
                    <Share2 size={24} />
                </button>
            </header>

            <main className="p-5 space-y-6">

                {/* Title Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="text-neon-green font-bold text-xs uppercase tracking-wide bg-neon-green/10 px-2 py-1 rounded-md border border-neon-green/20">
                            {meetData.sport}
                        </span>
                        <div className="flex gap-2">
                            <span className="text-xs px-2 py-0.5 rounded border border-gray-700 text-gray-400 bg-gray-900">
                                {meetData.level || 'Any Level'}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded border border-gray-700 text-gray-400 bg-gray-900">
                                {meetData.vibe || 'Fun'}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-between items-start gap-4">
                        <h2 className="text-2xl font-bold leading-tight flex-1">{meetData.title}</h2>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center border border-gray-600">
                            {meetData.participants.find((p: any) => p.host)?.img ? (
                                <img src={meetData.participants.find((p: any) => p.host)?.img} className="w-full h-full object-cover" />
                            ) : (
                                <User size={16} className="text-gray-400" />
                            )}
                        </div>
                        <span className="text-sm text-gray-400">Hosted by <Link href={`/profile/${meetData.host}`} className="text-white font-bold hover:text-neon-green transition-colors underline-offset-2 hover:underline">{meetData.host}</Link></span>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="bg-gray-900 rounded-2xl p-5 space-y-4 border border-gray-800">
                    <div className="flex items-start gap-3">
                        <Calendar className="text-gray-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <div className="font-bold">{meetData.date}</div>
                            <div className="text-gray-400 text-sm flex items-center gap-1">
                                {meetData.startTime} ~ {meetData.endTime}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <MapPin className="text-gray-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <div className="font-bold">{meetData.loc}</div>
                            <div className="text-gray-400 text-sm">Distance: {meetData.dist}</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Users className="text-gray-500 shrink-0 mt-0.5" size={20} />
                        <div className="w-full">
                            <div className="font-bold mb-2">{meetData.participants.length} / {meetData.max} Joining</div>
                            <div className="flex -space-x-2 overflow-hidden py-1">
                                {meetData.participants && meetData.participants.slice(0, 8).map((user: any, idx: number) => (
                                    <div key={idx} className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center relative group shrink-0">
                                        {user.img ? (
                                            <img src={user.img} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span className="text-[10px] font-bold text-gray-500">{user.name.slice(0, 1).toUpperCase()}</span>
                                        )}
                                    </div>
                                ))}
                                {meetData.participants.length > 8 && (
                                    <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0">
                                        +{meetData.participants.length - 8}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <h3 className="font-bold text-lg">About Session</h3>
                    <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800/50">
                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                            {meetData.description}
                        </p>
                    </div>
                </div>

                {/* Map Placeholder */}
                <div className="space-y-2">
                    <h3 className="font-bold text-lg">Location</h3>
                    <div className="aspect-video w-full bg-gray-800 rounded-2xl flex flex-col items-center justify-center border border-gray-700 relative overflow-hidden group">
                        {meetData.latitude && meetData.longitude && isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={MAP_CONTAINER_STYLE}
                                center={{ lat: meetData.latitude, lng: meetData.longitude }}
                                zoom={15}
                                onLoad={onLoad}
                                onUnmount={onUnmount}
                                options={MAP_OPTIONS}
                            >
                                <Marker
                                    position={{ lat: meetData.latitude, lng: meetData.longitude }}
                                    icon={{
                                        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                                        fillColor: "#39FF14", // Neon Green
                                        fillOpacity: 1,
                                        strokeWeight: 1,
                                        strokeColor: "#000000",
                                        scale: 1.5,
                                        anchor: new google.maps.Point(12, 24)
                                    }}
                                />
                            </GoogleMap>
                        ) : (
                            <div className="flex flex-col items-center text-gray-500">
                                <MapPin size={32} className="mb-2 opacity-50" />
                                <span className="text-xs">
                                    {!isLoaded ? 'Loading Map...' : 'No map location provided'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Section */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <MessageCircle className="text-neon-green" size={20} />
                            Chat
                        </h3>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
                            {meetData.participants.length} Active
                        </span>
                    </div>

                    {isJoined ? (
                        <div className="space-y-3">
                            <div className="h-48 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                                {chatMessages.map(msg => (
                                    <div key={msg.id} className={`flex flex-col ${msg.user === 'Me' ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-end gap-2 max-w-[85%]">
                                            {msg.user !== 'Me' && (
                                                <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
                                                    <span className="text-[10px] font-bold">{msg.user.slice(0, 1)}</span>
                                                </div>
                                            )}
                                            <div className={`px-3 py-2 rounded-xl text-sm ${msg.user === 'Me'
                                                ? 'bg-neon-green text-black rounded-tr-none'
                                                : 'bg-gray-800 text-gray-200 rounded-tl-none'
                                                }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-600 mt-1 px-1">{msg.time}</span>
                                    </div>
                                ))}
                                {chatMessages.length === 0 && <p className="text-center text-gray-500 text-xs py-4">No messages yet. Say hi!</p>}
                            </div>

                            {/* Chat Input or Expired Message */}
                            {meetData.rawEndTime && new Date(meetData.rawEndTime) < new Date() ? (
                                <div className="py-3 mt-2 border-t border-gray-800 text-center">
                                    <span className="text-xs text-red-500 font-bold flex items-center justify-center gap-1">
                                        <Clock size={14} />
                                        Session Ended - Chat Disabled
                                    </span>
                                </div>
                            ) : (
                                <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-gray-800">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-black/50 border border-gray-700 rounded-full px-4 py-2 text-sm focus:border-neon-green focus:outline-none transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!message.trim()}
                                        className="p-2 rounded-full bg-gray-800 text-neon-green disabled:opacity-50 hover:bg-gray-700 transition-colors"
                                    >
                                        <Send size={20} />
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : meetData.rawEndTime && new Date(meetData.rawEndTime) < new Date() ? (
                        <div className="h-32 bg-black/20 rounded-xl border border-gray-800/50 flex flex-col items-center justify-center text-gray-500 gap-2">
                            <Clock size={32} className="opacity-20 text-red-500" />
                            <span className="text-xs text-red-400 font-bold">Session Ended - Chat Disabled</span>
                        </div>
                    ) : (
                        <div className="h-32 bg-black/20 rounded-xl border border-gray-800/50 flex flex-col items-center justify-center text-gray-500 gap-2">
                            <MessageCircle size={32} className="opacity-20" />
                            <span className="text-xs">Join session to chat with members</span>
                        </div>
                    )}
                </div>

                {/* Actions Area */}
                <div className="p-4 pb-24 border-t border-gray-900 mt-4 space-y-3">
                    {(meetData.hostId === myProfile?.id) ? (
                        <>
                            <button
                                onClick={() => setShowFeedbackModal(true)}
                                className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-500 font-bold text-sm hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                End Meetup & Request Feedback
                            </button>
                            <p className="text-[10px] text-gray-500 text-center">
                                Ending the meetup will notify all participants to provide feedback.
                            </p>
                        </>
                    ) : (
                        <button
                            onClick={handleJoinToggle}
                            disabled={meetData.rawEndTime && new Date(meetData.rawEndTime) < new Date()}
                            className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${meetData.rawEndTime && new Date(meetData.rawEndTime) < new Date()
                                ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                                : isJoined
                                    ? 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-red-900/50 hover:text-red-500 hover:border-red-500'
                                    : 'bg-neon-green text-black hover:bg-[#32D612] shadow-[0_0_20px_rgba(57,255,20,0.3)]'
                                }`}
                        >
                            {meetData.rawEndTime && new Date(meetData.rawEndTime) < new Date()
                                ? 'Session Ended'
                                : isJoined ? 'Leave Session' : 'Join Session'}
                        </button>
                    )}
                </div>

                {/* Feedback Modal */}
                < MeetupFeedbackModal
                    isOpen={showFeedbackModal}
                    onClose={() => setShowFeedbackModal(false)}
                    meetupTitle={meetData.title}
                    participants={meetData.participants}
                    onSubmit={handleFeedbackSubmit}
                />
            </main >
        </div >
    );
}
