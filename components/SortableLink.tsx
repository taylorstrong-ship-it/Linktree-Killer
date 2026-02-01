'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface Link {
    title: string
    url: string
}

interface SortableLinkProps {
    id: number
    link: Link
    index: number
    onUpdate: (index: number, field: 'title' | 'url', value: string) => void
    onRemove: (index: number) => void
}

export function SortableLink({ id, link, index, onUpdate, onRemove }: SortableLinkProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 ${isDragging ? 'shadow-lg shadow-blue-500/30 border-blue-500' : ''
                }`}
        >
            <div className="flex items-start gap-2">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="mt-2 text-gray-500 hover:text-gray-300 transition-colors cursor-grab active:cursor-grabbing touch-none"
                >
                    <GripVertical size={18} />
                </div>

                {/* Input Fields */}
                <div className="flex-1 grid gap-2">
                    <input
                        type="text"
                        value={link.title}
                        onChange={(e) => onUpdate(index, 'title', e.target.value)}
                        placeholder="Link Title"
                        className="w-full p-2 text-xs bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                    />
                    <input
                        type="text"
                        value={link.url}
                        onChange={(e) => onUpdate(index, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full p-2 text-xs bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                    />
                </div>

                {/* Delete Button */}
                <button
                    onClick={() => onRemove(index)}
                    className="mt-2 text-xs py-1.5 px-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded transition"
                    title="Delete"
                >
                    <i className="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    )
}
