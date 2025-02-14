import { useState, useRef, useEffect } from "react";
import { Button } from "./components/ui/button";
import ImagePreview from "./components/ImagePreview";
import CombinedImagePreview from "./components/CombinedImagePreview";

export default function ImageCombiner() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.focus();
        }
    }, []);
    const [images, setImages] = useState([]);
    const [combinedImage, setCombinedImage] = useState(null);
    const [orientation, setOrientation] = useState('horizontal');
    const [alignment, setAlignment] = useState('center');
    const [gap, setGap] = useState(0);
    const [draggedIndex, setDraggedIndex] = useState(null);

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setImages(imageUrls);
    };

    const handlePaste = async (e) => {
        e.preventDefault();
        const items = Array.from(e.clipboardData.items);
        const imageItems = items.filter(item => item.type.startsWith('image/'));

        if (imageItems.length > 0) {
            const newImages = await Promise.all(imageItems.map(async item => {
                const blob = item.getAsFile();
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            }));

            setImages(prevImages => {
                const updatedImages = [...prevImages, ...newImages];
                if (updatedImages.length >= 2) {
                    setTimeout(combineImages, 0);
                }
                return updatedImages;
            });
        }
    };

    const combineImages = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const loadedImages = await Promise.all(
            images.map(src => new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            }))
        );

        let totalWidth = 0;
        let totalHeight = 0;
        let maxWidth = 0;
        let maxHeight = 0;

        loadedImages.forEach(img => {
            if (orientation === 'horizontal') {
                totalWidth += img.width;
                maxHeight = Math.max(maxHeight, img.height);
            } else {
                totalHeight += img.height;
                maxWidth = Math.max(maxWidth, img.width);
            }
        });

        canvas.width = orientation === 'horizontal' ? totalWidth : maxWidth;
        canvas.height = orientation === 'horizontal' ? maxHeight : totalHeight;

        let currentX = 0;
        let currentY = 0;

        loadedImages.forEach((img, index) => {
            if (orientation === 'horizontal') {
                let y = 0;
                if (alignment === 'center') {
                    y = (maxHeight - img.height) / 2;
                } else if (alignment === 'bottom') {
                    y = maxHeight - img.height;
                }
                ctx.drawImage(img, currentX, y);
                currentX += img.width + (index < loadedImages.length - 1 ? gap : 0);
            } else {
                let x = 0;
                if (alignment === 'center') {
                    x = (maxWidth - img.width) / 2;
                } else if (alignment === 'right') {
                    x = maxWidth - img.width;
                }
                ctx.drawImage(img, x, currentY);
                currentY += img.height + (index < loadedImages.length - 1 ? gap : 0);
            }
        });

        const combinedImageUrl = canvas.toDataURL('image/png');
        setCombinedImage(combinedImageUrl);
    };

    return (
        <div 
            ref={containerRef}
            className="flex gap-6 p-6 h-screen bg-gray-900" 
            onPaste={handlePaste}
            tabIndex="0"
        >
            <div 
                className="w-[450px] bg-gray-800 rounded-md shadow-2xl p-6 space-y-4 transition-all duration-300 flex flex-col items-center justify-start"
                onPaste={handlePaste}
                tabIndex="0"
            >
                <div className="flex items-center gap-3 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-[80px] w-[80px] text-blue-500" viewBox="0 0 48 48">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" d="M29.4995,12.3739c.7719-.0965,1.5437,.4824,1.5437,1.2543h0l2.5085,23.8312c.0965,.7719-.4824,1.5437-1.2543,1.5437l-23.7347,2.5085c-.7719,.0965-1.5437-.4824-1.5437-1.2543h0l-2.5085-23.7347c-.0965-.7719,.4824-1.5437,1.2543-1.5437l23.7347-2.605Z"></path>
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" d="M12.9045,18.9347c-1.7367,.193-3.0874,1.7367-2.8945,3.5699,.193,1.7367,1.7367,3.0874,3.5699,2.8945,1.7367-.193,3.0874-1.7367,2.8945-3.5699s-1.8332-3.0874-3.5699-2.8945h0Zm8.7799,5.596l-4.6312,5.6925c-.193,.193-.4824,.2894-.6754,.0965h0l-1.0613-.8683c-.193-.193-.5789-.0965-.6754,.0965l-5.0171,6.1749c-.193,.193-.193,.5789,.0965,.6754-.0965,.0965,.0965,.0965,.193,.0965l19.9719-2.1226c.2894,0,.4824-.2894,.4824-.5789,0-.0965-.0965-.193-.0965-.2894l-7.8151-9.0694c-.2894-.0965-.5789-.0965-.7719,.0965h0Z"></path>
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" d="M16.2814,13.8211l.6754-6.0784c.0965-.7719,.7719-1.3508,1.5437-1.2543l23.7347,2.5085c.7719,.0965,1.3508,.7719,1.2543,1.5437h0l-2.5085,23.7347c0,.6754-.7719,1.2543-1.5437,1.2543l-6.1749-.6754"></path>
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" d="M32.7799,29.9337l5.3065,.5789c.2894,0,.4824-.193,.5789-.4824,0-.0965,0-.193-.0965-.2894l-5.789-10.5166c-.0965-.193-.4824-.2894-.6754-.193h0l-.3859,.3859"></path>
                    </svg>
                    <h1 className="text-2xl font-bold text-gray-300">Image Combiner</h1>
                </div>
                
                <div className="space-y-3 w-full flex flex-col">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Upload Images</label>
                        <div className="bg-gray-900 rounded-full">
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*" 
                                onChange={handleImageUpload} 
                                className="block w-full text-sm text-gray-400
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-500 file:text-white
                                    file:hover:bg-blue-600
                                    file:cursor-pointer file:transition-colors"
                            />
                            </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Paste Images</label>
                        <div 
                            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors flex flex-col items-center space-y-4"
                            onClick={() => document.querySelector('[tabindex="0"]').focus()}
                        >
                            <p className="text-gray-400">Click here to paste images from clipboard</p>
                            <Button
                                onClick={async () => {
                                    try {
                                        const clipboardItems = await navigator.clipboard.read();
                                        for (const clipboardItem of clipboardItems) {
                                            const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
                                            if (imageTypes.length > 0) {
                                                const blob = await clipboardItem.getType(imageTypes[0]);
                                                const reader = new FileReader();
                                                reader.onload = () => {
                                                    setImages(prevImages => [...prevImages, reader.result]);
                                                };
                                                reader.readAsDataURL(blob);
                                            }
                                        }
                                    } catch (error) {
                                        console.error('Failed to read clipboard:', error);
                                    }
                                }}
                                variant="outline"
                                className="bg-transparent border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                            >
                                Paste Image
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 w-full flex flex-col items-center">
                    <div className="space-x-4 flex items-center">
                        <label className="block text-sm font-medium text-gray-300">Orientation:</label>
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    className="w-4 h-4 text-blue-500 border-gray-400 focus:ring-blue-500 focus:ring-2 bg-gray-700"
                                    name="orientation"
                                    value="horizontal"
                                    checked={orientation === 'horizontal'}
                                    onChange={(e) => {
                                        setOrientation(e.target.value);
                                        if (images.length >= 2) {
                                            combineImages();
                                        }
                                    }}
                                />
                                <span className="ml-2 text-gray-300">Horizontal</span>
                            </label>
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    className="w-4 h-4 text-blue-500 border-gray-400 focus:ring-blue-500 focus:ring-2 bg-gray-700"
                                    name="orientation"
                                    value="vertical"
                                    checked={orientation === 'vertical'}
                                    onChange={(e) => {
                                        setOrientation(e.target.value);
                                        if (images.length >= 2) {
                                            combineImages();
                                        }
                                    }}
                                />
                                <span className="ml-2 text-gray-300">Vertical</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <label className="block text-sm font-medium text-gray-300">Alignment:</label>
                        <select
                            value={alignment}
                            onChange={(e) => {
                                setAlignment(e.target.value);
                                if (images.length >= 2) {
                                    combineImages();
                                }
                            }}
                            className="bg-gray-700 border-gray-600 text-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            {orientation === 'horizontal' ? (
                                <>
                                    <option value="top">Top</option>
                                    <option value="center">Center</option>
                                    <option value="bottom">Bottom</option>
                                </>
                            ) : (
                                <>
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div className="flex items-center space-x-4">
                        <label className="block text-sm font-medium text-gray-300">Gap:</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={gap}
                            onChange={(e) => {
                                const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                                setGap(value);
                                if (images.length >= 2) {
                                    combineImages();
                                }
                            }}
                            className="w-20 bg-gray-700 border-gray-600 text-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-sm text-gray-400">pixels</span>
                    </div>

                    <Button 
                        onClick={combineImages} 
                        disabled={images.length < 2}
                        className="w-full sm:w-auto"
                    >
                        Combine Images
                    </Button>
                </div>

            </div>
            <div className="flex-1 bg-gray-800 rounded-md shadow-2xl p-6">
                <div className="overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    {images.length > 0 && (
                        <ImagePreview 
                            images={images}
                            draggedIndex={draggedIndex}
                            setDraggedIndex={setDraggedIndex}
                            setImages={setImages}
                        />
                    )}

                    <CombinedImagePreview combinedImage={combinedImage} />
                </div>
            </div>
        </div>
    );
}
