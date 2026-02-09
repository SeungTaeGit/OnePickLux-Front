import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, ShoppingBag, ChevronLeft, ChevronRight, X, ChevronDown, Star, Shield, Heart, CheckCircle, Truck, Calculator, Coins, Camera, MessageCircle, Instagram, Filter, SlidersHorizontal, Share2 } from 'lucide-react';

/**
 * [백엔드 개발자 노트]
 * * Theme: Warm & Luxury
 * * Feature: Full Application (Main, Selling, Product List, Product Detail)
 * * [통합 상태]
 * - currentPage: 페이지 라우팅 ('main', 'selling', 'products', 'detail')
 * - selectedProduct: 상세 페이지에 보여줄 상품 데이터
 */

// --- 데이터 상수 ---

const BANNER_DATA = [
  { id: 1, title: "Grand Opening", desc: "수수료 0원, 프리미엄 위탁의 시작", color: "bg-[#8B7355]", textColor: "text-white" },
  { id: 2, title: "Vintage Chanel", desc: "시간이 흘러도 변하지 않는 가치", color: "bg-[#2C2C2C]", textColor: "text-[#D4AF37]" },
  { id: 3, title: "Autumn Collection", desc: "가을을 준비하는 가장 완벽한 방법", color: "bg-[#A68A64]", textColor: "text-white" },
  { id: 4, title: "High-End Watch", desc: "전문 감정사가 보증하는 정품", color: "bg-[#4A4540]", textColor: "text-gray-200" },
  { id: 5, title: "Luxury Archive", desc: "구하기 힘든 희귀템 모음전", color: "bg-[#967259]", textColor: "text-white" },
];

const CATEGORIES = [
  { id: 1, name: "가방", icon: "👜", desc: "Classic & Trendy Bags" },
  { id: 2, name: "의류", icon: "🧥", desc: "Premium Apparel" },
  { id: 3, name: "주얼리", icon: "💍", desc: "Timeless Jewelry" },
  { id: 4, name: "신발", icon: "👠", desc: "Luxury Shoes" },
  { id: 5, name: "지갑", icon: "👛", desc: "Wallets & Small Goods" },
  { id: 6, name: "악세서리", icon: "🕶️", desc: "Scarves & Eyewear" },
];

const INITIAL_BRANDS = [
  { id: 1, name: "Hermès", isLiked: true },
  { id: 2, name: "Chanel", isLiked: false },
  { id: 3, name: "Rolex", isLiked: true },
  { id: 4, name: "Louis Vuitton", isLiked: false },
  { id: 5, name: "Dior", isLiked: false },
  { id: 6, name: "Cartier", isLiked: false },
  { id: 7, name: "Prada", isLiked: false },
  { id: 8, name: "Gucci", isLiked: false },
  { id: 9, name: "Burberry", isLiked: false },
  { id: 10, name: "Fendi", isLiked: false },
  { id: 11, name: "Bottega Veneta", isLiked: false },
  { id: 12, name: "Saint Laurent", isLiked: false },
  { id: 13, name: "Celine", isLiked: false },
  { id: 14, name: "Balenciaga", isLiked: false },
  { id: 15, name: "Valentino", isLiked: false },
  { id: 16, name: "Goyard", isLiked: false },
];

const MOCK_PRODUCTS = Array(12).fill(null).map((_, i) => ({
  id: i,
  brand: INITIAL_BRANDS[i % INITIAL_BRANDS.length].name,
  name: `Premium Collection Item ${i + 1}`,
  price: (i + 1) * 450000 + 100000,
  discount: i % 3 === 0 ? 5 : 0,
  image: "PRODUCT IMG",
  isHot: i < 4,
  description: "이 상품은 전문 감정사의 검수를 마친 100% 정품입니다. 미세한 사용감이 있을 수 있으나 전체적으로 매우 양호한 상태를 유지하고 있습니다."
}));

// --- 메인 App 컴포넌트 ---

