import { useState } from 'react';
import { Button } from './ui/button';

export default function DownloadImage({ combinedImage }) {
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
    const [quality, setQuality] = useState(.5);

    const handleDownload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            const targetWidth = width ? parseInt(width) : img.width;
            const targetHeight = height ? parseInt(height) : img.height;

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            const downloadLink = document.createElement('a');
            downloadLink.href = canvas.toDataURL('image/jpeg', quality);
            downloadLink.download = 'combined-image.jpg';
            downloadLink.click();
        };

        img.src = combinedImage;
    };

    const handleDimensionChange = (value, type) => {
        const numValue = value === '' ? '' : parseInt(value);
        if (type === 'width') {
            setWidth(numValue);
            if (maintainAspectRatio && numValue !== '') {
                const img = new Image();
                img.onload = () => {
                    const aspectRatio = img.height / img.width;
                    setHeight(Math.round(numValue * aspectRatio));
                };
                img.src = combinedImage;
            }
        } else {
            setHeight(numValue);
            if (maintainAspectRatio && numValue !== '') {
                const img = new Image();
                img.onload = () => {
                    const aspectRatio = img.width / img.height;
                    setWidth(Math.round(numValue * aspectRatio));
                };
                img.src = combinedImage;
            }
        }
    };

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-300 mt-4">Download Options:</h3>
            <div className="flex flex-col gap-4 border-b border-gray-700">
                <div className="flex items-center space-x-4">
                    <div className="space-x-2">
                        <label className="text-sm font-medium text-gray-300">Width:</label>
                        <input
                            type="number"
                            value={width}
                            onChange={(e) => handleDimensionChange(e.target.value, 'width')}
                            placeholder="Auto"
                            className="w-20 bg-gray-700 border-gray-600 text-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="space-x-2">
                        <label className="text-sm font-medium text-gray-300">Height:</label>
                        <input
                            type="number"
                            value={height}
                            onChange={(e) => handleDimensionChange(e.target.value, 'height')}
                            placeholder="Auto"
                            className="w-20 bg-gray-700 border-gray-600 text-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={maintainAspectRatio}
                            onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                            className="w-4 h-4 text-blue-500 border-gray-400 focus:ring-blue-500 focus:ring-2 bg-gray-700"
                        />
                        <span className="ml-2 text-sm text-gray-300">Maintain aspect ratio</span>
                    </label>
                </div>
                <div className="space-x-2 flex items-center">
                    <label className="text-sm font-medium text-gray-300">Quality:</label>
                    <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-32 accent-blue-500"
                    />
                    <span className="text-sm text-gray-300">{Math.round(quality * 100)}%</span>
                </div>
                <Button onClick={handleDownload} className="w-48 mb-4">
                    Download Image
                </Button>
            </div>
        </div>
    );
}