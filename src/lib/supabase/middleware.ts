import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname;

    // 1. If user is NOT logged in
    // 1. If user is NOT logged in
    if (!user) {
        // Protect private routes
        // DISABLED for Mock Prototype: We use client-side localStorage check in layout.tsx
        /*
        if (path.startsWith('/onboarding') ||
            path.startsWith('/meet') ||
            path.startsWith('/upload') ||
            path.startsWith('/profile')) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        */
    }

    // 2. If user IS logged in
    // 2. If user IS logged in
    /*
    if (user) {
        // Redirect away from auth pages
        if (path === '/login' || path === '/signup') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }
    */

    return supabaseResponse
}
