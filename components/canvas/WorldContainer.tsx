'use client';

import { useState, useEffect, ReactNode } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { useRouter } from 'next/navigation';

type ViewState = 'home' | 'about' | 'contact';

interface WorldContainerProps {
    children: ReactNode;
}

export function WorldContainer({ children }: WorldContainerProps) {
    const [viewState, setViewState] = useState<ViewState>('home');
    const controls = useAnimation();
    const router = useRouter();

    // Camera position mapping
    // Physical DOM order: [About, Home/Scanner, Contact]
    // To show middle child (Scanner) at #home, camera translates LEFT (-100vw)
    const positions = {
        about: 0,          // Camera at 0 shows first child (About)
        home: '-100vw',    // Camera at -100vw shows middle child (Scanner) 
        contact: '-200vw'  // Camera at -200vw shows third child (Contact)
    };

    // DISABLED: Tease animation was causing unwanted auto-panning
    // useEffect(() => {
    //     const teaseSequence = async () => {
    //         await controls.start({ x: -20, transition: { duration: 0.3, ease: 'easeOut' } });
    //         await controls.start({ x: 20, transition: { duration: 0.4, ease: 'easeInOut' } });
    //         await controls.start({ x: 0, transition: { duration: 0.3, ease: 'easeOut' } });
    //     };
    //     const timeout = setTimeout(teaseSequence, 1000);
    //     return () => clearTimeout(timeout);
    // }, [controls]);

    // Sync viewState with hash-based routing (browser back button support)
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '') as ViewState;
            if (['home', 'about', 'contact'].includes(hash)) {
                setViewState(hash);
            } else {
                // Force redirect to #home if no valid hash
                setViewState('home');
                window.history.replaceState(null, '', '#home');
            }
        };

        // Set initial state from hash
        handleHashChange();

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Update hash when viewState changes
    useEffect(() => {
        const currentHash = window.location.hash.replace('#', '');
        if (currentHash !== viewState) {
            window.history.pushState(null, '', `#${viewState}`);
        }
    }, [viewState]);

    // Animate to current viewState
    useEffect(() => {
        controls.start({
            x: positions[viewState],
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        });
    }, [viewState, controls]);

    // Handle drag end - snap to nearest section
    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const { offset, velocity } = info;
        const swipeThreshold = 50;
        const velocityThreshold = 500;

        // Strong swipe (velocity-based)
        if (Math.abs(velocity.x) > velocityThreshold) {
            if (velocity.x > 0) {
                // Swiped right
                navigateRelative('left');
            } else {
                // Swiped left
                navigateRelative('right');
            }
            return;
        }

        // Gentle drag (offset-based)
        if (Math.abs(offset.x) > swipeThreshold) {
            if (offset.x > 0) {
                navigateRelative('left');
            } else {
                navigateRelative('right');
            }
        } else {
            // Not enough drag - bounce back
            controls.start({
                x: positions[viewState],
                transition: { type: 'spring', stiffness: 300, damping: 30 }
            });
        }
    };

    // Navigate relative to current position
    const navigateRelative = (direction: 'left' | 'right') => {
        const stateOrder: ViewState[] = ['about', 'home', 'contact'];
        const currentIndex = stateOrder.indexOf(viewState);

        if (direction === 'left' && currentIndex > 0) {
            setViewState(stateOrder[currentIndex - 1]);
        } else if (direction === 'right' && currentIndex < stateOrder.length - 1) {
            setViewState(stateOrder[currentIndex + 1]);
        } else {
            // At boundary - bounce back
            controls.start({
                x: positions[viewState],
                transition: { type: 'spring', stiffness: 300, damping: 30 }
            });
        }
    };

    // Public navigation function for HUD buttons
    const navigateTo = (target: ViewState) => {
        setViewState(target);
    };

    return (
        <div className="relative w-full min-h-screen overflow-hidden" style={{ touchAction: 'none' }}>
            {/* Parallax background grid */}
            <motion.div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px'
                }}
                animate={{
                    backgroundPositionX: viewState === 'about' ? '25vw' : viewState === 'contact' ? '-25vw' : '0'
                }}
                transition={{ type: 'spring', stiffness: 250, damping: 35 }}
            />

            {/* World container - drag disabled, button navigation only */}
            <motion.div
                animate={controls}
                className="flex flex-nowrap min-h-screen relative z-10"
                style={{ width: '300vw' }} // 3 sections wide
            >
                {children}
            </motion.div>

            {/* Liquid Chalk HUD Navigation (Fallback for non-swipers) */}
            <WorldNavigation viewState={viewState} onNavigate={navigateTo} />
        </div>
    );
}

// Navigation HUD Component - Simplified Left/Right Arrows
interface WorldNavigationProps {
    viewState: ViewState;
    onNavigate: (target: ViewState) => void;
}

function WorldNavigation({ viewState, onNavigate }: WorldNavigationProps) {
    // Carousel navigation: About ← HOME → Contact
    const handleLeftClick = () => {
        if (viewState === 'home') {
            onNavigate('about');
        } else if (viewState === 'contact') {
            onNavigate('home');
        }
        // From 'about': do nothing (already at left boundary)
    };

    const handleRightClick = () => {
        if (viewState === 'home') {
            onNavigate('contact');
        } else if (viewState === 'about') {
            onNavigate('home');
        }
        // From 'contact': do nothing (already at right boundary)
    };

    // Show left arrow for HOME and Contact
    const showLeftArrow = viewState === 'home' || viewState === 'contact';
    // Show right arrow for HOME and About
    const showRightArrow = viewState === 'home' || viewState === 'about';

    return (
        <>
            {/* LEFT ARROW */}
            {showLeftArrow && (
                <button
                    onClick={handleLeftClick}
                    className="fixed left-4 bottom-8 z-50 p-4
                     bg-white/5 backdrop-blur-sm border border-white/10 rounded-full
                     hover:bg-white/10 transition-all
                     active:scale-95"
                    aria-label="Navigate left"
                >
                    <svg width="32" height="32" viewBox="0 0 100 100" className="text-[#FF6B35]">
                        <path d="M 70 20 L 30 50 L 70 80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                </button>
            )}

            {/* RIGHT ARROW */}
            {showRightArrow && (
                <button
                    onClick={handleRightClick}
                    className="fixed right-4 bottom-8 z-50 p-4
                     bg-white/5 backdrop-blur-sm border border-white/10 rounded-full
                     hover:bg-white/10 transition-all
                     active:scale-95"
                    aria-label="Navigate right"
                >
                    <svg width="32" height="32" viewBox="0 0 100 100" className="text-[#FF6B35]">
                        <path d="M 30 20 L 70 50 L 30 80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                </button>
            )}
        </>
    );
}
