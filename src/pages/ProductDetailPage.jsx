import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Shield, CheckCircle, Share2, TrendingDown, Heart } from 'lucide-react';
import { getProductDetail } from '../api/productApi.js';
import axios from 'axios';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // 페이지 이동을 위해 추가
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await getProductDetail(id);
        if (response && response.status === 'OK' && response.data) {
          setDetail(response.data);
          if (response.data.isLiked !== undefined) {
             setIsLiked(response.data.isLiked);
          }
        } else {
          setDetail(null);
        }
      } catch (error) {
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleLikeToggle = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8080/api/products/${id}/likes`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.data === "상품을 찜했습니다.") {
         setIsLiked(true);
      } else {
         setIsLiked(false);
      }
    } catch (error) {
      console.error('찜하기 오류:', error);
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  // 💡 [핵심 추가] 장바구니 담기 함수
  const handleAddToCart = async () => {
    const token = localStorage.getItem('accessToken');

    // 1. 비로그인 상태면 로그인 페이지로 유도
    if (!token) {
      alert('장바구니 기능은 로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      // 2. 백엔드 API 호출 (단일 상품이므로 count는 무조건 1로 고정)
      const response = await axios.post('http://localhost:8080/api/cart',
        {
          productId: parseInt(id),
          count: 1
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // 3. 성공 시 처리
      if (response.data.status === 'OK' || response.status === 200) {
        // 사용자에게 장바구니로 바로 이동할지 묻습니다.
        if (window.confirm('장바구니에 상품이 담겼습니다. 장바구니로 이동하시겠습니까?')) {
          navigate('/cart');
        } else {
          // 이동하지 않고 현재 페이지에 남을 경우, 헤더의 장바구니 숫자를 갱신하기 위해 새로고침(또는 상태 업데이트)
          window.location.reload();
        }
      }
    } catch (error) {
      // 4. 실패 시 처리 (특히 백엔드에서 던진 "이미 담긴 상품입니다" 예외 처리)
      console.error('장바구니 담기 오류:', error);

      // 백엔드의 GlobalExceptionHandler가 에러 메시지를 response.data.message 등에 담아준다고 가정
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('이미 장바구니에 담긴 상품이거나 처리 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) return <div className="py-20 text-center text-[#888]">Loading detail...</div>;
  if (!detail) return <div className="py-20 text-center text-[#888]">상품 정보를 찾을 수 없습니다.</div>;

  const discountRate = detail.discountRate || detail.discount || 0;
  const finalPrice = discountRate > 0
    ? Math.floor(detail.price * (1 - discountRate / 100))
    : detail.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-xs text-[#888] mb-8 font-medium">Home &gt; {detail.categoryName || 'Category'} &gt; {detail.brandName} &gt; <span className="text-[#2C2C2C]">{detail.name}</span></div>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        <div className="relative aspect-square bg-[#F4F4F4] rounded-sm overflow-hidden group">
           {detail.thumbnailUrl ? (
             <img src={detail.thumbnailUrl} alt={detail.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
           ) : (
             <div className="absolute inset-0 flex items-center justify-center text-[#CCC] font-serif text-2xl tracking-widest group-hover:scale-105 transition-transform duration-700">IMAGE</div>
           )}
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-[#997B4D] font-bold text-sm tracking-widest uppercase border-b border-[#997B4D] pb-0.5">{detail.brandName}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] mb-6 leading-tight">{detail.name}</h1>

          <div className="flex items-center gap-4 mb-8">
            {discountRate > 0 ? (
              <div className="flex flex-col">
                <span className="text-lg text-[#999] line-through decoration-1 mb-1 font-serif">
                  {detail.price?.toLocaleString()}원
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-serif text-red-500 font-bold">
                    {finalPrice.toLocaleString()}<span className="text-2xl text-red-500 ml-1">원</span>
                  </span>
                  <span className="bg-red-50 text-red-500 border border-red-200 text-xs font-bold px-2 py-1 tracking-wider flex items-center gap-1">
                    <TrendingDown size={12}/> -{discountRate}%
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-3xl font-serif text-[#2C2C2C]">
                {detail.price?.toLocaleString()}<span className="text-lg ml-1">원</span>
              </span>
            )}
          </div>

          <div className="h-[1px] bg-[#E5E0D8] w-full mb-8"></div>

          <div className="space-y-4 mb-10 text-sm text-[#5C5550]">
            <div className="flex"><span className="w-24 font-bold text-[#2C2C2C]">상품 상태</span><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#997B4D]"></span>{detail.grade || 'S등급'}</span></div>
            <div className="flex"><span className="w-24 font-bold text-[#2C2C2C]">상품 번호</span><span className="font-mono text-[#888]">P-{10000 + detail.productId}</span></div>
            <div className="flex"><span className="w-24 font-bold text-[#2C2C2C]">배송 정보</span><span>무료배송 (우체국 택배 안전배송)</span></div>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={handleLikeToggle}
              className="w-14 flex items-center justify-center border border-[#E5E0D8] hover:border-[#2C2C2C] transition group bg-white"
            >
              <Heart size={20} className={`transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-[#2C2C2C] group-hover:text-red-500'}`} />
            </button>
            {/* 💡 [수정] ADD TO CART 버튼에 onClick 이벤트 연결 */}
            <button
              onClick={handleAddToCart}
              className="flex-1 border border-[#E5E0D8] text-[#2C2C2C] py-4 font-bold text-sm tracking-widest hover:border-[#2C2C2C] transition flex items-center justify-center gap-2 bg-white hover:bg-gray-50"
            >
              <ShoppingBag size={18} strokeWidth={1.5} /> ADD TO CART
            </button>
            <button className="flex-1 bg-[#2C2C2C] text-white py-4 font-bold text-sm tracking-widest hover:bg-[#444] transition shadow-lg">BUY NOW</button>
          </div>

          <div className="flex items-center justify-between text-xs text-[#888] border-t border-[#E5E0D8] pt-4">
            <div className="flex items-center gap-1"><Shield size={14} /> 100% 정품 보증</div>
            <div className="flex items-center gap-1"><CheckCircle size={14} /> 전문 감정사 검수</div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-[#2C2C2C]"><Share2 size={14} /> 공유하기</div>
          </div>
        </div>
      </div>

      <div className="mt-24">
         <div className="flex border-b border-[#E5E0D8] mb-10">
            <button className="px-8 py-4 text-sm font-bold text-[#2C2C2C] border-b-2 border-[#2C2C2C]">상품 상세 & 검수 리포트</button>
            <button className="px-8 py-4 text-sm font-medium text-[#888] hover:text-[#2C2C2C]">배송/반품</button>
         </div>
         <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">
            <div className="text-center">
              <h3 className="text-xl font-serif text-[#2C2C2C] mb-4">Product Details</h3>
              <p className="text-sm text-[#5C5550] leading-loose">{detail.description || "전문 감정사가 엄격한 기준에 따라 검수를 완료한 100% 정품입니다."}</p>
            </div>
            {/* 기존 검수 리포트 내용이 있다면 이 아래에 유지됩니다 */}
         </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;