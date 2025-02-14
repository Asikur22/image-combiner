import DraggableImage from './DraggableImage';

export default function ImagePreview({ images, draggedIndex, setDraggedIndex, setImages }) {
    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== targetIndex) {
            const newImages = [...images];
            const [draggedImage] = newImages.splice(draggedIndex, 1);
            newImages.splice(targetIndex, 0, draggedImage);
            setImages(newImages);
            setDraggedIndex(null);
        }
    };

    const handleRemove = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-300">Preview:</h3>
            <div 
                className="flex gap-4 pb-4 max-w-full border-b border-gray-700"
                onDragOver={(e) => e.preventDefault()}
            >
                {images.map((src, index) => (
                    <div
                        key={index}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        <DraggableImage
                            src={src}
                            index={index}
                            onDragStart={(index) => setDraggedIndex(index)}
                            onDragEnd={() => setDraggedIndex(null)}
                            onDragOver={(targetIndex) => {
                                if (draggedIndex !== null && draggedIndex !== targetIndex) {
                                    const newImages = [...images];
                                    const [draggedImage] = newImages.splice(draggedIndex, 1);
                                    newImages.splice(targetIndex, 0, draggedImage);
                                    setImages(newImages);
                                    setDraggedIndex(targetIndex);
                                }
                            }}
                            onRemove={handleRemove}
                        />
                    </div>
                ))}    
            </div>
        </div>
    );
}