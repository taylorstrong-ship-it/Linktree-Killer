'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface InfiniteCanvasWorldProps {
    viewState: 'home' | 'about' | 'contact';
    children: ReactNode;
}

export function InfiniteCanvasWorld({ viewState, children }: InfiniteCanvasWorldProps) {
    // Camera position logic: slide the WORLD container
    const cameraPosition = {
        home: 0,
        about: '100vw',    // Slide world RIGHT to reveal left section
        contact: '-100vw'  // Slide world LEFT to reveal right section
    }[viewState];

    return (
        <motion.div
            animate={{ x: cameraPosition }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
            }}
            className="flex flex-nowrap min-h-screen"
            style={{
                width: '300vw', // 3 sections wide
                willChange: 'transform' // GPU optimization
            }}
        >
            {children}
        </motion.div>
    );
}

interface WorldSectionProps {
    children: ReactNode;
    className?: string;
}

export function WorldSection({ children, className = '' }: WorldSectionProps) {
    return (
        <section className={`min-h-screen w-screen flex-shrink-0 ${className}`}>
            {children}
        </section>
    );
}
