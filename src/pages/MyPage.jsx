import React, { useState, useEffect } from 'react';
import { User, Package, Tag, Heart, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react'; // 💡 MessageSquare, AlertCircle 추가
import { getMyProfile, getMySellingHistory, getMyOrderHistory, getMyLikedProducts } from '../api/myPageApi.js';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // 💡 문의 내역 직접 호출용
import ProductCard from '../components/common/ProductCard.jsx';

const MyPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 💡 다른 페이지에서 탭을 지정해서 넘어올 때 사용

  // URL state로 activeTab이 넘어오면 그걸 쓰고, 아니면 'profile' 사용
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profile');

  const [profile, setProfile] = useState(null);
  const [sellingList, setSellingList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [likedList, setLikedList] = useState([]);

  // 💡 [추가] 1:1 문의 내역 상태
  const [inquiryList, setInquiryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 💡 [추가] 내가 쓴 1:1 문의 내역을 불러오는 함수
  const fetchMyInquiries = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return [];
      const response = await axios.get('http://localhost:8080/api/inquiries/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('문의 내역 로드 실패:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        setIsLoading(true);

        // 💡 문의 내역 API도 함께 호출합니다.
        const [profileRes, sellingRes, orderRes, likedRes, inquiryRes] = await Promise.all([
          getMyProfile().catch(e => { console.error("프로필 에러:", e); return null; }),
          getMySellingHistory().catch(e => { console.error("판매내역 에러:", e); return null; }),
          getMyOrderHistory().catch(e => { console.error("구매내역 에러:", e); return null; }),
          getMyLikedProducts().catch(e => { return { status: 'ERROR', data: [] }; }),
          fetchMyInquiries() // 💡 문의 내역 함수 추가
        ]);

        if (profileRes && profileRes.status === 'OK') setProfile(profileRes.data);
        if (sellingRes && sellingRes.status === 'OK') setSellingList(sellingRes.data);
        if (orderRes && orderRes.status === 'OK') setOrderList(orderRes.data);
        if (inquiryRes) setInquiryList(inquiryRes);

        let likesArray = [];
        if (likedRes) {
          if (likedRes.data && Array.isArray(likedRes.data)) likesArray = likedRes.data;
          else if (likedRes.data?.data && Array.isArray(likedRes.data.data)) likesArray = likedRes.data.data;
          else if (Array.isArray(likedRes)) likesArray = likedRes;
        }
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
              className={`w-full flex items-center justify-between p-5 text-sm font-bold tracking-widest transition border-b border-[#E5E0D8] ${activeTab === 'likes' ? 'bg-[#FDFBF7] text-[#997B4D]' : 'text-[#5C5550] hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3"><Heart size={16} /> 찜한 상품 <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{likedList.length}</span></div>
              <ChevronRight size={14} />
            </button>

            {/* 💡 [추가] 1:1 문의 내역 탭 */}
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`w-full flex items-center justify-between p-5 text-sm font-bold tracking-widest transition ${activeTab === 'inquiries' ? 'bg-[#FDFBF7] text-[#997B4D]' : 'text-[#5C5550] hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3"><MessageSquare size={16} /> 1:1 문의 내역 <span className="bg-[#1A1A1A] text-white text-[10px] px-2 py-0.5 rounded-full">{inquiryList.length}</span></div>
              <ChevronRight size={14} />
            </button>
          </div>
        </aside>

        <main className="flex-1 bg-white border border-[#E5E0D8] shadow-sm p-8 md:p-12 min-h-[500px]">

          {/* 내 정보 탭 */}
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

          {/* 판매 내역 탭 */}
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

          {/* 구매 내역 탭 */}
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

          {/* 찜한 상품 탭 */}
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

          {/* 💡 [추가] 1:1 문의 내역 탭 */}
          {activeTab === 'inquiries' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E5E0D8]">
                <h3 className="text-xl font-serif text-[#2C2C2C]">1:1 Inquiries</h3>
                <button onClick={() => navigate('/cs')} className="text-xs font-bold text-[#997B4D] border border-[#997B4D] px-4 py-2 hover:bg-[#997B4D] hover:text-white transition rounded-sm">새 문의 작성</button>
              </div>

              {inquiryList.length === 0 ? (
                <div className="text-center py-20 text-[#888] bg-[#FDFBF7] border border-[#E5E0D8] flex flex-col items-center justify-center">
                  <MessageSquare size={40} className="text-[#E5E0D8] mb-4" strokeWidth={1.5} />
                  <p className="font-bold text-[#5C5550] mb-2">작성한 1:1 문의가 없습니다.</p>
                  <p className="text-sm">궁금한 점이 있으시다면 언제든 고객센터를 이용해주세요.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {inquiryList.map((inquiry) => (
                    <div key={inquiry.inquiryId} className="border border-[#E5E0D8] rounded-sm overflow-hidden bg-white">
                      {/* 질문 영역 (고객이 쓴 내용) */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] bg-[#F4F4F4] text-[#5C5550] border border-[#E5E0D8] px-2 py-1 uppercase tracking-widest font-bold">
                              {inquiry.typeDescription}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-1 uppercase tracking-widest ${
                              inquiry.status === 'ANSWERED' ? 'bg-[#1A1A1A] text-[#D4AF37]' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {inquiry.statusDescription}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 font-mono">{inquiry.createdAt?.split('T')[0]}</span>
                        </div>
                        <h4 className="font-bold text-[#2C2C2C] mb-2 text-lg">{inquiry.title}</h4>
                        <p className="text-sm text-[#5C5550] leading-relaxed whitespace-pre-wrap">{inquiry.content}</p>
                      </div>

                      {/* 💡 답변 영역 (관리자가 답변을 달았을 때만 보임) */}
                      {inquiry.status === 'ANSWERED' && (
                        <div className="bg-[#FDFBF7] p-6 border-t border-[#E5E0D8] flex gap-4">
                           <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center shrink-0">
                             <AlertCircle size={16} className="text-white" />
                           </div>
                           <div>
                             <div className="flex items-center gap-2 mb-2">
                               <span className="font-bold text-[#997B4D] text-sm">ONEPICK LUX 고객센터</span>
                               <span className="text-xs text-gray-400 font-mono">{inquiry.answeredAt?.split('T')[0]}</span>
                             </div>
                             <p className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-wrap font-medium">
                               {inquiry.answerContent}
                             </p>
                           </div>
                        </div>
                      )}
                    </div>
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