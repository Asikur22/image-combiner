import { useRef, useState } from 'react';

export default function DraggableImage({ src, index, onDragStart, onDragEnd, onDragOver, onRemove }) {
    const dragRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e) => {
        setIsDragging(true);
        e.dataTransfer.setData('text/plain', index.toString());
        e.dataTransfer.effectAllowed = 'move';

        // Add a slight delay to ensure the drag image is set
        requestAnimationFrame(() => {
            dragRef.current.style.opacity = '0.5';
            dragRef.current.style.transform = 'scale(0.95)';
        });

        onDragStart(index);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        dragRef.current.style.opacity = '1';
        dragRef.current.style.transform = 'scale(1)';
        onDragEnd();
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        onDragOver(index);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        if (!isDragging) {
            dragRef.current.style.transform = 'scale(1.05)';
            dragRef.current.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.5)';
        }
    };

    const handleDragLeave = () => {
        if (!isDragging) {
            dragRef.current.style.transform = 'scale(1)';
            dragRef.current.style.boxShadow = 'none';
        }
    };

    return (
        <div
            ref={dragRef}
            className={`relative rounded-lg cursor-move transition-all border border-gray-600 duration-200 ${isDragging ? 'z-50' : 'z-0'} group`}
            draggable="true"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            <button
                onClick={() => onRemove(index)}
                className="absolute p-2 -top-4 -right-4 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus:outline-none transition-opacity z-10"
                title="Remove image"
            >
                ×
            </button>
            <img
                src={src}
                alt={`Preview ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg select-none"
                draggable="false"
                onDragStart={(e) => e.preventDefault()}
            />
        </div>
    );
}