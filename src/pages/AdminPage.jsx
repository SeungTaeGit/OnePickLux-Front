import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, Package, Tag, Users, Settings,
  ShoppingCart, AlertCircle, Edit, Trash2, X, Save, TrendingDown,
  Search, Filter, BarChart3, CheckCircle, XCircle, SearchCode
} from 'lucide-react';
import axios from 'axios';

/** * API CONFIG & CLIENT */
const client = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
});

client.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const api = {
  getDashboard: () => client.get('/admin/dashboard').then(r => r.data),
  getProducts: () => client.get('/admin/products').then(r => r.data),
  getRequests: () => client.get('/admin/selling-requests').then(r => r.data),
  updateSellingStatus: (id, status) => client.patch(`/admin/selling/${id}/status`, null, { params: { status } }),
  approveRequest: (id, data) => client.post(`/admin/selling/${id}/approve`, data),
  updateProduct: (id, data) => client.patch(`/admin/products/${id}`, data),
  deleteProduct: (id) => client.delete(`/admin/products/${id}`)
};

const BRAND_MAP = { 1: "Hermès", 2: "Chanel", 3: "Rolex", 4: "Louis Vuitton", 5: "Dior" };
const CATEGORY_MAP = { 1: "가방", 2: "의류", 3: "주얼리", 4: "신발", 5: "지갑", 6: "악세서리" };

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);

  // 검색 및 필터 상태 관리
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // 모달 상태 관리 (Approve 모달 대신 통합된 Inspect 모달 사용)
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // 검수 및 승인을 위한 폼 데이터
  const [approveForm, setApproveForm] = useState({
    brandId: 1, categoryId: 1, name: '', price: 0, grade: 'S', description: '',
    inspectorName: '시스템 감정사', leatherStatus: 'S', hardwareStatus: 'S', shapeStatus: 'S', innerStatus: 'S', finalComment: ''
  });

  const [editForm, setEditForm] = useState({
    brandId: 1, categoryId: 1, name: '', price: 0, discountRate: 0,
    status: 'SELLING', description: '', grade: 'S'
  });

  const loadData = async () => {
    try {
      const [dbRes, prdRes, reqRes] = await Promise.all([
        api.getDashboard().catch(() => null),
        api.getProducts().catch(() => []),
        api.getRequests().catch(() => [])
      ]);

      const extractData = (response) => {
        if (!response || typeof response === 'string') return null;
        if (Array.isArray(response)) return response;
        if (response.data !== undefined) return response.data;
        if (response.result !== undefined) return response.result;
        return response;
      };

      const extractedProducts = extractData(prdRes);
      const extractedRequests = extractData(reqRes);

      setDashboardData(extractData(dbRes) || {
        todayNewOrders: 24, totalProducts: 156, pendingSellingRequests: 5, totalMembers: 1204
      });
      setProducts(Array.isArray(extractedProducts) ? extractedProducts : []);
      setRequests(Array.isArray(extractedRequests) ? extractedRequests : []);

    } catch (e) {
      console.error("데이터 로드 실패", e);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 💡 [수정] 필터 로직 강화 (백엔드에서 영어/한글 어떤 게 오든 똑똑하게 매칭)
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brandName?.toLowerCase().includes(searchQuery.toLowerCase());

      const pStatus = p.status?.toUpperCase() || '';
      let matchStatus = false;

      if (filterStatus === 'ALL') {
        matchStatus = true;
      } else if (filterStatus === 'SELLING') {
        matchStatus = pStatus === 'SELLING' || pStatus === '판매중';
      } else if (filterStatus === 'PREPARING') {
        matchStatus = pStatus === 'PREPARING' || pStatus.includes('준비') || pStatus.includes('검수');
      } else if (filterStatus === 'RESERVED') {
        matchStatus = pStatus === 'RESERVED' || pStatus === '예약중';
      } else if (filterStatus === 'SOLD_OUT') {
        matchStatus = pStatus === 'SOLD_OUT' || pStatus.includes('완료') || pStatus.includes('품절');
      }

      return matchSearch && matchStatus;
    });
  }, [products, searchQuery, filterStatus]);

  // 💡 [추가] 상세 검수 모달 열기 로직
  const handleInspectClick = (request) => {
    setSelectedItem(request);
    setApproveForm({
      ...approveForm,
      brandId: Object.keys(BRAND_MAP).find(key => BRAND_MAP[key] === request.brandName) || 1,
      name: request.itemName || '',
      price: request.expectedPrice || 0, // 고객 희망가를 기본 감정가로 세팅
    });
    setIsInspectModalOpen(true);
  };

  // 💡 [수정] 모달 안에서 실행되는 액션들 (반려, 검수중, 승인)
  const handleActionSubmit = async (actionType, e) => {
    if (e) e.preventDefault();

    try {
      if (actionType === 'APPROVED') {
        if (!confirm('입력하신 정보로 상품을 최종 승인하고 쇼핑몰에 등록하시겠습니까?')) return;
        await api.approveRequest(selectedItem.requestId, approveForm);
        alert('✅ 상품 검수 완료 및 스토어 등록 성공!');
      } else {
        const actionLabel = actionType === 'REJECTED' ? '반려' : '검수중';
        if (!confirm(`이 신청 건을 [${actionLabel}] 상태로 변경하시겠습니까?`)) return;
        await api.updateSellingStatus(selectedItem.requestId, actionType);
        alert(`✅ ${actionLabel} 처리되었습니다.`);
      }

      setIsInspectModalOpen(false);
      loadData();
    } catch (error) {
      alert('❌ 처리 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  const handleEditClick = (product) => {
    setSelectedItem(product);
    const currentDiscountRate = product.discountRate || product.discount || 0;

    setEditForm({
      brandId: Object.keys(BRAND_MAP).find(key => BRAND_MAP[key] === product.brandName) || 1,
      categoryId: 1,
      name: product.name,
      price: product.price,
      discountRate: currentDiscountRate,
      status: product.status === '판매중' ? 'SELLING' : (product.status === '예약중' ? 'RESERVED' : 'SOLD_OUT'),
      grade: 'S',
      description: product.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateProduct(selectedItem.productId, editForm);
      alert('상품 정보가 성공적으로 수정되었습니다.');
      setIsEditModalOpen(false);
      loadData();
    } catch (e) { alert('수정 중 오류가 발생했습니다.'); }
  };

  const handleDelete = async (id) => {
    if (confirm('정말로 이 상품을 삭제(숨김 처리) 하시겠습니까?')) {
      await api.deleteProduct(id);
      loadData();
    }
  };

  const getDiscountedPrice = (price, rate) => Math.floor(price * (1 - rate / 100));

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans">
      <aside className="w-64 bg-[#1A1A1A] text-white flex flex-col shadow-xl z-20">
        <div className="p-8 border-b border-white/5">
          <h1 className="text-xl font-serif font-black tracking-tighter text-[#D4AF37]">
            ONEPICK <span className="text-white/40">ADMIN</span>
          </h1>
        </div>
        <nav className="flex-1 mt-6 px-4 space-y-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'products', icon: Package, label: 'Product Stock' },
            { id: 'requests', icon: Tag, label: 'Selling Requests' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === item.id ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight uppercase">{activeTab}</h2>
        </header>

        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && dashboardData && (
          <div className="space-y-8 animate-in fade-in duration-500">
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
        )}

        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'products' && (
          <div className="animate-in fade-in duration-500 flex flex-col gap-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="브랜드명 또는 상품명 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 bg-[#F8F9FA] px-4 rounded-xl border-none">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent py-3 text-sm font-bold outline-none text-gray-600 w-32 cursor-pointer"
                >
                  <option value="ALL">전체 상태</option>
                  <option value="SELLING">판매중</option>
                  <option value="PREPARING">검수/준비중</option>
                  <option value="RESERVED">예약중</option>
                  <option value="SOLD_OUT">판매완료</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#FAFAFA] text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <tr><th className="p-6">ID</th><th className="p-6">Brand</th><th className="p-6">Item Name</th><th className="p-6">Pricing</th><th className="p-6">Status</th><th className="p-6 text-right">Actions</th></tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {filteredProducts && filteredProducts.length > 0 ? (
                    filteredProducts.map(p => {
                      const currentDiscountRate = p.discountRate || p.discount || 0;
                      return (
                        <tr key={p.productId} className="hover:bg-gray-50 transition-colors group">
                          <td className="p-6 font-mono text-gray-400">#{p.productId}</td>
                          <td className="p-6 font-black text-[#1A1A1A]">{p.brandName}</td>
                          <td className="p-6 font-medium text-gray-600 max-w-xs truncate">{p.name}</td>
                          <td className="p-6">
                            {currentDiscountRate > 0 ? (
                              <div>
                                <div className="text-xs text-gray-400 line-through">₩ {p.price?.toLocaleString()}</div>
                                <div className="font-serif font-bold text-red-500 text-base">
                                  ₩ {getDiscountedPrice(p.price, currentDiscountRate).toLocaleString()}
                                </div>
                                <div className="text-[10px] text-red-500 font-black flex items-center gap-1 mt-0.5">
                                  <TrendingDown size={10}/> -{currentDiscountRate}% DC
                                </div>
                              </div>
                            ) : (
                              <div className="font-serif font-bold text-black text-base">₩ {p.price?.toLocaleString()}</div>
                            )}
                          </td>
                          <td className="p-6"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === '판매중' || p.status === 'SELLING' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{p.status}</span></td>
                          <td className="p-6 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditClick(p)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-black hover:text-[#D4AF37] transition-all"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(p.productId)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-gray-400 font-bold">검색 결과가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- SELLING REQUESTS TAB --- */}
        {activeTab === 'requests' && (
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
             <table className="w-full text-left">
               <thead className="bg-[#FAFAFA] text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                 <tr><th className="p-6">Requester</th><th className="p-6">Type</th><th className="p-6">Product Details</th><th className="p-6">Expected</th><th className="p-6">Step</th><th className="p-6 text-center">Action</th></tr>
               </thead>
               <tbody className="text-sm divide-y divide-gray-50">
                 {requests && requests.length > 0 ? (
                   requests.map(r => (
                     <tr key={r.requestId} className="hover:bg-gray-50 transition-colors">
                       <td className="p-6 font-black text-[#1A1A1A]">{r.userName}</td>
                       <td className="p-6"><span className="text-[10px] font-black bg-black text-white px-2 py-1 rounded">{r.requestType}</span></td>
                       <td className="p-6 font-medium text-gray-600">{r.brandName} · {r.itemName}</td>
                       <td className="p-6 font-serif font-bold">₩ {r.expectedPrice?.toLocaleString()}</td>
                       <td className="p-6 text-[#D4AF37] font-black text-xs">{r.status}</td>
                       <td className="p-6 text-center">
                         {/* 💡 [UX 개선] 단순 셀렉트 박스가 아닌 "상세 검수" 버튼으로 변경! */}
                         {r.status === '신청 완료' || r.status === 'REQUESTED' || r.status.includes('검수') ? (
                           <button
                             onClick={() => handleInspectClick(r)}
                             className="bg-[#1A1A1A] text-[#D4AF37] px-4 py-2 rounded-lg text-xs font-black tracking-widest uppercase hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
                           >
                             <SearchCode size={14} /> 검수하기
                           </button>
                         ) : (
                           <span className="text-gray-300 italic text-xs font-bold px-2">Closed</span>
                         )}
                       </td>
                     </tr>
                   ))
                 ) : (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-gray-400 font-bold">신청 내역이 없습니다.</td>
                    </tr>
                 )}
               </tbody>
             </table>
           </div>
        )}
      </main>

      {/* --- 💡 [새로 추가된 모달] 상품 상세 검수 및 승인 모달 (INSPECTION MODAL) --- */}
      {isInspectModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-8 flex flex-col max-h-[90vh]">

            <div className="bg-[#1A1A1A] p-6 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-serif font-bold flex items-center gap-2">
                  <SearchCode className="text-[#D4AF37]" /> Product Inspection Review
                </h3>
                <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-black">신청 상품 상세 검수 및 감정가 책정</p>
              </div>
              <button onClick={() => setIsInspectModalOpen(false)} className="text-white/40 hover:text-white transition-colors"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-[#F8F9FA]">

              {/* 왼쪽: 신청자 원본 정보 (읽기 전용) */}
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Original Request</h4>
                  <div className="space-y-4">
                    <div><p className="text-xs text-gray-500 mb-1">신청자</p><p className="font-bold text-sm">{selectedItem.userName}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">거래 방식</p><span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded">{selectedItem.requestType}</span></div>
                    <div><p className="text-xs text-gray-500 mb-1">브랜드</p><p className="font-bold text-sm text-[#D4AF37]">{selectedItem.brandName}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">상품명</p><p className="font-bold text-sm">{selectedItem.itemName}</p></div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">고객 희망가</p>
                      <p className="font-serif font-black text-lg">₩ {selectedItem.expectedPrice?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 관리자 감정 및 폼 입력 영역 */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Appraisal & Registration Form</h4>

                <form id="approveForm" onSubmit={(e) => handleActionSubmit('APPROVED', e)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Category (카테고리)</label>
                      <select value={approveForm.categoryId} onChange={(e) => setApproveForm({...approveForm, categoryId: Number(e.target.value)})} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none">
                        {Object.entries(CATEGORY_MAP).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Final Product Name (정식 상품명)</label>
                      <input type="text" value={approveForm.name} onChange={(e) => setApproveForm({...approveForm, name: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Appraised Price (최종 감정가/판매가)</label>
                      <input type="number" value={approveForm.price} onChange={(e) => setApproveForm({...approveForm, price: Number(e.target.value)})} className="w-full border-2 border-gray-100 rounded-xl p-3 text-lg font-serif font-black focus:border-[#D4AF37] outline-none text-blue-600" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Overall Grade (종합 등급)</label>
                      <select value={approveForm.grade} onChange={(e) => setApproveForm({...approveForm, grade: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none">
                        <option value="NEW">새상품</option><option value="S">S등급</option><option value="A_PLUS">A+등급</option><option value="A">A등급</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Official Description (스토어 노출 설명)</label>
                    <textarea value={approveForm.description} onChange={(e) => setApproveForm({...approveForm, description: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4AF37] outline-none h-24 resize-none" placeholder="고객에게 노출될 상품 설명을 작성해주세요." required />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-3">Internal Memo (관리자 참고용 코멘트)</label>
                    <textarea value={approveForm.finalComment} onChange={(e) => setApproveForm({...approveForm, finalComment: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-gray-500 h-16 resize-none bg-white" placeholder="예: 핸들 부분 미세 스크래치 발견 등" />
                  </div>
                </form>
              </div>
            </div>

            {/* 모달 하단 액션 버튼 영역 */}
            <div className="bg-white p-6 border-t border-gray-100 flex gap-3 justify-end shrink-0">
              <button type="button" onClick={() => handleActionSubmit('REJECTED')} className="px-6 py-3 rounded-xl font-bold text-sm text-red-500 bg-red-50 hover:bg-red-100 transition-all flex items-center gap-2">
                <XCircle size={18} /> 반려 (거절)
              </button>
              <button type="button" onClick={() => handleActionSubmit('REVIEWING')} className="px-6 py-3 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">
                검수중 처리 (보류)
              </button>
              <button type="submit" form="approveForm" className="px-8 py-3 rounded-xl font-black text-sm text-black bg-[#D4AF37] hover:scale-105 transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2">
                <CheckCircle size={18} /> 최종 승인 및 스토어 등록
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- 기존 PRODUCT EDIT MODAL 유지 (생략하지 않음) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="bg-[#1A1A1A] p-8 text-white flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-serif font-bold">Advanced Product Edit</h3>
                <p className="text-xs text-[#D4AF37] mt-1 uppercase tracking-widest font-black">All fields are editable</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/40 hover:text-white transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Brand</label>
                    <select value={editForm.brandId} onChange={(e) => setEditForm({...editForm, brandId: Number(e.target.value)})} className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm font-bold focus:border-[#D4AF37] outline-none">
                      {Object.entries(BRAND_MAP).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                    <select value={editForm.categoryId} onChange={(e) => setEditForm({...editForm, categoryId: Number(e.target.value)})} className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm font-bold focus:border-[#D4AF37] outline-none">
                      {Object.entries(CATEGORY_MAP).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Product Name</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm font-bold focus:border-[#D4AF37] outline-none" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Grade</label>
                    <select value={editForm.grade} onChange={(e) => setEditForm({...editForm, grade: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm font-bold focus:border-[#D4AF37] outline-none">
                      <option value="NEW">새상품</option><option value="S">S등급</option><option value="A_PLUS">A+등급</option><option value="A">A등급</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
                    <select value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm font-bold focus:border-[#D4AF37] outline-none">
                      <option value="PREPARING">검수/준비중</option><option value="SELLING">판매중</option><option value="RESERVED">예약중</option><option value="SOLD_OUT">품절</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Base Price</label>
                    <input type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})} className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm font-serif font-bold focus:border-[#D4AF37] outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Discount (%)</label>
                    <input type="number" min="0" max="99" value={editForm.discountRate} onChange={(e) => setEditForm({...editForm, discountRate: Number(e.target.value)})} className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm font-bold text-red-500 focus:border-[#D4AF37] outline-none" />
                  </div>
                </div>

                <div className="bg-[#FAFAFA] rounded-2xl p-4 border-2 border-dashed border-gray-200">
                  <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold text-gray-400">Final Price</span><span className="text-[10px] font-black text-red-500">-{editForm.discountRate}% OFF</span></div>
                  <div className="text-2xl font-serif font-black text-black">₩ {getDiscountedPrice(editForm.price, editForm.discountRate).toLocaleString()}</div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm font-medium focus:border-[#D4AF37] outline-none h-32 resize-none" placeholder="상품 상세 설명을 입력하세요..." />
                </div>
              </div>

              <div className="md:col-span-2 mt-4 pt-6 border-t border-gray-100 flex gap-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 rounded-xl font-bold text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">CANCEL</button>
                <button type="submit" className="flex-[2] bg-[#1A1A1A] text-[#D4AF37] py-4 rounded-xl font-black text-sm tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-2"><Save size={18}/> SAVE ALL CHANGES</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;