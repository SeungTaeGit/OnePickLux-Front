import React, { useState } from 'react';
import { LayoutDashboard, Package, Tag, Image as ImageIcon, PlusCircle } from 'lucide-react';
import { Tag as TagIcon } from 'lucide-react';

import AdminDashboard from './AdminDashboard';
import AdminProducts from './AdminProducts';
import AdminProductCreate from './AdminProductCreate';
import AdminRequests from './AdminRequests';
import AdminBanners from './AdminBanners';
import AdminBrands from './AdminBrands';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans">
      {/* 왼쪽 사이드바 메뉴 */}
      <aside className="w-64 bg-[#1A1A1A] text-white flex flex-col shadow-xl z-20 shrink-0">
        <div className="p-8 border-b border-white/5">
          <h1 className="text-xl font-serif font-black tracking-tighter text-[#D4AF37]">
            ONEPICK <span className="text-white/40">ADMIN</span>
          </h1>
        </div>
        <nav className="flex-1 mt-6 px-4 space-y-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'products', icon: Package, label: 'Product Stock' },
            { id: 'product-create', icon: PlusCircle, label: 'Product Create' },
            { id: 'brands', icon: TagIcon, label: 'Brand Config' },
            { id: 'requests', icon: Tag, label: 'Selling Requests' },
            { id: 'banners', icon: ImageIcon, label: 'Banner Management' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${
                activeTab === item.id
                  ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* 오른쪽 메인 화면 영역 */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10 border-b border-gray-100 pb-6">
          <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight uppercase font-serif italic underline decoration-[#D4AF37] underline-offset-8">
            {activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Server Online
          </div>
        </header>

        {/* 탭 상태에 따라 해당하는 컴포넌트를 렌더링합니다 */}
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'product-create' && <AdminProductCreate />}
        {activeTab === 'brands' && <AdminBrands />}
        {activeTab === 'requests' && <AdminRequests />}
        {activeTab === 'banners' && <AdminBanners />}
      </main>
    </div>
  );
};

export default AdminPage;