const App = () => {
  const [currentPage, setCurrentPage] = useState('main');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('category');
  const [brands, setBrands] = useState(INITIAL_BRANDS);

  // 페이지 이동 함수
  const navigateTo = (page, product = null) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);
    if (product) {
      setSelectedProduct(product);
    }
    setIsMenuOpen(false);
  };

  const toggleLike = (brandId) => {
    setBrands(prev => prev.map(brand =>
      brand.id === brandId ? { ...brand, isLiked: !brand.isLiked } : brand
    ));
  };

  const likedBrands = brands.filter(b => b.isLiked);
  const allBrands = [...brands].sort((a, b) => a.name.localeCompare(b.name));
  const topBrands = brands.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A4540] font-sans selection:bg-[#D4AF37] selection:text-white">

      {/* 1. 공통 헤더 (Header) */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative">

          {/* 왼쪽: 로고 및 GNB */}
          <div className="flex items-center gap-10">
            <div onClick={() => navigateTo('main')} className="flex flex-col items-center cursor-pointer group">
              <div className="relative mb-1">
                 <Shield className="w-6 h-6 text-[#997B4D] fill-[#997B4D]/10" strokeWidth={1.5} />
                 <span className="absolute inset-0 flex items-center justify-center text-[8px] font-serif font-bold text-[#997B4D] pt-0.5">OL</span>
              </div>
              <h1 className="text-xl font-serif font-bold tracking-widest text-[#2C2C2C]">
                ONEPICK LUX
              </h1>
              <div className="flex items-center gap-2 w-full justify-center">
                <div className="h-[1px] w-3 bg-[#997B4D]"></div>
                <span className="text-[0.5rem] tracking-[0.2em] text-[#997B4D] font-medium">PRE-OWNED LUXURY</span>
                <div className="h-[1px] w-3 bg-[#997B4D]"></div>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5C5550]">
              <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('products'); }} className="hover:text-[#997B4D] transition duration-300">NEW</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('products'); }} className="hover:text-[#997B4D] transition duration-300">BEST</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('products'); }} className="hover:text-[#997B4D] transition duration-300 flex items-center gap-1">
                SALE <span className="text-[#997B4D] text-[10px]">●</span>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('main'); }} className="hover:text-[#997B4D] transition duration-300">EVENT</a>
            </nav>

            <div className="">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-2 text-xs font-serif tracking-wider border rounded-sm px-4 py-2 transition ${isMenuOpen ? 'border-[#997B4D] text-[#997B4D] bg-[#997B4D]/5' : 'border-[#D1C7BD] hover:border-[#997B4D] hover:text-[#997B4D] bg-white'}`}
              >
                <Menu size={14} />
                <span>MENU</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* 오른쪽: 유저 액션 */}
          <div className="flex items-center gap-5 text-[#5C5550]">
            <button
              onClick={() => navigateTo('selling')}
              className={`hidden md:flex px-4 py-2 border text-xs font-bold tracking-widest rounded-sm transition duration-300 items-center justify-center whitespace-nowrap
                ${currentPage === 'selling'
                  ? 'bg-[#997B4D] text-white border-[#997B4D]'
                  : 'bg-[#997B4D]/10 text-[#997B4D] border-[#997B4D]/20 hover:bg-[#997B4D] hover:text-white'}
              `}
            >
              내 명품 팔기
            </button>

            <button className="hover:text-[#997B4D] transition"><Search size={20} strokeWidth={1.5} /></button>
            <button className="hover:text-[#997B4D] transition relative">
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#997B4D] text-white text-[9px] flex items-center justify-center rounded-full">2</span>
            </button>
            <button className="hidden sm:flex items-center gap-2 text-xs font-bold tracking-widest hover:text-[#997B4D] transition uppercase">Login</button>
          </div>
        </div>

        {/* Mega Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-t border-[#E5E0D8] shadow-2xl animate-fade-in z-40 overflow-hidden">
            <div className="max-w-7xl mx-auto flex min-h-[400px]">
              <div className="w-48 border-r border-[#E5E0D8] bg-[#FDFBF7]">
                <button onClick={() => setActiveTab('category')} className={`w-full text-left px-6 py-5 text-xs font-bold tracking-widest transition-colors flex justify-between items-center group ${activeTab === 'category' ? 'bg-white text-[#997B4D] border-l-4 border-[#997B4D]' : 'text-[#888] hover:bg-white hover:text-[#5C5550]'}`}>CATEGORY {activeTab === 'category' && <ChevronRight size={14} />}</button>
                <button onClick={() => setActiveTab('brand')} className={`w-full text-left px-6 py-5 text-xs font-bold tracking-widest transition-colors flex justify-between items-center ${activeTab === 'brand' ? 'bg-white text-[#997B4D] border-l-4 border-[#997B4D]' : 'text-[#888] hover:bg-white hover:text-[#5C5550]'}`}>BRAND {activeTab === 'brand' && <ChevronRight size={14} />}</button>
              </div>
              <div className="flex-1 p-8 bg-white overflow-y-auto max-h-[60vh]">
                {activeTab === 'category' && (
                  <div className="grid grid-cols-3 gap-6">
                    {CATEGORIES.map(cat => (
                      <div key={cat.id} className="group cursor-pointer border border-transparent hover:border-[#E5E0D8] rounded-lg p-4 transition duration-300 hover:shadow-sm" onClick={() => navigateTo('products')}>
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-[#FDFBF7] rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                          <div><h3 className="text-sm font-bold text-[#2C2C2C] mb-1 group-hover:text-[#997B4D] transition">{cat.name}</h3><p className="text-xs text-[#888] font-light">{cat.desc}</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'brand' && (
                  <div className="flex flex-col h-full">
                    {likedBrands.length > 0 && (
                      <div className="mb-10 animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#997B4D]/20"><Heart size={14} className="text-[#997B4D] fill-[#997B4D]" /><h3 className="text-xs font-bold text-[#997B4D] tracking-widest">MY FAVORITE BRANDS</h3></div>
                        <div className="grid grid-cols-4 gap-3">
                          {likedBrands.map(brand => (
                            <div key={`liked-${brand.id}`} className="bg-[#997B4D]/5 border border-[#997B4D] text-[#997B4D] p-3 rounded-sm text-center text-xs font-serif font-bold cursor-pointer hover:bg-[#997B4D] hover:text-white transition flex justify-between items-center group shadow-sm" onClick={() => navigateTo('products')}>
                              <span>{brand.name}</span>
                              <button onClick={(e) => { e.stopPropagation(); toggleLike(brand.id); }} className="hover:scale-110 transition p-1"><Star size={14} className="text-[#D4AF37] fill-[#D4AF37] group-hover:text-white group-hover:fill-white transition-colors" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E0D8]"><h3 className="text-xs font-bold text-[#5C5550] tracking-widest">ALL BRANDS</h3><span className="text-[10px] text-[#BBB] tracking-wider uppercase font-medium">A-Z Sorted</span></div>
                      <div className="grid grid-cols-4 gap-3">
                        {allBrands.map(brand => (
                          <div key={brand.id} className={`relative group p-3 border rounded-sm transition-all duration-300 cursor-pointer flex items-center justify-between ${brand.isLiked ? 'border-[#997B4D] bg-white' : 'border-[#E5E0D8] hover:border-[#997B4D] hover:bg-white'}`} onClick={() => navigateTo('products')}>
                            <span className={`font-serif text-xs tracking-wide ${brand.isLiked ? 'text-[#997B4D] font-bold' : 'text-[#5C5550]'}`}>{brand.name}</span>
                            <button onClick={(e) => { e.stopPropagation(); toggleLike(brand.id); }} className="p-1 rounded-full hover:bg-[#F4F4F4] transition"><Star size={14} className={`transition-colors duration-300 ${brand.isLiked ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#CCC] group-hover:text-[#D4AF37]'}`} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-[#2C2C2C] text-white py-3 px-8 text-xs flex justify-between items-center font-light tracking-wider"><span className="opacity-80">* 모든 브랜드 상품은 전문 감정사의 2차 검수를 거칩니다.</span><a href="#" className="underline hover:text-[#D4AF37] opacity-80 hover:opacity-100 transition">위탁 판매 가이드 보기 &rarr;</a></div>
          </div>
        )}
      </header>

      {/* --- Page Router --- */}
      {currentPage === 'main' && <MainPageContent topBrands={topBrands} navigateTo={navigateTo} />}
      {currentPage === 'selling' && <SellingPageContent />}
      {currentPage === 'products' && <ProductListPageContent navigateTo={navigateTo} />}
      {currentPage === 'detail' && <ProductDetailPageContent product={selectedProduct} />}

      {/* 4. 공통 Footer (Footer) */}
      <footer className="bg-[#2C2C2C] text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm font-light">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-serif text-white mb-4">ONEPICK LUX</h2>
            <p className="mb-6 leading-relaxed opacity-70">
              엄격한 정품 검수를 거친 프리미엄 중고 명품 플랫폼.<br/>
              당신의 품격을 높여줄 단 하나의 선택.
            </p>
            <div className="flex gap-4">
               <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition cursor-pointer">In</div>
               <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition cursor-pointer">Fb</div>
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Help</h3>
            <ul className="space-y-2 opacity-70">
              <li><a href="#" className="hover:text-[#D4AF37]">FAQ</a></li>
              <li><a href="#" className="hover:text-[#D4AF37]">배송 안내</a></li>
              <li><a href="#" className="hover:text-[#D4AF37]">반품/환불 정책</a></li>
              <li><a href="#" className="hover:text-[#D4AF37]">정품 보증 정책</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2 opacity-70">
              <li>1544-XXXX</li>
              <li>support@onepicklux.com</li>
              <li>서울시 강남구 테헤란로</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

