import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import axios from 'axios';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  // 💡 [수정] 백엔드와 맞추어 변수명을 isLiked로 통일!
  const [isLiked, setIsLiked] = useState(product.isLiked || false);

  const discountRate = product.discountRate || product.discount || 0;
  const finalPrice = discountRate > 0
    ? Math.floor(product.price * (1 - discountRate / 100))
    : product.price;

  // 💡 [수정] 찜하기(Like) 버튼 클릭 시 실행되는 함수
  const handleLikeToggle = async (e) => {
    e.stopPropagation(); // 카드 클릭 시 상세페이지로 이동하는 것 방지

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    try {
      // 대표님이 만드신 백엔드의 ProductLikeController 주소로 요청!
      const response = await axios.post(`http://localhost:8080/api/products/${product.productId}/likes`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 💡 백엔드 응답 메시지("상품을 찜했습니다." / "찜하기를 취소했습니다.")를 보고 하트 색깔 결정
      if (response.data.data === "상품을 찜했습니다.") {
         setIsLiked(true);
      } else {
         setIsLiked(false);
      }
    } catch (error) {
      console.error('찜하기 오류:', error);
      alert('찜 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="group cursor-pointer" onClick={() => navigate(`/products/${product.productId}`)}>
      <div className="relative aspect-[3/4] bg-[#F4F4F4] overflow-hidden mb-4 border border-[#E5E0D8]">
        {product.image && product.image !== "IMG" ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#CCC] font-serif tracking-widest group-hover:scale-105 transition">IMAGE</div>
        )}

        {discountRate > 0 && (
          <div className="absolute top-0 left-0 bg-[#997B4D] text-white text-[10px] font-bold px-3 py-1.5 tracking-wider z-10">
            -{discountRate}%
          </div>
        )}

        {/* 💡 [수정] 하트 UI (isLiked 상태 반영) */}
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