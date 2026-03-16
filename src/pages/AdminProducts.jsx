import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, TrendingDown, Edit, Trash2, X, Save, Upload, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const AdminProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDate, setFilterDate] = useState('ALL');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [editForm, setEditForm] = useState({
    brandId: '', categoryId: '', name: '', price: 0, discountRate: 0,
    type: 'PRE_OWNED', // 💡 [추가] 수정 폼에도 타입 필드 추가
    status: 'SELLING', description: '', grade: 'S'
  });

  const [currentThumbnail, setCurrentThumbnail] = useState(null);
  const [currentDetails, setCurrentDetails] = useState([]);
  const [newThumbnail, setNewThumbnail] = useState(null);
  const [newThumbnailPreview, setNewThumbnailPreview] = useState('');
  const [newDetailFiles, setNewDetailFiles] = useState([]);
  const [newDetailPreviews, setNewDetailPreviews] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchBrandsAndCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:8080/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const content = response.data?.data?.content || response.data?.data || [];
      setProducts(content);
    } catch (error) {
      console.error("상품 로드 실패", error);
    }
  };

  const fetchBrandsAndCategories = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const brandRes = await axios.get('http://localhost:8080/api/admin/brands', {
        headers: { Authorization: `Bearer ${token}` }
      });

      let allBrands = Array.isArray(brandRes.data?.data) ? brandRes.data.data : (Array.isArray(brandRes.data) ? brandRes.data : []);
      setBrandList(allBrands);

      setCategoryList([
        { id: 1, name: "가방" }, { id: 2, name: "의류" }, { id: 3, name: "주얼리" },
        { id: 4, name: "신발" }, { id: 5, name: "지갑" }, { id: 6, name: "악세서리" }
      ]);
    } catch (error) {
      console.error("기준 정보 로드 실패", error);
    }
  };

  const parseDate = (dateData) => {
    if (!dateData) return null;
    if (Array.isArray(dateData)) {
      return new Date(dateData[0], dateData[1] - 1, dateData[2], dateData[3] || 0, dateData[4] || 0);
    }
    return new Date(dateData);
  };

  const isDateInRange = (dateString, range) => {
    if (range === 'ALL' || !dateString) return true;
    const date = parseDate(dateString);
    if (!date) return true;

    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (range === 'TODAY') return diffDays <= 1;
    if (range === 'WEEK') return diffDays <= 7;
    if (range === 'MONTH') return diffDays <= 30;
    return true;
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

      const matchDate = isDateInRange(p.createdAt || p.registeredAt, filterDate);

      return matchSearch && matchStatus && matchDate;
    });
  }, [products, searchQuery, filterStatus, filterDate]);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL || 'https://onepick-lux-images.s3.ap-northeast-2.amazonaws.com';
    return `${S3_BASE_URL}/${path.startsWith('/') ? path.slice(1) : path}`;
  };

  const handleEditClick = (product) => {
    setSelectedItem(product);

    // 💡 [추가] 백엔드에서 type 정보를 보내줄 경우를 대비한 방어적 세팅
    let currentType = product.type;
    if (!currentType) {
      currentType = product.typeDescription === '병행수입(새상품)' ? 'PARALLEL_IMPORT' : 'PRE_OWNED';
    }

    setEditForm({
      brandId: product.brandId || brandList.find(b => b.name === product.brandName)?.id || 1,
      categoryId: product.categoryId || 1,
      name: product.name,
      price: product.price,
      discountRate: product.discountRate || product.discount || 0,
      type: currentType, // 💡 수정할 때 기존 타입 세팅
      status: product.status === '판매중' ? 'SELLING' : (product.status === '예약중' ? 'RESERVED' : (product.status === '품절' ? 'SOLD_OUT' : 'PREPARING')),
      grade: product.grade || 'S',
      description: product.description || ''
    });

    setCurrentThumbnail(product.thumbnailUrl || product.image);
    setCurrentDetails(product.imageUrls || product.detailImages || []);
    setNewThumbnail(null); setNewThumbnailPreview('');
    setNewDetailFiles([]); setNewDetailPreviews([]);

    setIsEditModalOpen(true);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewThumbnail(file);
      setNewThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleDetailImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewDetailFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setDetailPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewDetailImage = (index) => {
    setNewDetailFiles(prev => prev.filter((_, i) => i !== index));
    setDetailPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const requestBlob = new Blob([JSON.stringify(editForm)], { type: 'application/json' });
    formData.append('request', requestBlob);

    if (newThumbnail) formData.append('thumbnail', newThumbnail);
    if (newDetailFiles.length > 0) newDetailFiles.forEach(file => formData.append('detailImages', file));

    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`http://localhost:8080/api/admin/products/${selectedItem.productId || selectedItem.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('상품 정보가 성공적으로 수정되었습니다.');
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('수정 오류', error);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 상품을 삭제 하시겠습니까?')) {
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

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="브랜드명 또는 상품명 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-all" />
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-[#F8F9FA] px-4 rounded-xl border-none">
            <Filter size={18} className="text-gray-400" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-transparent py-3 text-sm font-bold outline-none text-gray-600 w-28 cursor-pointer">
              <option value="ALL">전체 상태</option><option value="SELLING">판매중</option><option value="PREPARING">준비/검수중</option><option value="RESERVED">예약중</option><option value="SOLD_OUT">판매완료</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-[#F8F9FA] px-4 rounded-xl border-none">
            <Calendar size={18} className="text-gray-400" />
            <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-transparent py-3 text-sm font-bold outline-none text-gray-600 w-32 cursor-pointer">
              <option value="ALL">전체 기간</option><option value="TODAY">오늘 등록</option><option value="WEEK">최근 7일</option><option value="MONTH">최근 30일</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#FAFAFA] text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <tr><th className="p-6">Product</th><th className="p-6">Info</th><th className="p-6">Pricing</th><th className="p-6">Date & Status</th><th className="p-6 text-right">Actions</th></tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(p => {
                const currentDiscountRate = p.discountRate || p.discount || 0;
                const parsedDate = parseDate(p.createdAt || p.registeredAt);
                const actualProductId = p.productId || p.id;

                // 💡 [UX] 상품 리스트에서도 이게 부띠끄(새상품)인지 알 수 있도록 배지 처리
                const isBoutique = p.type === 'PARALLEL_IMPORT' || p.typeDescription === '병행수입(새상품)';

                return (
                  <tr
                    key={actualProductId}
                    onClick={() => navigate(`/products/${actualProductId}`)}
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                  >
                    <td className="p-4 w-24">
                       <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 border relative">
                         {isBoutique && <div className="absolute top-0 left-0 bg-[#D4AF37] text-white text-[8px] px-1 font-bold z-10">NEW</div>}
                         {p.thumbnailUrl || p.image ? (
                           <img src={getImageUrl(p.thumbnailUrl || p.image)} alt={p.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold">NO IMG</div>
                         )}
                       </div>
                    </td>
                    <td className="p-4">
                      <p className="font-mono text-[10px] text-gray-400 mb-1">#{actualProductId}</p>
                      <p className="font-black text-[#1A1A1A] text-xs uppercase">{p.brandName || 'BRAND'}</p>
                      <p className="font-medium text-gray-600 max-w-xs truncate">{p.name}</p>
                    </td>
                    <td className="p-4">
                      {currentDiscountRate > 0 ? (
                        <div>
                          <div className="text-xs text-gray-400 line-through">₩ {p.price?.toLocaleString()}</div>
                          <div className="font-serif font-bold text-red-500 text-base">₩ {getDiscountedPrice(p.price, currentDiscountRate).toLocaleString()}</div>
                          <div className="text-[10px] text-red-500 font-black flex items-center gap-1 mt-0.5"><TrendingDown size={10}/> -{currentDiscountRate}%</div>
                        </div>
                      ) : (<div className="font-serif font-bold text-black text-base">₩ {p.price?.toLocaleString()}</div>)}
                    </td>
                    <td className="p-4">
                      <p className="text-[10px] text-gray-400 font-mono mb-2">
                        {parsedDate ? parsedDate.toLocaleDateString() : 'N/A'}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === '판매중' || p.status === 'SELLING' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-6 flex justify-end gap-2 pt-6">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditClick(p); }}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-black hover:text-[#D4AF37] transition-all"
                      >
                        <Edit size={16}/>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(actualProductId); }}
                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (<tr><td colSpan="5" className="p-10 text-center text-gray-400 font-bold">검색 결과가 없습니다.</td></tr>)}
          </tbody>
        </table>
      </div>

      {/* 수정 모달 */}
      {isEditModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-8 max-h-[90vh] flex flex-col">
            <div className="bg-[#1A1A1A] p-8 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-serif font-bold">Product Edit & Images</h3>
                <p className="text-xs text-[#D4AF37] mt-1 uppercase tracking-widest font-black">새로운 이미지를 올리면 기존 이미지가 대체됩니다.</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/40 hover:text-white transition-colors"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <form id="editForm" onSubmit={handleEditSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* 1. 이미지 수정 영역 */}
                <div className="lg:col-span-1 space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Main Thumbnail</label>
                    <div className="relative aspect-square border-2 border-dashed border-gray-200 bg-gray-50 rounded-2xl overflow-hidden flex flex-col items-center justify-center group cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleThumbnailChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <img src={newThumbnailPreview || getImageUrl(currentThumbnail)} alt="Thumbnail" className={`w-full h-full object-cover ${!newThumbnailPreview && !currentThumbnail ? 'hidden' : ''}`} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center pointer-events-none">
                        <Upload size={24} className="text-[#D4AF37] mb-2" />
                        <p className="text-white text-xs font-bold">클릭하여 변경</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex justify-between items-center">
                      Detail Images <span className="text-[10px] bg-red-100 text-red-500 px-2 py-0.5 rounded font-medium normal-case">새로 올리면 기존 삭제됨</span>
                    </label>
                    <div className="relative border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors mb-4">
                      <input type="file" accept="image/*" multiple onChange={handleDetailImagesChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <ImageIcon size={20} className="mx-auto text-gray-400 mb-1" />
                      <p className="text-[10px] font-bold text-gray-500">클릭하여 전체 교체</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {newDetailPreviews.length > 0 ? (
                        newDetailPreviews.map((preview, idx) => (
                          <div key={idx} className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden">
                            <img src={preview} className="w-full h-full object-cover" alt={`새상세 ${idx}`}/>
                            <button type="button" onClick={() => removeNewDetailImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 z-20"><X size={12} /></button>
                          </div>
                        ))
                      ) : (
                        currentDetails.map((url, idx) => (
                          <div key={idx} className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden opacity-60">
                            <img src={getImageUrl(url)} className="w-full h-full object-cover grayscale-[30%]" alt={`기존상세 ${idx}`}/>
                            <div className="absolute inset-0 flex items-center justify-center"><span className="text-[10px] text-white font-bold bg-black/50 px-1 rounded">기존</span></div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. 텍스트 수정 영역 */}
                <div className="lg:col-span-2 space-y-6 bg-[#FAFAFA] p-6 rounded-2xl border border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Brand</label>
                      <select value={editForm.brandId} onChange={(e) => setEditForm({...editForm, brandId: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none">
                        {brandList.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Category</label>
                      <select value={editForm.categoryId} onChange={(e) => setEditForm({...editForm, categoryId: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none">
                        {categoryList.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Product Name</label>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none" required />
                  </div>

                  {/* 💡 [추가] 수정 모달에도 상품 타입 선택 추가 */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <label className="block text-[10px] font-black text-[#D4AF37] uppercase mb-2">Product Type (상품 유형)</label>
                    <select
                      value={editForm.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        // 새상품을 고르면 등급을 NEW로 자동 고정해줍니다.
                        setEditForm({...editForm, type: newType, grade: newType === 'PARALLEL_IMPORT' ? 'NEW' : editForm.grade});
                      }}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none"
                    >
                      <option value="PRE_OWNED">일반 중고 명품 (Pre-owned)</option>
                      <option value="PARALLEL_IMPORT">병행수입 새상품 (Boutique)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Base Price (원)</label>
                      <input type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-serif font-bold focus:border-[#D4AF37] outline-none text-blue-600" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Discount (%)</label>
                      <input type="number" min="0" max="99" value={editForm.discountRate} onChange={(e) => setEditForm({...editForm, discountRate: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold text-red-500 focus:border-[#D4AF37] outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Grade</label>
                      <select
                        value={editForm.grade}
                        onChange={(e) => setEditForm({...editForm, grade: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none"
                        disabled={editForm.type === 'PARALLEL_IMPORT'} // 병행수입은 수정 불가
                      >
                        <option value="NEW">새상품</option><option value="S">S등급</option><option value="A_PLUS">A+등급</option><option value="A">A등급</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Status</label>
                      <select value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none">
                        <option value="PREPARING">검수/준비중</option><option value="SELLING">판매중</option><option value="RESERVED">예약중</option><option value="SOLD_OUT">품절</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Description</label>
                    <textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-[#D4AF37] outline-none h-24 resize-none" placeholder="상품 상세 설명을 입력하세요..." />
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-white p-6 border-t border-gray-100 flex gap-4 shrink-0">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 rounded-xl font-bold text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">CANCEL</button>
              <button type="submit" form="editForm" className="flex-[2] bg-[#1A1A1A] text-[#D4AF37] py-4 rounded-xl font-black text-sm tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-2"><Save size={18}/> SAVE ALL CHANGES</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;