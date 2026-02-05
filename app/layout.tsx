import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: {
        default: "Taylored AI Solutions | High-Performance AI Software",
        template: "%s | Taylored AI Solutions",
    },
    description: "High-performance AI software solutions built for indie hackers and modern teams. Link in bio builder with AI auto-import.",
    applicationName: "Taylored AI Solutions",
    authors: [{ name: "Taylored AI Solutions" }],
    keywords: ["AI", "software", "high-performance", "link in bio", "indie hacker", "automation"],
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.tayloredsolutions.ai"),
    openGraph: {
        title: "Taylored AI Solutions | High-Performance AI Software",
        description: "High-performance AI software solutions built for indie hackers and modern teams.",
        type: "website",
        locale: "en_US",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Taylored AI Solutions - AI, Taylored to Your Exact Vibe",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Taylored AI Solutions | High-Performance AI Software",
        description: "High-performance AI software solutions built for indie hackers and modern teams.",
        images: ["/og-image.png"],
    },
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