// =========================================================================================
// [Sub Component 1] 메인 페이지 컨텐츠
// =========================================================================================
const MainPageContent = ({ topBrands, navigateTo }) => {
  return (
    <>
      <BannerSection />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* 카테고리 섹션 */}
        <div>
          <div className="text-center mb-8">
            <span className="text-[#997B4D] text-xs font-bold tracking-[0.2em] uppercase mb-2 block">Collections</span>
            <h2 className="text-2xl font-serif text-[#2C2C2C]">Browse by Category</h2>
          </div>
          <div className="flex justify-center gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <div onClick={() => navigateTo('products')} key={cat.id} className="flex flex-col items-center gap-3 min-w-[80px] cursor-pointer group">
                <div className="w-20 h-20 bg-white rounded-full shadow-sm border border-[#E5E0D8] flex items-center justify-center text-3xl group-hover:border-[#997B4D] group-hover:bg-[#997B4D]/5 transition duration-300">
                  {cat.icon}
                </div>
                <span className="text-xs font-medium text-[#5C5550] group-hover:text-[#997B4D] transition">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 브랜드 섹션 */}
        <div>
           <div className="flex items-center justify-center gap-4 flex-wrap">
            {topBrands.map((brand, index) => (
              <button onClick={() => navigateTo('products')} key={brand.id} className="relative px-6 py-2 bg-white border border-[#E5E0D8] text-xs font-serif text-[#5C5550] hover:border-[#997B4D] hover:text-[#997B4D] transition shadow-sm uppercase tracking-wide min-w-[120px]">
                {index < 3 && <span className="absolute -top-1 -right-1 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span></span>}
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 상품 진열 섹션 */}
      <section className="bg-gradient-to-b from-[#FDFBF7] via-white to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <div className="flex flex-col items-center mb-10">
              <span className="text-[#997B4D] text-xs font-bold tracking-[0.2em] mb-2">CURATED FOR YOU</span>
              <h2 className="text-3xl font-serif text-[#2C2C2C]">Trending Now</h2>
              <div className="w-10 h-[1px] bg-[#997B4D] mt-4"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-12">
              {MOCK_PRODUCTS.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} onClick={() => navigateTo('detail', product)} />
              ))}
            </div>
          </div>

          <div className="mb-20 bg-[#2C2C2C] rounded-sm p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="text-center md:text-left max-w-lg">
                <span className="inline-block px-3 py-1 border border-[#D4AF37] text-[#D4AF37] text-[10px] font-bold tracking-widest mb-4">LIMITED OFFER</span>
                <h3 className="text-3xl md:text-4xl font-serif mb-4 leading-tight">Vintage <span className="text-[#D4AF37] italic">Special</span> Deal</h3>
                <p className="text-gray-400 mb-8 font-light leading-relaxed">매일 오후 2시, 검수팀이 엄선한 S급 빈티지 상품을<br/>놀라운 가격에 만나보세요.</p>
                <button onClick={() => navigateTo('products')} className="px-8 py-3 bg-[#D4AF37] text-white text-sm font-bold tracking-widest hover:bg-[#B89628] transition shadow-lg">VIEW ALL DEALS</button>
              </div>
              <div className="flex gap-4">
                {MOCK_PRODUCTS.slice(4, 6).map((product) => (
                  <div key={product.id} className="w-44 bg-white/5 backdrop-blur-sm border border-white/10 p-3 text-white transition duration-300 hover:bg-white/10 cursor-pointer" onClick={() => navigateTo('detail', product)}>
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

          <div>
            <div className="flex items-center justify-between mb-8 border-b border-[#E5E0D8] pb-4">
              <h2 className="text-xl font-serif text-[#2C2C2C]">New Arrivals</h2>
              <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('products'); }} className="text-xs text-[#997B4D] font-bold tracking-wider hover:underline">VIEW ALL</a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-12">
              {MOCK_PRODUCTS.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} onClick={() => navigateTo('detail', product)} />
              ))}
            </div>
            <div className="mt-16 text-center">
               <button onClick={() => navigateTo('products')} className="px-10 py-3 border border-[#D1C7BD] text-xs font-bold tracking-widest text-[#5C5550] hover:bg-[#2C2C2C] hover:text-white hover:border-[#2C2C2C] transition uppercase">
                 Load More Products
               </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// =========================================================================================
