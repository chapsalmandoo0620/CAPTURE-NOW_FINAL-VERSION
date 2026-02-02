'use client';

import { useState } from 'react';
import { Camera, MapPin, Check, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LocationPicker from '@/components/location-picker';
import { useLanguage } from '@/context/language-context';
import { dictionaries } from '@/lib/i18n/dictionaries';
import AuthLanguageSwitcher from '@/components/auth-language-switcher';

const SPORTS = [
    'Run', 'Cycle', 'Soccer', 'Basketball', 'Tennis',
    'Golf', 'Climb', 'Fitness', 'Yoga', 'Swim',
    'Hike', 'Skate', 'Surf', 'Badminton'
];

export default function OnboardingPage() {
    const router = useRouter();
    const { language } = useLanguage();
    const t = dictionaries[language].onboarding;
    const tCommon = dictionaries[language].common;
    const tCategories = dictionaries[language].meetup.categories;
    const tLevels = dictionaries[language].meetup.levels;

    const [step, setStep] = useState(1);

    // Form State
    const [nickname, setNickname] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [skillLevels, setSkillLevels] = useState<Record<string, string>>({});
    const [vibe, setVibe] = useState('');

    // File Upload State
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const getSportLabel = (sport: string) => {
        const map: Record<string, string> = {
            'Run': tCategories.running,
            'Cycle': tCategories.cycling,
            'Soccer': tCategories.soccer,
            'Basketball': tCategories.basketball,
            'Tennis': tCategories.tennis,
            'Golf': tCategories.golf,
            'Climb': tCategories.climbing,
            'Fitness': tCategories.fitness,
            'Yoga': tCategories.yoga,
            'Swim': tCategories.swimming,
            'Hike': tCategories.hiking,
        };
        return map[sport] || sport;
    };

    const handleLocationSelect = (lat: number, lng: number, address?: string) => {
        setLatitude(lat);
        setLongitude(lng);
        if (address) setLocation(address);
    };

    const handleNext = async () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            await saveProfile();
        }
    };

    const saveProfile = async () => {
        setLoading(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            let avatarUrl = null;

            // 1. Upload Avatar if exists
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${user.id}/avatar.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, avatarFile, { upsert: true });

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('avatars')
                        .getPublicUrl(fileName);
                    avatarUrl = publicUrl;
                }
            }

            // 2. Save User Data
            // Default skills if not selected
            const finalSkills = { ...skillLevels };
            selectedInterests.forEach(sport => {
                if (!finalSkills[sport]) finalSkills[sport] = 'Beginner';
            });

            const { error } = await supabase.from('users').upsert({
                id: user.id,
                email: user.email,
                nickname,
                bio,
                location_name: location,
                latitude,
                longitude,
                interests: selectedInterests,
                skill_levels: finalSkills,
                vibe,
                avatar_url: avatarUrl,
                // updated_at: new Date().toISOString(), // Column missing in schema
            });

            if (error) {
                console.error("Supabase Error:", error);
                throw new Error(error.message);
            }

            // CLEAR STALE DATA (Migration Cleanup)
            localStorage.removeItem('my_posts');
            localStorage.removeItem('my_following');
            localStorage.removeItem('my_meetups');
            localStorage.removeItem('my_created_meets');
            localStorage.removeItem('my_meeting_scores');
            localStorage.removeItem('my_profile'); // Ensure we rely on DB fetch

            // Set Auth Flag (Optional, depending on middleware usage)
            localStorage.setItem('capture_now_auth', 'true');

            alert('Profile Setup Complete!');
            router.push('/tutorial?new=true');

        } catch (err: any) {
            console.error("Critical Error during save:", err);
            alert(`Failed to save profile: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const toggleInterest = (sport: string) => {
        setSelectedInterests(prev =>
            prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
        );
    };

    const setSkillForSport = (sport: string, level: string) => {
        setSkillLevels(prev => ({ ...prev, [sport]: level }));
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-24 relative">
            <AuthLanguageSwitcher />
            <div className="max-w-md mx-auto space-y-8">

                {/* Progress */}
                <div className="flex gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-neon-green' : 'bg-gray-800'}`} />
                    ))}
                </div>

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {step === 1 && t.step1.title}
                        {step === 2 && t.step2.title}
                        {step === 3 && t.step3.title}
                    </h1>
                    <p className="text-gray-400">
                        {step === 1 && t.step1.desc}
                        {step === 2 && t.step2.desc}
                        {step === 3 && t.step3.desc}
                    </p>
                </div>

                {/* Step 1: Profile */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="flex justify-center flex-col items-center gap-2">
                            <label className="relative w-32 h-32 bg-gray-900 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center group cursor-pointer hover:border-neon-green transition-colors overflow-hidden">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera className="text-gray-500 group-hover:text-neon-green" />
                                )}
                                <div className="absolute bottom-0 right-0 bg-neon-green text-black p-2 rounded-full z-10">
                                    <Camera size={16} />
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                            <span className="text-xs text-gray-500">{t.step1.optional}</span>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder={t.step1.nickname}
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full bg-gray-900 border-gray-800 rounded-xl p-4 text-white focus:border-neon-green focus:outline-none"
                            />
                            <textarea
                                placeholder={t.step1.bio}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full bg-gray-900 border-gray-800 rounded-xl p-4 text-white resize-none h-24 focus:border-neon-green focus:outline-none"
                            />

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">{t.step1.location}</label>

                                <LocationPicker onLocationSelect={handleLocationSelect} />

                                <div className="relative mt-2">
                                    <MapPin className="absolute top-4 left-4 text-gray-500" size={20} />
                                    <input
                                        type="text"
                                        placeholder={t.step1.locationSearch}
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full bg-gray-900 border-gray-800 rounded-xl p-4 pl-12 text-white focus:border-neon-green focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Interests */}
                {step === 2 && (
                    <div className="grid grid-cols-3 gap-3">
                        {SPORTS.map(sport => (
                            <button
                                key={sport}
                                onClick={() => toggleInterest(sport)}
                                className={`p-4 rounded-xl text-sm font-medium border transition-all ${selectedInterests.includes(sport)
                                    ? 'bg-neon-green text-black border-neon-green font-bold'
                                    : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
                                    }`}
                            >
                                {getSportLabel(sport)}
                            </button>
                        ))}
                        <button className="p-4 rounded-xl text-sm font-medium border border-gray-800 border-dashed text-gray-500 bg-transparent">
                            {t.step2.add}
                        </button>
                    </div>
                )}

                {/* Step 3: Skill & Vibe */}
                {step === 3 && (
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="font-bold mb-4">{t.step3.skillLevel}</h3>
                            {selectedInterests.length === 0 && <p className="text-gray-500">{t.step3.noSports}</p>}
                            {selectedInterests.map(sport => (
                                <div key={sport} className="space-y-2">
                                    <label className="text-sm text-neon-green font-bold">{getSportLabel(sport)}</label>
                                    <div className="flex gap-2">
                                        {['Beginner', 'Intermediate', 'Advanced'].map(level => {
                                            const currentLevel = skillLevels[sport] || 'Beginner';
                                            const displayLevel = level === 'Beginner' ? tLevels.beginner : (level === 'Intermediate' ? tLevels.intermediate : tLevels.advanced);
                                            return (
                                                <button
                                                    key={level}
                                                    onClick={() => setSkillForSport(sport, level)}
                                                    className={`flex-1 py-2 text-sm border rounded-lg transition-all ${currentLevel === level
                                                        ? 'bg-gray-800 text-white border-neon-green'
                                                        : 'bg-gray-900 text-gray-500 border-gray-800 hover:border-gray-700'
                                                        }`}
                                                >
                                                    {displayLevel}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-800">
                            <h3 className="font-bold">{t.step3.title}</h3>
                            {[
                                { id: 'fun', label: t.step3.vibes.fun.label, desc: t.step3.vibes.fun.desc },
                                { id: 'hard', label: t.step3.vibes.hard.label, desc: t.step3.vibes.hard.desc },
                                { id: 'grow', label: t.step3.vibes.grow.label, desc: t.step3.vibes.grow.desc }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setVibe(item.id)}
                                    className={`w-full p-4 rounded-xl border flex items-center justify-between text-left transition-all ${vibe === item.id
                                        ? 'bg-gray-800 border-neon-green'
                                        : 'bg-gray-900 border-gray-800'
                                        }`}
                                >
                                    <div>
                                        <div className={`font-bold ${vibe === item.id ? 'text-neon-green' : 'text-white'}`}>{item.label}</div>
                                        <div className="text-sm text-gray-400">{item.desc}</div>
                                    </div>
                                    {vibe === item.id && <Check className="text-neon-green" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bottom Nav */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-gray-900">
                    <div className="max-w-md mx-auto">
                        <button onClick={handleNext} disabled={loading} className="btn-neon w-full flex items-center justify-center gap-2 disabled:opacity-50">
                            {loading ? t.buttons.processing : (step === 3 ? t.buttons.start : t.buttons.next)}
                            {!loading && <ChevronRight size={20} />}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
