import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl;

    // Get hostname (e.g., 'bio.hairbyshea.com' or 'localhost:3000')
    let hostname = req.headers.get('host') || '';

    // Remove port if present (for localhost testing)
    hostname = hostname.split(':')[0];

    // Define domains to ignore (main app domains)
    // Adjust these based on your actual production domains
    const allowedDomains = ['localhost', 'taylored.bio', 'linktreekiller.vercel.app', 'www.taylored.bio'];

    // Check if the current hostname is one of our main domains
    const isMainDomain = allowedDomains.includes(hostname) || hostname.endsWith('.vercel.app');

    // 🕵️ CUSTOM DOMAIN DETECTED
    if (!isMainDomain) {
        // Rewrite the request to the dynamic profile route
        // The user sees 'bio.hairbyshea.com' in the browser
        // But Next.js renders '/app/public-profile/bio.hairbyshea.com'
        console.log(`🔌 Universal Adapter: Rerouting ${hostname} to /public-profile/${hostname}`);
        return NextResponse.rewrite(new URL(`/public-profile/${hostname}`, req.url));
    }

    return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. /favicon.ico, sitemap.xml, robots.txt
         */
        '/((?!api|_next|_static|favicon.ico).*)',
    ],
};
