'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Camera, Check, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import LocationPicker from '@/components/location-picker';

const ALL_SPORTS = [
    'Running', 'Cycling', 'Soccer', 'Basketball', 'Tennis',
    'Golf', 'Climbing', 'Fitness', 'Yoga', 'Swimming',
    'Hiking', 'Skate', 'Surf', 'Badminton'
];

export default function EditProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // User State
    const [user, setUser] = useState<any>(null); // Supabase User Object

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Form Fields
    const [nickname, setNickname] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [vibe, setVibe] = useState('');
    const [skillLevels, setSkillLevels] = useState<Record<string, string>>({});
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    useEffect(() => {
        const loadProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUser(user);
                const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
                if (profile) {
                    setNickname(profile.nickname || '');
                    setBio(profile.bio || '');
                    setLocation(profile.location_name || '');
                    setLatitude(profile.latitude);
                    setLongitude(profile.longitude);
                    setVibe(profile.vibe || 'Fun');
                    setPreviewUrl(profile.avatar_url || '');
                    setSelectedInterests(profile.interests || []);
                    setSkillLevels(profile.skill_levels || {});
                }
            } else {
                router.replace('/login');
            }
        };
        loadProfile();
    }, []);

    const handleLocationSelect = (lat: number, lng: number, address?: string) => {
        setLatitude(lat);
        setLongitude(lng);
        if (address) setLocation(address);
    };

    // ... handleFileChange, toggleInterest ...

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);

        const supabase = createClient();
        let finalAvatarUrl = previewUrl; // Default to existing

        try {
            // 1. Upload Avatar if Changed
            if (avatarFile) {
                // ... logic
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, avatarFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                finalAvatarUrl = publicUrl;
            }

            // 2. Update DB
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    nickname,
                    bio,
                    location_name: location,
                    latitude,
                    longitude,
                    vibe,
                    interests: selectedInterests,
                    skill_levels: skillLevels,
                    avatar_url: finalAvatarUrl
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            router.back();

        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="min-h-screen bg-black text-white p-6 justify-center flex items-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header ... */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex items-center justify-between border-b border-gray-900">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="font-bold text-lg">Edit Profile</h1>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="text-neon-green font-bold text-sm disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </header>

            <main className="p-5 space-y-8">
                {/* 1. Basic Info */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold text-gray-500 uppercase">Basic Info</h2>

                    <div className="flex flex-col items-center gap-3">
                        {/* Avatar Input ... */}
                        <label className="w-24 h-24 rounded-full bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center relative overflow-hidden cursor-pointer group hover:border-neon-green transition-colors">
                            {previewUrl ? (
                                <img src={previewUrl} className="w-full h-full object-cover" />
                            ) : (
                                <Camera className="text-gray-500 group-hover:text-neon-green" />
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={20} className="text-white" />
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                        <span className="text-xs text-gray-500">Tap to change</span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Nickname</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 focus:border-neon-green focus:outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Main Location <span className="text-neon-green text-xs">(Map Selection Required)</span></label>
                        {/* Render LocationPicker conditionally if keys loaded to prevent map flicker, or just render */}
                        <LocationPicker onLocationSelect={handleLocationSelect} initialLat={latitude || undefined} initialLng={longitude || undefined} />
                        <div className="relative mt-2">
                            <MapPin className="absolute top-4 left-4 text-gray-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search area (e.g. Gangnam)"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 pl-12 focus:border-neon-green focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Bio (Caption)</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 h-24 resize-none focus:border-neon-green focus:outline-none"
                            placeholder="Tell us about yourself..."
                        />
                    </div>
                </div>

                {/* 2. Sports & Skills */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold text-gray-500 uppercase">Sports & Skills</h2>

                    <div className="flex flex-wrap gap-2">
                        {ALL_SPORTS.map(sport => (
                            <button
                                key={sport}
                                onClick={() => toggleInterest(sport)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedInterests.includes(sport)
                                    ? 'bg-neon-green text-black border-neon-green'
                                    : 'bg-gray-900 text-gray-500 border-gray-800'
                                    }`}
                            >
                                {sport}
                            </button>
                        ))}
                    </div>

                    {selectedInterests.length > 0 && (
                        <div className="space-y-3 bg-gray-900/30 p-4 rounded-xl border border-gray-800">
                            {selectedInterests.map(sport => (
                                <div key={sport} className="flex items-center justify-between">
                                    <span className="text-sm font-bold w-24">{sport}</span>
                                    <div className="flex gap-1">
                                        {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                                            <button
                                                key={level}
                                                onClick={() => setSkill(sport, level)}
                                                className={`px-2 py-1 text-[10px] rounded border ${skillLevels[sport] === level
                                                    ? 'bg-gray-700 text-white border-white'
                                                    : 'bg-black text-gray-600 border-gray-800'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. Vibe */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold text-gray-500 uppercase">My Vibe</h2>
                    <div className="grid grid-cols-3 gap-2">
                        {['Fun', 'Competitive', 'Growth'].map(v => (
                            <button
                                key={v}
                                onClick={() => setVibe(v)}
                                className={`py-3 rounded-xl text-sm font-bold border transition-all ${vibe === v
                                    ? 'bg-white text-black border-white'
                                    : 'bg-gray-900 text-gray-400 border-gray-800'
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
}
