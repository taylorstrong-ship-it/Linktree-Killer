'use client';

import { useState } from 'react';

interface ImageWithFallbackProps {
    src: string;
    alt: string;
    brandName: string;
    primaryColor: string;
    className?: string;
}

/**
 * 🎨 Premium Image Component with Gradient Fallback
 * 
 * Uses brand colors and initials when image fails to load.
 * Zero latency, zero external dependencies.
 */
export default function ImageWithFallback({
    src,
    alt,
    brandName,
    primaryColor,
    className = ''
}: ImageWithFallbackProps) {
    const [imageError, setImageError] = useState(false);

    // Extract initials from brand name (max 2 letters)
    const getInitials = (name: string): string => {
        const words = name.trim().split(/\s+/);
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        }
        return (words[0][0] + words[1][0]).toUpperCase();
    };

    // Generate gradient based on primary color
    const generateGradient = (color: string): string => {
        // Lighten and darken the primary color for gradient
        return `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`;
    };

    if (!src || imageError) {
        return (
            <div
                className={`flex items-center justify-center ${className}`}
                style={{
                    background: generateGradient(primaryColor),
                }}
            >
                <span className="text-white font-bold text-5xl tracking-tight drop-shadow-lg">
                    {getInitials(brandName)}
                </span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setImageError(true)}
        />
    );
}
