import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard.jsx';
import { getProducts } from '../api/productApi.js';

// 💡 프론트엔드와 백엔드의 ID를 매핑 (실제 DB의 Brand ID와 일치해야 합니다)
const BRAND_INFO = {
  'hermes': { id: 1, kor: '에르메스', desc: '장인정신이 깃든 최고의 럭셔리', bg: 'bg-[#F37021]', text: 'text-white' },
  'chanel': { id: 2, kor: '샤넬', desc: '세기를 뛰어넘는 우아함의 대명사', bg: 'bg-[#1A1A1A]', text: 'text-white' },
  'rolex': { id: 3, kor: '롤렉스', desc: '성공의 상징, 변치 않는 가치', bg: 'bg-[#006039]', text: 'text-white' },
  'louis-vuitton': { id: 4, kor: '루이비통', desc: '여행의 예술을 담은 모노그램', bg: 'bg-[#3E3222]', text: 'text-[#D4AF37]' },
  'dior': { id: 5, kor: '디올', desc: '여성성을 극대화한 프렌치 시크', bg: 'bg-[#E5E0D8]', text: 'text-[#2C2C2C]' }
};

const BrandPage = () => {
  const { brandName } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const brandInfo = BRAND_INFO[brandName?.toLowerCase()];

  useEffect(() => {
    const fetchBrandProducts = async () => {
      // 매핑된 브랜드 정보가 없으면 (잘못된 URL 등) 실행 방지
      if (!brandInfo) return;

      setIsLoading(true);
      try {
        // 💡 [핵심] 키워드 검색(LIKE)이 아닌 정확한 brandId(=)로 요청합니다!
        const response = await getProducts({
          page: 0,
          size: 20,
          sort: 'createdAt,desc',
          brandId: brandInfo.id
        });

        if (response.data && response.data.content) {
          setProducts(response.data.content);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('브랜드 상품 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrandProducts();
  }, [brandName, brandInfo]); // URL이 바뀔 때마다 재실행

  // 잘못된 브랜드 URL 접근 시
  if (!brandInfo) {
    return <div className="py-32 text-center text-xl font-bold">존재하지 않는 브랜드관입니다.</div>;
  }

  return (
    <div className="animate-fade-in font-sans pb-20">

      {/* 브랜드관 상단 대형 배너 */}
      <div className={`w-full py-24 md:py-32 flex flex-col items-center justify-center transition-colors ${brandInfo.bg} ${brandInfo.text}`}>
        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-widest uppercase mb-4">
          {brandName}
        </h1>
        <p className="text-sm md:text-base tracking-widest opacity-80 font-medium">
          {brandInfo.desc}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-center justify-between mb-10 border-b border-[#E5E0D8] pb-4">
          <h2 className="text-xl font-bold text-[#2C2C2C]">
            <span className="text-[#997B4D]">{brandInfo.kor}</span> 상품 모아보기
          </h2>
          <span className="text-sm text-[#888]">총 <span className="font-bold text-[#2C2C2C]">{products.length}</span>개의 상품</span>
        </div>

        {isLoading ? (
          <div className="py-32 text-center text-[#888] animate-pulse font-medium">상품을 정성껏 진열하는 중입니다...</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product) => (
              <ProductCard
                key={product.productId}
                product={{
                  ...product,
                  image: product.thumbnailUrl,
                  brand: product.brandName,
                  name: product.name,
                  price: product.price
                }}
              />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-[#CCC] text-2xl font-serif">!</div>
            <p className="text-[#5C5550] font-bold mb-2">아직 등록된 {brandInfo.kor} 상품이 없습니다.</p>
            <p className="text-sm text-[#888]">가장 먼저 {brandInfo.kor}의 주인공이 되어보세요!</p>
            <button onClick={() => navigate('/selling')} className="mt-6 px-6 py-2 border border-[#2C2C2C] text-sm font-bold hover:bg-[#2C2C2C] hover:text-white transition">
              판매 신청하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandPage;