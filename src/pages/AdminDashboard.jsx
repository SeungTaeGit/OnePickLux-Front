import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, AlertCircle, Users, BarChart3 } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:8080/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // 백엔드 ApiResponse 구조에 맞춰 데이터 세팅
      if (response.data && response.data.data) {
        setDashboardData(response.data.data);
      } else {
        // 데이터가 없을 경우 임시 기본값 세팅
        setDashboardData({
          todayNewOrders: 0, totalProducts: 0, pendingSellingRequests: 0, totalMembers: 0
        });
      }
    } catch (error) {
      console.error("대시보드 데이터 로드 실패", error);
    }
  };

  if (!dashboardData) return <div className="p-10 text-gray-400">Loading Dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Today Orders', value: dashboardData.todayNewOrders, color: 'text-black', icon: ShoppingCart },
          { label: 'Active Items', value: dashboardData.totalProducts, color: 'text-black', icon: Package },
          { label: 'Pending Appr.', value: dashboardData.pendingSellingRequests, color: 'text-red-500', icon: AlertCircle },
          { label: 'Total Users', value: dashboardData.totalMembers, color: 'text-black', icon: Users },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-md">
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
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-[#D4AF37]"/> Weekly Revenue Overview
            </h3>
          </div>
          <div className="h-48 flex items-end justify-between gap-4 border-b border-gray-100 pb-2">
            {[40, 70, 45, 90, 65, 100, 85].map((height, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-2 group">
                <div className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-gray-400 transition-opacity">₩{height},000</div>
                <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden h-full flex items-end group-hover:bg-[#fcf8ed] transition-colors">
                  <div style={{ height: `${height}%` }} className="w-full bg-black group-hover:bg-[#D4AF37] transition-all duration-500 rounded-t-lg"></div>
                </div>
                <span className="text-[10px] font-bold text-gray-300">D-{6-i}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#1A1A1A] rounded-2xl p-8 text-white shadow-xl">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#D4AF37] mb-6">Action Needed</h3>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-white mb-1">위탁 신청 대기</div>
                <div className="text-[10px] text-gray-400">빠른 검수가 필요합니다.</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                {dashboardData.pendingSellingRequests}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;