// [Sub Component 2] 매입/위탁 신청 페이지
// =========================================================================================
const SellingPageContent = () => {
  const [sellingType, setSellingType] = useState('consignment');

  return (
    <div className="animate-fade-in pb-20">
      <div className="bg-[#2C2C2C] text-white py-20 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Smart Selling</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
            잠들어 있는 당신의 명품,<br/>
            <span className="text-[#D4AF37] italic">최고의 가치</span>로 돌려드립니다.
          </h2>
          <p className="text-gray-300 font-light mb-10 max-w-2xl mx-auto">
            국내 최대 명품 데이터베이스를 기반으로 한 정확한 감정.<br/>
            업계 최고가 매입 보장, ONEPICK LUX에서 경험해보세요.
          </p>
          <div className="flex justify-center gap-8 text-center text-sm">
            <div><div className="text-2xl font-bold text-white mb-1">12만+</div><div className="text-gray-400 text-xs">누적 매입 건수</div></div>
            <div className="w-[1px] bg-white/20 h-full"></div>
            <div><div className="text-2xl font-bold text-white mb-1">98%</div><div className="text-gray-400 text-xs">고객 만족도</div></div>
            <div className="w-[1px] bg-white/20 h-full"></div>
            <div><div className="text-2xl font-bold text-white mb-1">0원</div><div className="text-gray-400 text-xs">감정 수수료</div></div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#D4AF37]/20 via-transparent to-transparent opacity-50"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid md:grid-cols-2 gap-6">
          <div onClick={() => setSellingType('consignment')} className={`bg-white p-8 rounded-sm shadow-xl border-t-4 cursor-pointer transition-transform hover:-translate-y-1 ${sellingType === 'consignment' ? 'border-[#997B4D] ring-1 ring-[#997B4D]/20' : 'border-transparent'}`}>
            <div className="flex justify-between items-start mb-4"><div className="w-12 h-12 bg-[#997B4D]/10 rounded-full flex items-center justify-center text-2xl">🤝</div>{sellingType === 'consignment' && <CheckCircle className="text-[#997B4D]" size={24} />}</div>
            <h3 className="text-xl font-bold text-[#2C2C2C] mb-2">위탁 판매 신청</h3><p className="text-[#5C5550] text-sm mb-4">시간이 걸리더라도 높은 가격을 받고 싶으신가요?</p>
          </div>
          <div onClick={() => setSellingType('instant')} className={`bg-white p-8 rounded-sm shadow-xl border-t-4 cursor-pointer transition-transform hover:-translate-y-1 ${sellingType === 'instant' ? 'border-[#2C2C2C] ring-1 ring-[#2C2C2C]/20' : 'border-transparent'}`}>
            <div className="flex justify-between items-start mb-4"><div className="w-12 h-12 bg-[#2C2C2C]/10 rounded-full flex items-center justify-center text-2xl">⚡</div>{sellingType === 'instant' && <CheckCircle className="text-[#2C2C2C]" size={24} />}</div>
            <h3 className="text-xl font-bold text-[#2C2C2C] mb-2">즉시 매입 신청</h3><p className="text-[#5C5550] text-sm mb-4">기다림 없이 즉시 현금화하고 싶으신가요?</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-20 mb-20">
        <div className="bg-white p-8 md:p-10 border border-[#E5E0D8] shadow-lg rounded-sm">
          <h3 className="text-xl font-bold text-[#2C2C2C] mb-6 pb-4 border-b border-[#E5E0D8] flex items-center justify-between">
            <span>판매 신청 정보 입력</span><span className="text-xs font-normal text-[#997B4D] bg-[#997B4D]/10 px-2 py-1 rounded">{sellingType === 'consignment' ? '위탁 판매' : '즉시 매입'}</span>
          </h3>
          <div className="space-y-6">
            <div><label className="block text-xs font-bold text-[#5C5550] mb-2">브랜드 <span className="text-red-500">*</span></label><select className="w-full border border-[#E5E0D8] p-3 text-sm focus:outline-none focus:border-[#997B4D] bg-white"><option>브랜드를 선택해주세요</option>{INITIAL_BRANDS.map(b => <option key={b.id}>{b.name}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-[#5C5550] mb-2">상품명 / 모델명</label><input type="text" placeholder="예: 샤넬 클래식 미디움 블랙" className="w-full border border-[#E5E0D8] p-3 text-sm focus:outline-none focus:border-[#997B4D]" /></div>
            <button className="w-full bg-[#2C2C2C] text-white py-4 font-bold text-sm tracking-widest hover:bg-[#444] transition mt-4 shadow-lg">신청하기</button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-16 text-center">
        <h3 className="text-xl font-serif text-[#2C2C2C] mb-2">Need Help?</h3>
        <p className="text-sm text-[#888] mb-8">빠른 상담이 필요하시거나 더 많은 정보를 원하시나요?</p>
        <div className="grid md:grid-cols-2 gap-4">
          <a href="https://open.kakao.com/o/gLnec35h" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 p-4 bg-[#FAE100] text-[#371D1E] rounded-sm shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"><MessageCircle size={20} fill="#371D1E" className="text-[#371D1E]" /><div className="text-left"><div className="text-xs font-bold opacity-80">1:1 실시간 상담</div><div className="text-sm font-bold">카카오톡 오픈채팅</div></div></a>
          <a href="https://www.instagram.com/onepick_lux?igsh=b3hseHQyYjVpYWRx&utm_source=qr" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 p-4 bg-white border border-[#E5E0D8] text-[#2C2C2C] rounded-sm shadow-sm hover:border-[#D62976] hover:text-[#D62976] transition-all hover:-translate-y-0.5 group"><Instagram size={20} className="group-hover:text-[#D62976] transition-colors" /><div className="text-left"><div className="text-xs font-bold opacity-60 group-hover:text-[#D62976]">생생한 후기 & 입고 소식</div><div className="text-sm font-bold">인스타그램 구경하기</div></div></a>
        </div>
      </div>
    </div>
  );
};

// =========================================================================================
// [Sub Component 3] 전체 상품 진열 페이지
// =========================================================================================
const ProductListPageContent = ({ navigateTo }) => {
  const [filterPrice, setFilterPrice] = useState(5000000);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex flex-col items-center mb-12">
        <h2 className="text-3xl font-serif text-[#2C2C2C] mb-2">All Products</h2>
        <div className="w-10 h-[1px] bg-[#997B4D] mb-4"></div>
        <p className="text-sm text-[#888]">엄격한 검수를 거친 100% 정품 중고 명품을 만나보세요.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8 hidden md:block">
          <div><h3 className="text-sm font-bold text-[#2C2C2C] mb-4 pb-2 border-b border-[#E5E0D8] flex items-center gap-2"><Filter size={14} /> CATEGORY</h3><ul className="space-y-2 text-sm text-[#5C5550]">{CATEGORIES.map(cat => (<li key={cat.id} className="flex items-center gap-2 hover:text-[#997B4D] cursor-pointer"><input type="checkbox" className="accent-[#997B4D] rounded-sm" /><span>{cat.name}</span></li>))}</ul></div>
          <div><h3 className="text-sm font-bold text-[#2C2C2C] mb-4 pb-2 border-b border-[#E5E0D8]">BRAND</h3><div className="h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 pr-2 space-y-2 text-sm text-[#5C5550]">{INITIAL_BRANDS.map(brand => (<li key={brand.id} className="flex items-center gap-2 hover:text-[#997B4D] cursor-pointer list-none"><input type="checkbox" className="accent-[#997B4D] rounded-sm" /><span>{brand.name}</span></li>))}</div></div>
          <div><h3 className="text-sm font-bold text-[#2C2C2C] mb-4 pb-2 border-b border-[#E5E0D8]">PRICE</h3><input type="range" min="0" max="10000000" step="100000" value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)} className="w-full accent-[#997B4D] h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" /><div className="flex justify-between text-xs text-[#888] mt-2 font-mono"><span>0원</span><span>{Number(filterPrice).toLocaleString()}원+</span></div></div>
        </aside>

        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs text-[#888] font-bold">Total <span className="text-[#2C2C2C]">{MOCK_PRODUCTS.length}</span> items</span>
            <div className="flex items-center gap-3">
              <button className="md:hidden flex items-center gap-1 text-xs font-bold border px-3 py-2 rounded-sm"><Filter size={14} /> 필터</button>
              <div className="relative group">
                <button className="flex items-center gap-1 text-xs font-bold text-[#5C5550] hover:text-[#997B4D]"><SlidersHorizontal size={14} /> 신상품순 <ChevronDown size={12} /></button>
                <div className="absolute right-0 top-full mt-2 w-32 bg-white border border-[#E5E0D8] shadow-lg rounded-sm py-1 hidden group-hover:block z-10"><button className="w-full text-left px-4 py-2 text-xs hover:bg-[#FDFBF7] text-[#997B4D]">신상품순</button><button className="w-full text-left px-4 py-2 text-xs hover:bg-[#FDFBF7]">낮은가격순</button><button className="w-full text-left px-4 py-2 text-xs hover:bg-[#FDFBF7]">높은가격순</button><button className="w-full text-left px-4 py-2 text-xs hover:bg-[#FDFBF7]">인기순</button></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {MOCK_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} onClick={() => navigateTo('detail', product)} />
            ))}
          </div>

          <div className="mt-16 flex justify-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center border border-[#E5E0D8] text-[#5C5550] hover:border-[#997B4D] hover:text-[#997B4D] text-xs transition rounded-sm bg-[#2C2C2C] text-white border-[#2C2C2C]">1</button>
            <button className="w-8 h-8 flex items-center justify-center border border-[#E5E0D8] text-[#5C5550] hover:border-[#997B4D] hover:text-[#997B4D] text-xs transition rounded-sm">2</button>
            <button className="w-8 h-8 flex items-center justify-center border border-[#E5E0D8] text-[#5C5550] hover:border-[#997B4D] hover:text-[#997B4D] text-xs transition rounded-sm">3</button>
            <span className="w-8 h-8 flex items-center justify-center text-[#CCC] text-xs">...</span>
            <button className="w-8 h-8 flex items-center justify-center border border-[#E5E0D8] text-[#5C5550] hover:border-[#997B4D] hover:text-[#997B4D] text-xs transition rounded-sm"><ChevronRight size={14}/></button>
          </div>
        </main>
      </div>
    </div>
  );
};

