'use client';

import { useLanguage } from '@/context/language-context';

export default function AuthLanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="absolute top-4 right-4 z-50">
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-black/50 text-white border border-gray-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-neon-green backdrop-blur-sm"
            >
                <option value="en">English</option>
                <option value="ko">한국어</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
            </select>
        </div>
    );
}
