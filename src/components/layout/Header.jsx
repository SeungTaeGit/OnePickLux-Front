import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, LogOut, Menu, X, Heart, ChevronRight } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // [추가] 장바구니 개수를 담을 상태 변수 (기본값 0)
  const [cartCount, setCartCount] = useState(0);

  const [activeTab, setActiveTab] = useState('category');
  const [likedCategories, setLikedCategories] = useState([]);
  const [likedBrands, setLikedBrands] = useState([]);

  // 1. 컴포넌트가 화면에 나타날 때(또는 경로가 바뀔 때) 실행
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);
    setIsMenuOpen(false);

    // [추가] 2. 로그인 상태라면 백엔드에서 장바구니 개수를 가져옵니다.
    if (loggedIn) {
      fetchCartCount(token);
    } else {
      setCartCount(0); // 로그아웃 상태면 0으로 초기화
    }
  }, [location.pathname]);

  // [추가] 3. 백엔드 API 호출 함수
  const fetchCartCount = async (token) => {
    try {
      // 본인의 백엔드 서버 주소에 맞게 수정하세요 (예: http://localhost:8080/api/cart/count)
      const response = await fetch('http://localhost:8080/api/cart/count', {
        method: 'GET',
        headers: {
          // 백엔드(Spring Security)가 사용자를 인식할 수 있도록 토큰을 보냅니다.
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        // ApiResponse 구조에 맞게 데이터를 꺼내옵니다. (result.data)
        setCartCount(result.data);
      }
    } catch (error) {
      console.error('장바구니 개수를 가져오는데 실패했습니다:', error);
    }
  };

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
    setCartCount(0); // 로그아웃 시 장바구니 개수 초기화
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  const categories = ['가방', '시계', '주얼리', '지갑', '의류', '신발'];
  const brands = [
    { eng: 'CHANEL', kor: '샤넬' },
    { eng: 'HERMES', kor: '에르메스' },
    { eng: 'ROLEX', kor: '롤렉스' },
    { eng: 'LOUIS VUITTON', kor: '루이비통' },
    { eng: 'GUCCI', kor: '구찌' },
    { eng: 'DIOR', kor: '디올' },
    { eng: 'PRADA', kor: '프라다' },
    { eng: 'CELINE', kor: '셀린느' },
    { eng: 'CARTIER', kor: '까르띠에' },
    { eng: 'GOYARD', kor: '고야드' }
  ];

  const toggleLikeCategory = (category) => {
    setLikedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleLikeBrand = (brandEngName) => {
    setLikedBrands(prev =>
      prev.includes(brandEngName) ? prev.filter(b => b !== brandEngName) : [...prev, brandEngName]
    );
  };

  const unlikedCategories = categories.filter(c => !likedCategories.includes(c));
  const likedBrandsList = brands.filter(b => likedBrands.includes(b.eng));
  const unlikedBrandsList = brands.filter(b => !likedBrands.includes(b.eng));

  return (
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

          {/* [수정] 장바구니 버튼 클릭 시 /cart 로 이동 & cartCount가 0보다 클 때만 숫자 배지를 보여줌 */}
          <button onClick={() => navigate('/cart')} className="hover:text-[#997B4D] transition relative">
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
                  {likedBrandsList.length > 0 && (
                    <div>
                      <h3 className="text-base font-serif font-bold text-[#997B4D] mb-4 flex items-center gap-2">
                        <Heart size={18} className="fill-[#997B4D]" /> 관심 브랜드
                      </h3>
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {likedBrandsList.map((brand, index) => (
                          <div key={`liked-brand-${index}`} className="flex items-center justify-between p-3.5 bg-[#FDFBF7] border border-[#997B4D]/30 rounded-xl transition-all hover:shadow-md">
                            <button
                              onClick={() => { setIsMenuOpen(false); navigate(`/products?brand=${brand.eng}`); }}
                              className="text-left group-hover:text-[#997B4D] truncate pr-2"
                            >
                              <span className="text-sm font-bold text-[#997B4D]">{brand.kor}</span>
                              <span className="text-[11px] font-serif text-[#B5A591] ml-1.5 uppercase">({brand.eng})</span>
                            </button>
                            <button onClick={() => toggleLikeBrand(brand.eng)} className="p-1 shrink-0">
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
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {unlikedBrandsList.map((brand, index) => (
                        <div key={`brand-${index}`} className="flex items-center justify-between p-3.5 bg-gray-50/50 border border-transparent hover:border-[#E5E0D8] hover:bg-white rounded-xl transition-all group">
                          <button
                            onClick={() => { setIsMenuOpen(false); navigate(`/products?brand=${brand.eng}`); }}
                            className="text-left truncate pr-2"
                          >
                            <span className="text-sm font-medium text-[#2C2C2C] group-hover:text-[#997B4D] transition-colors">{brand.kor}</span>
                            <span className="text-[11px] font-serif text-[#8C857E] ml-1.5 uppercase group-hover:text-[#B5A591] transition-colors">({brand.eng})</span>
                          </button>
                          <button onClick={() => toggleLikeBrand(brand.eng)} className="p-1 shrink-0">
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