// =========================================================================================
// [Sub Component 4] 상품 상세 페이지
// =========================================================================================
const ProductDetailPageContent = ({ product }) => {
  if (!product) return <div>Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-xs text-[#888] mb-8 font-medium">Home &gt; {product.brand} &gt; <span className="text-[#2C2C2C]">{product.name}</span></div>
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        <div className="relative aspect-square bg-[#F4F4F4] rounded-sm overflow-hidden group">
           <div className="absolute inset-0 flex items-center justify-center text-[#CCC] font-serif text-2xl tracking-widest group-hover:scale-105 transition-transform duration-700">{product.image || 'PRODUCT IMG'}</div>
           {product.discount > 0 && <div className="absolute top-4 left-4 bg-[#997B4D] text-white text-xs font-bold px-3 py-1.5 tracking-wider">-{product.discount}%</div>}
        </div>
        <div className="flex flex-col justify-center">
          <div className="mb-2"><span className="text-[#997B4D] font-bold text-sm tracking-widest uppercase border-b border-[#997B4D] pb-0.5">{product.brand}</span></div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] mb-6 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-4 mb-8"><span className="text-3xl font-serif text-[#2C2C2C]">{product.price.toLocaleString()}<span className="text-lg">원</span></span>{product.discount > 0 && (<span className="text-lg text-[#AAA] line-through decoration-1">{Math.floor(product.price * (100 + product.discount) / 100).toLocaleString()}원</span>)}</div>
          <div className="h-[1px] bg-[#E5E0D8] w-full mb-8"></div>
          <div className="space-y-4 mb-10 text-sm text-[#5C5550]">
            <div className="flex"><span className="w-24 font-bold text-[#2C2C2C]">상품 상태</span><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#997B4D]"></span>S등급 (미사용 보관품)</span></div>
            <div className="flex"><span className="w-24 font-bold text-[#2C2C2C]">구성품</span><span>본품, 더스트백, 보증서, 박스</span></div>
            <div className="flex"><span className="w-24 font-bold text-[#2C2C2C]">상품번호</span><span className="font-mono text-[#888]">P-{10000 + product.id}</span></div>
            <div className="flex"><span className="w-24 font-bold text-[#2C2C2C]">배송정보</span><span>무료배송 (우체국 택배)</span></div>
          </div>
          <div className="flex gap-4 mb-6">
            <button className="flex-1 bg-[#2C2C2C] text-white py-4 font-bold text-sm tracking-widest hover:bg-[#444] transition shadow-lg">BUY NOW</button>
            <button className="flex-1 border border-[#E5E0D8] text-[#2C2C2C] py-4 font-bold text-sm tracking-widest hover:border-[#2C2C2C] transition flex items-center justify-center gap-2"><ShoppingBag size={18} strokeWidth={1.5} /> ADD TO CART</button>
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
            <button className="px-8 py-4 text-sm font-bold text-[#2C2C2C] border-b-2 border-[#2C2C2C]">상품 상세</button>
            <button className="px-8 py-4 text-sm font-medium text-[#888] hover:text-[#2C2C2C]">배송/반품</button>
            <button className="px-8 py-4 text-sm font-medium text-[#888] hover:text-[#2C2C2C]">문의하기</button>
         </div>
         <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
            <h3 className="text-xl font-serif text-[#2C2C2C] mb-4">Product Details</h3>
            <p className="text-sm text-[#5C5550] leading-loose">{product.description || "이 상품은 ONEPICK LUX의 전문 감정사가 엄격한 기준에 따라 검수를 완료한 100% 정품입니다. 시간이 흘러도 변하지 않는 가치를 지닌 빈티지 컬렉션을 만나보세요."}</p>
            <div className="py-10">
               <div className="w-full h-64 bg-[#F9F9F9] flex items-center justify-center text-[#DDD] text-lg font-serif tracking-widest">DETAIL IMAGE 01</div>
               <div className="mt-4 w-full h-64 bg-[#F9F9F9] flex items-center justify-center text-[#DDD] text-lg font-serif tracking-widest">DETAIL IMAGE 02</div>
            </div>
         </div>
      </div>
    </div>
  );
}

