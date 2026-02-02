'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, X, ChevronDown, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/language-context';

/* 
  Same Logic as Meet Page for Categories/Levels to verify consistency 
  But here we select single value.
*/
const SPORTS = ['Running', 'Cycle', 'Soccer', 'Basketball', 'Tennis', 'Golf', 'Climbing', 'Fitness', 'Yoga', 'Swimming', 'Hiking', 'Skating', 'Surfing', 'Badminton', 'Boxing', 'MMA', 'Crossfit'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Any'];

export default function UploadPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isVideo, setIsVideo] = useState(false);
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const [sport, setSport] = useState(''); // Optional
    const [level, setLevel] = useState(''); // Optional (Context: post level? maybe not strictly needed for highlights but useful)
    const [uploading, setUploading] = useState(false);

    // Native Camera Input
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check Auth
    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert(t('upload.loginReq'));
                router.replace('/onboarding');
            }
        };
        checkAuth();
    }, [router, t]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setIsVideo(selected.type.startsWith('video/'));
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        try {
            // 1. Upload File
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('highlights')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('highlights')
                .getPublicUrl(fileName);

            // 3. Insert Record
            const { error: dbError } = await supabase
                .from('highlights')
                .insert({
                    user_id: user.id,
                    media_url: publicUrl,
                    caption,
                    location_name: location,
                    category: sport || 'General', // Default
                    // level: level // Schema doesn't strictly have level on highlights yet, but if it did...
                    // For now we just focus on existing schema columns.
                    // Checking schema: highlights(id, user_id, media_url, description(caption), location_name, category)
                });

            if (dbError) throw dbError;

            // Success
            router.push('/'); // Go to Feed
            router.refresh();

        } catch (error: any) {
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    // Sport/Level UI logic (Simple Selects)
    const sportsList = SPORTS.map(s => ({
        value: s,
        label: s.toLowerCase() === 'cycle' ? t('meetup.categories.cycling') : t(`meetup.categories.${s.toLowerCase()}`) || s
    }));

    // Schema might not support level for highlights yet, but UI shows it as Optional.
    // If backend doesn't support, we just won't save it or add to metadata json? 
    // Schema in memory: highlights table has 'category' but not explicit 'level'. 
    // I will ignore saving 'level' for now to avoid errors, or treat it as purely UI if not supported.
    // Actually, looking at previous artifacts, highlights schema is simple.
    // I'll leave the UI selector as requested but maybe append to caption or ignore? 
    // Or just store category.
    // For now, I'll keep the selector as "Optional" implies it might not even be used heavily.

    const levelsList = LEVELS.map(l => ({
        value: l,
        label: t(`meetup.levels.${l.toLowerCase()}`) || l
    }));

    return (
        <div className="min-h-screen bg-black text-white pb-24 flex flex-col items-center relative">
            {/* Header */}
            <div className="w-full h-16 flex items-center justify-between px-4 border-b border-gray-900 sticky top-0 bg-black/80 backdrop-blur z-20">
                <button onClick={() => router.back()} className="p-2">
                    <X className="text-gray-400" />
                </button>
                <h1 className="font-bold text-lg">{t('upload.title')}</h1>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Main Content */}
            <div className="w-full max-w-md flex-1 flex flex-col p-4 space-y-6">

                {/* File Picker Area */}
                {!preview ? (
                    <div
                        className="flex-1 border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center gap-4 bg-gray-900/20 hover:bg-gray-900/40 transition-colors cursor-pointer group min-h-[400px]"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-neon-green group-hover:text-black transition-colors">
                            <Camera size={32} />
                        </div>
                        <span className="font-bold text-gray-500 group-hover:text-white">{t('upload.selectPrompt')}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                cameraInputRef.current?.click();
                            }}
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 border border-gray-800 text-gray-400 font-bold hover:bg-gray-800"
                        >
                            <Camera size={20} /> {t('upload.openCamera')}
                        </button>
                    </div>
                ) : (
                    <div className="relative w-full rounded-3xl overflow-hidden bg-black border border-gray-800 aspect-[4/5]">
                        {isVideo ? (
                            <video src={preview} className="w-full h-full object-cover" controls />
                        ) : (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        )}
                        <button
                            onClick={() => { setFile(null); setPreview(null); }}
                            className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-red-500/80 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-xl py-2 px-3 flex justify-center">
                            <span className="text-xs font-bold text-neon-green">{t('upload.preview')}</span>
                        </div>
                    </div>
                )}

                {/* Hidden Inputs */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                    className="hidden"
                />
                <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                    capture="environment"
                    className="hidden"
                />

                {/* Metadata Inputs */}
                {preview && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
                        {/* Selects Row */}
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <select
                                    value={sport}
                                    onChange={(e) => setSport(e.target.value)}
                                    className="w-full appearance-none bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-neon-green focus:outline-none text-gray-300"
                                >
                                    <option value=''>{t('upload.selectSport')}</option>
                                    {sportsList.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                            </div>
                            <div className="flex-1 relative">
                                <select
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    className="w-full appearance-none bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-neon-green focus:outline-none text-gray-300"
                                >
                                    <option value=''>{t('upload.selectLevel')}</option>
                                    {levelsList.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <label className="absolute -top-2.5 left-3 bg-black px-1 text-xs font-bold text-gray-400">{t('upload.locationProto')}</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder={t('upload.locationPlace')}
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-neon-green focus:outline-none placeholder-gray-600 text-white"
                            />
                        </div>

                        {/* Caption */}
                        <div className="relative">
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder={t('upload.captionPlace')}
                                className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-sm focus:border-neon-green focus:outline-none min-h-[100px] resize-none placeholder-gray-600 text-white"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className={`w-full py-4 rounded-xl font-bold text-black text-lg transition-all shadow-lg ${uploading
                                ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                                : 'bg-neon-green hover:bg-[#32D612] hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {uploading ? t('upload.uploading') : t('upload.shareMoment')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
