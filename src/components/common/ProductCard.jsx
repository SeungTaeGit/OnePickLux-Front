import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import axios from 'axios';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(product.isLiked || false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  const isSoldOut = product.status === '판매완료' || product.status === 'SOLD_OUT' || product.status === '품절';

  // 💡 [핵심 추가] 이 상품이 병행수입 새상품인지 확인하는 변수
  const isBoutique = product.type === 'PARALLEL_IMPORT' || product.typeDescription === '병행수입(새상품)';

  const discountRate = product.discountRate || product.discount || 0;
  const finalPrice = discountRate > 0
    ? Math.floor(product.price * (1 - discountRate / 100))
    : product.price;

  const extractBrandLogoText = (fullName) => {
    if (!fullName) return 'BRAND';
    const match = fullName.match(/\(([^)]+)\)/);
    return match ? match[1] : fullName;
  };
  const brandLogoText = extractBrandLogoText(product.brand || product.brandName);

  const handleLikeToggle = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    try {
      const response = await axios.post(`http://localhost:8080/api/products/${product.productId}/likes`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.data === "상품을 찜했습니다.") setIsLiked(true);
      else setIsLiked(false);
    } catch (error) {
      console.error('찜하기 오류:', error);
      alert('찜 처리 중 오류가 발생했습니다.');
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL || 'https://onepick-lux-images.s3.ap-northeast-2.amazonaws.com';
    return `${S3_BASE_URL}/${path.startsWith('/') ? path.slice(1) : path}`;
  };

  const mainImg = product.thumbnailUrl || product.image;
  const extraImages = product.imageUrls || product.images || product.detailImages || [];
  const displayImages = [mainImg, ...extraImages].filter(Boolean);

  useEffect(() => {
    if (isHovered && displayImages.length > 1 && !isSoldOut) {
      setCurrentImageIndex(1);
      timerRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
      }, 2000);
    } else {
      clearInterval(timerRef.current);
      setCurrentImageIndex(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isHovered, displayImages.length, isSoldOut]);

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate(`/products/${product.productId || product.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] bg-[#F4F4F4] overflow-hidden mb-4 border border-[#E5E0D8]">

        {/* 💡 1. 부띠끄(새상품) 글로벌 배지 추가! 이제 어디서든 이 카드를 쓰면 배지가 보입니다. */}
        {isBoutique && !isSoldOut && (
          <div className="absolute top-0 left-0 bg-[#1A1A1A] text-[#D4AF37] text-[9px] font-black px-3 py-1.5 tracking-widest uppercase z-30 shadow-md">
            BOUTIQUE / 새상품
          </div>
        )}

        {/* 기존 할인 배지 위치 조정 (부띠끄 배지와 안 겹치도록) */}
        {!isSoldOut && discountRate > 0 && (
          <div className={`absolute left-0 bg-[#997B4D] text-white text-[10px] font-bold px-3 py-1.5 tracking-wider z-20 shadow-md ${isBoutique ? 'top-6' : 'top-0'}`}>
            -{discountRate}%
          </div>
        )}

        {displayImages.length > 0 && displayImages[0] !== "IMG" ? (
          displayImages.map((imgUrl, index) => (
            <img
              key={index}
              src={getImageUrl(imgUrl)}
              alt={`${product.name} 이미지 ${index}`}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${!isSoldOut && 'group-hover:scale-105'} ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              } ${isSoldOut ? 'grayscale-[30%]' : ''}`}
            />
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#CCC] font-serif tracking-widest transition">IMAGE</div>
        )}

        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 z-40 flex flex-col items-center justify-center p-4 backdrop-blur-[2px]">
             <span className="text-white font-serif text-2xl tracking-[0.25em] uppercase text-center mb-3 drop-shadow-md">
               {brandLogoText}
             </span>
             <div className="w-12 h-[1px] bg-white/60 mb-3"></div>
             <span className="text-white text-xs font-black tracking-[0.3em] uppercase drop-shadow-md">
               SOLD OUT
             </span>
          </div>
        )}

        <button
          onClick={handleLikeToggle}
          className="absolute top-3 right-3 z-30 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white shadow-sm transition-all"
        >
          <Heart
            size={18}
            className={`transition-colors duration-300 ${isLiked ? 'fill-red-500 text-red-500' : 'text-[#5C5550] hover:text-red-500'}`}
          />
        </button>

        {!isSoldOut && (
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent z-10">
            <button className="w-full py-3 bg-white text-[#2C2C2C] text-xs font-bold tracking-widest hover:bg-[#2C2C2C] hover:text-white transition shadow-lg">QUICK VIEW</button>
          </div>
        )}
      </div>

      <div className="text-center px-2">
        <h4 className={`font-bold text-xs uppercase tracking-widest mb-1 ${isSoldOut ? 'text-[#888]' : 'text-[#997B4D]'}`}>
          {product.brand || product.brandName}
        </h4>
        <p className={`text-sm mb-2 font-medium truncate ${isSoldOut ? 'text-[#aaa]' : 'text-[#4A4540]'}`}>
          {product.name}
        </p>

        <div className="flex items-center justify-center gap-2 font-serif text-[#2C2C2C] h-6">
          {isSoldOut ? (
            <span className="text-[10px] font-black text-[#888] tracking-widest uppercase bg-gray-100 px-3 py-1 rounded-sm">판매 완료</span>
          ) : discountRate > 0 ? (
            <>
              <span className="text-base font-bold text-red-500">{finalPrice.toLocaleString()}원</span>
              <span className="text-xs text-[#999] line-through decoration-1">{product.price?.toLocaleString()}원</span>
            </>
          ) : (
            <span className="text-base font-bold">{product.price?.toLocaleString()}원</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;