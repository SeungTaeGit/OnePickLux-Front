import React, { useState, useEffect } from 'react';
import { User, Package, Tag, LogOut, ChevronRight } from 'lucide-react';
import { getMyProfile, getMySellingHistory, getMyOrderHistory } from '../api/myPageApi.js';
import { useNavigate } from 'react-router-dom';

const MyPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  // 상태 관리
  const [profile, setProfile] = useState(null);
  const [sellingList, setSellingList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 화면이 처음 켜질 때 데이터 불러오기
  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        setIsLoading(true);
        // 세 가지 API를 동시에 병렬로 호출 (성능 최적화)
        const [profileRes, sellingRes, orderRes] = await Promise.all([
          getMyProfile(),
          getMySellingHistory(),
          getMyOrderHistory()
        ]);

        if (profileRes.status === 'OK') setProfile(profileRes.data);
        if (sellingRes.status === 'OK') setSellingList(sellingRes.data);
        if (orderRes.status === 'OK') setOrderList(orderRes.data);

      } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다.", error);
        // 토큰이 만료되었거나 없으면 로그인 페이지로 튕겨냄
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
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
    <div className="bg-[#FDFBF7] min-h-screen pb-20 animate-fade-in">
      {/* 상단 헤더 영역 */}
      <div className="bg-[#2C2C2C] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
            <User size={32} className="text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-3xl font-serif mb-2"><span className="text-[#D4AF37]">{profile?.name}</span> 님</h2>
            <p className="text-sm font-light text-gray-400">{profile?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 flex flex-col md:flex-row gap-8">

        {/* 좌측 탭 메뉴 */}
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
              className={`w-full flex items-center justify-between p-5 text-sm font-bold tracking-widest transition ${activeTab === 'orders' ? 'bg-[#FDFBF7] text-[#997B4D]' : 'text-[#5C5550] hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3"><Package size={16} /> 구매 내역 <span className="bg-[#997B4D] text-white text-[10px] px-2 py-0.5 rounded-full">{orderList.length}</span></div>
              <ChevronRight size={14} />
            </button>
          </div>
        </aside>

        {/* 우측 콘텐츠 영역 */}
        <main className="flex-1 bg-white border border-[#E5E0D8] shadow-sm p-8 md:p-12">

          {/* 1. 내 정보 관리 탭 */}
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

          {/* 2. 판매 내역 탭 */}
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

          {/* 3. 구매 내역 탭 */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-serif text-[#2C2C2C] mb-6 pb-4 border-b border-[#E5E0D8]">Order History</h3>
              {orderList.length === 0 ? (
                <div className="text-center py-16 text-[#888] bg-[#FDFBF7] border border-[#E5E0D8]">결제 완료된 주문 내역이 없습니다.</div>
              ) : (
                <div className="space-y-4">
                  {/* 나중에 결제 기능 만들면 이곳에 리스트가 나옵니다. */}
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