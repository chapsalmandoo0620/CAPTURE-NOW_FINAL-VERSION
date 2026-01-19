'use client';

import { useState, useEffect } from 'react';
import { Search, Map as MapIcon, List, Filter, Calendar, MapPin, Plus, X, ChevronDown, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = ['All', 'Running', 'Soccer', 'Tennis', 'Cycling', 'Hiking', 'Golf', 'Basketball'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Any'];
const VIBES = ['Competitive', 'Fun', 'Training'];
const DISTANCES = ['< 1km', '1-3km', '3-5km', '5-10km', '10km+'];

export default function MeetPage() {
    // UI State
    const [view, setView] = useState<'list' | 'map'>('list');
    const [activeCategory, setActiveCategory] = useState('All');
    const [showFilter, setShowFilter] = useState(false);

    // Data State
    const [meets, setMeets] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [myProfile, setMyProfile] = useState<any>(null);

    // Filter Logic State
    const [filterSport, setFilterSport] = useState('All');
    const [filterLevel, setFilterLevel] = useState('Any');
    const [filterDist, setFilterDist] = useState('');
    const [filterHost, setFilterHost] = useState('');

    // Initialize & Load Persistence
    const [joinedMeets, setJoinedMeets] = useState<string[]>([]);

    useEffect(() => {
        const loadMeets = async () => {
            const supabase = createClient();

            // 1. Get Current User for "Joined" check
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setMyProfile({ id: user.id }); // Minimal profile for ID check

                // Fetch joined meetups
                const { data: joinedData } = await supabase
                    .from('meetup_participants')
                    .select('meetup_id')
                    .eq('user_id', user.id);

                if (joinedData) {
                    setJoinedMeets(joinedData.map(j => j.meetup_id));
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
                .neq('status', 'finished')
                .order('start_time', { ascending: true });

            if (data) {
                const formatted = data.map(m => ({
                    id: m.id,
                    title: m.title,
                    host: m.host?.nickname || 'Unknown',
                    hostId: m.host_id,
                    sport: m.category || 'Other',
                    date: new Date(m.start_time).toISOString().split('T')[0],
                    startTime: new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    endTime: m.end_time ? new Date(m.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                    loc: m.location_name,
                    dist: '1.2km', // Mock: PostGIS calc needed for real dist
                    level: m.level,
                    vibe: m.vibe_tag,
                    max: m.max_participants,
                    participants: m.participants.length,
                    status: m.status
                }));
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

        return matchesSearch && matchesCategory && matchesFilterSport && matchesFilterLevel && matchesFilterHost;
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
                                    {['All', 'Running', 'Soccer', 'Tennis', 'Cycling'].map(s => (
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
                            return (
                                <div
                                    key={meet.id}
                                    className={`bg-gray-900/50 border rounded-2xl p-5 hover:border-gray-700 transition-all group relative overflow-hidden ${isHost ? 'border-neon-green shadow-[0_0_10px_rgba(57,255,20,0.1)]' : 'border-gray-800'
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
                                                    className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${joinedMeets.includes(meet.id.toString())
                                                        ? 'bg-gray-800 border-gray-600 text-white hover:bg-red-900/50 hover:border-red-500'
                                                        : 'bg-neon-green border-neon-green text-black hover:bg-[#32D612]'
                                                        }`}
                                                >
                                                    {joinedMeets.includes(meet.id.toString()) ? 'Joined' : 'Join'}
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
                    // Map View Placeholder (Keep existing)
                    <div className="h-[60vh] bg-gray-900 rounded-2xl flex flex-col items-center justify-center text-gray-500 border border-gray-800 relative overflow-hidden">
                        <MapPin size={48} className="text-gray-800 mb-2" />
                        <span className="text-sm">Map View Integration Coming Soon</span>
                        <div className="absolute top-1/3 left-1/4 w-8 h-8 rounded-full bg-neon-green/20 border border-neon-green flex items-center justify-center text-xs animate-bounce">🏃</div>
                        <div className="absolute bottom-1/3 right-1/4 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-xs animate-pulse delay-75">⚽</div>
                    </div>
                )}
            </main>

            {/* FAB: Create Meetup */}
            <a href="/meet/create" className="fixed bottom-24 right-5 z-50">
                <div className="w-14 h-14 bg-neon-green rounded-full shadow-[0_0_20px_rgba(57,255,20,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-black">
                    <Plus size={32} strokeWidth={2.5} />
                </div>
            </a>
        </div>
    );
}
