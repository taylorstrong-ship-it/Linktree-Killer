'use client'

import { Reorder, useDragControls, motion } from 'framer-motion'
import { GripVertical, Pencil, Trash2, Ghost } from 'lucide-react'
import { useState, memo } from 'react'

interface Link {
    title: string
    url: string
    position?: number
}

interface SortableLinksListProps {
    links: Link[]
    onChange: (newLinks: Link[]) => void
}

export function SortableLinksList({ links, onChange }: SortableLinksListProps) {
    // 🎯 EMPTY STATE: Show ghost placeholder if no links
    if (links.length === 0) {
        return (
            <div className="space-y-3">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-xl border-2 border-dashed border-white/10 bg-white/5 p-12 text-center"
                >
                    {/* Animated Ghost Icon */}
                    <motion.div
                        animate={{
                            y: [0, -10, 0],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="mb-4 flex justify-center"
                    >
                        <Ghost className="w-16 h-16 text-gray-600" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">No Links Yet</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Drop your first link to start the engine.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            onChange([{ title: '', url: '', position: 0 }])
                        }}
                        className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
                    >
                        Create First Link
                    </motion.button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <Reorder.Group
                axis="y"
                values={links}
                onReorder={onChange}
                className="space-y-3"
            >
                {links.map((link, index) => (
                    <SortableItem
                        key={`link-${index}-${link.title || 'new'}`}
                        link={link}
                        index={index}
                        onUpdate={(field, value) => {
                            const updated = [...links]
                            updated[index] = { ...updated[index], [field]: value }
                            onChange(updated)
                        }}
                        onDelete={() => {
                            const updated = links.filter((_, i) => i !== index)
                            onChange(updated)
                        }}
                    />
                ))}
            </Reorder.Group>

            {/* Add New Link Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                    onChange([...links, { title: '', url: '', position: links.length }])
                }}
                className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2 font-medium"
            >
                <i className="fa-solid fa-plus"></i>
                Add Link
            </motion.button>
        </div>
    )
}

interface SortableItemProps {
    link: Link
    index: number
    onUpdate: (field: 'title' | 'url', value: string) => void
    onDelete: () => void
}

const SortableItem = memo(function SortableItem({ link, index, onUpdate, onDelete }: SortableItemProps) {
    const dragControls = useDragControls()
    const [isDragging, setIsDragging] = useState(false)
    const [showSuccessGlow, setShowSuccessGlow] = useState(false)

    return (
        <Reorder.Item
            value={link}
            dragListener={false} // 🔒 CRITICAL: Disable default drag
            dragControls={dragControls}
            dragElastic={0.1} // Premium resistance feel
            onDragStart={() => {
                setIsDragging(true)
                // 📳 Haptic feedback on pickup
                if (navigator.vibrate) {
                    navigator.vibrate(20)
                }
            }}
            onDragEnd={() => {
                setIsDragging(false)
                // ✨ SUCCESS GLOW: Trigger green flash on drop
                setShowSuccessGlow(true)
                setTimeout(() => setShowSuccessGlow(false), 1000)
            }}
            style={{ willChange: isDragging ? 'transform' : 'auto' }}
            className="relative"
        >
            <motion.div
                animate={{
                    scale: isDragging ? 1.02 : 1,
                    boxShadow: isDragging
                        ? '0 20px 40px rgba(0, 0, 0, 0.3)'
                        : '0 0 0 rgba(0, 0, 0, 0)',
                    borderColor: showSuccessGlow
                        ? 'rgba(0, 255, 65, 0.5)' // Hacker Green
                        : 'rgba(255, 255, 255, 0.1)'
                }}
                transition={{
                    duration: 0.2,
                    borderColor: { duration: 1, ease: "easeOut" }
                }}
                className="bg-white/5 border rounded-xl p-4 space-y-3 cursor-default relative overflow-hidden"
            >
                {/* Success Glow Overlay */}
                {showSuccessGlow && (
                    <motion.div
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute inset-0 bg-[#00FF41]/10 pointer-events-none"
                    />
                )}

                <div className="flex items-start gap-3">
                    {/* Content Section - NOT draggable */}
                    <div className="flex-1 space-y-3 min-w-0">
                        {/* Title Input */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 block mb-1">
                                Link Title
                            </label>
                            <input
                                type="text"
                                value={link.title}
                                onChange={(e) => onUpdate('title', e.target.value)}
                                placeholder="Shop Now"
                                className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                            />
                        </div>

                        {/* URL Input */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 block mb-1">
                                Destination URL
                            </label>
                            <input
                                type="url"
                                value={link.url}
                                onChange={(e) => onUpdate('url', e.target.value)}
                                placeholder="https://example.com"
                                className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition truncate"
                            />
                        </div>
                    </div>

                    {/* Right Actions Column */}
                    <div className="flex flex-col gap-2 items-center">
                        {/* 🎯 GRIP HANDLE - The only draggable area */}
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onPointerDown={(e) => {
                                dragControls.start(e)
                            }}
                            className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 rounded-lg transition-colors touch-none"
                        >
                            <GripVertical className="w-5 h-5 text-gray-500 hover:text-gray-300" />
                        </motion.div>

                        {/* Delete Button with whileTap */}
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={onDelete}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                            title="Delete link"
                        >
                            <Trash2 className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>

                {/* Drag Indicator - Shows when dragging */}
                {isDragging && (
                    <div className="absolute -left-1 top-0 bottom-0 w-1 bg-blue-500 rounded-full" />
                )}
            </motion.div>
        </Reorder.Item>
    )
})
