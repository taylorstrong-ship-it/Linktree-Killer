'use client'

import { useState, useRef, useEffect } from 'react'

interface CompareSliderProps {
    imageBefore: string
    imageAfter: string
}

export default function CompareSlider({ imageBefore, imageAfter }: CompareSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50) // Percentage (0-100)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Handle mouse/touch move
    const handleMove = (clientX: number) => {
        if (!containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const x = clientX - rect.left
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
        setSliderPosition(percentage)
    }

    // Mouse events
    const handleMouseDown = () => setIsDragging(true)

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return
        handleMove(e.clientX)
    }

    const handleMouseUp = () => setIsDragging(false)

    // Touch events
    const handleTouchStart = () => setIsDragging(true)

    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging || !e.touches[0]) return
        handleMove(e.touches[0].clientX)
    }

    const handleTouchEnd = () => setIsDragging(false)

    // Add/remove global event listeners
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
            window.addEventListener('touchmove', handleTouchMove)
            window.addEventListener('touchend', handleTouchEnd)
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('touchmove', handleTouchMove)
            window.removeEventListener('touchend', handleTouchEnd)
        }
    }, [isDragging])

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 cursor-ew-resize select-none"
            style={{ touchAction: 'none' }}
        >
            {/* After Image (Full width - bottom layer) */}
            <div className="absolute inset-0">
                <img
                    src={imageAfter}
                    alt="After"
                    className="w-full h-full object-cover"
                    draggable={false}
                />
                {/* "After" Badge */}
                <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                    After
                </div>
            </div>

            {/* Before Image (Clipped by slider position - top layer) */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
            >
                <img
                    src={imageBefore}
                    alt="Before"
                    className="w-full h-full object-cover"
                    style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }}
                    draggable={false}
                />
                {/* "Before" Badge */}
                <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                    Before
                </div>
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                {/* Handle Circle with Arrows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-gray-200 hover:scale-110 transition-transform">
                    <svg
                        className="w-6 h-6 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M8 7l-5 5 5 5M16 7l5 5-5 5"
                        />
                    </svg>
                </div>
            </div>

            {/* Instruction hint (shows when not dragging) */}
            {!isDragging && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-medium px-4 py-2 rounded-full backdrop-blur-sm pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                    ← Drag to compare →
                </div>
            )}
        </div>
    )
}
