'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, Calendar, Clock, MapPin, Users, Activity, Smile, ArrowRight } from 'lucide-react';
import LocationPicker from '@/components/location-picker';

export default function CreateMeetPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<{
        title: string;
        sport: string;
        date: string;
        startTime: string;
        endTime: string;
        location: string;
        latitude?: number;
        longitude?: number;
        maxParticipants: number;
        level: string;
        vibe: string;
    }>({
        title: '',
        sport: 'Running',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        maxParticipants: 4,
        level: 'Any',
        vibe: 'Fun'
    });

    const [isAddingCustom, setIsAddingCustom] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleSport = (sport: string) => {
        setFormData({ ...formData, sport });
    };

    const handleLocationSelect = (lat: number, lng: number, address?: string) => {
        setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            location: address ? address : prev.location
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert('You must be logged in to create a session.');
            return;
        }

        if (!formData.latitude || !formData.longitude) {
            alert('Please select a location on the map.');
            return;
        }

        // Combine date and time (Simple ISO construction)
        const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`).toISOString();
        const endDateTime = formData.endTime ? new Date(`${formData.date}T${formData.endTime}:00`).toISOString() : null;

        const { data: meetup, error } = await supabase
            .from('meetups')
            .insert({
                host_id: user.id,
                title: formData.title,
                category: formData.sport,
                start_time: startDateTime,
                end_time: endDateTime,
                location_name: formData.location,
                latitude: formData.latitude,
                longitude: formData.longitude,
                max_participants: parseInt(formData.maxParticipants as any),
                level: formData.level,
                vibe_tag: formData.vibe,
                status: 'recruiting'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating meetup:', error);
            alert(`Failed to create meetup: ${error.message}`);
            return;
        }

        if (meetup) {
            // Auto-join host
            const { error: joinError } = await supabase
                .from('meetup_participants')
                .insert({
                    meetup_id: meetup.id,
                    user_id: user.id,
                    status: 'host'
                });

            if (joinError) console.error('Error joining as host:', joinError);

            alert('Session Created Successfully!');
            router.push('/meet');
        }
    };

    // Sports List from Onboarding
    const SPORTS_LIST = [
        'Running', 'Cycle', 'Soccer', 'Basketball', 'Tennis',
        'Golf', 'Climbing', 'Fitness', 'Yoga', 'Swimming',
        'Hiking', 'Skating', 'Surfing', 'Badminton', 'Boxing', 'MMA', 'Crossfit'
    ];

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex items-center gap-3 border-b border-gray-900">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="font-bold text-lg">Create New Session</h1>
            </header>

            <main className="p-5">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Sport Selection */}
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Sport</label>
                        <div className="grid grid-cols-3 gap-2">
                            {SPORTS_LIST.map(sport => (
                                <button
                                    key={sport}
                                    type="button"
                                    onClick={() => {
                                        toggleSport(sport);
                                        setIsAddingCustom(false);
                                    }}
                                    className={`py-3 rounded-xl text-sm font-bold border transition-all ${formData.sport === sport
                                        ? 'bg-neon-green text-black border-neon-green'
                                        : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800'
                                        }`}
                                >
                                    {sport}
                                </button>
                            ))}

                            {/* Render Custom Sport if Selected and not in List */}
                            {!SPORTS_LIST.includes(formData.sport) && !isAddingCustom && formData.sport && (
                                <button
                                    type="button"
                                    className="py-3 rounded-xl text-sm font-bold border transition-all bg-neon-green text-black border-neon-green"
                                    onClick={() => setIsAddingCustom(true)}
                                >
                                    {formData.sport}
                                </button>
                            )}

                            {/* Custom Input */}
                            {isAddingCustom ? (
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Type Sport..."
                                    className="py-3 px-2 rounded-xl text-sm font-bold bg-gray-800 text-white border border-neon-green focus:outline-none"
                                    value={formData.sport}
                                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                                    onBlur={() => { if (!formData.sport) setIsAddingCustom(false); }}
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddingCustom(true);
                                        setFormData({ ...formData, sport: '' }); // Clear to type
                                    }}
                                    className={`py-3 rounded-xl text-sm font-medium border border-gray-800 border-dashed text-gray-500 bg-transparent hover:border-gray-600 hover:text-white transition-colors ${!SPORTS_LIST.includes(formData.sport) && formData.sport ? 'hidden' : ''}`}
                                >
                                    + Custom
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Session Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Wednesday Night Run 5k"
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 focus:border-neon-green focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                <Calendar size={14} /> Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 focus:border-neon-green focus:outline-none text-white scheme-dark"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                <Clock size={14} /> Start
                            </label>
                            <input
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 focus:border-neon-green focus:outline-none text-white scheme-dark"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                <Clock size={14} /> End
                            </label>
                            <input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 focus:border-neon-green focus:outline-none text-white scheme-dark"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <MapPin size={14} /> Location
                        </label>

                        <LocationPicker onLocationSelect={handleLocationSelect} />

                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            placeholder="Location Name (e.g. Near Exit 3)"
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 focus:border-neon-green focus:outline-none transition-colors text-sm"
                        />
                    </div>

                    {/* Details: Max Participants, Level, Vibe */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                <Users size={14} /> Max People
                            </label>
                            <input
                                type="number"
                                name="maxParticipants"
                                value={formData.maxParticipants}
                                onChange={handleChange}
                                min={2}
                                max={50}
                                required
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 focus:border-neon-green focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                <Activity size={14} /> Level
                            </label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 focus:border-neon-green focus:outline-none appearance-none"
                            >
                                <option value="Any">Any Level</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Smile size={14} /> Vibe
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Competitive', 'Fun', 'Training'].map(v => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, vibe: v })}
                                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${formData.vibe === v
                                        ? 'bg-gray-700 text-white border-gray-500'
                                        : 'bg-gray-900 text-gray-500 border-gray-800 hover:bg-gray-800'
                                        }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>


                    {/* Action Button */}
                    <div className="pt-6">
                        <button type="submit" className="w-full bg-neon-green text-black font-bold text-lg py-4 rounded-2xl shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:bg-[#32D612] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                            Create Session <ArrowRight size={20} />
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
}
