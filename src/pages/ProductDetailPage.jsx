import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Shield, CheckCircle, Share2, TrendingDown, Heart } from 'lucide-react';
import axios from 'axios';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  // 💡 메인 화면에 띄울 큰 이미지의 상태를 관리합니다.
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // 인증이 필요 없는 공개 API라고 가정합니다. (필요 시 토큰 추가)
        const response = await axios.get(`http://localhost:8080/api/products/${id}`);

        if (response.data && response.data.data) {
          const productData = response.data.data;
          setDetail(productData);
          // 💡 처음 렌더링 될 때는 메인 이미지를 썸네일로 설정합니다.
          setMainImage(productData.thumbnailUrl);

          if (productData.isLiked !== undefined) {
             setIsLiked(productData.isLiked);
          }
        }
      } catch (error) {
        console.error("상품 상세 조회 실패", error);
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleLikeToggle = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { alert('로그인이 필요한 서비스입니다.'); navigate('/login'); return; }
    try {
      const response = await axios.post(`http://localhost:8080/api/products/${id}/likes`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.data === "상품을 찜했습니다.") setIsLiked(true); else setIsLiked(false);
    } catch (error) { console.error('찜하기 오류:', error); alert('처리 중 오류가 발생했습니다.'); }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { alert('장바구니 기능은 로그인이 필요합니다.'); navigate('/login'); return; }
    try {
      const response = await axios.post('http://localhost:8080/api/cart', { productId: parseInt(id), count: 1 }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (response.data.status === 'OK' || response.status === 200) {
        if (window.confirm('장바구니에 상품이 담겼습니다. 장바구니로 이동하시겠습니까?')) navigate('/cart'); else window.location.reload();
      }
    } catch (error) {
      console.error('장바구니 담기 오류:', error);
      if (error.response && error.response.data && error.response.data.message) alert(error.response.data.message); else alert('이미 장바구니에 담긴 상품이거나 처리 중 오류가 발생했습니다.');
    }
  };

  // S3 이미지 URL 변환 헬퍼
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL || 'https://onepick-lux-images.s3.ap-northeast-2.amazonaws.com';
    return `${S3_BASE_URL}/${path.startsWith('/') ? path.slice(1) : path}`;
  };

  if (loading) return <div className="py-20 text-center text-[#888]">Loading detail...</div>;
  if (!detail) return <div className="py-20 text-center text-[#888]">상품 정보를 찾을 수 없습니다.</div>;

  const discountRate = detail.discountRate || 0;
  const finalPrice = discountRate > 0 ? Math.floor(detail.price * (1 - discountRate / 100)) : detail.price;

  // 💡 썸네일과 상세 이미지 배열을 하나로 합쳐서 "갤러리 리스트"를 만듭니다.
  // 백엔드 필드명이 imageUrls 인지 detailImages 인지 승태님의 DTO에 맞게 수정하세요!
  const allImages = [detail.thumbnailUrl, ...(detail.imageUrls || detail.detailImages || [])].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-xs text-[#888] mb-8 font-medium">Home &gt; {detail.categoryName || 'Category'} &gt; {detail.brandName || 'Brand'} &gt; <span className="text-[#2C2C2C]">{detail.name}</span></div>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">

        {/* 💡 [좌측] 이미지 갤러리 섹션 */}
        <div className="flex flex-col gap-4">
          {/* 1. 메인 큰 이미지 뷰어 */}
          <div className="relative aspect-square bg-[#F4F4F4] rounded-sm overflow-hidden flex items-center justify-center">
             {mainImage ? (
               <img src={getImageUrl(mainImage)} alt={detail.name} className="w-full h-full object-cover" />
             ) : (
               <div className="text-[#CCC] font-serif text-2xl tracking-widest">IMAGE</div>
             )}
          </div>

          {/* 2. 하단 작은 썸네일 리스트 (클릭하면 메인 이미지가 바뀜) */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setMainImage(imgUrl)} // 클릭 시 상태 변경
                  className={`relative w-20 h-20 shrink-0 border-2 rounded-sm overflow-hidden transition-all ${
                    mainImage === imgUrl ? 'border-[#2C2C2C] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={getImageUrl(imgUrl)} alt={`썸네일 ${index}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 💡 [우측] 상품 정보 섹션 */}
        <div className="flex flex-col justify-center">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-[#997B4D] font-bold text-sm tracking-widest uppercase border-b border-[#997B4D] pb-0.5">{detail.brandName || 'BRAND'}</span>
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

      {/* 💡 [하단] 쇼핑몰 스타일 상세 설명 영역 */}
      <div className="mt-32">
         <div className="flex justify-center border-b border-[#E5E0D8] mb-16">
            <button className="px-12 py-4 text-base font-bold text-[#2C2C2C] border-b-2 border-[#2C2C2C]">상품 상세 & 검수 리포트</button>
            <button className="px-12 py-4 text-base font-medium text-[#888] hover:text-[#2C2C2C]">배송/반품 안내</button>
         </div>

         <div className="max-w-4xl mx-auto animate-fade-in-up">

            {/* 텍스트 설명 부분 */}
            <div className="text-center mb-16 px-4">
              <h3 className="text-2xl font-serif text-[#2C2C2C] mb-6 tracking-wide">Product Details</h3>
              <div className="text-base text-[#5C5550] leading-relaxed whitespace-pre-wrap">
                {detail.description || "전문 감정사가 엄격한 기준에 따라 검수를 완료한 100% 정품입니다."}
              </div>
            </div>

            {/* 💡 상세 이미지 통으로 나열하기 (쇼핑몰 느낌) */}
            {/* imageUrls 나 detailImages 배열의 사진들을 세로로 꽉 차게 렌더링합니다. */}
            <div className="flex flex-col items-center w-full">
              {(detail.imageUrls || detail.detailImages || []).map((imgUrl, index) => (
                <img
                  key={index}
                  src={getImageUrl(imgUrl)}
                  alt={`상세설명 이미지 ${index + 1}`}
                  className="w-full max-w-3xl object-contain mb-2" // 가로를 꽉 채우고 아래 여백 살짝 줌
                />
              ))}
            </div>

         </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;