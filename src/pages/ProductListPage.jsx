import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronDown, ChevronRight, Search, Tag, Sparkles, Flame } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/common/ProductCard.jsx';
import { getProducts } from '../api/productApi.js';

const CATEGORIES = [
  { id: 1, name: '가방' },
  { id: 2, name: '의류' },
  { id: 6, name: '주얼리' },
  { id: 4, name: '신발' },
  { id: 5, name: '지갑' },
  { id: 3, name: '악세서리' }
];

const ProductListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const urlSort = queryParams.get('sort');
  const urlFilter = queryParams.get('filter');
  const urlCategoryId = queryParams.get('categoryId');
  const urlBrandId = queryParams.get('brandId');

  let initialTab = 'new';
  if (urlFilter === 'sale') initialTab = 'sale';
  else if (urlSort === 'best') initialTab = 'best';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [filterPrice, setFilterPrice] = useState(10000000);
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(urlCategoryId ? Number(urlCategoryId) : 'all');
  const [selectedBrand, setSelectedBrand] = useState(urlBrandId ? Number(urlBrandId) : 'all');
  const [brands, setBrands] = useState([]);

  // 💡 [핵심 수정] 관리자 API가 아닌 퍼블릭 API 호출 (토큰 불필요)
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        // admin 경로가 빠진 일반 고객용 API 주소!
        const response = await axios.get('http://localhost:8080/api/brands/active');

        let fetchedBrands = [];
        if (response.data && Array.isArray(response.data.data)) {
          fetchedBrands = response.data.data;
        } else if (Array.isArray(response.data)) {
          fetchedBrands = response.data;
        }

        setBrands(fetchedBrands);
      } catch (error) {
        console.error('🚨 브랜드 필터 로딩 중 오류 발생:', error);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    let tab = 'new';
    const currentParams = new URLSearchParams(location.search);
    if (currentParams.get('filter') === 'sale') tab = 'sale';
    else if (currentParams.get('sort') === 'best') tab = 'best';

    const categoryId = currentParams.get('categoryId');
    setSelectedCategory(categoryId ? Number(categoryId) : 'all');

    const brandId = currentParams.get('brandId');
    setSelectedBrand(brandId ? Number(brandId) : 'all');

    setActiveTab(tab);
  }, [location.search]);

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page');
    navigate(`/products?${params.toString()}`);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: 0,
        size: 20,
        keyword: keyword || undefined,
        maxPrice: filterPrice || undefined
      };

      if (activeTab === 'new') params.sort = 'new';
      else if (activeTab === 'best') params.sort = 'best';
      else if (activeTab === 'sale') {
        params.sort = 'sale';
        params.filter = 'sale';
      }

      if (selectedCategory !== 'all') params.categoryId = selectedCategory;
      if (selectedBrand !== 'all') params.brandId = selectedBrand;

      const response = await getProducts(params);
      if (response.data && response.data.content) {
          setProducts(response.data.content);
      } else {
          setProducts([]);
      }
    } catch (error) {
      console.error('상품 로딩 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeTab, filterPrice, selectedCategory, selectedBrand]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') fetchProducts();
  };

  const tabs = [
    { id: 'new', label: 'NEW ARRIVALS', path: '/products?sort=new' },
    { id: 'best', label: 'BEST SELLERS', path: '/products?sort=best' },
    { id: 'sale', label: 'PRICE DOWN', path: '/products?filter=sale' }
  ];

  const renderDynamicBanner = () => {
    switch (activeTab) {
        case 'new':
          return (
            <div className="bg-[#FDFBF7] py-20 px-4 text-center border-b border-[#E5E0D8] relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-30"></div>
              <div className="relative z-10 flex flex-col items-center">
                <span className="flex items-center gap-2 text-[#997B4D] text-[10px] font-black tracking-[0.3em] uppercase mb-4">
                  <Sparkles size={14} /> Fresh Drops
                </span>
                <h1 className="text-4xl md:text-5xl font-serif text-[#2C2C2C] mb-4 tracking-tight">UNUSED & NEW</h1>
                <p className="text-[#5C5550] text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                  엄격한 검수를 통과한 <span className="font-bold text-[#2C2C2C]">미사용 신품 및 민트급 상품</span>입니다.<br/>
                  누구도 소유하지 않은 완벽한 컨디션을 가장 먼저 만나보세요.
                </p>
              </div>
            </div>
          );
        case 'best':
          return (
            <div className="bg-gradient-to-r from-[#2C2C2C] to-[#1A1A1A] py-20 px-4 text-center border-b-4 border-[#D4AF37] relative">
              <div className="relative z-10 flex flex-col items-center">
                <span className="flex items-center gap-2 text-[#D4AF37] text-[10px] font-black tracking-[0.3em] uppercase mb-4">
                  <Flame size={14} /> Trending Now
                </span>
                <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 tracking-tight">BEST SELLERS</h1>
                <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                  현재 고객님들께 <span className="font-bold text-[#D4AF37]">가장 많은 사랑을 받고 있는</span> 인기 상품입니다.<br/>
                  검증된 베스트셀러로 후회 없는 선택을 경험하세요.
                </p>
              </div>
            </div>
          );
        case 'sale':
          return (
            <div className="bg-[#5C2B29] py-20 px-4 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full blur-[100px] opacity-20"></div>
              <div className="relative z-10 flex flex-col items-center">
                <span className="flex items-center gap-2 text-[#F2A6A6] text-[10px] font-black tracking-[0.3em] uppercase mb-4">
                  <Tag size={14} /> Limited Offer
                </span>
                <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 tracking-tight">PRICE DOWN</h1>
                <p className="text-[#E5C1C0] text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                  시세 대비 <span className="font-bold text-white underline decoration-red-400 underline-offset-4">합리적인 가격으로 인하된</span> 특별 상품들입니다.<br/>
                  단 하나의 재고, 망설이는 순간 품절될 수 있습니다.
                </p>
              </div>
            </div>
          );
        default:
          return null;
      }
  };

  return (
    <div className="animate-fade-in font-sans min-h-screen bg-white pb-20">

      {renderDynamicBanner()}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">

        <div className="flex flex-col items-center border-b border-[#E5E0D8] mb-12">

          <div className="flex gap-8 md:gap-16">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`pb-4 text-sm font-bold tracking-widest uppercase transition-colors relative ${
                  activeTab === tab.id ? 'text-[#D4AF37]' : 'text-[#888] hover:text-[#2C2C2C]'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37] animate-in slide-in-from-left-2 duration-300"></span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 mb-8 w-full max-w-md relative group mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#997B4D] transition-colors" size={20} />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="상품명 또는 브랜드명 검색 후 엔터"
              className="w-full pl-12 pr-4 py-3 bg-[#F4F4F4] border border-transparent rounded-full text-sm font-bold outline-none focus:bg-white focus:border-[#997B4D] focus:shadow-[0_0_15px_rgba(153,123,77,0.1)] transition-all"
            />
          </div>

        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ================= 좌측 사이드바 필터 ================= */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8 hidden md:block">

          {/* 1. 카테고리 필터 */}
          <div>
            <h3 className="text-sm font-bold text-[#2C2C2C] mb-4 pb-2 border-b border-[#E5E0D8] flex items-center gap-2">
              <Filter size={14} /> CATEGORY
            </h3>
            <ul className="space-y-2 text-sm text-[#5C5550]">
              <li
                className={`flex items-center gap-2 cursor-pointer transition-colors ${selectedCategory === 'all' ? 'text-[#997B4D] font-bold' : 'hover:text-[#997B4D]'}`}
                onClick={() => handleFilterChange('categoryId', 'all')}
              >
                <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${selectedCategory === 'all' ? 'bg-[#997B4D] border-[#997B4D]' : 'border-gray-300'}`}>
                    {selectedCategory === 'all' && <span className="w-2 h-2 bg-white rounded-sm"></span>}
                </div>
                <span>모든 카테고리</span>
              </li>
              {CATEGORIES.map(cat => (
                <li
                    key={cat.id}
                    className={`flex items-center gap-2 cursor-pointer transition-colors ${selectedCategory === cat.id ? 'text-[#997B4D] font-bold' : 'hover:text-[#997B4D]'}`}
                    onClick={() => handleFilterChange('categoryId', cat.id)}
                >
                  <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${selectedCategory === cat.id ? 'bg-[#997B4D] border-[#997B4D]' : 'border-gray-300'}`}>
                     {selectedCategory === cat.id && <span className="w-2 h-2 bg-white rounded-sm"></span>}
                  </div>
                  <span>{cat.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. 브랜드 필터 (퍼블릭 API 연동) */}
          <div>
            <h3 className="text-sm font-bold text-[#2C2C2C] mb-4 pb-2 border-b border-[#E5E0D8]">BRAND</h3>
            <div className="h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 pr-2 space-y-2 text-sm text-[#5C5550]">
              <li
                className={`flex items-center gap-2 cursor-pointer transition-colors list-none ${selectedBrand === 'all' ? 'text-[#997B4D] font-bold' : 'hover:text-[#997B4D]'}`}
                onClick={() => handleFilterChange('brandId', 'all')}
              >
                <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${selectedBrand === 'all' ? 'bg-[#997B4D] border-[#997B4D]' : 'border-gray-300'}`}>
                    {selectedBrand === 'all' && <span className="w-2 h-2 bg-white rounded-sm"></span>}
                </div>
                <span>모든 브랜드</span>
              </li>

              {brands.map(brand => {
                const brandId = brand.id || brand.brandId;
                const brandName = brand.name || brand.koreanName || brand.englishName;
                return (
                  <li
                    key={brandId}
                    className={`flex items-center gap-2 cursor-pointer transition-colors list-none ${selectedBrand === brandId ? 'text-[#997B4D] font-bold' : 'hover:text-[#997B4D]'}`}
                    onClick={() => handleFilterChange('brandId', brandId)}
                  >
                    <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${selectedBrand === brandId ? 'bg-[#997B4D] border-[#997B4D]' : 'border-gray-300'}`}>
                       {selectedBrand === brandId && <span className="w-2 h-2 bg-white rounded-sm"></span>}
                    </div>
                    <span>{brandName}</span>
                  </li>
                );
              })}
            </div>
          </div>

          {/* 3. 가격 슬라이더 */}
          <div>
            <h3 className="text-sm font-bold text-[#2C2C2C] mb-4 pb-2 border-b border-[#E5E0D8]">PRICE</h3>
            <input
              type="range"
              min="0"
              max="20000000"
              step="100000"
              value={filterPrice}
              onChange={(e) => setFilterPrice(Number(e.target.value))}
              className="w-full accent-[#997B4D] h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-[#888] mt-2 font-mono">
              <span>0원</span>
              <span>{Number(filterPrice).toLocaleString()}원 이하</span>
            </div>
          </div>
        </aside>

        {/* ================= 우측 상품 목록 ================= */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs text-[#888] font-bold">Total <span className="text-[#2C2C2C]">{products.length}</span> items</span>
            <div className="flex items-center gap-3">
              <button className="md:hidden flex items-center gap-1 text-xs font-bold border px-3 py-2 rounded-sm"><Filter size={14} /> 필터</button>
              <div className="relative group">
                <button className="flex items-center gap-1 text-xs font-bold text-[#5C5550] hover:text-[#997B4D]">
                  <SlidersHorizontal size={14} />
                  {activeTab === 'new' && '신상품순'}
                  {activeTab === 'best' && '인기순'}
                  {activeTab === 'sale' && '할인율순'}
                  <ChevronDown size={12} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
             <div className="text-center py-20 text-[#888]">상품을 불러오는 중입니다...</div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                {products.map((product) => (
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
             <div className="text-center py-20 text-[#888]">검색 결과와 일치하는 상품이 없습니다.</div>
          )}

          <div className="mt-16 flex justify-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center border border-[#E5E0D8] text-xs transition rounded-sm bg-[#2C2C2C] text-white">1</button>
            <button className="w-8 h-8 flex items-center justify-center border border-[#E5E0D8] text-[#5C5550] hover:text-[#997B4D] text-xs transition rounded-sm"><ChevronRight size={14}/></button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductListPage;