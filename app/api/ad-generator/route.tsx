import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// 🚀 GLOBAL CACHE: Fetch fonts once per container lifecycle, not per request.
// This prevents the "2x fetch" penalty on Vercel Edge.
const fontThin = fetch(new URL('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyfAZ9hjp-Ek-_EeA.woff'))
    .then((res) => res.arrayBuffer());

const fontBold = fetch(new URL('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff'))
    .then((res) => res.arrayBuffer());

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const title = searchParams.get('title') || 'Your Brand';
        const description = searchParams.get('description') || 'AI-Optimized Marketing Assets';
        // Enforce strict size limit (Edge < 4MB response, 10s timeout)
        // Truncate text to avoid massive layout shifts or processing time
        const safeTitle = title.slice(0, 50);
        const safeDesc = description.slice(0, 100);

        const [thinFontData, boldFontData] = await Promise.all([fontThin, fontBold]);

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#1E1E1E',
                        color: 'white',
                    }}
                >
                    {/* Background Pattern */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: 'linear-gradient(to right, #2a2a2a 1px, transparent 1px), linear-gradient(to bottom, #2a2a2a 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                            opacity: 0.1,
                        }}
                    />

                    {/* Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, padding: '40px', textAlign: 'center' }}>
                        <div style={{
                            fontSize: 60,
                            fontWeight: 900,
                            marginBottom: 20,
                            background: 'linear-gradient(90deg, #FFAD7A, #FFFFFF)',
                            backgroundClip: 'text',
                            color: 'transparent',
                            fontFamily: 'Inter'
                        }}>
                            {safeTitle}
                        </div>
                        <div style={{ fontSize: 30, color: '#888', fontFamily: 'Inter', maxWidth: '80%' }}>
                            {safeDesc}
                        </div>
                    </div>

                    {/* Brand Footer */}
                    <div style={{ position: 'absolute', bottom: 40, display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: 10, height: 10, background: '#FFAD7A', borderRadius: '50%', marginRight: 10 }} />
                        <div style={{ fontSize: 20, color: '#555' }}>Taylored AI Solutions</div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                fonts: [
                    {
                        name: 'Inter',
                        data: thinFontData,
                        style: 'normal',
                        weight: 100,
                    },
                    {
                        name: 'Inter',
                        data: boldFontData,
                        style: 'normal',
                        weight: 900,
                    },
                ],
            },
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
