
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        // @ts-ignore
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        // Middleware will handle session refresh, but here we exchange code
                        // We can't set cookies on request, but we need to on response
                        // This dance is handled by @supabase/ssr usually 
                        // but in Route Handler we need to prepare response
                    },
                },
            }
        )

        // Exchange Code for Session
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Forward to next URL (or home)
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocal = origin.includes('localhost')

            if (isLocal) {
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // Auth Error or No Code
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
