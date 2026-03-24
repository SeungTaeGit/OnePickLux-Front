import React, { useState, useEffect, useRef } from 'react';
import { Rotate3d, Loader2, AlertCircle } from 'lucide-react';

const Product360Viewer = ({
  folderUrl,
  totalFrames = 36,
  extension = ".jpg", // 💡 [추가] 확장자를 프롭스로 받을 수 있게 만듭니다!
  autoPlay = false,
  speed = 100,
  className = ""
}) => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    let loadedCount = 0;
    let errorCount = 0;
    let isCancelled = false;

    const preloadImages = async () => {
      for (let i = 1; i <= totalFrames; i++) {
        if (isCancelled) break;
        const img = new Image();

        // 💡 [핵심] 하드코딩된 .jpg 대신 전달받은 확장자를 사용합니다.
        img.src = `${folderUrl}/${i}${extension}`;

        const checkComplete = () => {
          loadedCount++;
          if (loadedCount === totalFrames && !isCancelled) {
            setImagesLoaded(true);
            if (errorCount > totalFrames / 2) {
               setHasError(true);
            }
          }
        };

        img.onload = checkComplete;
        img.onerror = () => {
          console.warn(`[360 Viewer] Failed to load image: ${img.src}`);
          errorCount++;
          checkComplete();
        };

        imagesRef.current[i] = img;
      }
    };

    preloadImages();
    return () => { isCancelled = true; };
  }, [folderUrl, totalFrames, extension]);

  // ... (이하 자동 회전, 드래그 로직, UI 렌더링 코드는 기존과 100% 동일합니다) ...
  useEffect(() => {
    if (autoPlay && imagesLoaded && !isDragging && !hasError) {
      autoPlayRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev === totalFrames ? 1 : prev + 1));
      }, speed);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [autoPlay, imagesLoaded, isDragging, totalFrames, speed, hasError]);

  const handleStart = (clientX) => {
    if (hasError) return;
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleMove = (clientX) => {
    if (!isDragging || hasError) return;
    const deltaX = clientX - startX;
    const sensitivity = 8;

    if (Math.abs(deltaX) > sensitivity) {
      if (deltaX > 0) setCurrentFrame(prev => (prev - 1 < 1 ? totalFrames : prev - 1));
      else setCurrentFrame(prev => (prev + 1 > totalFrames ? 1 : prev + 1));
      setStartX(clientX);
    }
  };

  const handleEnd = () => setIsDragging(false);

  if (hasError) {
    return (
      <div className={`relative w-full aspect-square flex flex-col items-center justify-center bg-[#1A1A1A] border border-[#333] ${className}`}>
        <AlertCircle size={32} className="text-gray-500 mb-2" />
        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Image Load Failed</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-square cursor-grab active:cursor-grabbing select-none flex items-center justify-center overflow-hidden ${className}`}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      {!imagesLoaded ? (
        <div className="flex flex-col items-center text-[#D4AF37]">
          <Loader2 className="animate-spin mb-2" size={32} />
          <span className="text-[10px] font-bold tracking-widest uppercase">Loading 3D Model...</span>
        </div>
      ) : (
        <>
          <img
            src={`${folderUrl}/${currentFrame}${extension}`}
            alt={`360 view frame ${currentFrame}`}
            className="w-full h-full object-contain pointer-events-none drop-shadow-2xl"
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 pointer-events-none animate-pulse border border-white/10">
            <Rotate3d size={14} className="text-[#D4AF37]" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Drag to Rotate</span>
          </div>
        </>
      )}
    </div>
  );
};

export default Product360Viewer;