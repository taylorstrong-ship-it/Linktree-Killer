'use client'

interface LivingBackgroundProps {
    primaryColor: string
    secondaryColor: string
    animationSpeed: 'slow' | 'medium' | 'fast'
    animationType: 'drift' | 'pulse' | 'swirl' | 'lava'
}

export default function LivingBackground({
    primaryColor,
    secondaryColor,
    animationSpeed,
    animationType
}: LivingBackgroundProps) {
    // Map animation speed to CSS duration
    const getAnimationDuration = () => {
        switch (animationSpeed) {
            case 'slow': return '20s'
            case 'medium': return '10s'
            case 'fast': return '4s'
            default: return '10s'
        }
    }

    // Generate a lighter version of primary color for additional blobs
    const getLighterShade = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)

        const newR = Math.min(r + 40, 255)
        const newG = Math.min(g + 40, 255)
        const newB = Math.min(b + 40, 255)

        return `rgb(${newR}, ${newG}, ${newB})`
    }

    const lighterPrimary = getLighterShade(primaryColor)
    const duration = getAnimationDuration()

    // Soft Lava Lamp Rendering - Dark Mode Safe
    if (animationType === 'lava') {
        // Helper to create semi-transparent color variants
        const hexToRgba = (hex: string, alpha: number) => {
            const r = parseInt(hex.slice(1, 3), 16)
            const g = parseInt(hex.slice(3, 5), 16)
            const b = parseInt(hex.slice(5, 7), 16)
            return `rgba(${r}, ${g}, ${b}, ${alpha})`
        }

        return (
            <>
                {/* Soft Lava Container - NO FILTERS */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Lava Bubble 1 - Primary, Tall */}
                    <div
                        className="absolute rounded-full blur-3xl"
                        style={{
                            width: '8rem',      // w-32
                            height: '12rem',    // h-48 - taller for wax effect
                            background: hexToRgba(primaryColor, 0.5),
                            bottom: '-20%',
                            left: '8%',
                            animation: 'floatUp 18s ease-in-out infinite',
                            animationDelay: '0s'
                        }}
                    />

                    {/* Lava Bubble 2 - Secondary, Medium */}
                    <div
                        className="absolute rounded-full blur-3xl"
                        style={{
                            width: '7rem',
                            height: '11rem',
                            background: hexToRgba(secondaryColor, 0.6),
                            bottom: '-20%',
                            left: '25%',
                            animation: 'floatUp 22s ease-in-out infinite',
                            animationDelay: '5s'
                        }}
                    />

                    {/* Lava Bubble 3 - Lighter Primary */}
                    <div
                        className="absolute rounded-full blur-3xl"
                        style={{
                            width: '6rem',
                            height: '10rem',
                            background: hexToRgba(lighterPrimary, 0.4),
                            bottom: '-20%',
                            left: '45%',
                            animation: 'floatUp 20s ease-in-out infinite',
                            animationDelay: '12s'
                        }}
                    />

                    {/* Lava Bubble 4 - Secondary Variant */}
                    <div
                        className="absolute rounded-full blur-3xl"
                        style={{
                            width: '9rem',
                            height: '13rem',
                            background: hexToRgba(secondaryColor, 0.45),
                            bottom: '-20%',
                            right: '25%',
                            animation: 'floatUp 19s ease-in-out infinite',
                            animationDelay: '8s'
                        }}
                    />

                    {/* Lava Bubble 5 - Primary Variant */}
                    <div
                        className="absolute rounded-full blur-3xl"
                        style={{
                            width: '7.5rem',
                            height: '11.5rem',
                            background: hexToRgba(primaryColor, 0.55),
                            bottom: '-20%',
                            right: '8%',
                            animation: 'floatUp 25s ease-in-out infinite',
                            animationDelay: '3s'
                        }}
                    />

                    {/* Lava Bubble 6 - Center Light Accent */}
                    <div
                        className="absolute rounded-full blur-3xl"
                        style={{
                            width: '5rem',
                            height: '9rem',
                            background: hexToRgba(lighterPrimary, 0.35),
                            bottom: '-20%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            animation: 'floatUp 15s ease-in-out infinite',
                            animationDelay: '10s'
                        }}
                    />
                </div>

                {/* Soft Lava Float Animation */}
                <style jsx>{`
                    @keyframes floatUp {
                        0% {
                            transform: translateY(0) scale(1);
                            opacity: 0;
                        }
                        20% {
                            opacity: 1;
                        }
                        50% {
                            transform: translateY(-60vh) scale(0.8);
                        }
                        100% {
                            transform: translateY(-120vh) scale(1.2);
                            opacity: 0;
                        }
                    }
                `}</style>
            </>
        )
    }

    // Standard Animations (drift, pulse, swirl)
    return (
        <>
            {/* Living Gradients Container */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Blob 1 - Primary Color */}
                <div
                    className="absolute w-96 h-96 rounded-full blur-3xl opacity-40"
                    style={{
                        background: primaryColor,
                        top: '-10%',
                        left: '-10%',
                        animation: `${animationType}-1 ${duration} ease-in-out infinite`
                    }}
                />

                {/* Blob 2 - Secondary Color */}
                <div
                    className="absolute w-80 h-80 rounded-full blur-3xl opacity-40"
                    style={{
                        background: secondaryColor,
                        bottom: '-10%',
                        right: '-10%',
                        animation: `${animationType}-2 ${duration} ease-in-out infinite`
                    }}
                />

                {/* Blob 3 - Lighter Primary */}
                <div
                    className="absolute w-72 h-72 rounded-full blur-3xl opacity-30"
                    style={{
                        background: lighterPrimary,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        animation: `${animationType}-3 ${duration} ease-in-out infinite`
                    }}
                />
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                /* DRIFT Animations - Subtle floating movement */
                @keyframes drift-1 {
                    0%, 100% {
                        transform: translate(0px, 0px);
                    }
                    50% {
                        transform: translate(40px, 30px);
                    }
                }

                @keyframes drift-2 {
                    0%, 100% {
                        transform: translate(0px, 0px);
                    }
                    50% {
                        transform: translate(-40px, -30px);
                    }
                }

                @keyframes drift-3 {
                    0%, 100% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 0.3;
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1.1);
                        opacity: 0.4;
                    }
                }

                /* PULSE Animations - Breathing/scaling effect */
                @keyframes pulse-1 {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.4;
                    }
                    50% {
                        transform: scale(1.3);
                        opacity: 0.6;
                    }
                }

                @keyframes pulse-2 {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.4;
                    }
                    50% {
                        transform: scale(1.4);
                        opacity: 0.5;
                    }
                }

                @keyframes pulse-3 {
                    0%, 100% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 0.3;
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1.5);
                        opacity: 0.5;
                    }
                }

                /* SWIRL Animations - Rotating around center */
                @keyframes swirl-1 {
                    0% {
                        transform: rotate(0deg) translateX(50px) rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg) translateX(50px) rotate(-360deg);
                    }
                }

                @keyframes swirl-2 {
                    0% {
                        transform: rotate(0deg) translateX(-50px) rotate(0deg);
                    }
                    100% {
                        transform: rotate(-360deg) translateX(-50px) rotate(360deg);
                    }
                }

                @keyframes swirl-3 {
                    0% {
                        transform: translate(-50%, -50%) rotate(0deg) scale(1);
                        opacity: 0.3;
                    }
                    50% {
                        transform: translate(-50%, -50%) rotate(180deg) scale(1.2);
                        opacity: 0.5;
                    }
                    100% {
                        transform: translate(-50%, -50%) rotate(360deg) scale(1);
                        opacity: 0.3;
                    }
                }
            `}</style>
        </>
    )
}
