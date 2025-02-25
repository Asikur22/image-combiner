import { useState, useRef, useEffect } from "react";
import { Button } from "./components/ui/button";
import { ErrorMessage } from "./components/ui/error-message";
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
    const gapOptions = [
        { value: 0, label: 'None' },
        { value: 8, label: 'Small' },
        { value: 24, label: 'Medium' },
        { value: 48, label: 'Large' },
        { value: 96, label: 'Extra Large' }
    ];
    const [draggedIndex, setDraggedIndex] = useState(null);

    useEffect(() => {
        if (images.length >= 2) {
            setTimeout(() => {
                combineImages();
            }, 200);
        } else {
            setCombinedImage(null);
        }
    }, [images, orientation, alignment, gap]);

    const [fileInput, setFileInput] = useState(null);

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setImages(prevImages => {
            const updatedImages = [...prevImages, ...imageUrls];
            return updatedImages;
        });
        setFileInput(event.target);
    };

    const handleImageRemove = (index) => {        
        if (fileInput) {
            const dt = new DataTransfer();
            const files = Array.from(fileInput.files);
            files.splice(index, 1);
            files.forEach(file => dt.items.add(file));
            fileInput.files = dt.files;
            setFileInput(fileInput);
        }
    };

    const [pasteError, setPasteError] = useState(null);
    const [lastPasteTime, setLastPasteTime] = useState(0);
    const handlePaste = async (e) => {
        e.preventDefault();
        setPasteError(null);
        
        const now = Date.now();
        if (now - lastPasteTime < 100) {
            return; // Prevent duplicate pastes within 100ms
        }
        setLastPasteTime(now);
        
        try {
            let items;
            if (e.clipboardData) {
                items = Array.from(e.clipboardData.items || []);
            } else {
                try {
                    const clipboardItems = await navigator.clipboard.read();
                    items = await Promise.all(
                        clipboardItems.map(async item => {
                            const imageType = item.types.find(type => type.startsWith('image/'));
                            if (imageType) {
                                const blob = await item.getType(imageType);
                                return { type: imageType, getAsFile: () => new File([blob], 'pasted-image.png', { type: imageType }) };
                            }
                            return null;
                        })
                    );
                } catch (clipboardError) {
                    throw new Error('Failed to access clipboard. Please check your browser permissions.');
                }
            }
    
            const imageItems = items.filter(item => item && item.type.startsWith('image/'));
    
            if (imageItems.length === 0) {
                throw new Error('No image found in clipboard.');
            }
    
            const newImages = await Promise.all(imageItems.map(async item => {
                const blob = item.getAsFile();
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(new Error('Failed to read image data.'));
                    reader.readAsDataURL(blob);
                });
            }));
    
            setImages(prevImages => {
                const updatedImages = [...prevImages, ...newImages];
                if (updatedImages.length >= 2) {
                    setTimeout(() => {
                        combineImages();
                    }, 100);
                }
                return updatedImages;
            });
        } catch (error) {
            console.error('Failed to read clipboard contents:', error);
            setPasteError(error.message);
        }
    };

    const combineImages = async () => {
        if (images.length < 2) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const loadedImages = await Promise.all(
            images.map(src => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = src;
                });
            })
        );

        const gapPixels = parseInt(gap);
        let totalWidth = 0;
        let totalHeight = 0;
        let maxWidth = 0;
        let maxHeight = 0;

        // Calculate total dimensions including gaps
        loadedImages.forEach((img, index) => {
            if (orientation === 'horizontal') {
                totalWidth += img.width + (index < loadedImages.length - 1 ? gapPixels : 0);
                maxHeight = Math.max(maxHeight, img.height);
            } else {
                totalHeight += img.height + (index < loadedImages.length - 1 ? gapPixels : 0);
                maxWidth = Math.max(maxWidth, img.width);
            }
        });

        if (orientation === 'horizontal') {
            canvas.width = totalWidth;
            canvas.height = maxHeight;
            ctx.fillStyle = 'transparent';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            canvas.width = maxWidth;
            canvas.height = totalHeight;
            ctx.fillStyle = 'transparent';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        let currentX = 0;
        let currentY = 0;

        loadedImages.forEach((img, index) => {
            let x = currentX;
            let y = currentY;

            if (alignment === 'center') {
                if (orientation === 'horizontal') {
                    y = (maxHeight - img.height) / 2;
                } else {
                    x = (maxWidth - img.width) / 2;
                }
            } else if (alignment === 'end') {
                if (orientation === 'horizontal') {
                    y = maxHeight - img.height;
                } else {
                    x = maxWidth - img.width;
                }
            }

            ctx.drawImage(img, x, y);

            if (orientation === 'horizontal') {
                currentX += img.width;
                if (index < loadedImages.length - 1) {
                    currentX += gapPixels;
                }
            } else {
                currentY += img.height;
                if (index < loadedImages.length - 1) {
                    currentY += gapPixels;
                }
            }
        });

        setCombinedImage(canvas.toDataURL());
    };

    return (
        <div 
            ref={containerRef}
            className="flex flex-col md:flex-row gap-6 p-6 h-screen bg-gray-900" 
            onPaste={handlePaste}
            tabIndex="0"
        >
            <div 
                className="w-full md:w-[350px] lg:w-[450px] bg-gray-800 rounded-md shadow-2xl p-6 space-y-4 transition-all duration-300 flex flex-col items-center justify-start"
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
                                onClick={handlePaste}
                                variant="outline"
                                className="bg-transparent border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                            >
                                Paste Image
                            </Button>
                            {pasteError && (
                                <ErrorMessage 
                                    message={pasteError} 
                                    className="mt-2" 
                                    onDismiss={() => setPasteError(null)}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {images.length > 0 && (
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
                            <select
                                value={gap}
                                onChange={(e) => setGap(parseInt(e.target.value))}
                                className="bg-gray-700 border-gray-600 text-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                {gapOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2">                  
                            <Button 
                                onClick={() => {
                                    setImages([]);
                                    setCombinedImage(null);
                                    if (fileInput) {
                                        fileInput.value = '';
                                        setFileInput(null);
                                    }
                                }} 
                                className="inline-block w-48 bg-red-500 hover:bg-red-600"
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                )}

            </div>
            <div className="w-full md:flex-1 bg-gray-800 rounded-md shadow-2xl p-6">
                <div className="overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    {images.length > 0 && (
                        <ImagePreview 
                            images={images}
                            draggedIndex={draggedIndex}
                            setDraggedIndex={setDraggedIndex}
                            setImages={setImages}
                            onRemove={handleImageRemove}
                        />
                    )}

                    <CombinedImagePreview combinedImage={combinedImage} />
                </div>
            </div>
        </div>
    );
}
