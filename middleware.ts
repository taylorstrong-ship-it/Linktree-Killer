import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const url = request.nextUrl;

    // Create Supabase client for auth checks
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options });
                    response = NextResponse.next({ request: { headers: request.headers } });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options });
                    response = NextResponse.next({ request: { headers: request.headers } });
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Protected routes - require authentication
    const protectedRoutes = ['/dashboard', '/generator', '/studio'];
    const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route));

    if (isProtectedRoute && !user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Auth routes - redirect authenticated users away
    const authRoutes = ['/login'];
    const isAuthRoute = authRoutes.some(route => url.pathname.startsWith(route));

    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Define main app routes that should NOT be rewritten as profiles
    const appRoutes = [
        '/login',
        '/onboarding',
        '/dashboard',
        '/generator',
        '/studio',
        '/builder',
        '/auth',
        '/api',
    ];

    // Check if this is an app route
    const isAppRoute = appRoutes.some(route => url.pathname.startsWith(route));

    // If it's an app route, let it through without rewriting
    if (isAppRoute) {
        return response;
    }

    // 🛡️ REWRITE LOOP PROTECTION
    // Prevent rewriting if we're already handling a profile route to avoid loops
    if (url.pathname.startsWith('/profiles')) {
        return response;
    }

    // Define Main Domains (Where the App lives)
    const mainDomains = ['localhost', 'tayloredsolutions.ai', 'vercel.app'];

    // Check if current hostname is a main domain
    const isMainDomain = mainDomains.some(domain => hostname.includes(domain));

    // If it's the main domain, don't rewrite to profiles
    if (isMainDomain) {
        return response;
    }

    // 4. THE REWRITE (For Custom Domains ONLY)
    // If we are here, the user is on "bio.customdomain.com".
    // We rewrite the URL behind the scenes to a special profile folder.
    // Example: bio.customdomain.com/about -> /profiles/bio.customdomain.com/about

    // Clone the URL to avoid mutating the original request for logging/analytics
    const urlRewrite = request.nextUrl.clone();
    urlRewrite.pathname = `/profiles/${hostname}${url.pathname}`;

    return NextResponse.rewrite(urlRewrite);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        "/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)",
    ],
};
