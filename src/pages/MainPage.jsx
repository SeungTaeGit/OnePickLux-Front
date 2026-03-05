import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BannerSection from '../components/home/BannerSection.jsx';
import ProductCard from '../components/common/ProductCard.jsx';
import { getProducts } from '../api/productApi.js';
import { ArrowRight, Sparkles, Flame, Tag } from 'lucide-react';

const MainPage = () => {
  const navigate = useNavigate();

  // 💡 5가지 섹션의 데이터를 각각 관리할 상태 변수들
  const [newProducts, setNewProducts] = useState([]);
  const [bestProducts, setBestProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [chanelProducts, setChanelProducts] = useState([]);
  const [rolexProducts, setRolexProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMainData = async () => {
      setIsLoading(true);
      try {
        // 💡 [백엔드 최적화 포인트] Promise.all을 통해 5개의 API를 병렬로 동시 호출합니다!
        const [newRes, bestRes, saleRes, chanelRes, rolexRes] = await Promise.all([
          getProducts({ size: 4, sort: 'new' }),                                  // 1. 신상품 4개
          getProducts({ size: 4, sort: 'best' }),                                 // 2. 베스트 4개
          getProducts({ size: 3, sort: 'sale', filter: 'sale' }),                 // 3. 세일 상품 3개 (할인율 높은 순)
          getProducts({ brandId: 2, size: 3, sort: 'new' }),                      // 4. 샤넬 상품 3개
          getProducts({ brandId: 3, size: 3, sort: 'new' })                       // 5. 롤렉스 상품 3개
        ]);

        if (newRes.data?.content) setNewProducts(newRes.data.content);
        if (bestRes.data?.content) setBestProducts(bestRes.data.content);
        if (saleRes.data?.content) setSaleProducts(saleRes.data.content);
        if (chanelRes.data?.content) setChanelProducts(chanelRes.data.content);
        if (rolexRes.data?.content) setRolexProducts(rolexRes.data.content);

      } catch (error) {
        console.error('메인 데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMainData();
  }, []);

  // 카드 렌더링 헬퍼 함수
  const renderProductCards = (products) => {
    return products.map(product => (
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
    ));
  };

  return (
    <div className="animate-fade-in font-sans pb-20 bg-white">

      {/* 1. 최상단 배너 섹션 */}
      <BannerSection />

      {/* 2. 신상품 (New Arrivals) 섹션 */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#E5E0D8]">
        <div className="flex flex-col items-center mb-12">
          <span className="flex items-center gap-2 text-[#997B4D] text-[10px] font-black tracking-[0.3em] mb-3 uppercase">
            <Sparkles size={14} /> Fresh Drops
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] tracking-widest uppercase">New Arrivals</h2>
          <div className="w-10 h-[1px] bg-[#997B4D] mt-6"></div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#888] animate-pulse">신상품을 불러오는 중입니다...</div>
        ) : newProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {renderProductCards(newProducts)}
          </div>
        ) : (
          <div className="text-center py-20 text-[#888]">등록된 신상품이 없습니다.</div>
        )}
      </section>

      {/* 3. 대표 브랜드 (Brand Focus) 섹션 */}
      <section className="bg-[#FDFBF7] py-24 border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] tracking-widest uppercase">Brand Focus</h2>
            <div className="w-10 h-[1px] bg-[#997B4D] mx-auto mt-6 mb-4"></div>
            <p className="text-[#888] text-sm tracking-widest uppercase">원픽럭스가 엄선한 이달의 브랜드</p>
          </div>

          {/* CHANEL */}
          <div className="flex flex-col lg:flex-row gap-8 mb-24">
            <div
              onClick={() => navigate('/brand/chanel')}
              className="lg:w-1/3 relative aspect-[3/4] overflow-hidden group cursor-pointer bg-[#1A1A1A] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition duration-700 z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=2000&auto=format&fit=crop"
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out opacity-70"
              />
              <div className="absolute bottom-10 left-8 z-20 text-white">
                <h3 className="text-4xl font-serif mb-3 tracking-widest">CHANEL</h3>
                <p className="text-sm flex items-center gap-2 tracking-widest uppercase hover:text-[#D4AF37] transition-colors">
                  Discover More <ArrowRight size={16} />
                </p>
              </div>
            </div>
            <div className="lg:w-2/3 flex items-center">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
                {isLoading ? Array(3).fill(0).map((_, i) => <div key={i} className="aspect-square bg-white animate-pulse"></div>)
                : renderProductCards(chanelProducts)}
              </div>
            </div>
          </div>

          {/* ROLEX */}
          <div className="flex flex-col lg:flex-row-reverse gap-8">
            <div
              onClick={() => navigate('/brand/rolex')}
              className="lg:w-1/3 relative aspect-[3/4] overflow-hidden group cursor-pointer bg-[#006039] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition duration-700 z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2000&auto=format&fit=crop"
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out opacity-80"
              />
              <div className="absolute bottom-10 right-8 z-20 text-white text-right">
                <h3 className="text-4xl font-serif mb-3 tracking-widest">ROLEX</h3>
                <p className="text-sm flex items-center justify-end gap-2 tracking-widest uppercase hover:text-[#D4AF37] transition-colors">
                  Discover More <ArrowRight size={16} />
                </p>
              </div>
            </div>
            <div className="lg:w-2/3 flex items-center">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
                {isLoading ? Array(3).fill(0).map((_, i) => <div key={i} className="aspect-square bg-white animate-pulse"></div>)
                : renderProductCards(rolexProducts)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 베스트 상품 (Best Sellers) 섹션 */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-12">
          <span className="flex items-center gap-2 text-[#997B4D] text-[10px] font-black tracking-[0.3em] mb-3 uppercase">
            <Flame size={14} /> Trending Now
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] tracking-widest uppercase">Best Sellers</h2>
          <div className="w-10 h-[1px] bg-[#997B4D] mt-6"></div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#888] animate-pulse">인기 상품을 불러오는 중입니다...</div>
        ) : bestProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {renderProductCards(bestProducts)}
          </div>
        ) : (
          <div className="text-center py-20 text-[#888]">등록된 상품이 없습니다.</div>
        )}
      </section>

      {/* 5. 미드 배너 (중간 스페셜 딜 배너) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-[#2C2C2C] rounded-sm p-10 md:p-14 text-white relative overflow-hidden shadow-2xl flex flex-col items-center text-center justify-center">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 border border-[#D4AF37] text-[#D4AF37] text-[10px] font-bold tracking-widest mb-6">위탁 수수료 20% 할인</span>
            <h3 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">옷장 속 잠든 명품,<br/><span className="text-[#D4AF37] italic">지금이</span> 판매 찬스!</h3>
            <p className="text-gray-400 mb-10 font-light leading-relaxed">업계 최고 전문가의 명품 케어 서비스와 함께<br/>원픽럭스에서 가장 빠르고 안전하게 판매하세요.</p>
            <button onClick={() => navigate('/selling')} className="px-10 py-4 bg-[#D4AF37] text-white text-sm font-bold tracking-widest hover:bg-[#B89628] transition shadow-lg">내 명품 판매하기</button>
          </div>
          {/* 배너 배경 장식 */}
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-[150px] opacity-10 pointer-events-none -translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-white rounded-full blur-[150px] opacity-5 pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        </div>
      </section>

      {/* 6. 오늘의 세일 상품 (Today's Sale) 섹션 */}
      <section className="bg-[#F8F9FA] py-24 border-t border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-12">
            <span className="flex items-center gap-2 text-[#D32F2F] text-[10px] font-black tracking-[0.3em] mb-3 uppercase">
              <Tag size={14} /> Limited Offer
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] tracking-widest uppercase">Today's Sale</h2>
            <div className="w-10 h-[1px] bg-[#D32F2F] mt-6"></div>
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-[#888] animate-pulse">특가 상품을 불러오는 중입니다...</div>
          ) : saleProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-8 gap-y-12 max-w-5xl mx-auto">
              {/* 세일 상품은 임팩트 있게 3개만 크게 보여줍니다 */}
              {renderProductCards(saleProducts)}
            </div>
          ) : (
            <div className="text-center py-20 text-[#888]">현재 진행 중인 특가 상품이 없습니다.</div>
          )}

          <div className="mt-16 text-center">
            <button onClick={() => navigate('/products?filter=sale')} className="px-10 py-3 border border-[#2C2C2C] text-xs font-bold tracking-widest text-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-white transition uppercase">
              특가 상품 전체보기
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default MainPage;