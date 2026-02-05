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
    const positions = {
        home: 0,
        about: '100vw',    // Push world RIGHT to reveal About (left)
        contact: '-100vw'  // Push world LEFT to reveal Contact (right)
    };

    // "Tease" animation on mount - hint that UI is swipeable
    useEffect(() => {
        const teaseSequence = async () => {
            await controls.start({ x: -20, transition: { duration: 0.3, ease: 'easeOut' } });
            await controls.start({ x: 20, transition: { duration: 0.4, ease: 'easeInOut' } });
            await controls.start({ x: 0, transition: { duration: 0.3, ease: 'easeOut' } });
        };

        // Run tease after brief delay
        const timeout = setTimeout(teaseSequence, 1000);
        return () => clearTimeout(timeout);
    }, [controls]);

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

            {/* Draggable world container */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }} // Rubber-band effect
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
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

// Navigation HUD Component
interface WorldNavigationProps {
    viewState: ViewState;
    onNavigate: (target: ViewState) => void;
}

function WorldNavigation({ viewState, onNavigate }: WorldNavigationProps) {
    return (
        <>
            {/* LEFT: WHO WE ARE (hidden on About) */}
            {viewState !== 'about' && (
                <button
                    onClick={() => onNavigate('about')}
                    className="fixed left-4 bottom-8 z-50 flex items-center gap-2 px-4 py-3
                     bg-white/5 backdrop-blur-sm border border-white/10 rounded-full
                     hover:bg-white/10 transition-all"
                >
                    <svg width="24" height="24" viewBox="0 0 100 100" className="text-[#FF6B35]">
                        <path d="M 80 50 L 20 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                        <path d="M 35 35 L 20 50 L 35 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
                    </svg>
                    <span
                        className="text-sm font-bold"
                        style={{
                            fontFamily: "'Permanent Marker', cursive",
                            color: '#FF6B35',
                            textShadow: '0 0 10px #FF6B35'
                        }}
                    >
                        WHO WE ARE
                    </span>
                </button>
            )}

            {/* RIGHT: GET IN TOUCH (hidden on Contact) */}
            {viewState !== 'contact' && (
                <button
                    onClick={() => onNavigate('contact')}
                    className="fixed right-4 bottom-8 z-50 flex items-center gap-2 px-4 py-3
                     bg-white/5 backdrop-blur-sm border border-white/10 rounded-full
                     hover:bg-white/10 transition-all"
                >
                    <span
                        className="text-sm font-bold"
                        style={{
                            fontFamily: "'Permanent Marker', cursive",
                            color: '#FF6B35',
                            textShadow: '0 0 10px #FF6B35'
                        }}
                    >
                        GET IN TOUCH
                    </span>
                    <svg width="24" height="24" viewBox="0 0 100 100" className="text-[#FF6B35]">
                        <path d="M 20 50 L 80 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                        <path d="M 65 35 L 80 50 L 65 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
                    </svg>
                </button>
            )}

            {/* BACK HOME (visible on About & Contact) */}
            {viewState !== 'home' && (
                <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => onNavigate('home')}
                    className="fixed top-24 left-1/2 -translate-x-1/2 z-50
                     flex items-center gap-3 px-6 py-3
                     bg-white/5 backdrop-blur-sm border border-white/10 rounded-full
                     hover:bg-white/10 transition-all"
                >
                    <svg width="24" height="24" viewBox="0 0 100 100" className="text-[#FF6B35]">
                        <path d="M 70 50 L 30 50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                        <path d="M 45 35 L 30 50 L 45 65" stroke="currentColor" strokeWidth="8" strokeLinecap="round" fill="none" />
                    </svg>
                    <span
                        className="text-lg font-bold"
                        style={{
                            fontFamily: "'Permanent Marker', cursive",
                            color: '#FF6B35',
                            textShadow: '0 0 10px #FF6B35'
                        }}
                    >
                        HOME
                    </span>
                </motion.button>
            )}
        </>
    );
}
