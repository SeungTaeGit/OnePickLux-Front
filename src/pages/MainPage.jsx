import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BannerSection from '../components/home/BannerSection.jsx';
import InfoSliderSection from '../components/home/InfoSliderSection.jsx';
import ProductCard from '../components/common/ProductCard.jsx';
import { MOCK_PRODUCTS } from '../constants/data.js';
import { getProducts } from '../api/productApi.js';

const MainPage = () => {
  const navigate = useNavigate();
  const [realProducts, setRealProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMainData = async () => {
      setIsLoading(true);
      try {
        const response = await getProducts({ page: 0, size: 8, sort: 'createdAt,desc' });
        if (response.data && response.data.content) {
          setRealProducts(response.data.content);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMainData();
  }, []);

  // 💡 메인에 장식할 대표 브랜드 목록
  const topBrands = [
    { name: 'CHANEL', url: 'chanel' },
    { name: 'HERMÈS', url: 'hermes' },
    { name: 'ROLEX', url: 'rolex' },
    { name: 'LOUIS VUITTON', url: 'louis-vuitton' },
    { name: 'DIOR', url: 'dior' }
  ];

  return (
    <div className="animate-fade-in font-sans">
      {/* 최상단 배너 섹션 */}
      <BannerSection />

      {/* 💡 [신규 추가] 프리미어 브랜드관 섹션 (럭셔리한 다크 테마) */}
      <section className="bg-[#1A1A1A] text-white py-20 border-b-4 border-[#D4AF37]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#D4AF37] text-[10px] font-black tracking-[0.3em] uppercase mb-3 block">Premium Boutiques</span>
            <h2 className="text-3xl md:text-4xl font-serif tracking-widest">프리미어 브랜드관</h2>
            <div className="w-12 h-[1px] bg-white/20 mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {topBrands.map((brand) => (
              <div
                key={brand.url}
                onClick={() => navigate(`/brand/${brand.url}`)}
                className="group relative aspect-[4/3] bg-[#2C2C2C] flex items-center justify-center cursor-pointer overflow-hidden border border-white/5 hover:border-[#D4AF37]/50 transition-colors"
              >
                {/* 호버 시 나타나는 골드 빛 배경 효과 */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <span className="font-serif text-lg tracking-widest text-white/70 group-hover:text-[#D4AF37] group-hover:scale-110 transition-all duration-500 relative z-10">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#FDFBF7] via-white to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <div className="flex flex-col items-center mb-10 mt-6">
              <span className="text-[#997B4D] text-xs font-bold tracking-[0.2em] mb-2 uppercase">MD's Pick</span>
              <h2 className="text-3xl font-serif text-[#2C2C2C]">지금 뜨는 베스트 상품</h2>
              <div className="w-10 h-[1px] bg-[#997B4D] mt-4"></div>
            </div>

            {isLoading ? (
               <div className="text-center py-20 text-[#888] animate-pulse">상품을 불러오는 중입니다...</div>
            ) : realProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-12">
                {realProducts.map((product) => (
                  <ProductCard
                    key={product.productId}
                    product={{
                      ...product,
                      image: product.thumbnailUrl || "IMG",
                      brand: product.brandName,
                      name: product.name,
                      price: product.price
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-[#888]">등록된 상품이 없습니다.</div>
            )}

            <div className="mt-16 text-center">
              <button onClick={() => navigate('/products')} className="px-10 py-3 border border-[#D1C7BD] text-xs font-bold tracking-widest text-[#5C5550] hover:bg-[#2C2C2C] hover:text-white hover:border-[#2C2C2C] transition uppercase">
                전체 상품 보기
              </button>
            </div>
          </div>

          <div className="mb-20 bg-[#2C2C2C] rounded-sm p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="text-center md:text-left max-w-lg">
                <span className="inline-block px-3 py-1 border border-[#D4AF37] text-[#D4AF37] text-[10px] font-bold tracking-widest mb-4">기간 한정 특가</span>
                <h3 className="text-3xl md:text-4xl font-serif mb-4 leading-tight">빈티지 <span className="text-[#D4AF37] italic">스페셜</span> 딜</h3>
                <p className="text-gray-400 mb-8 font-light leading-relaxed">매일 오후 2시, 검수팀이 엄선한 S급 빈티지 상품을<br/>놀라운 가격에 만나보세요.</p>
                <button onClick={() => navigate('/products')} className="px-8 py-3 bg-[#D4AF37] text-white text-sm font-bold tracking-widest hover:bg-[#B89628] transition shadow-lg">특가 상품 모두 보기</button>
              </div>
              <div className="flex gap-4">
                {MOCK_PRODUCTS.slice(4, 6).map((product) => (
                  <div key={product.id} className="w-44 bg-white/5 backdrop-blur-sm border border-white/10 p-3 text-white transition duration-300 hover:bg-white/10 cursor-pointer" onClick={() => navigate(`/products/${product.productId}`)}>
                    <div className="aspect-square bg-white/10 mb-3 flex items-center justify-center text-white/30 font-serif">IMAGE</div>
                    <div className="text-[#D4AF37] text-xs font-bold tracking-wider mb-1 uppercase">{product.brand}</div>
                    <div className="text-xs text-gray-300 truncate mb-2 font-light">{product.name}</div>
                    <div className="font-serif text-lg">{product.price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
          </div>

          <InfoSliderSection />
        </div>
      </section>
    </div>
  );
};

export default MainPage;