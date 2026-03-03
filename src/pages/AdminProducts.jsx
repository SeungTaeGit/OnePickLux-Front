import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, TrendingDown, Edit, Trash2, X, Save } from 'lucide-react';
import axios from 'axios';

const BRAND_MAP = { 1: "Hermès", 2: "Chanel", 3: "Rolex", 4: "Louis Vuitton", 5: "Dior" };
const CATEGORY_MAP = { 1: "가방", 2: "의류", 3: "주얼리", 4: "신발", 5: "지갑", 6: "악세서리" };

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // 상품 수정 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editForm, setEditForm] = useState({
    brandId: 1, categoryId: 1, name: '', price: 0, discountRate: 0,
    status: 'SELLING', description: '', grade: 'S'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:8080/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.data) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error("상품 로드 실패", error);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brandName?.toLowerCase().includes(searchQuery.toLowerCase());
      const pStatus = p.status?.toUpperCase() || '';
      let matchStatus = false;

      if (filterStatus === 'ALL') matchStatus = true;
      else if (filterStatus === 'SELLING') matchStatus = pStatus === 'SELLING' || pStatus === '판매중';
      else if (filterStatus === 'PREPARING') matchStatus = pStatus === 'PREPARING' || pStatus.includes('준비') || pStatus.includes('검수');
      else if (filterStatus === 'RESERVED') matchStatus = pStatus === 'RESERVED' || pStatus === '예약중';
      else if (filterStatus === 'SOLD_OUT') matchStatus = pStatus === 'SOLD_OUT' || pStatus.includes('완료') || pStatus.includes('품절');

      return matchSearch && matchStatus;
    });
  }, [products, searchQuery, filterStatus]);

  // 수정 로직
  const handleEditClick = (product) => {
    setSelectedItem(product);
    const currentDiscountRate = product.discountRate || product.discount || 0;

    // 백엔드에서 받은 브랜드명으로 ID 역추적
    const brandNameOnly = product.brandName?.split(' (')[0]; // "샤넬 (CHANEL)" 에서 "샤넬"만 추출
    const foundBrandId = Object.keys(BRAND_MAP).find(key => BRAND_MAP[key] === brandNameOnly) || 1;

    setEditForm({
      brandId: foundBrandId,
      categoryId: 1, // 백엔드에서 categoryId도 넘겨준다면 여기서 세팅
      name: product.name,
      price: product.price,
      discountRate: currentDiscountRate,
      status: product.status === '판매중' ? 'SELLING' : (product.status === '예약중' ? 'RESERVED' : (product.status === '품절' ? 'SOLD_OUT' : 'PREPARING')),
      grade: 'S',
      description: product.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(`http://localhost:8080/api/admin/products/${selectedItem.productId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('상품 정보가 성공적으로 수정되었습니다.');
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (e) {
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  // 삭제(숨김) 로직
  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 상품을 삭제(숨김 처리) 하시겠습니까?')) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`http://localhost:8080/api/admin/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchProducts();
      } catch (error) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const getDiscountedPrice = (price, rate) => Math.floor(price * (1 - rate / 100));

  return (
    <div className="animate-in fade-in duration-500 flex flex-col gap-6 font-sans">
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

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && selectedItem && (
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

export default AdminProducts;