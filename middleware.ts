import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const url = request.nextUrl;

    // 1. Define Main Domains (Where the App/Builder lives)
    const mainDomains = ['localhost', 'tayloredsolutions.ai', 'vercel.app'];

    // 2. Check if current hostname is a main domain
    const isMainDomain = mainDomains.some(domain => hostname.includes(domain));

    // 3. TRAFFIC CONTROL & INFINITE LOOP PROTECTION
    // 🔓 PUBLIC ACCESS: Main Domain is always open
    if (isMainDomain) {
        return NextResponse.next();
    }

    // 🛡️ REWRITE LOOP PROTECTION
    // Prevent rewriting if we're already handling a profile route to avoid loops
    if (url.pathname.startsWith('/profiles')) {
        return NextResponse.next();
    }

    // 4. THE REWRITE (For Custom Domains)
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
