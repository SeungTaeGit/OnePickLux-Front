import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const BannerSection = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // 스크롤(터치/드래그)을 인식하기 위한 상태
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // 1. 화면이 켜질 때 퍼블릭 API를 호출하여 활성화된 배너를 가져옵니다.
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
  // 💡 [핵심 트릭] 무한 루프를 위해 배너 배열을 4세트로 복제하여 길게 만듭니다.
  const extendedBanners = [...banners, ...banners, ...banners, ...banners];

  // 배너 데이터가 들어오면 시작 인덱스를 두 번째 세트의 시작점(N)으로 맞춥니다.
  useEffect(() => {
    if (N > 0) {
      setCurrentIndex(N);
    }
  }, [N]);

  // 2. 오토 슬라이드 로직 (5초마다 다음 배너로 이동)
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

  // 💡 [무한 루프의 비밀] 애니메이션이 끝날 때마다 몰래 제자리로 돌려놓는 함수
  const handleTransitionEnd = () => {
    if (currentIndex >= N * 2) {
      // 끝자락에 도달하면 애니메이션(transition)을 끄고 몰래 N만큼 앞으로 돌아옵니다.
      setIsTransitioning(false);
      setCurrentIndex(currentIndex - N);
    } else if (currentIndex <= 0) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex + N);
    }
  };

  // 배너 클릭 시 설정된 링크가 있다면 이동합니다.
  const handleBannerClick = (url) => {
    if (url) {
      if (url.startsWith('http')) {
        window.location.href = url;
      } else {
        navigate(url);
      }
    }
  };

  // --- 스크롤(스와이프) 감지 로직 ---
  const handleDragStart = (e) => {
    setTouchStart(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  };

  const handleDragMove = (e) => {
    setTouchEnd(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  };

  const handleDragEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();

    setTouchStart(null);
    setTouchEnd(null);
  };

  if (banners.length === 0) {
    return (
      <div className="relative w-full h-[300px] md:h-[450px] bg-[#2C2C2C] flex items-center justify-center">
        <div className="text-center text-white z-10 animate-fade-in-up">
          <span className="text-[#D4AF37] text-sm font-bold tracking-[0.3em] uppercase mb-4 block">Welcome to</span>
          <h2 className="text-5xl md:text-7xl font-serif mb-6 tracking-tight">ONEPICK LUX</h2>
          <p className="text-sm md:text-base font-light tracking-widest text-gray-300">PRE-OWNED LUXURY BOUTIQUE</p>
        </div>
      </div>
    );
  }

  // 현재 활성화된(맨 왼쪽 기준) 하단 닷(Dot)의 인덱스
  const activeDotIndex = N > 0 ? currentIndex % N : 0;

  return (
    // 배너 3개가 들어가면 가로폭이 좁아지므로 높이를 살짝 줄였습니다. (h-[300px] md:h-[450px])
    <div className="relative w-full h-[300px] md:h-[450px] bg-[#1A1A1A] overflow-hidden group">

      {/* 가로로 길게 늘어선 슬라이드 트랙 */}
      <div
        className="flex w-full h-full cursor-grab active:cursor-grabbing"
        style={{
          // 💡 한 화면에 3개씩 보여주므로(1/3), 1칸 이동할 때마다 33.333%씩 움직입니다.
          transform: `translateX(-${currentIndex * (100 / 3)}%)`,
          transitionDuration: isTransitioning ? '700ms' : '0ms',
          transitionProperty: 'transform',
          transitionTimingFunction: 'ease-in-out'
        }}
        onTransitionEnd={handleTransitionEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={touchStart ? handleDragMove : null}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => {
          if (touchStart) handleDragEnd();
        }}
      >
        {extendedBanners.map((banner, idx) => (
          <div
            key={`${banner.id}-${idx}`}
            onClick={() => handleBannerClick(banner.linkUrl)}
            // 💡 w-1/3 속성을 통해 무조건 한 화면에 3개의 배너가 꽉 차게 렌더링됩니다.
            className="w-1/3 shrink-0 h-full relative px-1 md:px-2"
            style={{ WebkitUserDrag: 'none' }}
          >
            <div className="w-full h-full relative rounded-sm overflow-hidden bg-[#2C2C2C]">
              {/* 이미지에 마우스를 올렸을 때 살짝 어두워지는 호버 효과 */}
              <div className="absolute inset-0 bg-black/10 hover:bg-black/30 transition-colors duration-500 z-10"></div>
              <img
                src={`http://localhost:8080${banner.imageUrl}`}
                alt={banner.title}
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 💡 [추가] 양쪽 끝이 점점 희미해지는 페이드 효과 (그라데이션 오버레이) */}
      <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-[#1A1A1A] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-[#1A1A1A] to-transparent z-10 pointer-events-none"></div>

      {/* 좌우 화살표 버튼 */}
      {N > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/30 text-white hover:bg-black/60 rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
          >
            <ChevronLeft size={28} strokeWidth={1.5} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/30 text-white hover:bg-black/60 rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
          >
            <ChevronRight size={28} strokeWidth={1.5} />
          </button>
        </>
      )}

      {/* 하단 네비게이션 점(Dots) */}
      {N > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                // 현재 속한 세트(배수)를 유지한 채로 도트 위치로 이동
                const currentSet = Math.floor(currentIndex / N);
                setCurrentIndex(currentSet * N + index);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeDotIndex ? 'bg-[#D4AF37] w-8' : 'bg-white/40 w-4 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerSection;