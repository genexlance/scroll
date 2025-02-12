import React, { useEffect, useRef, useState } from 'react';

interface ScrollAnimationProps {
  frames: string[];
  className?: string;
}

export function ScrollAnimation({ frames, className = '' }: ScrollAnimationProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const rafId = useRef<number>();
  const imageCache = useRef<HTMLImageElement[]>([]);

  // Preload and cache images
  useEffect(() => {
    const preloadImages = async () => {
      try {
        const loadedImages = await Promise.all(
          frames.map(src => {
            return new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.src = src;
              img.onload = () => resolve(img);
              img.onerror = reject;
            });
          })
        );
        imageCache.current = loadedImages;
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error preloading images:', error);
        setImagesLoaded(true);
      }
    };

    preloadImages();

    return () => {
      imageCache.current = [];
    };
  }, [frames]);

  // Scroll handler with direct frame selection
  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        const scrollPos = window.scrollY;
        const maxScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = Math.max(0, Math.min(1, scrollPos / maxScrollHeight));
        
        // Calculate frame index
        const totalCycles = 3; // Number of times to cycle through all frames
        const totalFrames = frames.length * totalCycles;
        const frameIndex = Math.floor((scrollProgress * totalFrames) % frames.length);
        
        setCurrentFrame(frameIndex);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [frames.length]);

  if (frames.length === 0) {
    return null;
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* White overlay with 60% opacity */}
      <div className="absolute inset-0 bg-white opacity-60 z-10" />
      
      <div className="absolute inset-0">
        {imagesLoaded && (
          <img
            src={frames[currentFrame]}
            alt={`Animation frame ${currentFrame + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: 'translate3d(0, 0, 0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              imageRendering: 'high-quality',
            }}
          />
        )}
      </div>
      
      {!imagesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
}