// --- 공통 컴포넌트 복원 (BannerSection, InfoSliderSection, ProductCard) ---

const BannerSection = () => {
  const scrollRef = useRef(null);
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -340 : 340;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  return (
    <div className="relative group max-w-7xl mx-auto mt-8 mb-12 px-4 sm:px-6 lg:px-8">
      <button onClick={() => scroll('left')} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 bg-white/90 backdrop-blur-sm border border-[#E5E0D8] text-[#5C5550] rounded-full shadow-xl hover:bg-[#2C2C2C] hover:text-white hover:border-[#2C2C2C] transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"><ChevronLeft size={24} /></button>
      <div ref={scrollRef} className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory gap-0 rounded-lg shadow-lg" style={{ scrollBehavior: 'smooth' }}>
        {BANNER_DATA.map((banner) => (
          <div key={banner.id} className={`min-w-[100%] md:min-w-[calc(100%/3)] lg:min-w-[calc(100%/3)] h-[400px] ${banner.color} ${banner.textColor} p-10 flex flex-col justify-between flex-shrink-0 snap-center relative overflow-hidden transition-transform hover:brightness-105 border-r border-white/5 last:border-r-0`}>
            <div className="relative z-10 flex flex-col h-full justify-between items-start">
              <div><span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md text-[10px] tracking-[0.2em] font-medium mb-4 border border-white/20 uppercase">Event</span><h3 className="text-3xl md:text-4xl font-serif leading-tight mb-4 max-w-[80%]">{banner.title}</h3><div className="w-16 h-[1px] bg-current opacity-50 mb-4"></div><p className="opacity-90 text-sm font-light leading-relaxed max-w-[90%]">{banner.desc}</p></div>
              <button className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white hover:text-[#2C2C2C] text-xs font-bold tracking-widest transition uppercase mt-4">View Details</button>
            </div>
            <div className="absolute -bottom-10 -right-10 text-[10rem] font-serif opacity-5 select-none pointer-events-none">{banner.id}</div>
          </div>
        ))}
      </div>
      <button onClick={() => scroll('right')} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 bg-white/90 backdrop-blur-sm border border-[#E5E0D8] text-[#5C5550] rounded-full shadow-xl hover:bg-[#2C2C2C] hover:text-white hover:border-[#2C2C2C] transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"><ChevronRight size={24} /></button>
    </div>
  );
};

const InfoSliderSection = () => {
  const scrollRef = useRef(null);
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth;
      const scrollPos = direction === 'left' ? -scrollAmount : scrollAmount;
      current.scrollBy({ left: scrollPos, behavior: 'smooth' });
    }
  };
  return (
    <div className="relative group max-w-7xl mx-auto mb-24 px-4 sm:px-6 lg:px-8 mt-12">
      <button onClick={() => scroll('left')} className="absolute left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-[#2C2C2C] transition-all duration-300 shadow-lg"><ChevronLeft size={24} strokeWidth={1.5} /></button>
      <div ref={scrollRef} className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory rounded-[2rem] shadow-2xl" style={{ scrollBehavior: 'smooth' }}>
        {BANNER_DATA.map((banner) => (
          <div key={banner.id} className={`min-w-full h-[320px] ${banner.color} ${banner.textColor} p-10 flex flex-col justify-center items-center text-center flex-shrink-0 snap-center relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
            <div className="relative z-10 max-w-3xl px-4">
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md text-[11px] tracking-[0.2em] font-medium mb-6 border border-white/30 uppercase rounded-full shadow-sm">Member Benefit</span>
              <h3 className="text-3xl md:text-4xl font-serif font-bold mb-6 leading-tight drop-shadow-md">{banner.title}</h3>
              <p className="opacity-90 text-sm md:text-base font-light leading-relaxed mb-8 max-w-lg mx-auto">{banner.desc}</p>
              <button className="group/btn relative px-8 py-3 border border-white/40 overflow-hidden rounded-full transition-all hover:bg-white hover:text-[#2C2C2C] hover:border-white hover:shadow-lg"><span className="relative z-10 text-xs font-bold tracking-widest uppercase">View More</span></button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => scroll('right')} className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-[#2C2C2C] transition-all duration-300 shadow-lg"><ChevronRight size={24} strokeWidth={1.5} /></button>
    </div>
  );
};

const ProductCard = ({ product, onClick }) => {
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative aspect-[3/4] bg-[#F4F4F4] overflow-hidden mb-4">
        <div className="absolute inset-0 flex items-center justify-center text-[#CCC] font-serif tracking-widest group-hover:scale-105 transition-transform duration-700 ease-in-out">PRODUCT IMG</div>
        {product.discount > 0 && (<div className="absolute top-0 left-0 bg-[#997B4D] text-white text-[10px] font-bold px-3 py-1.5 tracking-wider">-{product.discount}%</div>)}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent"><button className="w-full py-3 bg-white text-[#2C2C2C] text-xs font-bold tracking-widest hover:bg-[#2C2C2C] hover:text-white transition">QUICK VIEW</button></div>
      </div>
      <div className="text-center">
        <h4 className="font-bold text-[#997B4D] text-xs uppercase tracking-widest mb-1">{product.brand}</h4>
        <p className="text-sm text-[#4A4540] mb-2 font-medium truncate">{product.name}</p>
        <div className="flex items-center justify-center gap-2 font-serif text-[#2C2C2C]"><span className="text-base">{product.price.toLocaleString()}</span>{product.discount > 0 && (<span className="text-xs text-[#999] line-through decoration-1">{Math.floor(product.price * (100 + product.discount) / 100).toLocaleString()}</span>)}</div>
      </div>
    </div>
  );
};

export default App;