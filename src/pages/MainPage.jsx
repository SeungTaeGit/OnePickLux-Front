import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero3DShowcase from '../components/home/Hero3DShowcase.jsx'; // 💡 신규 3D 히어로 배너 임포트
import BannerSection from '../components/home/BannerSection.jsx'; // 💡 승태님의 기존 동적 롤링 배너
import ProductCard from '../components/common/ProductCard.jsx';
import { getProducts } from '../api/productApi.js';
import axios from 'axios';
import { ArrowRight, Sparkles, Flame, Tag, Clock } from 'lucide-react';

const MainPage = () => {
  const navigate = useNavigate();

  const [boutiqueProducts, setBoutiqueProducts] = useState([]);
  const [preOwnedNewProducts, setPreOwnedNewProducts] = useState([]);
  const [bestProducts, setBestProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [chanelProducts, setChanelProducts] = useState([]);
  const [rolexProducts, setRolexProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeBrands, setActiveBrands] = useState([]);
  const [chanelBrandInfo, setChanelBrandInfo] = useState(null);
  const [rolexBrandInfo, setRolexBrandInfo] = useState(null);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL || 'https://onepick-lux-images.s3.ap-northeast-2.amazonaws.com';
    return `${S3_BASE_URL}/${path.startsWith('/') ? path.slice(1) : path}`;
  };

  useEffect(() => {
    const fetchMainData = async () => {
      setIsLoading(true);
      try {
        const brandRes = await axios.get('http://localhost:8080/api/brands/active');
        const allBrands = brandRes.data?.data || brandRes.data || [];

        setActiveBrands(allBrands);

        const chanel = allBrands.find(b => b.englishName?.toUpperCase() === 'CHANEL');
        const rolex = allBrands.find(b => b.englishName?.toUpperCase() === 'ROLEX');

        setChanelBrandInfo(chanel);
        setRolexBrandInfo(rolex);

        const chanelId = chanel?.id || chanel?.brandId || 2;
        const rolexId = rolex?.id || rolex?.brandId || 3;

        const [boutiqueRes, preNewRes, bestRes, saleRes, chanelProductsRes, rolexProductsRes] = await Promise.all([
          getProducts({ type: 'PARALLEL_IMPORT', size: 4, sort: 'new' }),
          getProducts({ type: 'PRE_OWNED', size: 4, sort: 'new' }),
          getProducts({ type: 'PRE_OWNED', size: 4, sort: 'best' }),
          getProducts({ type: 'PRE_OWNED', size: 3, sort: 'sale', filter: 'sale' }),
          getProducts({ type: 'PRE_OWNED', brandId: chanelId, size: 3, sort: 'new' }),
          getProducts({ type: 'PRE_OWNED', brandId: rolexId, size: 3, sort: 'new' })
        ]);

        if (boutiqueRes.data?.content) setBoutiqueProducts(boutiqueRes.data.content);
        if (preNewRes.data?.content) setPreOwnedNewProducts(preNewRes.data.content);
        if (bestRes.data?.content) setBestProducts(bestRes.data.content);
        if (saleRes.data?.content) setSaleProducts(saleRes.data.content);
        if (chanelProductsRes.data?.content) setChanelProducts(chanelProductsRes.data.content);
        if (rolexProductsRes.data?.content) setRolexProducts(rolexProductsRes.data.content);

      } catch (error) {
        console.error('메인 데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMainData();
  }, []);

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
          discountRate: product.discountRate,
          type: product.type,
          typeDescription: product.typeDescription
        }}
      />
    ));
  };

  const navigateToBrand = (brand) => {
    if (!brand) return;
    const slug = brand.englishName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/brand/${slug}`, {
      state: { brandId: brand.id || brand.brandId, brandName: brand.englishName }
    });
  };

  return (
    <div className="animate-fade-in font-sans pb-20 bg-white flex flex-col">

      {/* 💡 1. [압도적 UX] 최상단 3D 히어로 쇼케이스 */}
      <Hero3DShowcase />

      {/* 💡 2. [마케팅/프로모션] 승태님이 만든 동적 롤링 배너 */}
      <BannerSection />

      {/* 3. Shop by Brand */}
      <section className="py-12 border-b border-[#E5E0D8] bg-white mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-xs font-black tracking-[0.3em] text-gray-400 mb-8 uppercase">Shop by Brand</h2>

          <div className="flex gap-4 md:gap-8 justify-start md:justify-center overflow-x-auto pb-4 scrollbar-hide snap-x">
            {activeBrands.map((brand) => {
              const brandId = brand.id || brand.brandId;
              return (
                <div
                  key={brandId}
                  onClick={() => navigateToBrand(brand)}
                  className="flex flex-col items-center gap-3 cursor-pointer group flex-shrink-0 snap-center"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-[#E5E0D8] overflow-hidden p-[2px] group-hover:border-[#997B4D] transition-colors bg-white shadow-sm flex items-center justify-center">
                    {brand.logoUrl ? (
                      <img src={getImageUrl(brand.logoUrl)} alt={brand.englishName} className="w-full h-full object-contain p-2 mix-blend-multiply group-hover:scale-110 transition-all duration-500" />
                    ) : (
                      <span className="text-[8px] font-bold text-gray-400">NO LOGO</span>
                    )}
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-[#5C5550] tracking-widest group-hover:text-[#997B4D] transition-colors uppercase">
                    {brand.englishName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. BOUTIQUE (새상품) 프리뷰 섹션 */}
      <section className="bg-[#1A1A1A] py-24 border-b-4 border-[#D4AF37]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-16 text-center">
            <span className="flex items-center gap-2 text-[#D4AF37] text-[10px] font-black tracking-[0.4em] mb-4 uppercase">
              <Sparkles size={14} /> Official Parallel Import
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-widest uppercase drop-shadow-md">
              BOUTIQUE <span className="font-light italic text-[#D4AF37]">Select</span>
            </h2>
            <p className="text-gray-400 text-sm mt-4 font-light">유럽 현지 부띠끄에서 정식 수입된 100% 미사용 새상품</p>
            <div className="w-10 h-[1px] bg-[#D4AF37] mt-6"></div>
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-gray-500 animate-pulse">부띠끄 컬렉션을 불러오는 중입니다...</div>
          ) : boutiqueProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                {renderProductCards(boutiqueProducts)}
              </div>
              <div className="mt-16 text-center">
                <button onClick={() => navigate('/boutique')} className="px-10 py-3 border border-[#D4AF37] text-xs font-bold tracking-widest text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition uppercase">
                  부띠끄 전체보기
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">입고 준비 중입니다.</div>
          )}
        </div>
      </section>

      {/* 5. PRE-OWNED 신상품 섹션 */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#E5E0D8]">
        <div className="flex flex-col items-center mb-12">
          <span className="flex items-center gap-2 text-[#997B4D] text-[10px] font-black tracking-[0.3em] mb-3 uppercase">
            <Clock size={14} /> Pre-owned New Arrivals
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] tracking-widest uppercase">Just Dropped</h2>
          <div className="w-10 h-[1px] bg-[#997B4D] mt-6"></div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#888] animate-pulse">중고 신상품을 불러오는 중입니다...</div>
        ) : preOwnedNewProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {renderProductCards(preOwnedNewProducts)}
          </div>
        ) : (
          <div className="text-center py-20 text-[#888]">등록된 중고 신상품이 없습니다.</div>
        )}
      </section>

      {/* 6. 대표 브랜드 섹션 */}
      <section className="bg-[#FDFBF7] py-24 border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] tracking-widest uppercase">Brand Focus</h2>
            <div className="w-10 h-[1px] bg-[#997B4D] mx-auto mt-6 mb-4"></div>
            <p className="text-[#888] text-sm tracking-widest uppercase">원픽럭스가 엄선한 프리미엄 중고 컬렉션</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 mb-24">
            <div
              onClick={() => chanelBrandInfo ? navigateToBrand(chanelBrandInfo) : navigate('/brand/chanel')}
              className="lg:w-1/3 relative aspect-[3/4] overflow-hidden group cursor-pointer bg-[#1A1A1A] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition duration-700 z-10"></div>
              <img src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=2000&auto=format&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out opacity-70" />
              <div className="absolute bottom-10 left-8 z-20 text-white">
                <h3 className="text-4xl font-serif mb-3 tracking-widest">CHANEL</h3>
                <p className="text-sm flex items-center gap-2 tracking-widest uppercase hover:text-[#D4AF37] transition-colors">Discover More <ArrowRight size={16} /></p>
              </div>
            </div>
            <div className="lg:w-2/3 flex items-center">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
                {isLoading ? Array(3).fill(0).map((_, i) => <div key={i} className="aspect-square bg-white animate-pulse"></div>) : renderProductCards(chanelProducts)}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row-reverse gap-8">
            <div
              onClick={() => rolexBrandInfo ? navigateToBrand(rolexBrandInfo) : navigate('/brand/rolex')}
              className="lg:w-1/3 relative aspect-[3/4] overflow-hidden group cursor-pointer bg-[#006039] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition duration-700 z-10"></div>
              <img src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2000&auto=format&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out opacity-80" />
              <div className="absolute bottom-10 right-8 z-20 text-white text-right">
                <h3 className="text-4xl font-serif mb-3 tracking-widest">ROLEX</h3>
                <p className="text-sm flex items-center justify-end gap-2 tracking-widest uppercase hover:text-[#D4AF37] transition-colors">Discover More <ArrowRight size={16} /></p>
              </div>
            </div>
            <div className="lg:w-2/3 flex items-center">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
                {isLoading ? Array(3).fill(0).map((_, i) => <div key={i} className="aspect-square bg-white animate-pulse"></div>) : renderProductCards(rolexProducts)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. 베스트 상품 섹션 */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-12">
          <span className="flex items-center gap-2 text-[#997B4D] text-[10px] font-black tracking-[0.3em] mb-3 uppercase">
            <Flame size={14} /> Trending Pre-owned
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

      {/* 8. 미드 배너 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-[#2C2C2C] rounded-sm p-10 md:p-14 text-white relative overflow-hidden shadow-2xl flex flex-col items-center text-center justify-center">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 border border-[#D4AF37] text-[#D4AF37] text-[10px] font-bold tracking-widest mb-6">위탁 수수료 20% 할인</span>
            <h3 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">옷장 속 잠든 명품,<br/><span className="text-[#D4AF37] italic">지금이</span> 판매 찬스!</h3>
            <p className="text-gray-400 mb-10 font-light leading-relaxed">업계 최고 전문가의 명품 케어 서비스와 함께<br/>원픽럭스에서 가장 빠르고 안전하게 판매하세요.</p>
            <button onClick={() => navigate('/selling')} className="px-10 py-4 bg-[#D4AF37] text-white text-sm font-bold tracking-widest hover:bg-[#B89628] transition shadow-lg">내 명품 판매하기</button>
          </div>
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-[150px] opacity-10 pointer-events-none -translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-white rounded-full blur-[150px] opacity-5 pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        </div>
      </section>

      {/* 9. 특가 세일 섹션 */}
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