import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, Shield, CheckCircle, Share2, TrendingDown } from 'lucide-react';
import { getProductDetail } from '../api/productApi.js';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await getProductDetail(id);
        if (response && response.status === 'OK' && response.data) {
          setDetail(response.data);
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

  if (loading) return <div className="py-20 text-center text-[#888]">Loading detail...</div>;
  if (!detail) return <div className="py-20 text-center text-[#888]">상품 정보를 찾을 수 없습니다.</div>;

  // 💡 [추가] 할인율 및 최종 할인가 계산
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
          <div className="mb-2"><span className="text-[#997B4D] font-bold text-sm tracking-widest uppercase border-b border-[#997B4D] pb-0.5">{detail.brandName}</span></div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] mb-6 leading-tight">{detail.name}</h1>

          {/* 💡 [수정] 할인가가 적용된 UI 영역 */}
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
            <button className="flex-1 bg-[#2C2C2C] text-white py-4 font-bold text-sm tracking-widest hover:bg-[#444] transition shadow-lg">BUY NOW</button>
            <button className="flex-1 border border-[#E5E0D8] text-[#2C2C2C] py-4 font-bold text-sm tracking-widest hover:border-[#2C2C2C] transition flex items-center justify-center gap-2">
              <ShoppingBag size={18} strokeWidth={1.5} /> ADD TO CART
            </button>
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

            {detail.inspection && (
              <div className="bg-[#FDFBF7] border border-[#E5E0D8] p-8 mt-10">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E5E0D8]">
                  <Shield className="text-[#997B4D]" size={24} />
                  <h3 className="text-lg font-bold text-[#2C2C2C] tracking-widest">전문 감정사 검수 리포트</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-center text-sm">
                  <div><div className="text-[#888] mb-1 text-xs">가죽 상태</div><div className="font-bold text-[#2C2C2C] text-lg text-[#997B4D]">{detail.inspection.leatherStatus || '-'}</div></div>
                  <div><div className="text-[#888] mb-1 text-xs">금속 장식</div><div className="font-bold text-[#2C2C2C] text-lg text-[#997B4D]">{detail.inspection.hardwareStatus || '-'}</div></div>
                  <div><div className="text-[#888] mb-1 text-xs">형태 보존</div><div className="font-bold text-[#2C2C2C] text-lg text-[#997B4D]">{detail.inspection.shapeStatus || '-'}</div></div>
                  <div><div className="text-[#888] mb-1 text-xs">내부 오염</div><div className="font-bold text-[#2C2C2C] text-lg text-[#997B4D]">{detail.inspection.innerStatus || '-'}</div></div>
                </div>
                <div className="bg-white p-6 border border-[#E5E0D8] rounded-sm">
                  <span className="text-xs font-bold text-[#997B4D] mb-2 block">감정사 종합 소견</span>
                  <p className="text-sm text-[#5C5550] leading-relaxed">"{detail.inspection.finalComment}"</p>
                  <div className="mt-4 text-right text-xs text-[#888]">
                    담당 감정사: {detail.inspection.inspectorName} | 검수일: {detail.inspection.inspectedAt}
                  </div>
                </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;