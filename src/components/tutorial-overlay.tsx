'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, X, Image as ImageIcon, MapPin, Menu, Zap, Heart, MessageCircle, Bookmark, Plus, Calendar, History, Megaphone, Bell, Check, Globe } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { Locale } from '@/lib/i18n/dictionaries';

interface TutorialOverlayProps {
    onComplete: () => void;
    isNewUser?: boolean;
}

export default function TutorialOverlay({ onComplete, isNewUser }: TutorialOverlayProps) {
    const { t, setLanguage, language } = useLanguage();
    const [currentStep, setCurrentStep] = useState(0);
    // Show language selector if it's a new user, otherwise skip
    const [showLanguageSelect, setShowLanguageSelect] = useState(!!isNewUser);

    const handleLanguageSelect = (lang: Locale) => {
        setLanguage(lang);
        setShowLanguageSelect(false);
    };

    const STEPS = [
        {
            id: 1,
            title: t('tutorial.step1.title'),
            titleAccent: t('tutorial.step1.titleAccent'),
            desc: t('tutorial.step1.desc'),
            icon: Zap,
            color: "text-neon-green",
            content: null
        },
        {
            id: 2,
            title: t('tutorial.step2.title'),
            desc: t('tutorial.step2.desc'),
            icon: Heart,
            color: "text-pink-500",
            content: (
                <div className="flex gap-4 items-center justify-center p-4 bg-gray-800/50 rounded-xl mt-2">
                    <div className="flex flex-col items-center gap-1">
                        <Heart className="text-pink-500 fill-pink-500/20" size={24} />
                        <span className="text-[10px] text-gray-400">{t('tutorial.step2.like')}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <MessageCircle className="text-blue-400" size={24} />
                        <span className="text-[10px] text-gray-400">{t('tutorial.step2.comment')}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Bookmark className="text-yellow-400" size={24} />
                        <span className="text-[10px] text-gray-400">{t('tutorial.step2.save')}</span>
                    </div>
                </div>
            )
        },
        {
            id: 3,
            title: t('tutorial.step3.title'),
            desc: t('tutorial.step3.desc'),
            icon: ImageIcon,
            color: "text-blue-400",
            content: (
                <div className="flex flex-col items-center gap-2 mt-2">
                    <div className="w-12 h-12 rounded-full bg-neon-green flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.5)] animate-pulse">
                        <Plus className="text-black font-bold" size={28} />
                    </div>
                    <span className="text-xs text-neon-green font-medium">{t('tutorial.step3.action')}</span>
                </div>
            )
        },
        {
            id: 4,
            title: t('tutorial.step4.title'),
            desc: t('tutorial.step4.desc'),
            icon: MapPin,
            color: "text-red-400",
            content: (
                <div className="grid grid-cols-2 gap-2 mt-2 w-full max-w-[200px]">
                    <div className="bg-gray-800 p-2 rounded-lg text-center text-xs text-gray-300">⚽ {t('tutorial.step4.soccer')}</div>
                    <div className="bg-gray-800 p-2 rounded-lg text-center text-xs text-gray-300">🏀 {t('tutorial.step4.hoops')}</div>
                    <div className="bg-gray-800 p-2 rounded-lg text-center text-xs text-gray-300">📍 {t('tutorial.step4.nearMe')}</div>
                    <div className="bg-gray-800 p-2 rounded-lg text-center text-xs text-gray-300">📅 {t('tutorial.step4.today')}</div>
                </div>
            )
        },
        {
            id: 5,
            title: t('tutorial.step5.title'),
            desc: t('tutorial.step5.desc'),
            icon: Calendar,
            color: "text-orange-400",
            content: (
                <div className="bg-gray-800/80 p-3 rounded-xl w-full text-xs text-left space-y-2 mt-2 font-mono">
                    <div className="flex gap-2 items-center">
                        <MapPin size={12} className="text-red-400" /> <span>{t('tutorial.stepMock.park')}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Calendar size={12} className="text-orange-400" /> <span>{t('tutorial.stepMock.time')}</span>
                    </div>
                    <div className="w-full bg-neon-green text-black text-center py-1.5 rounded font-bold uppercase text-[10px]">
                        {t('tutorial.step5.create')}
                    </div>
                </div>
            )
        },
        {
            id: 6,
            title: t('tutorial.step6.title'),
            desc: t('tutorial.step6.desc'),
            icon: Menu,
            color: "text-purple-400",
            content: (
                <div className="flex gap-3 mt-2">
                    <div className="flex flex-col items-center gap-1 p-2 bg-gray-800 rounded-lg min-w-[60px]">
                        <History size={20} className="text-purple-400" />
                        <span className="text-[10px]">{t('tutorial.step6.history')}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 bg-gray-800 rounded-lg min-w-[60px]">
                        <Bookmark size={20} className="text-yellow-400" />
                        <span className="text-[10px]">{t('tutorial.step6.saved')}</span>
                    </div>
                </div>
            )
        }
    ];

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

    // LANGUAGE SELECTION SCREEN
    if (showLanguageSelect) {
        return (
            <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="w-full max-w-md bg-gray-900/50 border border-gray-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-6">
                        <Globe className="text-neon-green" size={32} />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Choose Language</h2>
                    <p className="text-gray-400 text-sm mb-8">Select your preferred language to get started.</p>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        {[
                            { code: 'en', label: 'English', flag: '🇺🇸' },
                            { code: 'ko', label: '한국어', flag: '🇰🇷' },
                            { code: 'ja', label: '日本語', flag: '🇯🇵' },
                            { code: 'zh', label: '中文', flag: '🇨🇳' }
                        ].map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageSelect(lang.code as Locale)}
                                className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2
                                    ${language === lang.code
                                        ? 'bg-neon-green/10 border-neon-green text-white'
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                <span className="text-2xl">{lang.flag}</span>
                                <span className="font-bold">{lang.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const step = STEPS[currentStep];
    const Icon = step.icon;

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">

            {/* Skip Button */}
            <button
                onClick={handleSkip}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors text-sm font-medium flex items-center gap-1 px-3 py-1 bg-gray-900 rounded-full border border-gray-800"
            >
                {t('common.skip')} <X size={14} />
            </button>

            {/* Main Card */}
            <div className="w-full max-w-4xl bg-gray-900/40 border border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px]">

                {/* Left Side: Visuals (40%) */}
                <div className="relative w-full md:w-5/12 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-800 group">
                    {/* Background Glow */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 transition-colors duration-500 ${step.color.replace('text-', 'bg-')}`}></div>

                    {/* Icon Container */}
                    <div className="relative z-10 w-32 h-32 rounded-full bg-gray-800/80 border border-gray-700/50 flex items-center justify-center shadow-lg mb-6 backdrop-blur-sm transition-transform duration-500 group-hover:scale-105">
                        <Icon size={64} className={`transition-all duration-300 ${step.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]`} />
                    </div>

                    {/* Step Indicator (Visual dots for mobile mainly) */}
                    <div className="flex gap-2 md:hidden">
                        {STEPS.map((_, idx) => (
                            <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentStep ? 'bg-white' : 'bg-gray-700'}`} />
                        ))}
                    </div>
                </div>

                {/* Right Side: Content (60%) */}
                <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-between relative bg-black/20">

                    <div>
                        {/* Step Counter */}
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                            Step {currentStep + 1} / {STEPS.length}
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                            {step.title}
                            {step.titleAccent && <span className="text-neon-green block">{step.titleAccent}</span>}
                        </h2>

                        {/* Description */}
                        <p className="text-gray-400 text-lg leading-relaxed mb-8">
                            {step.desc}
                        </p>

                        {/* Interactive Content / Visual Cue Area */}
                        {step.content && (
                            <div className="mb-8 animate-in slide-in-from-bottom-2 fade-in duration-500">
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">Preview</div>
                                {step.content}
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-auto pt-4 flex items-center justify-between">

                        {/* Desktop Dots */}
                        <div className="hidden md:flex gap-2">
                            {STEPS.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${idx === currentStep ? 'w-8 bg-neon-green' : 'w-2 bg-gray-800 hover:bg-gray-700'
                                        }`}
                                    onClick={() => setCurrentStep(idx)}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="btn-neon px-8 py-3 rounded-xl font-bold flex items-center gap-2 group ml-auto transition-all hover:scale-105"
                        >
                            {currentStep === STEPS.length - 1 ? t('common.start') : t('common.next')}
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}
