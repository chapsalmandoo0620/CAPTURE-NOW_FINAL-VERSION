
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const cookieStore: any[] = [];
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach((cookie) => cookieStore.push(cookie));
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

            let redirectUrl = `${origin}${next}`
            if (forwardedHost && !isLocal) {
                redirectUrl = `https://${forwardedHost}${next}`
            }

            const response = NextResponse.redirect(redirectUrl)

            // Apply captured cookies to the response
            cookieStore.forEach((cookie) => {
                response.cookies.set(cookie.name, cookie.value, cookie.options)
            })

            return response
        }
    }

    // Auth Error or No Code
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
