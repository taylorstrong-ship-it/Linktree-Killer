import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Linktree Killer - Link in Bio Builder",
    description: "Multi-user Linktree builder with AI auto-import",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Caveat:wght@400;700&family=Permanent+Marker&display=swap"
                />
            </head>
            <body className="font-sans antialiased">
                {/* SVG Filters for Liquid Neon Effects */}
                <svg height="0" width="0" style={{ position: 'absolute', visibility: 'hidden' }}>
                    <defs>
                        {/* 1. LIQUID RIPPLE FILTER (For Text) */}
                        <filter id="liquid-ripple">
                            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" />
                            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
                        </filter>
                        {/* 2. NEON GLOW FILTER (For Arrow) */}
                        <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                </svg>
                {children}
            </body>
        </html>
    );
}
