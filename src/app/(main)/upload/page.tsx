'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Image as ImageIcon, X, Send, Camera, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import LocationPicker from '@/components/location-picker';

export default function UploadPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // ... (rest of the code)

    // ...

    <input
        type="file"
        accept="image/*,video/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
    />

    {/* Camera Input (Hidden) */ }
    <input
        type="file"
        accept="image/*,video/*"
        capture="environment"
        className="hidden"
        ref={cameraInputRef}
        onChange={handleFileSelect}
    />

    {/* Camera Button */ }
    <button
        onClick={() => cameraInputRef.current?.click()}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 border border-gray-800 text-gray-400 font-bold hover:bg-gray-800"
    >
        <Camera size={20} />
        Open Camera
    </button>
    const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [caption, setCaption] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    // Metadata States
    const [sport, setSport] = useState('');
    const [level, setLevel] = useState('');
    const [location, setLocation] = useState('');
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);

    const SPORTS = [
        '',
        'Running', 'Cycling', 'Soccer', 'Tennis', 'Badminton',
        'Basketball', 'Hiking', 'Golf', 'Swimming', 'Climbing', 'Gym'
    ];
    const LEVELS = ['', 'Beginner', 'Intermediate', 'Advanced', 'Pro'];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const isVideo = selectedFile.type.startsWith('video/');
            setMediaType(isVideo ? 'video' : 'image');

            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedMedia(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleLocationSelect = (lat: number, lng: number, address?: string) => {
        setLatitude(lat);
        setLongitude(lng);
        if (address) setLocation(address);
    };

    const handleUpload = async () => {
        if (!file || !selectedMedia) return;

        setIsUploading(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Please login to upload.");

            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('highlights')
                .upload(fileName, file);

            if (uploadError) throw new Error(`Storage Upload Failed: ${uploadError.message}`);

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('highlights')
                .getPublicUrl(fileName);

            // 3. Save to Database
            const { error: dbError } = await supabase
                .from('highlights')
                .insert({
                    user_id: user.id,
                    media_url: publicUrl,
                    caption: caption,
                    category: sport,
                    location_name: location,
                    latitude: latitude,
                    longitude: longitude
                });

            if (dbError) throw new Error(`Database Save Failed: ${dbError.message} (Details: ${dbError.details || 'Check RLS'})`);

            // Success
            router.push('/');

        } catch (error: any) {
            console.error("Upload failed:", error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex items-center justify-between border-b border-gray-900">
                <button onClick={() => router.back()} className="p-1 text-gray-400 hover:text-white">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="font-bold text-lg">New Post</h1>
                <div className="w-8"></div>
            </header>

            <main className="p-4 flex flex-col items-center min-h-[80vh]">

                {!selectedMedia ? (
                    // Empty State: Upload Prompt
                    <div className="flex-1 flex flex-col items-center justify-center w-full gap-6">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full aspect-square max-w-sm border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-neon-green hover:bg-gray-900/30 transition-all cursor-pointer group"
                        >
                            <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ImageIcon size={40} className="text-gray-500 group-hover:text-neon-green" />
                            </div>
                            <span className="font-bold text-gray-500 group-hover:text-white">Select Photo or Video</span>
                        </div>

                        <input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />

                        {/* Camera Button (Mock) */}
                        <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 border border-gray-800 text-gray-400 font-bold hover:bg-gray-800">
                            <Camera size={20} />
                            Open Camera
                        </button>
                    </div>
                ) : (
                    // Preview & edit State
                    <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-5">
                        {/* Media Preview */}
                        <div className={`relative w-full rounded-3xl overflow-hidden border border-gray-800 bg-black ${mediaType === 'video' ? 'aspect-[9/16]' : 'aspect-square'}`}>
                            {mediaType === 'video' ? (
                                <video src={selectedMedia} controls autoPlay loop className="w-full h-full object-cover" />
                            ) : (
                                <img src={selectedMedia} alt="Preview" className="w-full h-full object-contain" />
                            )}

                            <button
                                onClick={() => { setSelectedMedia(null); setFile(null); }}
                                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-red-500/80 transition-colors z-10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Metadata Inputs */}
                        <div className="space-y-4">
                            {/* Sport & Level */}
                            <div className="flex gap-2">
                                <select
                                    value={sport}
                                    onChange={(e) => setSport(e.target.value)}
                                    className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-neon-green focus:outline-none appearance-none font-bold"
                                >
                                    {SPORTS.map(s => <option key={s} value={s}>{s === '' ? 'Select Sport (Optional)' : s}</option>)}
                                </select>
                                <select
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-neon-green focus:outline-none appearance-none text-gray-300"
                                >
                                    {LEVELS.map(l => <option key={l} value={l}>{l === '' ? 'Select Level (Optional)' : l}</option>)}
                                </select>
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1 text-gray-400">Location</label>
                                <LocationPicker onLocationSelect={handleLocationSelect} />
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <MapPin size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Add location name..."
                                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-neon-green focus:outline-none placeholder-gray-500 text-white"
                                    />
                                </div>
                            </div>

                            {/* Caption Input */}
                            <div className="space-y-1">
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Write a caption..."
                                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-sm focus:border-neon-green focus:outline-none min-h-[100px] resize-none"
                                />
                            </div>
                        </div>

                        {/* Share Button */}
                        <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isUploading
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-neon-green text-black hover:bg-[#32D612] shadow-[0_0_20px_rgba(57,255,20,0.3)]'
                                }`}
                        >
                            {isUploading ? (
                                <span>Uploading...</span>
                            ) : (
                                <>
                                    <Send size={20} /> Share Moment
                                </>
                            )}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
