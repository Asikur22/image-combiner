import DownloadImage from "./DownloadImage";

export default function CombinedImagePreview({ combinedImage }) {
    if (!combinedImage) return null;

    return (
        <>
            <DownloadImage combinedImage={combinedImage} />

            <div className="space-y-3 mt-4">
                <h3 className="text-lg font-semibold text-gray-300">Combined Image:</h3>
                <div className="relative pb-4">
                    <img 
                        src={combinedImage} 
                        alt="Combined" 
                        className="w-full object-contain max-h-[480px]" 
                    />
                </div>
            </div>
        </>
    );
}