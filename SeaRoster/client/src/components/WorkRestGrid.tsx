// c:\Users\krish\.gemini\antigravity\scratch\Seafarer\SeaRoster\client\src\components\WorkRestGrid.tsx
import React, { useState } from 'react';

// Props: current grid string "RRRRWW...", onChange handler
interface WorkRestGridProps {
    grid: string; // 48 chars
    readOnly?: boolean;
    onChange: (newGrid: string) => void;
}

const WorkRestGrid: React.FC<WorkRestGridProps> = ({ grid, readOnly, onChange }) => {
    const slots = grid.split('');
    const [isDragging, setIsDragging] = useState(false);
    const [dragType, setDragType] = useState<string | null>(null);

    // Helpers


    const handleMouseDown = (index: number, val: string) => {
        if (readOnly) return;
        setIsDragging(true);
        // If clicking W, we want to paint R. If clicking R, we want to paint W.
        const targetVal = val === 'R' ? 'W' : 'R';
        setDragType(targetVal);

        const newSlots = [...slots];
        newSlots[index] = targetVal;
        onChange(newSlots.join(''));
    };

    const handleMouseEnter = (index: number) => {
        if (!isDragging || readOnly || !dragType) return;
        const newSlots = [...slots];
        if (newSlots[index] !== dragType) {
            newSlots[index] = dragType;
            onChange(newSlots.join(''));
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragType(null);
    };

    return (
        <div
            className="select-none"
            onMouseLeave={handleMouseUp}
            onMouseUp={handleMouseUp}
        >
            {/* Hour Markers */}
            <div className="flex border-b border-slate-300 mb-1">
                {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="flex-1 text-center text-[10px] text-slate-500 border-l border-slate-200 h-4 leading-none">
                        {i}
                    </div>
                ))}
            </div>

            {/* The Grid */}
            <div className="flex bg-white border border-slate-300 h-10 shadow-sm rounded-sm overflow-hidden">
                {slots.map((val, i) => (
                    <div
                        key={i}
                        onMouseDown={() => handleMouseDown(i, val)}
                        onMouseEnter={() => handleMouseEnter(i)}
                        className={`flex-1 border-r border-slate-100 cursor-pointer transition-colors duration-75
                            ${val === 'R' ? 'bg-emerald-100 hover:bg-emerald-200' : 'bg-red-400 hover:bg-red-500'}
                            ${i % 2 === 0 ? '' : 'border-r-slate-300'} // Mark hours clearly
                        `}
                        title={`${Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'} - ${val === 'R' ? 'Rest' : 'Work'}`}
                    />
                ))}
            </div>

            {/* Legend/Status */}
            <div className="flex justify-between mt-2 text-xs text-slate-600">
                <div className="flex gap-4">
                    <span className="flex items-center"><div className="w-3 h-3 bg-red-400 mr-1 rounded-sm"></div> Work</span>
                    <span className="flex items-center"><div className="w-3 h-3 bg-emerald-100 border border-slate-200 mr-1 rounded-sm"></div> Rest</span>
                </div>
                <div>
                    <div>Total Work: {slots.filter(s => s === 'W').length / 2}h</div>
                </div>
            </div>
        </div>
    );
};

export default WorkRestGrid;
