import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, ChevronRight, ShieldCheck, Plane, Award, Sparkles } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/common/ProductCard.jsx';
import { getProducts } from '../api/productApi.js';

const BoutiquePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBoutiqueProducts = async () => {
    try {
      setLoading(true);
      // 💡 [핵심] API 호출 시 type 파라미터에 'PARALLEL_IMPORT'를 실어서 보냅니다.
      const params = {
        page: 0,
        size: 40,
        type: 'PARALLEL_IMPORT', // 새상품 고정
        sort: 'new' // 기본적으로 최신순 정렬
      };

      const response = await getProducts(params);
      if (response.data && response.data.content) {
          setProducts(response.data.content);
      } else {
          setProducts([]);
      }
    } catch (error) {
      console.error('부띠끄 상품 로딩 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoutiqueProducts();
  }, []);

  return (
    <div className="animate-fade-in font-sans min-h-screen bg-[#FAFAFA] pb-20">

      {/* 💡 1. 럭셔리 부띠끄 전용 메인 배너 (블랙 & 골드 테마) */}
      <div className="bg-[#1A1A1A] py-24 px-4 text-center border-b-[6px] border-[#D4AF37] relative overflow-hidden">
        {/* 장식용 배경 이펙트 */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-[150px] opacity-10"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-white rounded-full blur-[150px] opacity-5"></div>

        <div className="relative z-10 flex flex-col items-center">
          <span className="flex items-center gap-2 text-[#D4AF37] text-[10px] font-black tracking-[0.4em] uppercase mb-6">
            <Sparkles size={14} /> Official Parallel Import
          </span>
          <h1 className="text-5xl md:text-6xl font-serif text-white mb-6 tracking-tight drop-shadow-lg">
            BOUTIQUE <span className="font-light italic text-[#D4AF37]">Select</span>
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light">
            유럽 현지 부띠끄에서 정식 통관을 거쳐 직수입된 <span className="font-bold text-white border-b border-[#D4AF37]">100% 완전한 새상품</span>입니다.<br/>
            웨이팅 없이, 프리미엄 명품을 가장 빠르고 합리적으로 만나보세요.
          </p>
        </div>
      </div>

      {/* 💡 2. 신뢰도(Trust) 강조 영역 (고객 불안감 해소) */}
      <div className="bg-white border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#E5E0D8]">
          <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-0">
            <Plane className="text-[#997B4D] mb-3" size={28} strokeWidth={1.5} />
            <h4 className="font-bold text-[#2C2C2C] text-sm mb-1">유럽 현지 직수입</h4>
            <p className="text-xs text-[#888]">이탈리아, 프랑스 정식 매장 바잉</p>
          </div>
          <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-0">
            <ShieldCheck className="text-[#997B4D] mb-3" size={28} strokeWidth={1.5} />
            <h4 className="font-bold text-[#2C2C2C] text-sm mb-1">100% 정품 보장</h4>
            <p className="text-xs text-[#888]">가품 판정 시 200% 책임 보상제</p>
          </div>
          <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-0">
            <Award className="text-[#997B4D] mb-3" size={28} strokeWidth={1.5} />
            <h4 className="font-bold text-[#2C2C2C] text-sm mb-1">관부가세 포함</h4>
            <p className="text-xs text-[#888]">숨겨진 추가 비용 없는 투명한 가격</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex justify-between items-end mb-8 border-b border-[#E5E0D8] pb-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#2C2C2C]">New Arrivals</h2>
            <p className="text-xs text-[#888] mt-2">총 <span className="font-bold text-[#997B4D]">{products.length}</span>개의 새상품이 준비되어 있습니다.</p>
          </div>
        </div>

        {/* ================= 상품 목록 ================= */}
        {loading ? (
           <div className="text-center py-32 text-[#888] animate-pulse">부띠끄 컬렉션을 불러오는 중입니다...</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {products.map((product) => (
                // 💡 [수정] 겉을 감싸던 div와 수동 배지 코드를 싹 지우고 오직 ProductCard만 호출합니다!
                <ProductCard
                    key={product.productId}
                    product={{
                        ...product,
                        image: product.thumbnailUrl || "IMG",
                        brand: product.brandName,
                        name: product.name,
                        price: product.price,
                        discountRate: product.discountRate
                    }}
                />
              ))}
          </div>
        ) : (
           <div className="text-center py-32 flex flex-col items-center">
             <Sparkles size={40} className="text-[#E5E0D8] mb-4" />
             <p className="text-[#5C5550] font-bold">현재 입고된 부띠끄 새상품이 없습니다.</p>
             <p className="text-sm text-[#888] mt-2">새로운 컬렉션 입고를 기대해 주세요.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default BoutiquePage;