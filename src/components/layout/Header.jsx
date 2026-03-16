import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, LogOut, Menu, X, Heart, ChevronRight, Sparkles } from 'lucide-react'; // 💡 Sparkles 아이콘 추가

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [cartCount, setCartCount] = useState(0);
  const [likedCount, setLikedCount] = useState(0);
  const [activeTab, setActiveTab] = useState('category');

  const [brandSearch, setBrandSearch] = useState('');

  const [likedCategories, setLikedCategories] = useState(() => {
    const saved = localStorage.getItem('likedCategories');
    return saved ? JSON.parse(saved) : [];
  });

  const [likedBrands, setLikedBrands] = useState(() => {
    const saved = localStorage.getItem('likedBrands');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('likedCategories', JSON.stringify(likedCategories));
  }, [likedCategories]);

  useEffect(() => {
    localStorage.setItem('likedBrands', JSON.stringify(likedBrands));
  }, [likedBrands]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);
    setIsMenuOpen(false);
    setBrandSearch('');

    if (loggedIn) {
      fetchCounts(token);
    } else {
      setCartCount(0);
      setLikedCount(0);
    }
  }, [location.pathname]);

  const fetchCounts = async (token) => {
    try {
      const cartRes = await fetch('http://localhost:8080/api/cart/count', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (cartRes.ok) {
        const cartResult = await cartRes.json();
        setCartCount(cartResult.data || 0);
      }

      const likedRes = await fetch('http://localhost:8080/api/products/likes/me', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (likedRes.ok) {
        const likedResult = await likedRes.json();
        const likesArray = likedResult.data?.content || likedResult.data || [];
        setLikedCount(likesArray.length);
      }
    } catch (error) {
      console.error('카운트 정보를 가져오는데 실패했습니다:', error);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    setCartCount(0);
    setLikedCount(0);
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  const categories = [
    { id: 1, name: '가방' }, { id: 2, name: '의류' }, { id: 3, name: '주얼리' },
    { id: 4, name: '신발' }, { id: 5, name: '지갑' }, { id: 6, name: '악세서리' }
  ];

  const brands = [
    { eng: 'CHANEL', kor: '샤넬', slug: 'chanel' },
    { eng: 'HERMES', kor: '에르메스', slug: 'hermes' },
    { eng: 'ROLEX', kor: '롤렉스', slug: 'rolex' },
    { eng: 'LOUIS VUITTON', kor: '루이비통', slug: 'louis-vuitton' },
    { eng: 'DIOR', kor: '디올', slug: 'dior' },
    { eng: 'GUCCI', kor: '구찌', slug: 'gucci' },
    { eng: 'PRADA', kor: '프라다', slug: 'prada' },
    { eng: 'CELINE', kor: '셀린느', slug: 'celine' },
    { eng: 'CARTIER', kor: '까르띠에', slug: 'cartier' },
    { eng: 'GOYARD', kor: '고야드', slug: 'goyard' }
  ];

  const popularBrands = [
    brands.find(b => b.eng === 'CHANEL'),
    brands.find(b => b.eng === 'HERMES'),
    brands.find(b => b.eng === 'ROLEX'),
    brands.find(b => b.eng === 'DIOR')
  ].filter(Boolean);

  const toggleLikeCategory = (categoryId) => {
    setLikedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const toggleLikeBrand = (brandSlug) => {
    setLikedBrands(prev =>
      prev.includes(brandSlug) ? prev.filter(slug => slug !== brandSlug) : [...prev, brandSlug]
    );
  };

  const likedCategoriesList = categories.filter(c => likedCategories.includes(c.id));
  const likedBrandsList = brands.filter(b => likedBrands.includes(b.slug));

  const filteredBrands = brands.filter(b =>
    b.eng.toLowerCase().includes(brandSearch.toLowerCase()) ||
    b.kor?.includes(brandSearch)
  );

  const requireLogin = (callback) => {
    if (isLoggedIn) {
      callback();
    } else {
      if (window.confirm('로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/75 backdrop-blur-lg border-b border-[#E5E0D8] relative font-sans transition-colors duration-300 hover:bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-10">

        <div className="flex items-center gap-6 md:gap-10">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-[#2C2C2C] hover:text-[#997B4D] transition flex items-center justify-center relative w-8 h-8"
          >
            <div className={`absolute transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isMenuOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}>
              <Menu size={28} strokeWidth={1.5} />
            </div>
            <div className={`absolute transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isMenuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}>
              <X size={28} strokeWidth={1.5} />
            </div>
          </button>

          <Link to="/" className="flex flex-col items-center cursor-pointer group">
            <h1 className="text-xl font-serif font-bold tracking-widest text-[#2C2C2C]">ONEPICK LUX</h1>
            <div className="flex items-center gap-2 w-full justify-center">
              <div className="h-[1px] w-3 bg-[#997B4D]"></div>
              <span className="text-[0.5rem] tracking-[0.2em] text-[#997B4D] font-medium">PRE-OWNED LUXURY</span>
              <div className="h-[1px] w-3 bg-[#997B4D]"></div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5C5550]">
            {/* 💡 [추가] 병행수입 새상품관(부띠끄) 링크 - 골드 포인트 추가 */}
            <Link to="/boutique" className="hover:text-[#D4AF37] transition flex items-center gap-1 font-bold text-[#2C2C2C]">
              BOUTIQUE <Sparkles size={12} className="text-[#D4AF37]" />
            </Link>

            <span className="w-px h-3 bg-gray-300"></span> {/* 💡 메뉴 구분선 */}

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

          <button
            onClick={() => requireLogin(() => navigate('/mypage', { state: { activeTab: 'likes' } }))}
            className="hover:text-red-500 transition relative"
          >
            <Heart size={20} strokeWidth={1.5} />
            {likedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold shadow-sm">
                {likedCount > 99 ? '99+' : likedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => requireLogin(() => navigate('/cart'))}
            className="hover:text-[#997B4D] transition relative"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#997B4D] text-white text-[9px] flex items-center justify-center rounded-full font-bold shadow-sm">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-4 ml-2 border-l border-[#E5E0D8] pl-4">
              <button onClick={() => navigate('/mypage')} className="flex items-center gap-1.5 text-xs font-bold tracking-widest hover:text-[#997B4D] transition uppercase">
                <User size={16} /> MY PAGE
              </button>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs font-bold tracking-widest hover:text-red-500 transition uppercase text-gray-400">
                <LogOut size={16} /> LOGOUT
              </button>
            </div>
          ) : (
            <div className="flex items-center ml-2 border-l border-[#E5E0D8] pl-4">
              <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-xs font-bold tracking-widest hover:text-[#997B4D] transition uppercase">
                <User size={16} /> LOGIN
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className={`fixed top-20 left-0 w-full h-[calc(100vh-5rem)] bg-white z-40 border-t border-[#E5E0D8] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] origin-top
          ${isMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
      >
        <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row px-4 sm:px-6 lg:px-8">
          <div className="w-full md:w-64 py-12 pr-0 md:pr-10 flex flex-row md:flex-col gap-8 border-b md:border-b-0 md:border-r border-[#E5E0D8]">
            <button
              onClick={() => setActiveTab('category')}
              className={`text-left group flex flex-col ${activeTab === 'category' ? 'opacity-100' : 'opacity-40 hover:opacity-70'} transition-opacity`}
            >
              <span className="text-2xl font-serif font-bold text-[#2C2C2C] tracking-wider mb-1">CATEGORY</span>
              <span className="text-sm text-gray-500">카테고리</span>
            </button>
            <button
              onClick={() => setActiveTab('brand')}
              className={`text-left group flex flex-col ${activeTab === 'brand' ? 'opacity-100' : 'opacity-40 hover:opacity-70'} transition-opacity`}
            >
              <span className="text-2xl font-serif font-bold text-[#1A1A1A] tracking-wider mb-1">BRAND</span>
              <span className="text-sm text-gray-500">브랜드</span>
            </button>
          </div>

          <div className="flex-1 py-12 pl-0 md:pl-16">
            {activeTab === 'brand' && (
              <div className="animate-fade-in space-y-12">
                <div className="flex flex-col xl:flex-row gap-6">
                  <div className="flex-1 bg-[#F9F9F9] p-8 rounded-sm">
                    <h3 className="text-sm font-bold text-[#2C2C2C] mb-6">관심 브랜드</h3>
                    {likedBrandsList.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {likedBrandsList.map(brand => (
                          <div key={`liked-${brand.slug}`} className="flex items-center gap-1 bg-white border border-[#E5E0D8] px-4 py-2 rounded-full shadow-sm hover:border-[#997B4D] transition-colors">
                            <button onClick={() => { setIsMenuOpen(false); navigate(`/brand/${brand.slug}`); }} className="text-xs font-bold text-[#5C5550]">{brand.kor}</button>
                            <button onClick={() => toggleLikeBrand(brand.slug)} className="ml-1"><Heart size={14} className="fill-[#997B4D] text-[#997B4D]"/></button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-400 text-xs leading-relaxed">
                        아래 브랜드 리스트에서 <Heart size={12} className="inline text-gray-300"/> 를 누르고<br/>
                        해당 브랜드의 상품 혜택/소식을 받아보세요.
                      </div>
                    )}
                  </div>

                  <div className="flex-1 bg-[#F9F9F9] p-8 rounded-sm">
                    <h3 className="text-sm font-bold text-[#2C2C2C] mb-6">인기 브랜드</h3>
                    <div className="flex flex-wrap gap-2">
                      {popularBrands.map(brand => (
                        <div key={`pop-${brand.slug}`} className="flex items-center gap-1 bg-white border border-[#E5E0D8] px-4 py-2 rounded-full shadow-sm hover:border-[#997B4D] transition-colors">
                          <button onClick={() => { setIsMenuOpen(false); navigate(`/brand/${brand.slug}`); }} className="text-xs font-bold text-[#5C5550]">{brand.kor}</button>
                          <button onClick={() => toggleLikeBrand(brand.slug)} className="ml-1">
                            <Heart size={14} className={likedBrands.includes(brand.slug) ? "fill-[#997B4D] text-[#997B4D]" : "text-gray-300 hover:text-[#997B4D]"} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="브랜드명을 입력해 주세요."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="w-full bg-[#F4F4F4] pl-12 pr-4 py-3 rounded-full text-sm font-medium outline-none focus:bg-white focus:border-[#997B4D] border border-transparent transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-4 border-b border-[#E5E0D8] pb-4 mb-6 text-sm font-bold text-[#2C2C2C]">
                    <span>A-Z</span><span className="text-gray-300">|</span><span className="text-gray-400 font-normal">ㄱ-ㅎ</span>
                  </div>
                  {filteredBrands.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-6 gap-x-12">
                      {filteredBrands.map(brand => (
                        <div key={`list-${brand.slug}`} className="flex items-center justify-between group py-2">
                          <button onClick={() => { setIsMenuOpen(false); navigate(`/brand/${brand.slug}`); }} className="flex flex-col text-left">
                            <span className="text-base font-bold text-[#1A1A1A] group-hover:text-[#997B4D] transition-colors">{brand.eng}</span>
                            <span className="text-xs text-gray-500 mt-1">{brand.kor}</span>
                          </button>
                          <button onClick={() => toggleLikeBrand(brand.slug)} className="p-2">
                            <Heart size={18} className={likedBrands.includes(brand.slug) ? "fill-[#997B4D] text-[#997B4D]" : "text-gray-200 group-hover:text-[#997B4D] transition-colors"} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (<div className="py-10 text-center text-gray-400 text-sm">검색된 브랜드가 없습니다.</div>)}
                </div>
              </div>
            )}

            {activeTab === 'category' && (
              <div className="animate-fade-in space-y-12">
                <div className="flex flex-col xl:flex-row gap-6">
                  <div className="flex-1 bg-[#F9F9F9] p-8 rounded-sm">
                    <h3 className="text-sm font-bold text-[#2C2C2C] mb-6">관심 카테고리</h3>
                    {likedCategoriesList.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {likedCategoriesList.map(cat => (
                          <div key={`liked-cat-${cat.id}`} className="flex items-center gap-1 bg-white border border-[#E5E0D8] px-4 py-2 rounded-full shadow-sm hover:border-[#997B4D] transition-colors">
                            <button onClick={() => { setIsMenuOpen(false); navigate(`/products?categoryId=${cat.id}`); }} className="text-xs font-bold text-[#5C5550]">{cat.name}</button>
                            <button onClick={() => toggleLikeCategory(cat.id)} className="ml-1"><Heart size={14} className="fill-[#997B4D] text-[#997B4D]"/></button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-400 text-xs leading-relaxed">
                        자주 찾는 카테고리에 <Heart size={12} className="inline text-gray-300"/> 를 눌러보세요.
                      </div>
                    )}
                  </div>
                  <div className="flex-1 hidden xl:block"></div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#2C2C2C] border-b border-[#E5E0D8] pb-4 mb-6">전체 카테고리</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-6 gap-x-12">
                    {categories.map(cat => (
                      <div key={`list-cat-${cat.id}`} className="flex items-center justify-between group py-2 border-b border-transparent hover:border-gray-100">
                        <button onClick={() => { setIsMenuOpen(false); navigate(`/products?categoryId=${cat.id}`); }} className="text-base font-medium text-[#2C2C2C] group-hover:text-[#997B4D] transition-colors">
                          {cat.name}
                        </button>
                        <button onClick={() => toggleLikeCategory(cat.id)} className="p-2">
                          <Heart size={18} className={likedCategories.includes(cat.id) ? "fill-[#997B4D] text-[#997B4D]" : "text-gray-200 group-hover:text-[#997B4D] transition-colors"} />
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
    </header>
  );
};

export default Header;