'use client'

import { useDragControls, Reorder, motion } from 'framer-motion'
import { GripVertical, Trash2 } from 'lucide-react'

interface Link {
    title: string
    url: string
}

interface LinkItemProps {
    link: Link
    index: number
    onUpdate: (index: number, field: 'title' | 'url', value: string) => void
    onRemove: (index: number) => void
}

export function LinkItem({ link, index, onUpdate, onRemove }: LinkItemProps) {
    const dragControls = useDragControls()

    return (
        <Reorder.Item
            value={link}
            id={link.url + index} // Use a unique ID combination or just link itself if object reference is stable. 
            // Ideally links should have unique IDs. 
            // In page.tsx links are object literals, maybe strict equals works.
            // But Reorder needs `value` to match item in array.

            dragListener={false}
            dragControls={dragControls}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileDrag={{ scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.3)" }}
            className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 relative mb-3 group"
        >
            <div className="flex items-start gap-3">
                {/* Drag Handle - Mobile Optimized with Touch Area */}
                <div
                    onPointerDown={(e) => dragControls.start(e)}
                    className="mt-3 text-gray-500 hover:text-gray-300 transition-colors cursor-grab active:cursor-grabbing touch-none p-2 -m-2 z-10"
                >
                    <GripVertical size={20} />
                </div>

                {/* Input Fields */}
                <div className="flex-1 grid gap-2.5">
                    <input
                        type="text"
                        value={link.title}
                        onChange={(e) => onUpdate(index, 'title', e.target.value)}
                        placeholder="Link Title"
                        className="w-full p-2.5 text-sm bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                    />
                    <input
                        type="text"
                        value={link.url}
                        onChange={(e) => onUpdate(index, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full p-2.5 text-xs bg-gray-900/50 border border-gray-700/50 rounded-md text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
                    />
                </div>

                {/* Delete Button */}
                <button
                    onClick={() => onRemove(index)}
                    className="mt-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete"
                    aria-label="Delete link"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </Reorder.Item>
    )
}
