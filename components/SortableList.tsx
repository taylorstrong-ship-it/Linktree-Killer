'use client';

import * as React from 'react';
import { Reorder, useDragControls, DragControls } from 'framer-motion';
import { GripVertical } from 'lucide-react';

interface SortableListProps {
    items: any[];
    onReorder: (newOrder: any[]) => void;
    renderItem: (item: any) => React.ReactNode;
    keyExtractor: (item: any) => string;
}

interface DragHandleProps {
    controls: DragControls;
}

const DragHandle = ({ controls }: DragHandleProps) => {
    return (
        <div
            className="cursor-grab active:cursor-grabbing p-4 touch-none"
            onPointerDown={(e) => {
                // 📱 RESEARCH IMPLEMENTED: Haptics (Android Only, fails gracefully on iOS)
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    try { navigator.vibrate(10); } catch (e) { }
                }
                // 🛑 PREVENT SCROLL HIJACKING: Hand off directly to Motion controls
                controls.start(e);
            }}
            style={{ touchAction: 'none' }} // Critical for preventing iOS scroll interference
        >
            <GripVertical className="w-5 h-5 text-zinc-500" />
        </div>
    );
};

// 🔒 ISOLATED COMPONENT: Needed to scope useDragControls correctly per item
const SortableItem = ({ item, renderItem }: { item: any, renderItem: any }) => {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={item}
            dragListener={false} // Disable default drag
            dragControls={controls} // Bind manual controls
            className="relative bg-zinc-900 border border-zinc-800 rounded-xl flex items-center shadow-lg select-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileDrag={{ scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.5)", zIndex: 50 }}
        >
            {/* Handle receives the controls to trigger the drag */}
            <DragHandle controls={controls} />

            {/* Content Container */}
            <div className="flex-1 pr-4">
                {renderItem(item)}
            </div>
        </Reorder.Item>
    );
};

export const SortableList: React.FC<SortableListProps> = ({ items, onReorder, renderItem, keyExtractor }) => {
    return (
        <Reorder.Group axis="y" values={items} onReorder={onReorder} className="flex flex-col gap-4 w-full">
            {items.map((item) => (
                <SortableItem
                    key={keyExtractor(item)}
                    item={item}
                    renderItem={renderItem}
                />
            ))}
        </Reorder.Group>
    );
};
