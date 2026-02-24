import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, LogOut, Menu, X, Heart, ChevronRight } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('category');
  const [likedCategories, setLikedCategories] = useState([]);
  const [likedBrands, setLikedBrands] = useState([]);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('accessToken'));
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  const categories = ['가방', '시계', '주얼리', '지갑', '의류', '신발'];
  const brands = ['CHANEL', 'HERMES', 'ROLEX', 'LOUIS VUITTON', 'GUCCI', 'DIOR', 'PRADA', 'CELINE', 'CARTIER', 'GOYARD'];

  const toggleLikeCategory = (category) => {
    setLikedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleLikeBrand = (brand) => {
    setLikedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const unlikedCategories = categories.filter(c => !likedCategories.includes(c));
  const unlikedBrands = brands.filter(b => !likedBrands.includes(b));

  return (
    // font-sans를 적용하여 전체 기본 폰트를 Pretendard로 설정합니다.
    <header className="sticky top-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E5E0D8] relative font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-10 bg-[#FDFBF7]/95">

        <div className="flex items-center gap-6 md:gap-10">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-[#2C2C2C] hover:text-[#997B4D] transition flex items-center justify-center"
          >
            {isMenuOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
          </button>

          <Link to="/" className="flex flex-col items-center cursor-pointer group">
            {/* 로고, 제목 등에 font-serif를 적용하여 Playfair/Noto Serif를 씁니다. */}
            <h1 className="text-xl font-serif font-bold tracking-widest text-[#2C2C2C]">ONEPICK LUX</h1>
            <div className="flex items-center gap-2 w-full justify-center">
              <div className="h-[1px] w-3 bg-[#997B4D]"></div>
              <span className="text-[0.5rem] tracking-[0.2em] text-[#997B4D] font-medium">PRE-OWNED LUXURY</span>
              <div className="h-[1px] w-3 bg-[#997B4D]"></div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5C5550]">
            <Link to="/products?sort=new" className="hover:text-[#997B4D] transition">NEW</Link>
            <Link to="/products?sort=best" className="hover:text-[#997B4D] transition">BEST</Link>
            <Link to="/products?filter=sale" className="hover:text-[#997B4D] transition flex items-center gap-1">
              SALE <span className="text-[#997B4D] text-[10px]">●</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-5 text-[#5C5550]">
          <button onClick={() => navigate('/selling')} className="hidden md:flex px-4 py-2 text-xs font-bold tracking-widest bg-[#997B4D] text-white rounded-full hover:bg-[#8B7355] transition shadow-sm">
            내 명품 팔기
          </button>
          <button className="hover:text-[#997B4D] transition"><Search size={20} strokeWidth={1.5} /></button>
          <button className="hover:text-[#997B4D] transition relative">
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#997B4D] text-white text-[9px] flex items-center justify-center rounded-full font-bold">2</span>
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-4 ml-2 border-l border-[#E5E0D8] pl-4">
              <button onClick={() => navigate('/mypage')} className="flex items-center gap-1.5 text-xs font-bold tracking-widest hover:text-[#997B4D] transition uppercase">
                <User size={16} /> MY PAGE
              </button>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs font-bold tracking-widest hover:text-[#997B4D] transition uppercase">
                <LogOut size={16} /> LOGOUT
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-xs font-bold tracking-widest hover:text-[#997B4D] transition uppercase">
              <User size={16} /> LOGIN
            </button>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed top-20 left-0 w-full h-[calc(100vh-5rem)] bg-white z-40 border-t border-[#E5E0D8] overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row px-4 sm:px-6 lg:px-8">

            <div className="w-full md:w-56 py-8 pr-0 md:pr-8 flex flex-row md:flex-col gap-2 border-b md:border-b-0 md:border-r border-[#E5E0D8]">
              <button
                onClick={() => setActiveTab('category')}
                className={`py-3 px-5 text-left text-sm font-bold tracking-widest transition-all rounded-xl flex items-center justify-between ${
                  activeTab === 'category'
                    ? 'bg-[#FDFBF7] text-[#997B4D] shadow-sm'
                    : 'text-[#5C5550] hover:text-[#2C2C2C] hover:bg-gray-50'
                }`}
              >
                CATEGORIES
                {activeTab === 'category' && <ChevronRight size={16} />}
              </button>
              <button
                onClick={() => setActiveTab('brand')}
                className={`py-3 px-5 text-left text-sm font-bold tracking-widest transition-all rounded-xl flex items-center justify-between ${
                  activeTab === 'brand'
                    ? 'bg-[#FDFBF7] text-[#997B4D] shadow-sm'
                    : 'text-[#5C5550] hover:text-[#2C2C2C] hover:bg-gray-50'
                }`}
              >
                BRANDS
                {activeTab === 'brand' && <ChevronRight size={16} />}
              </button>
            </div>

            <div className="flex-1 py-8 pl-0 md:pl-12">
              {activeTab === 'category' ? (
                <div className="space-y-10">
                  {likedCategories.length > 0 && (
                    <div>
                      <h3 className="text-base font-serif font-bold text-[#997B4D] mb-4 flex items-center gap-2">
                        <Heart size={18} className="fill-[#997B4D]" /> 관심 카테고리
                      </h3>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {likedCategories.map((category, index) => (
                          <div key={`liked-cat-${index}`} className="flex items-center justify-between p-3.5 bg-[#FDFBF7] border border-[#997B4D]/30 rounded-xl transition-all hover:shadow-md">
                            <button
                              onClick={() => { setIsMenuOpen(false); navigate(`/products?category=${category}`); }}
                              className="text-sm font-medium text-[#997B4D]"
                            >
                              {category}
                            </button>
                            <button onClick={() => toggleLikeCategory(category)} className="p-1">
                              <Heart size={18} className="fill-[#997B4D] text-[#997B4D]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-base font-serif font-bold text-[#2C2C2C] mb-4">
                      전체 카테고리
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {unlikedCategories.map((category, index) => (
                        <div key={`cat-${index}`} className="flex items-center justify-between p-3.5 bg-gray-50/50 border border-transparent hover:border-[#E5E0D8] hover:bg-white rounded-xl transition-all">
                          <button
                            onClick={() => { setIsMenuOpen(false); navigate(`/products?category=${category}`); }}
                            className="text-sm font-medium text-[#5C5550] hover:text-[#2C2C2C]"
                          >
                            {category}
                          </button>
                          <button onClick={() => toggleLikeCategory(category)} className="p-1">
                            <Heart size={18} className="text-[#D1C9C0] hover:text-[#997B4D]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  {likedBrands.length > 0 && (
                    <div>
                      <h3 className="text-base font-serif font-bold text-[#997B4D] mb-4 flex items-center gap-2">
                        <Heart size={18} className="fill-[#997B4D]" /> 관심 브랜드
                      </h3>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {likedBrands.map((brand, index) => (
                          <div key={`liked-brand-${index}`} className="flex items-center justify-between p-3.5 bg-[#FDFBF7] border border-[#997B4D]/30 rounded-xl transition-all hover:shadow-md">
                            <button
                              onClick={() => { setIsMenuOpen(false); navigate(`/products?brand=${brand}`); }}
                              className="text-sm font-serif font-bold text-[#997B4D]"
                            >
                              {brand}
                            </button>
                            <button onClick={() => toggleLikeBrand(brand)} className="p-1">
                              <Heart size={18} className="fill-[#997B4D] text-[#997B4D]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-base font-serif font-bold text-[#2C2C2C] mb-4">
                      전체 브랜드
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {unlikedBrands.map((brand, index) => (
                        <div key={`brand-${index}`} className="flex items-center justify-between p-3.5 bg-gray-50/50 border border-transparent hover:border-[#E5E0D8] hover:bg-white rounded-xl transition-all">
                          <button
                            onClick={() => { setIsMenuOpen(false); navigate(`/products?brand=${brand}`); }}
                            className="text-sm font-serif font-medium text-[#5C5550] hover:text-[#2C2C2C]"
                          >
                            {brand}
                          </button>
                          <button onClick={() => toggleLikeBrand(brand)} className="p-1">
                            <Heart size={18} className="text-[#D1C9C0] hover:text-[#997B4D]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;