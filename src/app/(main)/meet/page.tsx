'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Map as MapIcon, List, Filter, Calendar, MapPin, Plus, X, ChevronDown, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import MeetupFeedbackModal from '@/components/meetup-feedback-modal';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const MAP_CONTAINER_STYLE = {
    width: '100%',
    height: '60vh',
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

const CATEGORIES = ['All', 'Running', 'Cycle', 'Soccer', 'Basketball', 'Tennis', 'Golf', 'Climbing', 'Fitness', 'Yoga', 'Swimming', 'Hiking', 'Skating', 'Surfing', 'Badminton', 'Boxing', 'MMA', 'Crossfit'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Any'];
const VIBES = ['Competitive', 'Fun', 'Training'];
const DISTANCES = ['< 1km', '1-3km', '3-5km', '5-10km', '10km+'];

const libraries: ("places")[] = ["places"];

// Haversine Formula for Distance
// Haversine Formula for Distance
function calculateDistanceValue(lat1: number, lon1: number, lat2: number, lon2: number) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return -1;
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function formatDistance(d: number) {
    if (d < 0) return 'Unknown';
    return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
}

export default function MeetPage() {
    // UI State
    const [view, setView] = useState<'list' | 'map'>('list');
    const [activeCategory, setActiveCategory] = useState('All');
    const [showFilter, setShowFilter] = useState(false);

    // Map State
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries
    });
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    // Data State
    const [meets, setMeets] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [myProfile, setMyProfile] = useState<any>(null);
    const [myLocation, setMyLocation] = useState<{ lat: number, lng: number } | null>(null);

    // Center map on user when loaded
    useEffect(() => {
        if (map && myLocation && view === 'map') {
            map.panTo(myLocation);
        }
    }, [map, view, myLocation]);

    // Filter Logic State
    const [filterSport, setFilterSport] = useState('All');
    const [filterLevel, setFilterLevel] = useState('Any');
    const [filterDist, setFilterDist] = useState('');
    const [filterHost, setFilterHost] = useState('');

    // Initialize & Load Persistence
    const [joinedMeets, setJoinedMeets] = useState<string[]>([]);

    // Auto-Feedback State
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [pendingFeedbackMeet, setPendingFeedbackMeet] = useState<any>(null);

    // Check for Pending Feedback
    useEffect(() => {
        const checkPendingFeedback = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Get my finished meetups
            const { data: participations } = await supabase
                .from('meetup_participants')
                .select(`
                    meetup_id,
                    meetup:meetups (
                        id, title, status, host_id,
                        participants:meetup_participants(
                            user:users(id, nickname, avatar_url)
                        )
                    )
                `)
                .eq('user_id', user.id);

            if (!participations) return;

            // Filter for 'finished' meetups
            const finishedMeets = participations
                .map((p: any) => p.meetup)
                .filter((m: any) => m && m.status === 'finished');

            if (finishedMeets.length === 0) return;

            // 2. Get my submitted feedbacks
            const { data: myFeedbacks } = await supabase
                .from('meetup_feedback')
                .select('meetup_id')
                .eq('reviewer_id', user.id);

            const reviewedIds = new Set(myFeedbacks?.map(f => f.meetup_id) || []);

            // 3. Find first unreviewed
            const pending = finishedMeets.find((m: any) => !reviewedIds.has(m.id));

            if (pending) {
                // Format participants for modal
                const modalParticipants = pending.participants.map((p: any) => ({
                    id: p.user.id,
                    name: p.user.nickname,
                    avatar: p.user.avatar_url
                }));

                setPendingFeedbackMeet({
                    id: pending.id,
                    title: pending.title,
                    participants: modalParticipants
                });
                setShowFeedbackModal(true);
            }
        };

        checkPendingFeedback();
    }, []);

    const handleFeedbackSubmit = async (rating: number, starName: string | null, mannerName: string | null) => {
        if (!pendingFeedbackMeet) return;

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Resolve Names (Logic copied from meet/[id]/page.tsx)
        let starId = null;
        let mannerId = null;

        if (starName) {
            const target = pendingFeedbackMeet.participants.find((p: any) => p.name === starName);
            if (target) starId = target.id;
        }
        if (mannerName) {
            const target = pendingFeedbackMeet.participants.find((p: any) => p.name === mannerName);
            if (target) mannerId = target.id;
        }

        const { error } = await supabase.from('meetup_feedback').insert({
            meetup_id: pendingFeedbackMeet.id,
            reviewer_id: user.id,
            rating,
            star_player_id: starId,
            manner_player_id: mannerId
        });

        if (error) {
            alert(`Failed to submit feedback: ${error.message}`);
            return;
        }

        // Badge Updates
        if (starId) {
            const { data: sUser } = await supabase.from('users').select('star_player_count').eq('id', starId).single();
            if (sUser) await supabase.from('users').update({ star_player_count: (sUser.star_player_count || 0) + 1 }).eq('id', starId);
        }
        if (mannerId) {
            const { data: mUser } = await supabase.from('users').select('manner_player_count').eq('id', mannerId).single();
            if (mUser) await supabase.from('users').update({ manner_player_count: (mUser.manner_player_count || 0) + 1 }).eq('id', mannerId);
        }

        alert('Feedback submitted!');
        setShowFeedbackModal(false);
        setPendingFeedbackMeet(null);
    };

    const handleFeedbackSkip = async () => {
        if (!pendingFeedbackMeet) return;
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Insert skipped record (Rating 0) to prevent re-prompting
        const { error } = await supabase.from('meetup_feedback').insert({
            meetup_id: pendingFeedbackMeet.id,
            reviewer_id: user.id,
            rating: 0,
            star_player_id: null,
            manner_player_id: null
        });

        if (error) {
            console.error("Skip feedback error:", error);
        }

        setShowFeedbackModal(false);
        setPendingFeedbackMeet(null);
    };

    useEffect(() => {
        const loadMeets = async () => {
            const supabase = createClient();

            // 1. Get Current User & Profile Location
            const { data: { user } } = await supabase.auth.getUser();
            let userLat = 0;
            let userLng = 0;
            let myId = '';
            let currentJoined: string[] = [];

            if (user) {
                myId = user.id;
                const { data: profile } = await supabase
                    .from('users')
                    .select('nickname, latitude, longitude')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setMyProfile({ id: user.id, nickname: profile.nickname });
                    userLat = profile.latitude;
                    userLng = profile.longitude;
                    setMyLocation({ lat: userLat, lng: userLng });
                }

                // Fetch joined meetups
                const { data: joinedData } = await supabase
                    .from('meetup_participants')
                    .select('meetup_id')
                    .eq('user_id', user.id);

                if (joinedData) {
                    currentJoined = joinedData.map(j => j.meetup_id);
                    setJoinedMeets(currentJoined);
                }
            }

            // 2. Fetch Active Meetups
            const { data, error } = await supabase
                .from('meetups')
                .select(`
                    *,
                    host:users!host_id(nickname),
                    participants:meetup_participants(user_id)
                `)
                .neq('status', 'finished');

            if (data) {
                const formatted = data.map(m => {
                    const distValue = calculateDistanceValue(userLat, userLng, m.latitude, m.longitude);
                    return {
                        id: m.id,
                        title: m.title,
                        host: m.host?.nickname || 'Unknown',
                        hostId: m.host_id,
                        sport: m.category || 'Other',
                        date: new Date(m.start_time).toISOString().split('T')[0],
                        startTime: new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        endTime: m.end_time ? new Date(m.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                        loc: m.location_name,
                        latitude: m.latitude,
                        longitude: m.longitude,
                        dist: formatDistance(distValue),
                        distValue: distValue, // Numeric Distance for filtering
                        level: m.level,
                        vibe: m.vibe_tag,
                        max: m.max_participants,
                        participants: m.participants.length,
                        status: m.status,
                        start_time: m.start_time, // Keep for sorting
                        rawEndTime: m.end_time // Keep for expiration check
                    };
                });

                // Sorting Logic
                // Priority: Hosted & Expired -> Hosted by Me -> Joined by Me -> Start Time Ascending
                formatted.sort((a, b) => {
                    const now = new Date();
                    const aExpired = a.rawEndTime && new Date(a.rawEndTime) < now;
                    const bExpired = b.rawEndTime && new Date(b.rawEndTime) < now;

                    const aHosted = a.hostId === myId;
                    const bHosted = b.hostId === myId;

                    // 1. Hosted & Expired (Top Priority)
                    if (aHosted && aExpired && !(bHosted && bExpired)) return -1;
                    if (!(aHosted && aExpired) && (bHosted && bExpired)) return 1;

                    // 2. Hosted by Me
                    if (aHosted && !bHosted) return -1;
                    if (!aHosted && bHosted) return 1;

                    const aJoined = currentJoined.includes(a.id);
                    const bJoined = currentJoined.includes(b.id);
                    if (aJoined && !bJoined) return -1;
                    if (!aJoined && bJoined) return 1;

                    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
                });

                setMeets(formatted);
            }
        };
        loadMeets();
    }, []);

    // Filter & Search Logic
    const filteredMeets = meets.filter(meet => {

        const matchesSearch = searchQuery === '' ||
            meet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            meet.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
            meet.loc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            meet.sport.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = activeCategory === 'All' || meet.sport === activeCategory;
        const matchesFilterSport = filterSport === 'All' || meet.sport === filterSport;
        const matchesFilterLevel = filterLevel === 'Any' || meet.level === filterLevel;
        const matchesFilterHost = filterHost === '' || meet.host.toLowerCase().includes(filterHost.toLowerCase());

        let matchesFilterDist = true;
        if (filterDist === '< 1km') matchesFilterDist = meet.distValue >= 0 && meet.distValue < 1;
        else if (filterDist === '1-3km') matchesFilterDist = meet.distValue >= 1 && meet.distValue < 3;
        else if (filterDist === '3-5km') matchesFilterDist = meet.distValue >= 3 && meet.distValue < 5;
        else if (filterDist === '5-10km') matchesFilterDist = meet.distValue >= 5 && meet.distValue < 10;
        else if (filterDist === '10km+') matchesFilterDist = meet.distValue >= 10;

        return matchesSearch && matchesCategory && matchesFilterSport && matchesFilterLevel && matchesFilterHost && matchesFilterDist;
    });

    const resetFilters = () => {
        setFilterSport('All');
        setFilterLevel('Any');
        setFilterDist('');
        setFilterHost('');
        setShowFilter(false);
    };

    const handleJoinClick = async (e: React.MouseEvent, meet: any) => {
        e.preventDefault();
        e.stopPropagation();

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("Please login to join.");
            return;
        }

        const isJoined = joinedMeets.includes(meet.id);

        if (isJoined) {
            // Leave
            const { error } = await supabase
                .from('meetup_participants')
                .delete()
                .match({ meetup_id: meet.id, user_id: user.id });

            if (!error) {
                setJoinedMeets(prev => prev.filter(id => id !== meet.id));
                setMeets(prev => prev.map(m => m.id === meet.id ? { ...m, participants: m.participants - 1 } : m));
            } else {
                alert("Failed to leave session.");
            }
        } else {
            // Join
            const { error } = await supabase
                .from('meetup_participants')
                .insert({ meetup_id: meet.id, user_id: user.id });

            if (!error) {
                setJoinedMeets(prev => [...prev, meet.id]);
                setMeets(prev => prev.map(m => m.id === meet.id ? { ...m, participants: m.participants + 1 } : m));
            } else {
                alert("Failed to join session.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative">
            {/* Header ... */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 space-y-3 border-b border-gray-900">
                {/* ... (Keep existing Header code) ... */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find sports nearby..."
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-neon-green focus:outline-none transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => setView(view === 'list' ? 'map' : 'list')}
                        className={`p-3 rounded-xl border transition-colors ${view === 'map' ? 'bg-neon-green text-black border-neon-green' : 'bg-gray-900 border-gray-800 text-gray-400'}`}
                    >
                        {view === 'list' ? <MapIcon size={20} /> : <List size={20} />}
                    </button>
                    <button
                        onClick={() => setShowFilter(true)}
                        className={`p-3 rounded-xl border transition-colors ${showFilter ? 'bg-neon-green text-black border-neon-green' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'}`}
                    >
                        <Filter size={20} />
                    </button>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat
                                ? 'bg-neon-green text-black shadow-[0_0_10px_rgba(57,255,20,0.3)]'
                                : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            {/* Filter Modal ... (Keep existing Filter Modal) */}
            {showFilter && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-gray-900 w-full max-w-md rounded-3xl border border-gray-800 p-6 space-y-6 shadow-2xl relative">
                        {/* ... Filter content ... */}
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Filter size={20} className="text-neon-green" /> Filter Sessions</h3>
                            <button onClick={() => setShowFilter(false)} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Sport */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-bold uppercase">Sport</label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setFilterSport(s)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold border ${filterSport === s ? 'bg-neon-green text-black border-neon-green' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Level */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-bold uppercase">Level</label>
                                <div className="flex flex-wrap gap-2">
                                    {LEVELS.map(l => (
                                        <button
                                            key={l}
                                            onClick={() => setFilterLevel(l)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold border ${filterLevel === l ? 'bg-neon-green text-black border-neon-green' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Distance */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-bold uppercase">Distance</label>
                                <select
                                    value={filterDist}
                                    onChange={(e) => setFilterDist(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-neon-green focus:outline-none"
                                >
                                    <option value="">Any Distance</option>
                                    {DISTANCES.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            {/* Host */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-bold uppercase">Host Name</label>
                                <input
                                    type="text"
                                    value={filterHost}
                                    onChange={(e) => setFilterHost(e.target.value)}
                                    placeholder="e.g. runner_kim"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-neon-green focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={resetFilters} className="flex-1 py-3 bg-gray-800 rounded-xl font-bold text-gray-400 hover:text-white">Reset</button>
                            <button onClick={() => setShowFilter(false)} className="flex-[2] py-3 bg-neon-green text-black rounded-xl font-bold hover:bg-[#32D612]">Apply Filters</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <main className="p-4">
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-xl font-bold">Sessions <span className="text-neon-green text-sm ml-1">({filteredMeets.length})</span></h2>
                    <span className="text-xs text-gray-400">Sort by: Time</span>
                </div>

                {view === 'list' ? (
                    <div className="space-y-4">
                        {filteredMeets.length > 0 ? filteredMeets.map(meet => {
                            const isHost = meet.host === 'Me' || (myProfile && (meet.host === myProfile.nickname || meet.hostId === myProfile.id));
                            const isExpired = meet.rawEndTime && new Date(meet.rawEndTime) < new Date();

                            return (
                                <div
                                    key={meet.id}
                                    className={`bg-gray-900/50 border rounded-2xl p-5 hover:border-gray-700 transition-all group relative overflow-hidden ${isHost && isExpired
                                        ? 'border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.2)]'
                                        : isHost
                                            ? 'border-neon-green shadow-[0_0_10px_rgba(57,255,20,0.1)]'
                                            : 'border-gray-800'
                                        }`}
                                >
                                    {meet.status === 'Closing Soon' && (
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-bl-full -mr-10 -mt-10 blur-xl"></div>
                                    )}

                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-neon-green uppercase tracking-wide border border-gray-700">
                                                {meet.sport}
                                            </span>
                                            {meet.status === 'Closing Soon' && (
                                                <span className="text-[10px] font-bold text-red-500 animate-pulse">Closing Soon</span>
                                            )}
                                            {isHost && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neon-green text-black uppercase tracking-wide">
                                                    My Session
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="bg-gray-800 rounded-lg px-2 py-1 border border-gray-700 flex flex-col items-center">
                                                <span className="text-[10px] text-gray-400 uppercase">Join</span>
                                                <span className={`font-bold text-sm ${(Array.isArray(meet.participants) ? meet.participants.length : meet.participants) >= meet.max ? 'text-red-500' : 'text-neon-green'}`}>
                                                    {Array.isArray(meet.participants) ? meet.participants.length : meet.participants}/{meet.max}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold mb-1 leading-tight group-hover:text-neon-green transition-colors">{meet.title}</h3>

                                    <div className="flex gap-2 mb-3">
                                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-700 text-gray-300 bg-gray-800/50">
                                            Lv: {meet.level || 'Any'}
                                        </span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-700 text-gray-300 bg-gray-800/50">
                                            {meet.vibe || 'Fun'}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-500" />
                                            <span>{meet.date} <span className="text-gray-600">|</span> <span className="text-gray-300">{meet.startTime} ~ {meet.endTime}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-gray-500" />
                                            <span>{meet.loc} <span className="text-gray-600">({meet.dist})</span></span>
                                        </div>
                                    </div>


                                    <div className="mt-5 pt-3 border-t border-gray-800/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-gray-700 border border-gray-600"></div>
                                            <span className="text-xs text-gray-500">Hosted by <span className="text-gray-300 font-medium">{meet.host}</span></span>
                                        </div>
                                        <div className="flex gap-2">
                                            {/* Direct Join Button - Hide for Host */}
                                            {!isHost && (
                                                <button
                                                    onClick={(e) => handleJoinClick(e, meet)}
                                                    disabled={isExpired}
                                                    className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${isExpired
                                                        ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                                                        : joinedMeets.includes(meet.id.toString())
                                                            ? 'bg-gray-800 border-gray-600 text-white hover:bg-red-900/50 hover:border-red-500'
                                                            : 'bg-neon-green border-neon-green text-black hover:bg-[#32D612]'
                                                        }`}
                                                >
                                                    {isExpired ? 'Ended' : joinedMeets.includes(meet.id.toString()) ? 'Joined' : 'Join'}
                                                </button>
                                            )}

                                            <a href={`/meet/${meet.id}`} className="px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-xs text-neon-green font-bold hover:bg-gray-700 transition-all shadow-md">
                                                View Details
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-20 text-gray-500">
                                <p>No meetups found.</p>
                                <button onClick={resetFilters} className="text-neon-green text-sm font-bold mt-2 hover:underline">Reset Filters</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rounded-2xl overflow-hidden border border-gray-800 relative">
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={MAP_CONTAINER_STYLE}
                                center={myLocation || { lat: 37.5665, lng: 126.9780 }} // Default Seoul
                                zoom={13}
                                onLoad={onLoad}
                                onUnmount={onUnmount}
                                options={MAP_OPTIONS}
                            >
                                {/* User Location */}
                                {myLocation && (
                                    <Marker
                                        position={myLocation}
                                        icon={{
                                            path: google.maps.SymbolPath.CIRCLE,
                                            scale: 8,
                                            fillColor: "#4285F4",
                                            fillOpacity: 1,
                                            strokeColor: "white",
                                            strokeWeight: 2,
                                        }}
                                        title="You are here"
                                    />
                                )}

                                {/* Meetups */}
                                {filteredMeets.map(meet => (
                                    <Marker
                                        key={meet.id}
                                        position={{ lat: meet.latitude, lng: meet.longitude }}
                                        icon={{
                                            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                                            fillColor: "#39FF14", // Neon Green
                                            fillOpacity: 1,
                                            strokeWeight: 1,
                                            strokeColor: "#000000",
                                            scale: 1.5,
                                            anchor: new google.maps.Point(12, 24)
                                        }}
                                        onClick={() => window.location.href = `/meet/${meet.id}`}
                                        title={meet.title}
                                    />
                                ))}
                            </GoogleMap>
                        ) : (
                            <div className="h-[60vh] bg-gray-900 flex items-center justify-center">
                                Loading Map...
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* FAB: Create Meetup */}
            <a href="/meet/create" className="fixed bottom-24 right-5 z-50">
                <div className="w-14 h-14 bg-neon-green rounded-full shadow-[0_0_20px_rgba(57,255,20,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-black">
                    <Plus size={32} strokeWidth={2.5} />
                </div>
            </a>

            {/* Auto Feedback Modal */}
            {pendingFeedbackMeet && (
                <MeetupFeedbackModal
                    isOpen={showFeedbackModal}
                    onClose={() => setShowFeedbackModal(false)}
                    meetupTitle={pendingFeedbackMeet.title}
                    participants={pendingFeedbackMeet.participants}
                    onSubmit={handleFeedbackSubmit}
                    onSkip={handleFeedbackSkip}
                />
            )}
        </div>
    );
}
