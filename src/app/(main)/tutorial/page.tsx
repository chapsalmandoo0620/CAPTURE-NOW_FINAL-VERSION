'use client';

import React, { Suspense } from 'react';
import TutorialOverlay from '@/components/tutorial-overlay';
import { useRouter, useSearchParams } from 'next/navigation';

function TutorialContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isNewUser = searchParams.get('new') === 'true';

    const handleComplete = () => {
        router.push('/');
    };

    return <TutorialOverlay onComplete={handleComplete} isNewUser={isNewUser} />;
}

export default function TutorialPage() {
    return (
        <div className="relative min-h-screen bg-black">
            {/* Background (Blurred version of Feed or just simple brand background) */}
            <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm" style={{ backgroundImage: 'url(/splash-bg.jpg)' }}>
                {/* Fallback pattern if image missing */}
                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black"></div>
            </div>

            <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-neon-green">Loading...</div>}>
                <TutorialContent />
            </Suspense>
        </div>
    );
}
