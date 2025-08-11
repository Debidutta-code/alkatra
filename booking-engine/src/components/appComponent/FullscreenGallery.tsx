import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Share2, ZoomIn, ZoomOut, RotateCcw, Maximize2, Grid3X3 } from 'lucide-react';

interface FullscreenGalleryProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  propertyName?: string;
}

const FullscreenGallery: React.FC<FullscreenGalleryProps> = ({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
  propertyName = "Property"
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState<{ [key: number]: boolean }>({});
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [showGridView, setShowGridView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Reset state when gallery opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setImagePosition({ x: 0, y: 0 });
      setShowGridView(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  // Auto-hide controls
  useEffect(() => {
    if (!isOpen) return;

    const resetTimeout = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setShowControls(true);
      timeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    const handleMouseMove = () => resetTimeout();

    resetTimeout();
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          if (showGridView) {
            setShowGridView(false);
          } else {
            onClose();
          }
          break;
        case 'ArrowLeft':
          if (!showGridView) goToPrevious();
          break;
        case 'ArrowRight':
          if (!showGridView) goToNext();
          break;
        case ' ':
          e.preventDefault();
          setShowThumbnails(prev => !prev);
          break;
        case 'g':
        case 'G':
          setShowGridView(prev => !prev);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, showGridView]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsLoading(true);
    resetZoom();
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsLoading(true);
    resetZoom();
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
    setIsLoading(true);
    setShowGridView(false);
    resetZoom();
  };

  const resetZoom = () => {
    setZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = (index: number) => {
    setImageError(prev => ({ ...prev, [index]: true }));
    setIsLoading(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Failed to exit fullscreen:', error);
      }
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(images[currentIndex]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${propertyName.replace(/[^a-zA-Z0-9]/g, '-')}-image-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${propertyName} - Image ${currentIndex + 1}`,
          url: images[currentIndex],
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(images[currentIndex]);
        // Show a temporary notification
        const notification = document.createElement('div');
        notification.textContent = 'Image URL copied to clipboard!';
        notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
        document.body.appendChild(notification);
        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => document.body.removeChild(notification), 300);
        }, 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black select-none"
      onWheel={handleWheel}
    >
      {/* Header with controls */}
      <div className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-all duration-500 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        }`}>
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className="text-white">
            <h3 className="font-semibold text-lg md:text-xl leading-tight">{propertyName}</h3>
            <p className="text-white/70 text-sm mt-1">
              {currentIndex + 1} of {images.length} photos
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="hidden md:flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-white/20 rounded-md transition-colors duration-200"
                title="Zoom out"
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4 text-white" />
              </button>
              <span className="text-white text-xs px-2 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-white/20 rounded-md transition-colors duration-200"
                title="Zoom in"
                disabled={zoom >= 5}
              >
                <ZoomIn className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setShowGridView(!showGridView)}
                className="p-2 hover:bg-white/20 rounded-md transition-colors duration-200"
                title="Grid view"
              >
                <Grid3X3 className="h-4 w-4 text-white" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/20 rounded-md transition-colors duration-200"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                <Maximize2 className="h-4 w-4 text-white" />
              </button>

              <button
                onClick={handleDownload}
                className="p-2 hover:bg-white/20 rounded-md transition-colors duration-200"
                title="Download image"
              >
                <Download className="h-4 w-4 text-white" />
              </button>

              <button
                onClick={handleShare}
                className="p-2 hover:bg-white/20 rounded-md transition-colors duration-200"
                title="Share image"
              >
                <Share2 className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-lg transition-colors duration-200 ml-2"
              title="Close gallery (Esc)"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {showGridView && (
        <div className="absolute inset-0 z-10 bg-black/95 backdrop-blur-sm overflow-y-auto">
          <div className="container mx-auto p-4 pt-20">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden group transition-all duration-200 ${currentIndex === index
                      ? 'ring-2 ring-blue-500 scale-105'
                      : 'hover:scale-105 hover:ring-1 hover:ring-white/50'
                    }`}
                >
                  {!imageError[index] ? (
                    <img
                      src={image}
                      alt={`Grid thumbnail ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200"
                      loading="lazy"
                      onError={() => handleImageError(index)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <X className="h-6 w-6 text-gray-500" />
                    </div>
                  )}

                  {/* Image number overlay */}
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                    {index + 1}
                  </div>

                  {/* Current image indicator */}
                  {currentIndex === index && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main image container */}
      {!showGridView && (
        <div className="flex items-center justify-center h-full p-4 pt-20 pb-20">
          <div className="relative max-w-full max-h-full w-full h-full flex items-center justify-center">
            {/* Loading spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            )}

            {/* Main image */}
            {!imageError[currentIndex] ? (
              <img
                ref={imageRef}
                src={images[currentIndex]}
                alt={`${propertyName} - Image ${currentIndex + 1}`}
                className={`max-w-full max-h-full object-contain transition-all duration-300 ${zoom > 1 ? 'cursor-grab' : 'cursor-default'
                  } ${isDragging ? 'cursor-grabbing' : ''} ${isLoading ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                  }`}
                style={{
                  transform: `scale(${zoom}) translate(${imagePosition.x / zoom}px, ${imagePosition.y / zoom}px)`,
                  transformOrigin: 'center'
                }}
                onLoad={handleImageLoad}
                onError={() => handleImageError(currentIndex)}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                draggable={false}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-white/60 p-8 max-w-md">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
                  <X className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Image not available</h3>
                <p className="text-white/40 text-center">
                  Image {currentIndex + 1} of {images.length} could not be loaded
                </p>
              </div>
            )}

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-all duration-300 ${showControls ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'
                    }`}
                  title="Previous image (←)"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>

                <button
                  onClick={goToNext}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-all duration-300 ${showControls ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                    }`}
                  title="Next image (→)"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </>
            )}

            {/* Reset zoom button */}
            {zoom !== 1 && (
              <button
                onClick={resetZoom}
                className={`absolute top-4 left-1/2 transform -translate-x-1/2 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-lg text-white text-sm transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
                  }`}
                title="Reset zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom thumbnails */}
      {!showGridView && images.length > 1 && showThumbnails && (
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-500 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
          }`}>
          <div className="p-4 md:p-6">
            <div className="flex justify-center">
              <div className="flex gap-2 overflow-x-auto max-w-full pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all duration-200 ${currentIndex === index
                        ? 'ring-2 ring-white scale-105'
                        : 'opacity-60 hover:opacity-80 hover:scale-105'
                      }`}
                  >
                    {!imageError[index] ? (
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={() => handleImageError(index)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <X className="h-4 w-4 text-gray-500" />
                      </div>
                    )}

                    {currentIndex === index && (
                      <div className="absolute inset-0 bg-white/10 border-2 border-white rounded-lg"></div>
                    )}

                    {/* Image number */}
                    <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded backdrop-blur-sm">
                      {index + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      <div className={`absolute bottom-4 left-4 text-white/60 text-xs transition-all duration-500 ${showControls ? 'opacity-100' : 'opacity-0'
        }`}>
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2 space-y-1">
          <div>Press <kbd className="bg-white/20 px-1 rounded">Esc</kbd> to close</div>
          <div>Press <kbd className="bg-white/20 px-1 rounded">G</kbd> for grid view</div>
          <div>Press <kbd className="bg-white/20 px-1 rounded">Space</kbd> to toggle thumbnails</div>
        </div>
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      ></div>
    </div>
  );
};

export default FullscreenGallery;