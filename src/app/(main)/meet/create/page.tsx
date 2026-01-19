'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, Calendar, Clock, MapPin, Users, Activity, Smile, ArrowRight } from 'lucide-react';

export default function CreateMeetPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleSport = (sport: string) => {
        setFormData({ ...formData, sport });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert('You must be logged in to create a session.');
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
                                    onClick={() => toggleSport(sport)}
                                    className={`py-3 rounded-xl text-sm font-bold border transition-all ${formData.sport === sport
                                        ? 'bg-neon-green text-black border-neon-green'
                                        : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800'
                                        }`}
                                >
                                    {sport}
                                </button>
                            ))}
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
                        <div className="relative">
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                placeholder="Search location..."
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-4 pr-10 py-3 focus:border-neon-green focus:outline-none transition-colors"
                            />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                <MapPin size={20} />
                            </button>
                        </div>
                        {/* Map Mock */}
                        <div className="h-32 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center text-gray-500 text-xs">
                            <MapPin className="mb-1" size={16} /> Map Integration Here
                        </div>
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
