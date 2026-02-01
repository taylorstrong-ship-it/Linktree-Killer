'use client'

import { LinkItem } from './LinkItem'
import { Reorder, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'

interface Link {
    title: string
    url: string
}

interface LinkEditorProps {
    links: Link[]
    onChange: (newLinks: Link[]) => void
}

export function LinkEditor({ links, onChange }: LinkEditorProps) {

    const handleUpdate = (index: number, field: 'title' | 'url', value: string) => {
        const newLinks = [...links]
        newLinks[index] = { ...newLinks[index], [field]: value }
        onChange(newLinks)
    }

    const handleRemove = (index: number) => {
        const newLinks = links.filter((_, i) => i !== index)
        onChange(newLinks)
    }

    const handleAdd = () => {
        onChange([...links, { title: '', url: '' }])
    }

    return (
        <div className="space-y-4">
            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <Reorder.Group
                    axis="y"
                    values={links}
                    onReorder={onChange}
                    className="space-y-0"
                >
                    <AnimatePresence initial={false}>
                        {links.map((link, index) => (
                            // Generating a unique-ish key. In production, links should have true UIDs.
                            // For now, using combination or index is risky with Reorder if strict mode.
                            // Reorder needs keys to track items. 
                            // If user has duplicate URL+Title, reorder might glitch.
                            // Ideally we add an `id` property to links.
                            <LinkItem
                                key={link.url + index} // Fallback key strategy
                                link={link}
                                index={index}
                                onUpdate={handleUpdate}
                                onRemove={handleRemove}
                            />
                        ))}
                    </AnimatePresence>
                </Reorder.Group>

                {links.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-xl text-gray-500">
                        <p className="text-sm">No links yet. Add your first one!</p>
                    </div>
                )}
            </div>

            <button
                onClick={handleAdd}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
                <Plus size={20} />
                Add New Link
            </button>
        </div>
    )
}
