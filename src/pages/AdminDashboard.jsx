import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, AlertCircle, Users, BarChart3, Clock, ArrowRight, TrendingUp, CheckCircle } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    fetchDashboard();
    fetchRecentRequests();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:8080/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.data) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error("대시보드 데이터 로드 실패", error);
      // 백엔드 API가 아직 없거나 에러 날 경우 화면이 깨지지 않도록 기본값 세팅
      setDashboardData({
        todayNewOrders: 0,
        totalProducts: 0,
        pendingSellingRequests: 0,
        totalMembers: 0,
        todayRevenue: 0,
        totalOriginalInventoryValue: 0,
        totalDiscountedInventoryValue: 0,
        soldOutCount: 0
      });
    }
  };

  const fetchRecentRequests = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:8080/api/admin/selling-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.data) {
        const pending = response.data.data.filter(r => r.status.includes('신청') || r.status.includes('검수')).slice(0, 4);
        setRecentRequests(pending);
      }
    } catch (error) {
      console.error("최근 위탁 신청 로드 실패", error);
    }
  };

  if (!dashboardData) return <div className="p-10 text-gray-400 font-bold animate-pulse">Loading Dashboard Dashboard Data...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">

      {/* 💡 1. 핵심 KPI (Top Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1A1A1A] p-8 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-white/5 group-hover:scale-110 transition-transform"><TrendingUp size={120}/></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Today's Revenue</span>
            </div>
            <div className="text-3xl font-serif font-black text-white">₩ {(dashboardData.todayRevenue || 0).toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-2 font-bold">결제 모듈 연동 예정</div>
          </div>
        </div>

        {[
          { label: 'Pending Appr. (검수 대기)', value: dashboardData.pendingSellingRequests, color: 'text-red-500', icon: AlertCircle, bg: 'bg-white' },
          { label: 'Active Items (판매 중)', value: dashboardData.totalProducts, color: 'text-[#1A1A1A]', icon: Package, bg: 'bg-white' },
          { label: 'Total Members (총 회원)', value: dashboardData.totalMembers, color: 'text-[#1A1A1A]', icon: Users, bg: 'bg-white' },
        ].map((stat, idx) => (
          <div key={idx} className={`${stat.bg} p-8 rounded-2xl shadow-sm border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-md`}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</span>
              <stat.icon size={20} className="text-[#D4AF37]" />
            </div>
            <div className={`text-4xl font-serif font-bold ${stat.color}`}>
              {stat.value?.toLocaleString() || 0}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 💡 2. 최근 위탁 신청 현황 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#1A1A1A] flex items-center gap-2">
              <Clock size={18} className="text-[#D4AF37]"/> Recent Pending Requests
            </h3>
            <button className="text-[10px] font-black text-gray-400 hover:text-[#1A1A1A] flex items-center gap-1 transition-colors">
              VIEW ALL <ArrowRight size={12}/>
            </button>
          </div>
          <div className="flex-1 p-0">
            {recentRequests.length > 0 ? (
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-gray-50">
                  {recentRequests.map(r => (
                    <tr key={r.requestId} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 pl-6 font-medium text-[#1A1A1A]">{r.brandName}</td>
                      <td className="p-4 text-gray-500 truncate max-w-[200px]">{r.itemName}</td>
                      <td className="p-4 font-serif font-bold text-right">₩ {r.expectedPrice?.toLocaleString()}</td>
                      <td className="p-4 pr-6 text-right">
                        <span className="bg-red-50 text-red-500 text-[10px] font-black px-2 py-1 rounded tracking-wider uppercase">검수 요망</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-10">
                <CheckCircle size={32} className="mb-2 text-green-500 opacity-50" />
                <p className="font-bold text-sm">현재 대기 중인 검수 건이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* 💡 3. 미니 차트 및 실제 데이터 기반 재고 현황 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 flex items-center gap-2 mb-8">
              <BarChart3 size={18} className="text-[#D4AF37]"/> Inventory Status
            </h3>
            <div className="h-24 flex items-end justify-between gap-3 border-b border-gray-100 pb-2 mb-6">
              {/* 이 차트는 향후 날짜별 방문자수 API 연동 시 사용할 수 있도록 껍데기만 둡니다 */}
              {[40, 70, 45, 90, 65, 100, 85].map((height, i) => (
                <div key={i} className="w-full flex flex-col items-center gap-2 group">
                  <div className="w-full bg-gray-100 rounded-t-sm relative overflow-hidden h-full flex items-end">
                    <div style={{ height: `${height}%` }} className="w-full bg-[#1A1A1A] group-hover:bg-[#D4AF37] transition-all duration-300 rounded-t-sm"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 💡 [핵심] 백엔드에서 받아온 실제 재고 가치 데이터 표시 */}
          <div className="space-y-4">
             <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-gray-500">총 재고 가치 <span className="text-[10px] font-normal">(원가 기준)</span></span>
                <span className="font-serif text-sm text-gray-400 line-through decoration-1">
                  ₩ {(dashboardData.totalOriginalInventoryValue || 0).toLocaleString()}
                </span>
             </div>
             <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                <span className="text-xs font-bold text-[#1A1A1A]">총 재고 가치 <span className="text-[10px] font-normal text-red-500">(할인 적용가)</span></span>
                <span className="font-serif text-xl font-black text-red-500">
                  ₩ {(dashboardData.totalDiscountedInventoryValue || 0).toLocaleString()}
                </span>
             </div>
             <div className="flex justify-between items-center text-xs font-bold text-gray-600 pt-1">
                <span>품절 / 완료 상품 누적</span>
                <span className="text-[#1A1A1A] bg-gray-100 px-3 py-1 rounded-full">
                  {dashboardData.soldOutCount || 0} 건
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;