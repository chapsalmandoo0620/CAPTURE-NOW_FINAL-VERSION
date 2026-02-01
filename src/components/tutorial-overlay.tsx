'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, X, Image as ImageIcon, MapPin, Menu, Zap } from 'lucide-react';

interface TutorialOverlayProps {
    onComplete: () => void;
    isNewUser?: boolean; // If true, "Skip" might behave differently or text changes
}

const STEPS = [
    {
        id: 1,
        title: "Welcome to CAPTURE NOW",
        desc: "The ultimate platform for sharing sports highlights and joining meetups.",
        icon: Zap,
        color: "text-neon-green"
    },
    {
        id: 2,
        title: "Share Your Moments",
        desc: "Upload photos and videos to your feed. Show off your skills and get recognized.",
        icon: ImageIcon,
        color: "text-blue-400"
    },
    {
        id: 3,
        title: "Join Meetups",
        desc: "Find sports sessions near you. Filter by sport, distance, and time.",
        icon: MapPin,
        color: "text-red-400"
    },
    {
        id: 4,
        title: "Stay Connected",
        desc: "Check the Menu for your bookmarks, history, and announcements.",
        icon: Menu,
        color: "text-purple-400"
    }
];

export default function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">

            {/* Skip Button */}
            <button
                onClick={handleSkip}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors text-sm font-medium flex items-center gap-1"
            >
                Skip <X size={16} />
            </button>

            {/* Content Card */}
            <div className="w-full max-w-sm bg-gray-900/50 border border-gray-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 flex h-1">
                    {STEPS.map((_, idx) => (
                        <div
                            key={idx}
                            className={`flex-1 transition-all duration-300 ${idx <= currentStep ? 'bg-neon-green' : 'bg-gray-800'}`}
                        />
                    ))}
                </div>

                <div className="mt-8 mb-6 relative">
                    {/* Animated Icon Circle */}
                    <div className="w-24 h-24 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mb-4 mx-auto relative group">
                        <div className="absolute inset-0 bg-neon-green/10 rounded-full blur-xl animate-pulse"></div>
                        {STEPS.map((step, idx) => {
                            const Icon = step.icon;
                            return idx === currentStep ? (
                                <Icon key={idx} size={40} className={`${step.color} animate-in zoom-in spin-in-3 duration-300`} />
                            ) : null;
                        })}
                    </div>
                </div>

                <div className="min-h-[120px] transition-all duration-300">
                    <h2 className="text-2xl font-bold text-white mb-3">{STEPS[currentStep].title}</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">{STEPS[currentStep].desc}</p>
                </div>

                {/* Buttons */}
                <div className="w-full mt-8 space-y-3">
                    <button
                        onClick={handleNext}
                        className="w-full btn-neon py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                        {currentStep === STEPS.length - 1 ? 'Get Started' : 'Next'}
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Dots (Optional visual indicator) */}
            <div className="flex gap-2 mt-8">
                {STEPS.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-neon-green w-6' : 'bg-gray-800'}`}
                    />
                ))}
            </div>
        </div>
    );
}
