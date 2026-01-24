'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Plus, User, Menu, Aperture } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const NAV_ITEMS = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/meet', icon: Search, label: 'Meet' },
    { href: '/upload', icon: Plus, label: 'Upload', isSpecial: true }, // Special styling flag
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/menu', icon: Menu, label: 'Menu' },
];

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    // Check for profile existence immediately on mount
    useEffect(() => {
        const checkProfile = async () => {
            // We only check if we are NOT already on onboarding (though layout doesn't wrap it, good to be safe)
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('id')
                    .eq('id', user.id)
                    .single();

                // If no public profile exists, this is a new OAuth user -> Onboarding
                if (!profile) {
                    router.replace('/onboarding');
                }
            }
        };
        checkProfile();
    }, [pathname, router]);

    return (
        <div className="flex justify-center min-h-screen bg-black">
            <div className="w-full max-w-md bg-black relative flex flex-col min-h-screen border-x border-gray-900">

                {/* Header (Visible only on Home/Feed for now, or global?) */}
                {/* We can make the header part of page.tsx if it varies, but explicit header here is fine too. 
            Let's keep it simple: Header is part of the layout for now, or just the bottom nav. 
            Actually, commonly header changes per page. Let's leave header to the pages for flexibility, 
            OR implement a common Top Nav. 
            For now, I'll put Bottom Nav here. */}

                <main className="flex-1 pb-24">
                    {children}
                </main>

                {/* Bottom Navigation */}
                <nav className="fixed bottom-0 w-full max-w-md bg-black/95 backdrop-blur-md border-t border-gray-800 z-50 pb-safe">
                    <div className="flex justify-between items-end h-16 px-2">
                        {NAV_ITEMS.map(({ href, icon: Icon, label, isSpecial }) => {
                            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

                            if (isSpecial) {
                                return (
                                    <div key={href} className="relative -top-5 flex justify-center w-1/5">
                                        <Link
                                            href={href}
                                            className="bg-neon-green text-black w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.4)] border-4 border-black transition-transform active:scale-95"
                                        >
                                            <Aperture size={28} strokeWidth={2.5} />
                                        </Link>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        "flex flex-col items-center justify-center w-1/5 h-full space-y-1 transition-colors pb-2",
                                        isActive ? "text-neon-green" : "text-gray-500 hover:text-gray-300"
                                    )}
                                >
                                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="text-[10px] font-medium">{label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </div>
    );
}
