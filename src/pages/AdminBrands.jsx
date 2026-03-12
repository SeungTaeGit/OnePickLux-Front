import React, { useState, useEffect } from 'react';
import { Upload, Plus, Edit, Trash2, Power, X, Save, Tag } from 'lucide-react';
import axios from 'axios';

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // 💡 폼 상태 관리 (CREATE / EDIT 모드)
  const [formMode, setFormMode] = useState('CREATE'); // 'CREATE' or 'EDIT'
  const [selectedBrandId, setSelectedBrandId] = useState(null);

  // 💡 텍스트 입력 데이터
  const [englishName, setEnglishName] = useState('');
  const [koreanName, setKoreanName] = useState('');
  const [isDisplay, setIsDisplay] = useState(true);

  // 💡 이미지 파일 데이터
  const [logoImage, setLogoImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  // 1. 브랜드 목록 조회 (GET)
  const fetchBrands = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:8080/api/admin/brands', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.data) {
        setBrands(response.data.data);
      }
    } catch (error) {
      console.error('브랜드 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // S3 URL 헬퍼
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL || 'https://onepick-lux-images.s3.ap-northeast-2.amazonaws.com';
    return `${S3_BASE_URL}/${path.startsWith('/') ? path.slice(1) : path}`;
  };

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setFormMode('CREATE');
    setSelectedBrandId(null);
    setEnglishName('');
    setKoreanName('');
    setIsDisplay(true);
    setLogoImage(null);
    setPreviewUrl('');
  };

  // 수정 버튼 클릭 핸들러 (EDIT 모드로 전환)
  const handleEditClick = (brand) => {
    setFormMode('EDIT');
    setSelectedBrandId(brand.id);
    setEnglishName(brand.englishName);
    setKoreanName(brand.koreanName);
    setIsDisplay(brand.isDisplay);
    setLogoImage(null); // 새 파일은 비워둠
    setPreviewUrl(getImageUrl(brand.logoUrl) || ''); // 기존 로고 보여주기
  };

  // 2. 브랜드 등록 & 수정 (POST & PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formMode === 'CREATE' && !logoImage) {
      alert('브랜드 로고 이미지는 필수입니다.');
      return;
    }

    // 💡 백엔드 @RequestPart 스펙에 맞춘 FormData 조립
    const formData = new FormData();
    const requestBlob = new Blob(
      [JSON.stringify({ englishName, koreanName, isDisplay })],
      { type: 'application/json' }
    );
    formData.append('request', requestBlob);

    if (logoImage) {
      formData.append('logoImage', logoImage);
    }

    try {
      const token = localStorage.getItem('accessToken');

      if (formMode === 'CREATE') {
        await axios.post('http://localhost:8080/api/admin/brands', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('브랜드가 성공적으로 등록되었습니다.');
      } else {
        await axios.put(`http://localhost:8080/api/admin/brands/${selectedBrandId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('브랜드가 성공적으로 수정되었습니다.');
      }

      resetForm();
      fetchBrands();
    } catch (error) {
      console.error('브랜드 저장 실패:', error);
      alert(error.response?.data?.message || '저장 중 오류가 발생했습니다.');
    }
  };

  // 3. 브랜드 삭제 (DELETE)
  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까? 연관된 상품이 있으면 삭제가 거부될 수 있습니다.')) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:8080/api/admin/brands/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBrands();
      // 만약 삭제한 브랜드를 수정 중이었다면 폼 초기화
      if (formMode === 'EDIT' && selectedBrandId === id) {
        resetForm();
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      alert(error.response?.data?.message || '삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="animate-in fade-in duration-500 font-sans">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* 💡 왼쪽: 브랜드 등록/수정 폼 */}
        <div className="xl:col-span-1">
          <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm h-fit sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-[#1A1A1A] flex items-center gap-2">
                {formMode === 'CREATE' ? (
                  <><Plus size={18} className="text-[#D4AF37]" /> Create Brand</>
                ) : (
                  <><Edit size={18} className="text-[#D4AF37]" /> Edit Brand</>
                )}
              </h2>
              {formMode === 'EDIT' && (
                <button onClick={resetForm} className="text-[10px] font-bold text-gray-400 hover:text-black flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                  <X size={12}/> 취소
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">English Name</label>
                <input
                  type="text"
                  value={englishName}
                  onChange={(e) => setEnglishName(e.target.value)}
                  placeholder="예: Chanel"
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Korean Name</label>
                <input
                  type="text"
                  value={koreanName}
                  onChange={(e) => setKoreanName(e.target.value)}
                  placeholder="예: 샤넬"
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Brand Logo (S3)</label>
                <div className="relative border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition rounded-xl p-6 text-center cursor-pointer overflow-hidden aspect-video flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-full object-contain mix-blend-multiply p-2" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 pointer-events-none">
                      <Upload size={24} className="mb-2 text-[#D4AF37]" />
                      <span className="text-xs font-bold text-gray-500">클릭하여 로고 업로드</span>
                      <span className="text-[10px] mt-1">배경이 투명한 PNG 권장</span>
                    </div>
                  )}
                  {previewUrl && formMode === 'EDIT' && !logoImage && (
                    <div className="absolute inset-0 bg-white/60 opacity-0 hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                      <p className="text-black font-bold text-xs">클릭하여 로고 교체</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <input
                  type="checkbox"
                  id="isDisplay"
                  checked={isDisplay}
                  onChange={(e) => setIsDisplay(e.target.checked)}
                  className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                />
                <label htmlFor="isDisplay" className="text-xs font-bold text-gray-600 cursor-pointer">
                  쇼핑몰 및 필터에 노출 (Active)
                </label>
              </div>

              <button
                type="submit"
                className={`w-full py-4 rounded-xl font-black text-sm tracking-[0.2em] transition-all shadow-md flex items-center justify-center gap-2 ${
                  formMode === 'CREATE'
                    ? 'bg-[#1A1A1A] text-[#D4AF37] hover:bg-black'
                    : 'bg-[#D4AF37] text-black hover:bg-[#c5a130]'
                }`}
              >
                {formMode === 'CREATE' ? <><Save size={16} /> REGISTER BRAND</> : <><Save size={16} /> SAVE CHANGES</>}
              </button>
            </form>
          </div>
        </div>

        {/* 💡 오른쪽: 등록된 브랜드 리스트 */}
        <div className="xl:col-span-2">
          {loading ? (
            <div className="text-center py-20 text-gray-400 font-bold animate-pulse">Loading Brands...</div>
          ) : brands.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-20 flex flex-col items-center justify-center">
              <Tag size={48} className="text-gray-200 mb-4" strokeWidth={1.5} />
              <p className="text-gray-400 font-bold">등록된 브랜드가 없습니다.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <table className="w-full text-left">
                 <thead className="bg-[#FAFAFA] text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                   <tr><th className="p-6">Logo</th><th className="p-6">Brand Name</th><th className="p-6">Status</th><th className="p-6 text-right">Actions</th></tr>
                 </thead>
                 <tbody className="text-sm divide-y divide-gray-50">
                   {brands.map(brand => (
                     <tr key={brand.id} className="hover:bg-gray-50 transition-colors group">
                       <td className="p-4 w-32">
                         <div className={`w-20 h-12 flex items-center justify-center rounded-lg p-2 ${brand.isDisplay ? 'bg-white border border-gray-200' : 'bg-gray-100 border border-gray-200 opacity-50'}`}>
                           {brand.logoUrl ? (
                             <img src={getImageUrl(brand.logoUrl)} alt={brand.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                           ) : (
                             <span className="text-[10px] font-bold text-gray-400">NO LOGO</span>
                           )}
                         </div>
                       </td>
                       <td className="p-4">
                         <h3 className={`text-sm font-black uppercase ${brand.isDisplay ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>
                           {brand.englishName}
                         </h3>
                         <p className="text-xs font-bold text-gray-500 mt-0.5">{brand.koreanName}</p>
                       </td>
                       <td className="p-4">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex w-fit items-center gap-1 ${brand.isDisplay ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                           <Power size={10} /> {brand.isDisplay ? 'ACTIVE' : 'INACTIVE'}
                         </span>
                       </td>
                       <td className="p-4 flex justify-end gap-2 items-center h-full pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(brand)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-black hover:text-[#D4AF37] transition-all title='수정'">
                            <Edit size={16}/>
                          </button>
                          <button onClick={() => handleDelete(brand.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all title='삭제'">
                            <Trash2 size={16}/>
                          </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBrands;