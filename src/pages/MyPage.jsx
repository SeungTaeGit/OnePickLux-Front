import React, { useState, useEffect } from 'react';
import { User, Package, Tag, Heart, ChevronRight } from 'lucide-react';
import { getMyProfile, getMySellingHistory, getMyOrderHistory, getMyLikedProducts } from '../api/myPageApi.js';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard.jsx';

const MyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profile');

  const [profile, setProfile] = useState(null);
  const [sellingList, setSellingList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [likedList, setLikedList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        setIsLoading(true);
        console.log("🔄 마이페이지 데이터 로딩 시작...");

        // 💡 4개의 API를 병렬 호출하며, 하나라도 에러가 나면 앱이 멈추지 않도록 각각 catch를 달아줍니다.
        const [profileRes, sellingRes, orderRes, likedRes] = await Promise.all([
          getMyProfile().catch(e => { console.error("프로필 에러:", e); return null; }),
          getMySellingHistory().catch(e => { console.error("판매내역 에러:", e); return null; }),
          getMyOrderHistory().catch(e => { console.error("구매내역 에러:", e); return null; }),
          getMyLikedProducts().catch(e => {
            console.error("🚨 찜한 상품 API 에러:", e);
            return { status: 'ERROR', data: [] };
          })
        ]);

        if (profileRes && profileRes.status === 'OK') setProfile(profileRes.data);
        if (sellingRes && sellingRes.status === 'OK') setSellingList(sellingRes.data);
        if (orderRes && orderRes.status === 'OK') setOrderList(orderRes.data);

        // 💡 Axios 래핑을 벗겨내는 강력한 방어 로직
        console.log("📦 찜한 상품 백엔드 응답 데이터:", likedRes);
        let likesArray = [];
        if (likedRes) {
          if (likedRes.data && Array.isArray(likedRes.data)) {
            likesArray = likedRes.data;
          } else if (likedRes.data?.data && Array.isArray(likedRes.data.data)) {
            likesArray = likedRes.data.data;
          } else if (Array.isArray(likedRes)) {
            likesArray = likedRes;
          }
        }

        console.log("🎯 최종 렌더링될 찜 상품 개수:", likesArray.length);
        setLikedList(likesArray);

      } catch (error) {
        console.error("데이터 전체 로드 실패:", error);
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPageData();
  }, [navigate]);

  if (isLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-[#888]">Loading My Page...</div>;
  }

  return (
    <div className="bg-[#FDFBF7] min-h-screen pb-20 animate-fade-in font-sans">
      <div className="bg-[#2C2C2C] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
            <User size={32} className="text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-3xl font-serif mb-2"><span className="text-[#D4AF37]">{profile?.name || '고객'}</span> 님</h2>
            <p className="text-sm font-light text-gray-400">{profile?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white border border-[#E5E0D8] rounded-sm overflow-hidden shadow-sm">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between p-5 text-sm font-bold tracking-widest transition border-b border-[#E5E0D8] ${activeTab === 'profile' ? 'bg-[#FDFBF7] text-[#997B4D]' : 'text-[#5C5550] hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3"><User size={16} /> 내 정보 관리</div>
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setActiveTab('selling')}
              className={`w-full flex items-center justify-between p-5 text-sm font-bold tracking-widest transition border-b border-[#E5E0D8] ${activeTab === 'selling' ? 'bg-[#FDFBF7] text-[#997B4D]' : 'text-[#5C5550] hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3"><Tag size={16} /> 판매 내역 <span className="bg-[#997B4D] text-white text-[10px] px-2 py-0.5 rounded-full">{sellingList.length}</span></div>
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between p-5 text-sm font-bold tracking-widest transition border-b border-[#E5E0D8] ${activeTab === 'orders' ? 'bg-[#FDFBF7] text-[#997B4D]' : 'text-[#5C5550] hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3"><Package size={16} /> 구매 내역 <span className="bg-[#997B4D] text-white text-[10px] px-2 py-0.5 rounded-full">{orderList.length}</span></div>
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`w-full flex items-center justify-between p-5 text-sm font-bold tracking-widest transition ${activeTab === 'likes' ? 'bg-[#FDFBF7] text-[#997B4D]' : 'text-[#5C5550] hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3"><Heart size={16} /> 찜한 상품 <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{likedList.length}</span></div>
              <ChevronRight size={14} />
            </button>
          </div>
        </aside>

        <main className="flex-1 bg-white border border-[#E5E0D8] shadow-sm p-8 md:p-12 min-h-[500px]">
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-serif text-[#2C2C2C] mb-6 pb-4 border-b border-[#E5E0D8]">Profile Information</h3>
              <div className="space-y-6 max-w-lg">
                <div><label className="block text-xs font-bold text-[#888] mb-1">이름</label><p className="text-[#2C2C2C] font-medium">{profile?.name}</p></div>
                <div><label className="block text-xs font-bold text-[#888] mb-1">이메일 (아이디)</label><p className="text-[#2C2C2C] font-medium">{profile?.email}</p></div>
                <div><label className="block text-xs font-bold text-[#888] mb-1">휴대폰 번호</label><p className="text-[#2C2C2C] font-medium">{profile?.phone || '미등록'}</p></div>
                <div><label className="block text-xs font-bold text-[#888] mb-1">가입일</label><p className="text-[#2C2C2C] font-medium">{profile?.joinedAt ? profile.joinedAt.split('T')[0] : '-'}</p></div>
                <button className="mt-4 px-6 py-3 border border-[#E5E0D8] text-xs font-bold text-[#5C5550] hover:bg-[#2C2C2C] hover:text-white transition uppercase tracking-widest">비밀번호 변경</button>
              </div>
            </div>
          )}

          {activeTab === 'selling' && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-serif text-[#2C2C2C] mb-6 pb-4 border-b border-[#E5E0D8]">Selling History</h3>
              {sellingList.length === 0 ? (
                <div className="text-center py-16 text-[#888] bg-[#FDFBF7] border border-[#E5E0D8]">아직 신청하신 위탁/매입 내역이 없습니다.</div>
              ) : (
                <div className="space-y-4">
                  {sellingList.map((item) => (
                    <div key={item.sellingId} className="flex flex-col md:flex-row md:items-center justify-between p-6 border border-[#E5E0D8] hover:border-[#997B4D] transition">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] bg-[#2C2C2C] text-white px-2 py-1 uppercase tracking-wider">{item.requestType}</span>
                          <span className="text-xs text-[#888]">{item.requestedAt.split('T')[0]}</span>
                        </div>
                        <h4 className="font-bold text-[#2C2C2C]">{item.brandName} - {item.itemName}</h4>
                        <p className="text-sm text-[#5C5550] mt-1">희망가: {item.desiredPrice?.toLocaleString()}원</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-4 py-2 text-xs font-bold rounded-full ${
                          item.sellingStatus === '승인 (매입/위탁 확정)' ? 'bg-green-100 text-green-700' :
                          item.sellingStatus === '반려 (매입 불가)' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {item.sellingStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-serif text-[#2C2C2C] mb-6 pb-4 border-b border-[#E5E0D8]">Order History</h3>
              {orderList.length === 0 ? (
                <div className="text-center py-16 text-[#888] bg-[#FDFBF7] border border-[#E5E0D8]">결제 완료된 주문 내역이 없습니다.</div>
              ) : (
                <div className="space-y-4">
                  {/* 구매 내역 렌더링 영역 */}
                </div>
              )}
            </div>
          )}

          {activeTab === 'likes' && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-serif text-[#2C2C2C] mb-6 pb-4 border-b border-[#E5E0D8] flex items-center justify-between">
                Wishlist
                <span className="text-sm text-[#888] font-sans">총 <span className="font-bold text-[#D4AF37]">{likedList.length}</span>개의 상품</span>
              </h3>

              {likedList.length === 0 ? (
                <div className="text-center py-20 text-[#888] bg-[#FDFBF7] border border-[#E5E0D8] flex flex-col items-center justify-center">
                  <Heart size={40} className="text-[#E5E0D8] mb-4" strokeWidth={1.5} />
                  <p className="font-bold text-[#5C5550] mb-2">찜한 상품이 없습니다.</p>
                  <p className="text-sm">마음에 드는 상품에 하트를 눌러보세요.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {likedList.map((product) => (
                    <ProductCard
                        key={product.productId}
                        product={{
                            ...product,
                            image: product.thumbnailUrl || "IMG",
                            brand: product.brandName,
                            name: product.name,
                            price: product.price,
                            discountRate: product.discountRate,
                            isLiked: true
                        }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyPage;