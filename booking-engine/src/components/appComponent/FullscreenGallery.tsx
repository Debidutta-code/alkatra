import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Share2, ZoomIn, ZoomOut, RotateCcw, Maximize2, Grid3X3, Heart } from 'lucide-react';

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
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [showGridView, setShowGridView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      className="fixed inset-0 z-50 bg-white select-none flex flex-col"
      onWheel={handleWheel}
    >
      {/* Header with controls - Fixed height */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm z-20">
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className="text-gray-900">
            <h3 className="font-bold text-lg md:text-xl leading-tight text-gray-900">{propertyName}</h3>
            <p className="text-gray-600 text-sm mt-1">
              Photo {currentIndex + 1} of {images.length}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Zoom controls */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1 border border-gray-200">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom out"
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4 text-gray-700" />
              </button>
              <span className="text-gray-700 text-xs px-3 min-w-[3rem] text-center font-medium">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom in"
                disabled={zoom >= 5}
              >
                <ZoomIn className="h-4 w-4 text-gray-700" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200"
                title="Add to favorites"
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
              </button>

              <button
                onClick={() => setShowGridView(!showGridView)}
                className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200"
                title="Grid view"
              >
                <Grid3X3 className="h-4 w-4 text-gray-700" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                <Maximize2 className="h-4 w-4 text-gray-700" />
              </button>

              <button
                onClick={handleDownload}
                className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200"
                title="Download image"
              >
                <Download className="h-4 w-4 text-gray-700" />
              </button>

              <button
                onClick={handleShare}
                className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200"
                title="Share image"
              >
                <Share2 className="h-4 w-4 text-gray-700" />
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-all duration-200"
              title="Close gallery (Esc)"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {showGridView && (
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="container mx-auto p-4 pb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">All Photos</h2>
              <p className="text-gray-600">{images.length} photos available</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`relative aspect-square rounded-xl overflow-hidden group transition-all duration-200 border-2 ${
                    currentIndex === index
                      ? 'border-blue-500 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-102'
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
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <X className="h-6 w-6 text-gray-400" />
                    </div>
                  )}

                  {/* Image number overlay */}
                  <div className="absolute top-3 left-3 bg-white/90 text-gray-800 text-xs font-semibold px-2 py-1 rounded-lg shadow-sm">
                    {index + 1}
                  </div>

                  {/* Current image indicator */}
                  {currentIndex === index && (
                    <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
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

      {/* Main image container - Takes remaining space */}
      {!showGridView && (
        <div className="flex-1 bg-gray-50 relative overflow-hidden">
          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Main image - Centered without excessive padding */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {!imageError[currentIndex] ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  ref={imageRef}
                  src={images[currentIndex]}
                  alt={`${propertyName} - Image ${currentIndex + 1}`}
                  className={`max-w-full max-h-full object-contain bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
                    zoom > 1 ? 'cursor-grab' : 'cursor-default'
                  } ${isDragging ? 'cursor-grabbing' : ''} ${
                    isLoading ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
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
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 p-12 max-w-md bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <X className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-700">Image not available</h3>
                <p className="text-gray-500 text-center">
                  Photo {currentIndex + 1} of {images.length} could not be loaded
                </p>
              </div>
            )}
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl z-10"
                title="Previous image (←)"
              >
                <ChevronLeft className="h-6 w-6 text-gray-700" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl z-10"
                title="Next image (→)"
              >
                <ChevronRight className="h-6 w-6 text-gray-700" />
              </button>
            </>
          )}

          {/* Reset zoom button */}
          {zoom !== 1 && (
            <button
              onClick={resetZoom}
              className="absolute top-6 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium shadow-lg transition-all duration-200 flex items-center gap-2 z-10"
              title="Reset zoom"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Zoom
            </button>
          )}
        </div>
      )}

      {/* Bottom thumbnails - Fixed height when shown */}
      {!showGridView && images.length > 1 && showThumbnails && (
        <div className="flex-shrink-0 bg-white border-t border-gray-200 shadow-sm">
          <div className="p-4 md:p-6">
            <div className="flex justify-center">
              <div className="flex gap-3 overflow-x-auto max-w-full pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden transition-all duration-200 border-2 ${
                      currentIndex === index
                        ? 'border-blue-500 scale-105 shadow-md'
                        : 'border-gray-200 opacity-70 hover:opacity-100 hover:scale-105 hover:border-gray-300'
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
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <X className="h-4 w-4 text-gray-400" />
                      </div>
                    )}

                    {/* Image number */}
                    <div className="absolute top-1 right-1 bg-white/90 text-gray-800 text-xs font-semibold px-1.5 py-0.5 rounded shadow-sm">
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
      <div className="absolute bottom-4 left-4 text-gray-600 text-xs z-10">
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 space-y-1 shadow-sm">
          <div>Press <kbd className="bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded text-xs font-mono">Esc</kbd> to close</div>
          <div>Press <kbd className="bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded text-xs font-mono">G</kbd> for grid view</div>
          <div>Use <kbd className="bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded text-xs font-mono">←</kbd> <kbd className="bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded text-xs font-mono">→</kbd> to navigate</div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenGallery;