import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const BannerSection = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/banners');
        if (response.data && response.data.data && response.data.data.length > 0) {
          setBanners(response.data.data);
        }
      } catch (error) {
        console.error('배너를 불러오지 못했습니다:', error);
      }
    };
    fetchBanners();
  }, []);

  const N = banners.length;

  const extendedBanners = Array(10).fill(banners).flat();

  useEffect(() => {
    if (N > 0) {
      setCurrentIndex(N * 4);
    }
  }, [N]);

  useEffect(() => {
    if (N <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [N]);

  const nextSlide = () => {
    if (N === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (N === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleTransitionEnd = () => {
    if (currentIndex >= N * 6) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex - N);
    } else if (currentIndex <= N * 2) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex + N);
    }
  };

  const handleBannerClick = (url) => {
    if (!url) return;
    if (url.startsWith('http')) window.location.href = url;
    else navigate(url);
  };

  const handleDragStart = (e) => setTouchStart(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  const handleDragMove = (e) => setTouchEnd(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  const handleDragEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();
    setTouchStart(null); setTouchEnd(null);
  };

  if (banners.length === 0) {
    return <div className="w-full h-[400px] bg-[#FDFBF7] animate-pulse"></div>;
  }

  // 💡 [수정] 배너 간 여백 제거를 위해 넓이 계산
  // PC: 배너 1개당 26% 차지 -> 3개(78%) 노출, 양쪽 각각 11% 여백
  // Mobile: 배너 1개당 100% 차지
  const slideWidth = isMobile ? 100 : 26;
  const offset = isMobile ? 0 : 11;

  return (
    <div className="w-full bg-white pt-10 pb-6 overflow-hidden">

      {/* 💡 [수정] 마우스 오버 시 화살표 표시를 위해 group 속성 추가 */}
      <div className="relative w-full h-[350px] md:h-[450px] group">

        {/* 양쪽 희미해지는(Fade) 효과 오버레이 */}
        {!isMobile && (
          <>
            <div
              className="absolute top-0 left-0 h-full z-10 pointer-events-none bg-gradient-to-r from-white via-white/80 to-transparent"
              style={{ width: `${offset + 2}%` }}
            ></div>
            <div
              className="absolute top-0 right-0 h-full z-10 pointer-events-none bg-gradient-to-l from-white via-white/80 to-transparent"
              style={{ width: `${offset + 2}%` }}
            ></div>
          </>
        )}

        {/* 슬라이드 트랙 */}
        <div
          className="flex w-full h-full cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(calc(-${currentIndex * slideWidth}% + ${offset}%))`,
            transitionDuration: isTransitioning ? '700ms' : '0ms',
            transitionProperty: 'transform',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onTransitionEnd={handleTransitionEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleDragStart}
          onMouseMove={touchStart ? handleDragMove : null}
          onMouseUp={handleDragEnd}
          onMouseLeave={() => { if (touchStart) handleDragEnd(); }}
        >
          {extendedBanners.map((banner, idx) => (
            <div
              key={`${banner.id}-${idx}`}
              onClick={() => handleBannerClick(banner.linkUrl)}
              // 💡 [수정] px-2 (패딩) 제거하여 배너 사이 공간을 없앰
              className="h-full shrink-0 group/banner"
              style={{ width: `${slideWidth}%`, WebkitUserDrag: 'none' }}
            >
              <div className="w-full h-full relative overflow-hidden bg-gray-100">
                <div className="absolute inset-0 bg-black/5 group-hover/banner:bg-black/0 transition-colors duration-500 z-10"></div>
                <img
                  src={banner.imageUrl?.startsWith('http') ? banner.imageUrl : `http://localhost:8080${banner.imageUrl}`}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover/banner:scale-105 transition-transform duration-[1500ms] pointer-events-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* 💡 [수정] 마우스 오버 시 나타나는 화살표 버튼 */}
        {N > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/70 hover:bg-white text-gray-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:left-[12%]"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/70 hover:bg-white text-gray-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:right-[12%]"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BannerSection;