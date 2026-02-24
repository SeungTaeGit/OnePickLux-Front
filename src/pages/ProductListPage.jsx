import React, { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, ChevronDown, ChevronRight, Search } from 'lucide-react';
import ProductCard from '../components/common/ProductCard.jsx';
import { CATEGORIES, INITIAL_BRANDS } from '../constants/data.js';
import { getProducts } from '../api/productApi.js';

const ProductListPage = () => {
  const [filterPrice, setFilterPrice] = useState(10000000);
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // API 호출 함수: 검색어(keyword)와 최대 가격(maxPrice)을 파라미터로 전송
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: 0,
        size: 20,
        sort: 'createdAt,desc',
        keyword: keyword || undefined,
        maxPrice: filterPrice || undefined
      };

      const response = await getProducts(params);
      if (response.data && response.data.content) {
          setProducts(response.data.content);
      }
    } catch (error) {
      console.error('상품 로딩 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 진입 시 및 가격 필터 변경 시 데이터 요청
  useEffect(() => {
    fetchProducts();
  }, [filterPrice]);

  // 검색창 엔터키 이벤트 핸들러
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchProducts();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex flex-col items-center mb-12">
        <h2 className="text-3xl font-serif text-[#2C2C2C] mb-2">All Products</h2>
        <div className="w-10 h-[1px] bg-[#997B4D] mb-4"></div>
        <p className="text-sm text-[#888]">엄격한 검수를 거친 100% 정품 중고 명품을 만나보세요.</p>

        {/* 명품 스타일 검색창 */}
        <div className="mt-8 w-full max-w-md relative group">
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

      <div className="flex flex-col md:flex-row gap-8">
        {/* 사이드바 필터 영역 */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8 hidden md:block">
          <div>
            <h3 className="text-sm font-bold text-[#2C2C2C] mb-4 pb-2 border-b border-[#E5E0D8] flex items-center gap-2">
              <Filter size={14} /> CATEGORY
            </h3>
            <ul className="space-y-2 text-sm text-[#5C5550]">
              {CATEGORIES.map(cat => (
                <li key={cat.id} className="flex items-center gap-2 hover:text-[#997B4D] cursor-pointer">
                  <input type="checkbox" className="accent-[#997B4D] rounded-sm" />
                  <span>{cat.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#2C2C2C] mb-4 pb-2 border-b border-[#E5E0D8]">BRAND</h3>
            <div className="h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 pr-2 space-y-2 text-sm text-[#5C5550]">
              {INITIAL_BRANDS.map(brand => (
                <li key={brand.id} className="flex items-center gap-2 hover:text-[#997B4D] cursor-pointer list-none">
                  <input type="checkbox" className="accent-[#997B4D] rounded-sm" />
                  <span>{brand.name}</span>
                </li>
              ))}
            </div>
          </div>

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

        {/* 메인 상품 리스트 영역 */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs text-[#888] font-bold">Total <span className="text-[#2C2C2C]">{products.length}</span> items</span>
            <div className="flex items-center gap-3">
              <button className="md:hidden flex items-center gap-1 text-xs font-bold border px-3 py-2 rounded-sm"><Filter size={14} /> 필터</button>
              <div className="relative group">
                <button className="flex items-center gap-1 text-xs font-bold text-[#5C5550] hover:text-[#997B4D]">
                  <SlidersHorizontal size={14} /> 신상품순 <ChevronDown size={12} />
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
                        price: product.price
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