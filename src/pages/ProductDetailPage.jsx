import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Shield, CheckCircle, Share2, TrendingDown, Heart, Plane, Package, ShieldCheck, Sparkles, AlertTriangle, Truck, RefreshCcw } from 'lucide-react';
import axios from 'axios';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [mainImage, setMainImage] = useState(null);

  // 💡 [추가] 하단 탭 상태 관리 ('detail' 또는 'policy')
  const [activeBottomTab, setActiveBottomTab] = useState('detail');

  const handleShare = async () => {
    const shareData = {
      title: `[ONEPICK LUX] ${detail.name}`,
      text: '원픽럭스에서 발견한 이 명품, 어때요?',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('공유창을 닫았거나 에러 발생:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('상품 링크가 복사되었습니다. 원하는 곳에 붙여넣기(Ctrl+V) 해주세요!');
      } catch (error) {
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          alert('상품 링크가 복사되었습니다!');
        } catch (err) {
          alert('링크 복사에 실패했습니다.');
        }
        document.body.removeChild(textArea);
      }
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/products/${id}`);

        if (response.data && response.data.data) {
          const productData = response.data.data;
          setDetail(productData);
          setMainImage(productData.thumbnailUrl);

          if (productData.isLiked !== undefined) {
             setIsLiked(productData.isLiked);
          }
        }
      } catch (error) {
        console.error("상품 상세 조회 실패", error);
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleLikeToggle = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { alert('로그인이 필요한 서비스입니다.'); navigate('/login'); return; }
    try {
      const response = await axios.post(`http://localhost:8080/api/products/${id}/likes`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.data === "상품을 찜했습니다.") setIsLiked(true); else setIsLiked(false);
    } catch (error) { console.error('찜하기 오류:', error); alert('처리 중 오류가 발생했습니다.'); }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { alert('장바구니 기능은 로그인이 필요합니다.'); navigate('/login'); return; }
    try {
      const response = await axios.post('http://localhost:8080/api/cart', { productId: parseInt(id), count: 1 }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (response.data.status === 'OK' || response.status === 200) {
        if (window.confirm('장바구니에 상품이 담겼습니다. 장바구니로 이동하시겠습니까?')) navigate('/cart'); else window.location.reload();
      }
    } catch (error) {
      console.error('장바구니 담기 오류:', error);
      if (error.response && error.response.data && error.response.data.message) alert(error.response.data.message); else alert('이미 장바구니에 담긴 상품이거나 처리 중 오류가 발생했습니다.');
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL || 'https://onepick-lux-images.s3.ap-northeast-2.amazonaws.com';
    return `${S3_BASE_URL}/${path.startsWith('/') ? path.slice(1) : path}`;
  };

  const getGradeDescription = (grade) => {
    switch(grade) {
      case 'NEW': return '미사용 신품 (전시 상품 포함)';
      case 'S': return '미세한 사용감만 있는 매우 깨끗한 상품';
      case 'A_PLUS': return '약간의 사용감이 있으나 전반적으로 깨끗한 상품';
      case 'A': return '눈에 띄는 사용감과 스크래치가 있는 상품';
      default: return '검수 완료 상품';
    }
  };

  if (loading) return <div className="py-32 text-center text-[#888] font-medium animate-pulse">상품 정보를 정성껏 불러오는 중입니다...</div>;
  if (!detail) return <div className="py-32 text-center text-[#888] font-medium">상품 정보를 찾을 수 없습니다.</div>;

  const discountRate = detail.discountRate || 0;
  const finalPrice = discountRate > 0 ? Math.floor(detail.price * (1 - discountRate / 100)) : detail.price;
  const allImages = [detail.thumbnailUrl, ...(detail.imageUrls || detail.detailImages || [])].filter(Boolean);
  const isBoutique = detail.type === 'PARALLEL_IMPORT' || detail.typeDescription === '병행수입(새상품)';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in font-sans">

      <div className="text-xs text-[#888] mb-8 font-medium flex items-center gap-2">
        <span className="cursor-pointer hover:text-[#2C2C2C]" onClick={() => navigate('/')}>Home</span> &gt;
        <span className={isBoutique ? "text-[#D4AF37] font-bold" : "text-[#997B4D] font-bold"}>
          {isBoutique ? 'BOUTIQUE (새상품)' : 'PRE-OWNED (중고)'}
        </span> &gt;
        <span className="cursor-pointer hover:text-[#2C2C2C]" onClick={() => navigate(`/brand/${detail.brandName.toLowerCase()}`)}>
          {detail.brandName || 'Brand'}
        </span> &gt;
        <span className="text-[#2C2C2C] truncate max-w-[200px] inline-block align-bottom">{detail.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square bg-[#F4F4F4] rounded-sm overflow-hidden flex items-center justify-center border border-[#E5E0D8]">
             {isBoutique && (
               <div className="absolute top-4 left-4 z-10 bg-[#1A1A1A] text-[#D4AF37] text-[10px] font-black px-3 py-1.5 tracking-widest uppercase shadow-lg">
                 100% NEW
               </div>
             )}
             {mainImage ? (
               <img src={getImageUrl(mainImage)} alt={detail.name} className="w-full h-full object-cover" />
             ) : (
               <div className="text-[#CCC] font-serif text-2xl tracking-widest">IMAGE</div>
             )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setMainImage(imgUrl)}
                  className={`relative w-20 h-20 shrink-0 border-2 rounded-sm overflow-hidden transition-all ${
                    mainImage === imgUrl ? (isBoutique ? 'border-[#D4AF37] opacity-100' : 'border-[#2C2C2C] opacity-100') : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={getImageUrl(imgUrl)} alt={`썸네일 ${index}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-4 flex items-center gap-2">
            {isBoutique ? (
              <span className="bg-[#1A1A1A] text-[#D4AF37] text-[10px] font-black px-2 py-1 tracking-widest uppercase border border-[#D4AF37]/30">
                <Sparkles size={10} className="inline mr-1 -mt-0.5"/> BOUTIQUE / 새상품
              </span>
            ) : (
              <span className="bg-[#F4F4F4] text-[#5C5550] text-[10px] font-black px-2 py-1 tracking-widest uppercase border border-[#E5E0D8]">
                <CheckCircle size={10} className="inline mr-1 -mt-0.5 text-[#997B4D]"/> PRE-OWNED / 검수완료
              </span>
            )}
          </div>

          <div className="mb-2">
            <span className="text-[#2C2C2C] font-black text-sm tracking-widest uppercase border-b border-[#2C2C2C] pb-0.5 inline-block">
              {detail.brandName || 'BRAND'}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif text-[#2C2C2C] mb-6 leading-tight break-keep">
            {detail.name}
          </h1>

          <div className="flex items-center gap-4 mb-8">
            {discountRate > 0 ? (
              <div className="flex flex-col">
                <span className="text-lg text-[#999] line-through decoration-1 mb-1 font-serif">
                  {detail.price?.toLocaleString()}원
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-serif text-red-500 font-bold">
                    {finalPrice.toLocaleString()}<span className="text-2xl text-red-500 ml-1 font-sans font-medium">원</span>
                  </span>
                  <span className="bg-red-50 text-red-500 border border-red-200 text-xs font-bold px-2 py-1 tracking-wider flex items-center gap-1 rounded-sm">
                    <TrendingDown size={12}/> -{discountRate}%
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-3xl font-serif text-[#2C2C2C] font-bold">
                {detail.price?.toLocaleString()}<span className="text-lg ml-1 font-sans font-medium">원</span>
              </span>
            )}
          </div>

          <div className="h-[1px] bg-[#E5E0D8] w-full mb-6"></div>

          <div className="space-y-4 mb-8 text-sm text-[#5C5550]">
            <div className="flex">
              <span className="w-24 font-bold text-[#2C2C2C]">상품 상태</span>
              {isBoutique ? (
                <div className="flex flex-col">
                  <span className="flex items-center gap-2 font-bold text-[#D4AF37]">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span> NEW (미사용 신품)
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 font-bold text-[#997B4D]">
                    <span className="w-2 h-2 rounded-full bg-[#997B4D]"></span> {detail.grade || 'S등급'}
                  </span>
                  <span className="text-xs text-[#888] bg-[#FDFBF7] px-2 py-1 rounded-sm border border-[#E5E0D8]">
                    {getGradeDescription(detail.grade)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex"><span className="w-24 font-bold text-[#2C2C2C]">상품 번호</span><span className="font-mono text-[#888]">P-{10000 + detail.productId}</span></div>
            <div className="flex"><span className="w-24 font-bold text-[#2C2C2C]">배송 정보</span><span>무료배송 (우체국 안심 소포)</span></div>
          </div>

          {isBoutique ? (
            <div className="bg-[#1A1A1A] p-4 rounded-sm border border-[#333] mb-8 flex justify-between items-center text-xs font-bold text-gray-300">
              <div className="flex flex-col items-center gap-1.5"><Plane size={18} className="text-[#D4AF37]"/> 유럽 정식 통관</div>
              <div className="w-[1px] h-8 bg-gray-700"></div>
              <div className="flex flex-col items-center gap-1.5"><Package size={18} className="text-[#D4AF37]"/> 풀패키지 제공</div>
              <div className="w-[1px] h-8 bg-gray-700"></div>
              <div className="flex flex-col items-center gap-1.5"><ShieldCheck size={18} className="text-[#D4AF37]"/> 가품 200% 보상</div>
            </div>
          ) : (
            <div className="bg-[#FDFBF7] p-4 rounded-sm border border-[#E5E0D8] mb-8 flex justify-between items-center text-xs font-bold text-[#5C5550]">
              <div className="flex flex-col items-center gap-1.5"><Shield size={18} className="text-[#997B4D]"/> 정품 2중 검수</div>
              <div className="w-[1px] h-8 bg-[#E5E0D8]"></div>
              <div className="flex flex-col items-center gap-1.5"><Sparkles size={18} className="text-[#997B4D]"/> 프리미엄 케어 완료</div>
              <div className="w-[1px] h-8 bg-[#E5E0D8]"></div>
              <div className="flex flex-col items-center gap-1.5"><ShieldCheck size={18} className="text-[#997B4D]"/> 가품 200% 보상</div>
            </div>
          )}

          <div className="flex gap-4 mb-6">
            <button
              onClick={handleLikeToggle}
              className="w-14 flex items-center justify-center border border-[#E5E0D8] hover:border-[#2C2C2C] transition group bg-white rounded-sm"
            >
              <Heart size={20} className={`transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-[#2C2C2C] group-hover:text-red-500'}`} />
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 border border-[#E5E0D8] text-[#2C2C2C] py-4 font-bold text-sm tracking-widest hover:border-[#2C2C2C] transition flex items-center justify-center gap-2 bg-white hover:bg-gray-50 rounded-sm"
            >
              <ShoppingBag size={18} strokeWidth={1.5} /> ADD TO CART
            </button>
            <button className={`flex-1 text-white py-4 font-bold text-sm tracking-widest transition shadow-lg rounded-sm ${isBoutique ? 'bg-[#D4AF37] hover:bg-[#B89628]' : 'bg-[#1A1A1A] hover:bg-black'}`}>
              BUY NOW
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-[#888] border-t border-[#E5E0D8] pt-4">
            <div className="flex items-center gap-1"><Shield size={14} /> 100% 정품 보증</div>
            <div className="flex items-center gap-1"><CheckCircle size={14} /> 전문 감정사 검수</div>
            <div
              className="flex items-center gap-1 cursor-pointer hover:text-[#2C2C2C] transition-colors"
              onClick={handleShare}
            >
              <Share2 size={14} /> 공유하기
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 💡 [수정] 탭 전환 UI 구현 */}
      {/* ======================================================== */}
      <div className="mt-32">
         <div className="flex justify-center border-b border-[#E5E0D8] mb-16">
            <button
              onClick={() => setActiveBottomTab('detail')}
              className={`px-8 md:px-12 py-4 text-sm md:text-base font-bold transition-colors ${
                activeBottomTab === 'detail'
                ? 'text-[#2C2C2C] border-b-2 border-[#2C2C2C]'
                : 'text-[#888] hover:text-[#2C2C2C]'
              }`}
            >
              상품 상세 & 검수 리포트
            </button>
            <button
              onClick={() => setActiveBottomTab('policy')}
              className={`px-8 md:px-12 py-4 text-sm md:text-base font-bold transition-colors ${
                activeBottomTab === 'policy'
                ? 'text-[#2C2C2C] border-b-2 border-[#2C2C2C]'
                : 'text-[#888] hover:text-[#2C2C2C]'
              }`}
            >
              배송/교환/반품 안내
            </button>
         </div>

         {/* 탭 내용 렌더링 영역 */}
         <div className="max-w-4xl mx-auto animate-fade-in-up">

            {/* 💡 탭 1: 상세 이미지 (기존 로직) */}
            {activeBottomTab === 'detail' && (
              <>
                <div className="text-center mb-16 px-4">
                  <h3 className="text-2xl font-serif text-[#2C2C2C] mb-6 tracking-wide">Product Details</h3>
                  <div className="text-base text-[#5C5550] leading-relaxed whitespace-pre-wrap p-8 bg-[#FAFAFA] rounded-sm border border-[#E5E0D8]">
                    {detail.description || (isBoutique ?
                      "유럽 현지 정식 매장 및 부띠끄를 통해 바잉된 100% 정품 미사용 신품입니다.\n구성품이 모두 포함된 풀패키지로 안전하게 발송됩니다." :
                      "전문 감정사가 엄격한 기준에 따라 2중 검수를 완료한 100% 정품입니다.\n프리미엄 케어(세척/살균)를 마쳐 즉시 착용 가능합니다.")
                    }
                  </div>
                </div>
                <div className="flex flex-col items-center w-full">
                  {(detail.imageUrls || detail.detailImages || []).map((imgUrl, index) => (
                    <img key={index} src={getImageUrl(imgUrl)} alt={`상세설명 이미지 ${index + 1}`} className="w-full max-w-3xl object-contain mb-4 border border-[#E5E0D8]"/>
                  ))}
                </div>
              </>
            )}

            {/* 💡 탭 2: 명품 전문 배송/반품 정책 (신규 추가) */}
            {activeBottomTab === 'policy' && (
              <div className="space-y-12 px-4">

                {/* 배송 정책 */}
                <section>
                  <h4 className="flex items-center gap-2 text-lg font-bold text-[#2C2C2C] mb-4 border-b border-[#E5E0D8] pb-2">
                    <Truck size={20} className="text-[#997B4D]" /> 배송 안내
                  </h4>
                  <ul className="space-y-3 text-sm text-[#5C5550] leading-relaxed list-disc list-inside pl-4">
                    <li><span className="font-bold text-[#2C2C2C]">배송비:</span> 전 상품 무료배송 (제주/도서산간 지역 포함)</li>
                    <li><span className="font-bold text-[#2C2C2C]">배송사:</span> 우체국 안심소포 및 프리미엄 특수 배송(Valex)을 통해 가장 안전하게 전달됩니다.</li>
                    <li><span className="font-bold text-[#2C2C2C]">출고 일정:</span> 평일 오후 2시 이전 결제 완료 건은 당일 출고되며, 평균 1~2영업일 이내 수령 가능합니다.</li>
                    <li>모든 상품의 포장 및 출고 과정은 고화질 CCTV로 녹화되어 분실 및 파손을 철저히 방지합니다.</li>
                  </ul>
                </section>

                {/* 교환/반품 정책 */}
                <section>
                  <h4 className="flex items-center gap-2 text-lg font-bold text-[#2C2C2C] mb-4 border-b border-[#E5E0D8] pb-2">
                    <RefreshCcw size={20} className="text-[#997B4D]" /> 교환 및 반품 안내
                  </h4>
                  <div className="bg-[#FAFAFA] p-6 rounded-sm border border-[#E5E0D8] mb-4 flex items-start gap-3">
                    <AlertTriangle size={24} className="text-red-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-red-500 mb-1">보안 택(Security Tag) 제거 시 교환/반품 절대 불가</p>
                      <p className="text-xs text-[#5C5550] leading-relaxed">
                        상품에 부착된 원픽럭스 전용 보안 택이 훼손되거나 제거된 경우,
                        전자상거래법 제17조에 의거하여 어떠한 사유로도 교환 및 반품이 불가합니다.
                        반드시 택을 제거하기 전 상품의 상태를 확인해 주시기 바랍니다.
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-3 text-sm text-[#5C5550] leading-relaxed list-disc list-inside pl-4">
                    <li>단순 변심으로 인한 반품은 상품 수령 후 <span className="font-bold">7일 이내</span>에 고객센터를 통해 접수하셔야 합니다.</li>
                    <li>
                      <span className="font-bold text-[#2C2C2C]">반품 배송비:</span> 명품 특수 보험 배송비가 청구되므로, 단순 변심 반품 시 <span className="font-bold text-red-500">왕복 20,000원</span>이 차감 후 환불됩니다.
                    </li>
                    {isBoutique ? (
                       <li>본 상품은 병행수입 새상품으로, 미세한 스크래치, 가죽 결 차이, 본드 자국 등은 제조 공정상 발생할 수 있으며 이는 불량(무상 반품 사유)으로 간주되지 않습니다.</li>
                    ) : (
                       <li>본 상품은 프리오운드(중고) 상품으로, 고지된 상태(Condition) 등급에 따른 미세한 사용감이나 스크래치를 사유로 한 무상 반품은 불가합니다.</li>
                    )}
                  </ul>
                </section>

                {/* A/S 안내 */}
                <section>
                  <h4 className="flex items-center gap-2 text-lg font-bold text-[#2C2C2C] mb-4 border-b border-[#E5E0D8] pb-2">
                    <Shield size={20} className="text-[#997B4D]" /> A/S 및 보증
                  </h4>
                  <ul className="space-y-3 text-sm text-[#5C5550] leading-relaxed list-disc list-inside pl-4">
                    <li>원픽럭스에서 판매하는 모든 상품은 정품임을 100% 보증하며, 가품 판정 시 구매 금액의 200%를 보상해 드립니다.</li>
                    <li>병행수입 및 중고 명품 특성상 <span className="font-bold">국내 백화점 및 공식 매장에서의 무상 A/S는 불가</span>할 수 있습니다.</li>
                    <li>상품 사용 중 발생하는 수선은 명품 전문 수선사(사설)를 이용해 주시기 바랍니다.</li>
                  </ul>
                </section>

              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;