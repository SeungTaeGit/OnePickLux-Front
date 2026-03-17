import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/common/ProductCard.jsx';
import { getProducts } from '../api/productApi.js';

const BrandPage = () => {
  const { brandName } = useParams(); // URL에서 'chanel' 등을 가져옴
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentBrand, setCurrentBrand] = useState(null);

  // 💡 S3 이미지 URL 변환 헬퍼 추가
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL || 'https://onepick-lux-images.s3.ap-northeast-2.amazonaws.com';
    return `${S3_BASE_URL}/${path.startsWith('/') ? path.slice(1) : path}`;
  };

  useEffect(() => {
    const fetchBrandAndProducts = async () => {
      setIsLoading(true);
      try {
        // 💡 [핵심 수정] 무조건 백엔드에서 활성화된 브랜드 전체를 가져와서 완전한 데이터를 찾습니다!
        const brandRes = await axios.get('http://localhost:8080/api/brands/active');
        const allBrands = brandRes.data?.data || brandRes.data || [];

        let foundBrand = null;

        // 1. 넘겨받은 ID가 있다면 그걸로 찾기
        if (location.state && location.state.brandId) {
          foundBrand = allBrands.find(b => b.id === location.state.brandId || b.brandId === location.state.brandId);
        }
        // 2. 없다면 URL 파라미터(영문명)로 찾기
        if (!foundBrand) {
          foundBrand = allBrands.find(b =>
            b.englishName?.toLowerCase().replace(/\s+/g, '-') === brandName.toLowerCase() ||
            b.englishName?.toLowerCase() === brandName.toLowerCase()
          );
        }

        if (!foundBrand) {
          setCurrentBrand(null);
          setIsLoading(false);
          return;
        }

        // 💡 관리자가 백엔드에 입력한 모든 꿀 데이터(색상, 설명, 배너)를 상태에 예쁘게 저장!
        setCurrentBrand({
          id: foundBrand.id || foundBrand.brandId,
          name: foundBrand.englishName.toUpperCase(),
          kor: foundBrand.koreanName,
          description: foundBrand.description, // 브랜드 설명
          themeColor: foundBrand.themeColor || '#1A1A1A', // 테마 색 (없으면 기본 검정)
          bannerUrl: foundBrand.bannerUrl // 와이드 배너 이미지
        });

        // 상품 조회
        const response = await getProducts({
          page: 0,
          size: 20,
          sort: 'createdAt,desc',
          brandId: foundBrand.id || foundBrand.brandId
        });

        if (response.data && response.data.content) {
          setProducts(response.data.content);
        } else {
          setProducts([]);
        }

      } catch (error) {
        console.error('브랜드 상품 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandAndProducts();
  }, [brandName, location.state]);

  if (!isLoading && !currentBrand) {
    return (
      <div className="py-32 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-6xl font-serif text-[#E5E0D8] mb-4">?</div>
        <h2 className="text-xl font-bold text-[#2C2C2C] mb-2">존재하지 않는 브랜드입니다.</h2>
        <p className="text-[#888] mb-8">URL을 다시 한 번 확인해 주세요.</p>
        <button onClick={() => navigate('/products')} className="px-8 py-3 bg-[#1A1A1A] text-white text-sm tracking-widest font-bold">
          전체 상품 보기
        </button>
      </div>
    );
  }

  // 💡 [동적 스타일링] 배너 이미지가 있으면 배경 이미지로, 없으면 테마 컬러를 배경색으로 씁니다!
  const bannerStyle = currentBrand?.bannerUrl
    ? {
        backgroundImage: `url(${getImageUrl(currentBrand.bannerUrl)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : {
        backgroundColor: currentBrand?.themeColor
      };

  return (
    <div className="animate-fade-in font-sans pb-20">

      {/* 💡 [UX 매직] 관리자의 설정에 따라 완전히 다른 분위기를 내는 다이나믹 배너 */}
      <div
        className="w-full py-28 md:py-36 flex flex-col items-center justify-center text-white relative overflow-hidden border-b-[4px] border-[#D4AF37] transition-all duration-500"
        style={bannerStyle}
      >
        {/* 1. 배너 이미지가 있을 때: 흰색 텍스트가 잘 보이도록 살짝 어두운 딤(Dim) 처리 */}
        {currentBrand?.bannerUrl && (
           <div className="absolute inset-0 bg-black/50 z-0"></div>
        )}

        {/* 2. 배너 이미지가 없을 때: 기존의 세련된 빛 번짐(Blur) 장식 효과 유지 */}
        {!currentBrand?.bannerUrl && (
           <>
             <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 blur-[100px] rounded-full pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 blur-[150px] rounded-full pointer-events-none"></div>
           </>
        )}

        <div className="relative z-10 flex flex-col items-center text-center px-4">
          <span className="text-[10px] text-[#D4AF37] font-black tracking-[0.4em] uppercase mb-4 border-b border-[#D4AF37]/50 pb-1 drop-shadow-md">
            Premium Collection
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-widest uppercase mb-6 drop-shadow-lg">
            {currentBrand?.name}
          </h1>
          <p className="text-sm md:text-base tracking-widest text-gray-200 font-light max-w-lg drop-shadow-md whitespace-pre-wrap">
            {/* 💡 관리자가 적은 설명이 있으면 그걸 띄우고, 없으면 기본 멘트를 띄웁니다! */}
            {currentBrand?.description || `원픽럭스가 엄선한 ${currentBrand?.kor} 컬렉션을 만나보세요.`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-end justify-between mb-10 border-b border-[#E5E0D8] pb-4">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-[#2C2C2C]">
            {/* 💡 텍스트 컬러를 테마 컬러로 맞춰주는 센스! (단, 너무 밝은 색일 수 있으니 기본 골드색 사용) */}
            <span className="text-[#997B4D]">{currentBrand?.name}</span> Selection
          </h2>
          <span className="text-xs md:text-sm text-[#888] font-medium">
            Total <span className="font-bold text-[#2C2C2C]">{products.length}</span> Items
          </span>
        </div>

        {isLoading ? (
          <div className="py-32 text-center text-[#888] animate-pulse font-medium">상품을 정성껏 진열하는 중입니다...</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product) => (
              <ProductCard
                key={product.productId}
                product={{
                  ...product,
                  image: product.thumbnailUrl,
                  brand: product.brandName,
                  name: product.name,
                  price: product.price,
                  discountRate: product.discountRate,
                  type: product.type,
                  typeDescription: product.typeDescription
                }}
              />
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center bg-[#FDFBF7] border border-[#E5E0D8] rounded-sm">
            <div className="w-16 h-16 bg-white border border-[#E5E0D8] rounded-full flex items-center justify-center mb-4 text-[#CCC] text-2xl font-serif shadow-sm">!</div>
            <p className="text-[#5C5550] font-bold mb-2">아직 입고된 {currentBrand?.kor} 상품이 없습니다.</p>
            <p className="text-sm text-[#888] mb-6">가장 먼저 {currentBrand?.kor}의 주인공이 되어보세요!</p>
            <button onClick={() => navigate('/selling')} className="px-8 py-3 bg-[#1A1A1A] text-white text-xs font-bold hover:bg-[#D4AF37] transition tracking-widest uppercase">
              내 명품 판매 신청하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandPage;