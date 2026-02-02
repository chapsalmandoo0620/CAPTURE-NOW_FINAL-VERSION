'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dictionaries, Locale } from '@/lib/i18n/dictionaries';

type Dictionary = typeof dictionaries.en;

interface LanguageContextType {
    language: Locale;
    setLanguage: (lang: Locale) => void;
    t: (key: string) => string;
    dictionary: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Locale>('en');

    useEffect(() => {
        // Load persistency
        const saved = localStorage.getItem('capture-now-lang') as Locale;
        if (saved && dictionaries[saved]) {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (lang: Locale) => {
        setLanguageState(lang);
        localStorage.setItem('capture-now-lang', lang);
    };

    // Helper to access nested keys like 'tutorial.step1.title'
    const t = (path: string): string => {
        const keys = path.split('.');
        let current: any = dictionaries[language];

        for (const key of keys) {
            if (current[key] === undefined) {
                // Fallback to English if translation missing
                let fallback: any = dictionaries['en'];
                for (const fbKey of keys) {
                    fallback = fallback?.[fbKey];
                }
                return fallback || path; // Return key if absolutely nothing found
            }
            current = current[key];
        }
        return current as string;
    };

    const value = {
        language,
        setLanguage,
        t,
        dictionary: dictionaries[language]
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
