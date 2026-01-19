'use client';

import { useState } from 'react';
import { Star, Award, X, ThumbsUp } from 'lucide-react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    meetupTitle: string;
    participants: { name: string; avatar?: string }[];
    onSubmit: (rating: number, starPlayer: string, mannerPlayer: string) => void;
}

export default function MeetupFeedbackModal({ isOpen, onClose, meetupTitle, participants, onSubmit }: FeedbackModalProps) {
    const [rating, setRating] = useState(0);
    const [starPlayer, setStarPlayer] = useState<string | null>(null);
    const [mannerPlayer, setMannerPlayer] = useState<string | null>(null);

    if (!isOpen) return null;

    // Filter out "Me" from participants for voting
    const voteableParticipants = participants.filter(p => p.name !== 'Me');

    const handleRating = (r: number) => {
        setRating(r);
    };

    const handleSubmit = () => {
        onSubmit(rating, starPlayer || '', mannerPlayer || '');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-5 border-b border-gray-800 text-center relative">
                    <h2 className="font-bold text-xl text-white">Example Feedback</h2>
                    <p className="text-xs text-gray-400 mt-1">How was <span className="text-neon-green">{meetupTitle}</span>?</p>
                    {/* Close button is effectively "Skip" or "Close" */}
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar space-y-8">

                    {/* 1. Rating */}
                    <div className="text-center">
                        <label className="block text-sm font-bold text-gray-300 mb-3">Overall Satisfaction</label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRating(star)}
                                    className="focus:outline-none transition-transform active:scale-95 hover:scale-110"
                                >
                                    <Star
                                        size={32}
                                        className={`${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="text-center mt-2 text-neon-green font-bold text-lg">{rating > 0 ? rating.toFixed(1) : '-'}</div>
                    </div>

                    {/* 2. Star Player */}
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center justify-center gap-1">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" /> Star Player
                        </label>
                        <p className="text-[10px] text-gray-500 text-center mb-3">Who showed the most impressive performance?</p>
                        <div className="grid grid-cols-3 gap-2">
                            {voteableParticipants.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => setStarPlayer(p.name)}
                                    className={`p-2 rounded-xl border flex flex-col items-center gap-2 transition-all ${starPlayer === p.name
                                            ? 'bg-yellow-400/20 border-yellow-400'
                                            : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                                        {/* Avatar Placeholder */}
                                        <div className="w-full h-full bg-gray-600 flex items-center justify-center text-[10px]">{p.name[0]}</div>
                                    </div>
                                    <span className={`text-[10px] font-medium truncate w-full text-center ${starPlayer === p.name ? 'text-yellow-400' : 'text-gray-300'}`}>
                                        {p.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Manner Player */}
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center justify-center gap-1">
                            <Award size={14} className="text-neon-green" /> Manner Player
                        </label>
                        <p className="text-[10px] text-gray-500 text-center mb-3">Who showed the best sportsmanship?</p>
                        <div className="grid grid-cols-3 gap-2">
                            {voteableParticipants.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => setMannerPlayer(p.name)}
                                    className={`p-2 rounded-xl border flex flex-col items-center gap-2 transition-all ${mannerPlayer === p.name
                                            ? 'bg-neon-green/20 border-neon-green'
                                            : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                                        <div className="w-full h-full bg-gray-600 flex items-center justify-center text-[10px]">{p.name[0]}</div>
                                    </div>
                                    <span className={`text-[10px] font-medium truncate w-full text-center ${mannerPlayer === p.name ? 'text-neon-green' : 'text-gray-300'}`}>
                                        {p.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-gray-800 flex gap-3 bg-gray-900">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 font-bold text-sm hover:bg-gray-800"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0}
                        className="flex-1 py-3 rounded-xl bg-neon-green text-black font-bold text-sm hover:bg-[#32D612] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit Feedback
                    </button>
                </div>
            </div>
        </div>
    );
}
