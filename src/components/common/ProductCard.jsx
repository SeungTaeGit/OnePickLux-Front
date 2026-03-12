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

  const discountRate = product.discountRate || product.discount || 0;
  const finalPrice = discountRate > 0
    ? Math.floor(product.price * (1 - discountRate / 100))
    : product.price;

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
    if (isHovered && displayImages.length > 1) {
      setCurrentImageIndex(1);

      timerRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
      }, 2000);
    } else {
      clearInterval(timerRef.current);
      setCurrentImageIndex(0);
    }

    return () => clearInterval(timerRef.current);
  }, [isHovered, displayImages.length]);

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate(`/products/${product.productId}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] bg-[#F4F4F4] overflow-hidden mb-4 border border-[#E5E0D8]">

        {/* 💡 [수정됨] z-index(레이어) 이동 코드를 삭제하고, 오직 투명도(opacity)만으로 부드럽게 페이드인/아웃 시킵니다. */}
        {displayImages.length > 0 && displayImages[0] !== "IMG" ? (
          displayImages.map((imgUrl, index) => (
            <img
              key={index}
              src={getImageUrl(imgUrl)}
              alt={`${product.name} 이미지 ${index}`}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#CCC] font-serif tracking-widest group-hover:scale-105 transition">IMAGE</div>
        )}

        {discountRate > 0 && (
          <div className="absolute top-0 left-0 bg-[#997B4D] text-white text-[10px] font-bold px-3 py-1.5 tracking-wider z-10">
            -{discountRate}%
          </div>
        )}

        <button
          onClick={handleLikeToggle}
          className="absolute top-3 right-3 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white shadow-sm transition-all"
        >
          <Heart
            size={18}
            className={`transition-colors duration-300 ${isLiked ? 'fill-red-500 text-red-500' : 'text-[#5C5550] hover:text-red-500'}`}
          />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent z-10">
          <button className="w-full py-3 bg-white text-[#2C2C2C] text-xs font-bold tracking-widest hover:bg-[#2C2C2C] hover:text-white transition">QUICK VIEW</button>
        </div>
      </div>

      <div className="text-center px-2">
        <h4 className="font-bold text-[#997B4D] text-xs uppercase tracking-widest mb-1">{product.brand || product.brandName}</h4>
        <p className="text-sm text-[#4A4540] mb-2 font-medium truncate">{product.name}</p>
        <div className="flex items-center justify-center gap-2 font-serif text-[#2C2C2C]">
          {discountRate > 0 ? (
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