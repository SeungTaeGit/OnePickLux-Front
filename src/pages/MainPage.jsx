import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BannerSection from '../components/home/BannerSection.jsx';
import InfoSliderSection from '../components/home/InfoSliderSection.jsx';
import ProductCard from '../components/common/ProductCard.jsx';
import { CATEGORIES, INITIAL_BRANDS, MOCK_PRODUCTS } from '../constants/data.js';
import { getProducts } from '../api/productApi.js';

const MainPage = () => {
  const navigate = useNavigate();
  const [realProducts, setRealProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const topBrands = INITIAL_BRANDS.slice(0, 5);

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

  return (
    <div className="animate-fade-in">
      <BannerSection />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div>
          <div className="text-center mb-8">
            <span className="text-[#997B4D] text-xs font-bold tracking-[0.2em] uppercase mb-2 block">Collections</span>
            <h2 className="text-2xl font-serif text-[#2C2C2C]">Browse by Category</h2>
          </div>
          <div className="flex justify-center gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <div onClick={() => navigate('/products')} key={cat.id} className="flex flex-col items-center gap-3 min-w-[80px] cursor-pointer group">
                <div className="w-20 h-20 bg-white rounded-full shadow-sm border border-[#E5E0D8] flex items-center justify-center text-3xl group-hover:border-[#997B4D] group-hover:bg-[#997B4D]/5 transition duration-300">
                  {cat.icon}
                </div>
                <span className="text-xs font-medium text-[#5C5550] group-hover:text-[#997B4D] transition">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
           <div className="flex items-center justify-center gap-4 flex-wrap">
            {topBrands.map((brand, index) => (
              <button onClick={() => navigate('/products')} key={brand.id} className="relative px-6 py-2 bg-white border border-[#E5E0D8] text-xs font-serif text-[#5C5550] hover:border-[#997B4D] hover:text-[#997B4D] transition shadow-sm uppercase tracking-wide min-w-[120px]">
                {index < 3 && <span className="absolute -top-1 -right-1 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span></span>}
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#FDFBF7] via-white to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <div className="flex flex-col items-center mb-10">
              <span className="text-[#997B4D] text-xs font-bold tracking-[0.2em] mb-2">CURATED FOR YOU</span>
              <h2 className="text-3xl font-serif text-[#2C2C2C]">Trending Now</h2>
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
                View All Products
              </button>
            </div>
          </div>

          <div className="mb-20 bg-[#2C2C2C] rounded-sm p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="text-center md:text-left max-w-lg">
                <span className="inline-block px-3 py-1 border border-[#D4AF37] text-[#D4AF37] text-[10px] font-bold tracking-widest mb-4">LIMITED OFFER</span>
                <h3 className="text-3xl md:text-4xl font-serif mb-4 leading-tight">Vintage <span className="text-[#D4AF37] italic">Special</span> Deal</h3>
                <p className="text-gray-400 mb-8 font-light leading-relaxed">매일 오후 2시, 검수팀이 엄선한 S급 빈티지 상품을<br/>놀라운 가격에 만나보세요.</p>
                <button onClick={() => navigate('/products')} className="px-8 py-3 bg-[#D4AF37] text-white text-sm font-bold tracking-widest hover:bg-[#B89628] transition shadow-lg">VIEW ALL DEALS</button>
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