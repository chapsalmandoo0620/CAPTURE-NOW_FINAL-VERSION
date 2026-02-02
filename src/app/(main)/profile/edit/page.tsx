'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Camera, Check, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import LocationPicker from '@/components/location-picker';
import { useLanguage } from '@/context/language-context';
import { dictionaries } from '@/lib/i18n/dictionaries';

const ALL_SPORTS = [
    'Running', 'Cycling', 'Soccer', 'Basketball', 'Tennis',
    'Golf', 'Climbing', 'Fitness', 'Yoga', 'Swimming',
    'Hiking', 'Skate', 'Surf', 'Badminton'
];

export default function EditProfilePage() {
    const router = useRouter();
    const { language } = useLanguage();
    const t = dictionaries[language].common;
    const tEdit = dictionaries[language].profile.edit;
    const tMeetup = dictionaries[language].meetup;
    const tOnboarding = dictionaries[language].onboarding;

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
                    setSelectedInterests((profile.interests as string[]) || []);
                    setSkillLevels((profile.skill_levels as Record<string, string>) || {});
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const toggleInterest = (sport: string) => {
        setSelectedInterests(prev => {
            if (prev.includes(sport)) {
                return prev.filter(s => s !== sport);
            } else {
                return [...prev, sport];
            }
        });

        if (!skillLevels[sport]) {
            setSkillLevels(prev => ({ ...prev, [sport]: 'Beginner' }));
        }
    };

    const setSkill = (sport: string, level: string) => {
        setSkillLevels(prev => ({ ...prev, [sport]: level }));
    };


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

    if (!user) return <div className="min-h-screen bg-black text-white p-6 justify-center flex items-center">{t.loading}</div>;

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header ... */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex items-center justify-between border-b border-gray-900">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="font-bold text-lg">{tEdit.title}</h1>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="text-neon-green font-bold text-sm disabled:opacity-50"
                >
                    {loading ? tEdit.saving : tEdit.save}
                </button>
            </header>

            <main className="p-5 space-y-8">
                {/* 1. Basic Info */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold text-gray-500 uppercase">{tEdit.basicInfo}</h2>

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
                        <span className="text-xs text-gray-500">{tEdit.tapChange}</span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">{tEdit.nickname}</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 focus:border-neon-green focus:outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">{tEdit.location} <span className="text-neon-green text-xs">{tEdit.locationHint}</span></label>
                        {/* Render LocationPicker conditionally if keys loaded to prevent map flicker, or just render */}
                        <LocationPicker onLocationSelect={handleLocationSelect} initialLat={latitude || undefined} initialLng={longitude || undefined} />
                        <div className="relative mt-2">
                            <MapPin className="absolute top-4 left-4 text-gray-500" size={20} />
                            <input
                                type="text"
                                placeholder={tEdit.searchPlaceholder}
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 pl-12 focus:border-neon-green focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">{tEdit.bio}</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 h-24 resize-none focus:border-neon-green focus:outline-none"
                            placeholder={tEdit.bioPlaceholder}
                        />
                    </div>
                </div>

                {/* 2. Sports & Skills */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold text-gray-500 uppercase">{tEdit.sports}</h2>

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
                                {(tMeetup.categories as any)[sport.toLowerCase()] || sport}
                            </button>
                        ))}
                    </div>

                    {selectedInterests.length > 0 && (
                        <div className="space-y-3 bg-gray-900/30 p-4 rounded-xl border border-gray-800">
                            {selectedInterests.map(sport => (
                                <div key={sport} className="flex items-center justify-between">
                                    <span className="text-sm font-bold w-24">{(tMeetup.categories as any)[sport.toLowerCase()] || sport}</span>
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
                                                {(tMeetup.levels as any)[level.toLowerCase()] || level}
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
                    <h2 className="text-xs font-bold text-gray-500 uppercase">{tEdit.vibe}</h2>
                    <div className="grid grid-cols-3 gap-2">
                        {['Fun', 'Competitive', 'Growth'].map(v => {
                            const vibeKey = v === 'Fun' ? 'fun' : v === 'Competitive' ? 'hard' : 'grow';
                            return (
                                <button
                                    key={v}
                                    onClick={() => setVibe(v)}
                                    className={`py-3 rounded-xl text-sm font-bold border transition-all ${vibe === v
                                        ? 'bg-white text-black border-white'
                                        : 'bg-gray-900 text-gray-400 border-gray-800'
                                        }`}
                                >
                                    {(tOnboarding.step3.vibes as any)[vibeKey]?.label || v}
                                </button>
                            );
                        })}
                    </div>
                </div>

            </main>
        </div>
    );
}
