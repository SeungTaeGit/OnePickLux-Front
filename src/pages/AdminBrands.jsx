import React, { useState, useEffect } from 'react';
import { Upload, Plus, Edit, Trash2, Power, X, Save, Tag, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formMode, setFormMode] = useState('CREATE');
  const [selectedBrandId, setSelectedBrandId] = useState(null);

  const [englishName, setEnglishName] = useState('');
  const [koreanName, setKoreanName] = useState('');
  const [isDisplay, setIsDisplay] = useState(true);

  // 💡 [추가] 브랜드관 꾸미기용 상태
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState('#1A1A1A'); // 기본값 블랙

  const [logoImage, setLogoImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // 💡 [추가] 와이드 배너 이미지 상태
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

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

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL || 'https://onepick-lux-images.s3.ap-northeast-2.amazonaws.com';
    return `${S3_BASE_URL}/${path.startsWith('/') ? path.slice(1) : path}`;
  };

  // 로고 파일 선택
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 💡 [추가] 배너 파일 선택
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormMode('CREATE');
    setSelectedBrandId(null);
    setEnglishName('');
    setKoreanName('');
    setDescription('');
    setThemeColor('#1A1A1A');
    setIsDisplay(true);
    setLogoImage(null);
    setPreviewUrl('');
    setBannerImage(null);
    setBannerPreviewUrl('');
  };

  const handleEditClick = (brand) => {
    setFormMode('EDIT');
    setSelectedBrandId(brand.id);
    setEnglishName(brand.englishName);
    setKoreanName(brand.koreanName);
    setDescription(brand.description || '');
    setThemeColor(brand.themeColor || '#1A1A1A');
    setIsDisplay(brand.isDisplay);

    setLogoImage(null);
    setPreviewUrl(getImageUrl(brand.logoUrl) || '');

    setBannerImage(null);
    setBannerPreviewUrl(getImageUrl(brand.bannerUrl) || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formMode === 'CREATE' && !logoImage) {
      alert('브랜드 로고 이미지는 필수입니다.');
      return;
    }

    const formData = new FormData();
    // 💡 [수정] DTO에 새로 추가된 필드들을 담아줍니다.
    const requestBlob = new Blob(
      [JSON.stringify({
        englishName,
        koreanName,
        description,
        themeColor,
        isDisplay
      })],
      { type: 'application/json' }
    );
    formData.append('request', requestBlob);

    if (logoImage) formData.append('logoImage', logoImage);
    if (bannerImage) formData.append('bannerImage', bannerImage); // 백엔드 컨트롤러에도 @RequestPart("bannerImage") 추가 필요!

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

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까? 연관된 상품이 있으면 삭제가 거부될 수 있습니다.')) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:8080/api/admin/brands/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBrands();
      if (formMode === 'EDIT' && selectedBrandId === id) resetForm();
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="animate-in fade-in duration-500 font-sans">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* 💡 왼쪽: 브랜드 등록/수정 폼 (크기를 좀 더 키움) */}
        <div className="xl:col-span-4 lg:col-span-5">
          <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm h-fit sticky top-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-[#1A1A1A] flex items-center gap-2">
                {formMode === 'CREATE' ? <><Plus size={18} className="text-[#D4AF37]" /> Create Brand</> : <><Edit size={18} className="text-[#D4AF37]" /> Edit Brand</>}
              </h2>
              {formMode === 'EDIT' && (
                <button onClick={resetForm} className="text-[10px] font-bold text-gray-400 hover:text-black flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                  <X size={12}/> 취소
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">English Name</label>
                  <input type="text" value={englishName} onChange={(e) => setEnglishName(e.target.value)} placeholder="예: CHANEL" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Korean Name</label>
                  <input type="text" value={koreanName} onChange={(e) => setKoreanName(e.target.value)} placeholder="예: 샤넬" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none" required />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mb-2">Brand Description (브랜드 설명)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="브랜드 전용관에 노출될 소개 문구를 입력하세요." className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4AF37] outline-none h-20 resize-none" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mb-2">Theme Color (브랜드 고유 색상)</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-200 p-0.5" />
                  <input type="text" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} placeholder="#HEX" className="flex-1 border-2 border-gray-100 rounded-xl p-2.5 text-sm font-mono font-bold focus:border-[#D4AF37] outline-none uppercase" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Logo (PNG)</label>
                  <div className="relative border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {previewUrl ? (
                      <img src={previewUrl} alt="Logo" className="max-h-full object-contain p-4 mix-blend-multiply" />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400"><Upload size={20} className="mb-1 text-[#D4AF37]" /><span className="text-[10px] font-bold">로고 업로드</span></div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mb-2">Wide Banner (16:9)</label>
                  <div className="relative border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                    <input type="file" accept="image/*" onChange={handleBannerChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {bannerPreviewUrl ? (
                      <img src={bannerPreviewUrl} alt="Banner" className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400"><ImageIcon size={20} className="mb-1 text-[#D4AF37]" /><span className="text-[10px] font-bold">배너 업로드</span></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 bg-gray-50 p-4 rounded-xl border border-gray-100 mt-2">
                <input type="checkbox" id="isDisplay" checked={isDisplay} onChange={(e) => setIsDisplay(e.target.checked)} className="w-4 h-4 accent-[#D4AF37] cursor-pointer" />
                <label htmlFor="isDisplay" className="text-xs font-bold text-gray-600 cursor-pointer">쇼핑몰 메인 및 필터에 노출 (Active)</label>
              </div>

              <button type="submit" className={`w-full py-4 rounded-xl font-black text-sm tracking-[0.2em] transition-all shadow-md flex items-center justify-center gap-2 ${formMode === 'CREATE' ? 'bg-[#1A1A1A] text-[#D4AF37] hover:bg-black' : 'bg-[#D4AF37] text-black hover:bg-[#c5a130]'}`}>
                {formMode === 'CREATE' ? <><Save size={16} /> REGISTER BRAND</> : <><Save size={16} /> SAVE CHANGES</>}
              </button>
            </form>
          </div>
        </div>

        {/* 💡 오른쪽: 등록된 브랜드 리스트 */}
        <div className="xl:col-span-8 lg:col-span-7">
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
                   <tr><th className="p-5 w-24">Logo</th><th className="p-5">Brand Info</th><th className="p-5">Theme</th><th className="p-5">Status</th><th className="p-5 text-right">Actions</th></tr>
                 </thead>
                 <tbody className="text-sm divide-y divide-gray-50">
                   {brands.map(brand => (
                     <tr key={brand.id} className="hover:bg-gray-50 transition-colors group">
                       <td className="p-4">
                         <div className={`w-16 h-16 flex items-center justify-center rounded-full p-2 bg-white shadow-sm border border-gray-200`}>
                           {brand.logoUrl ? <img src={getImageUrl(brand.logoUrl)} alt={brand.name} className="w-full h-full object-contain mix-blend-multiply" /> : <span className="text-[8px] font-bold text-gray-400">NO LOGO</span>}
                         </div>
                       </td>
                       <td className="p-4">
                         <h3 className={`text-sm font-black uppercase ${brand.isDisplay ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>{brand.englishName}</h3>
                         <p className="text-xs font-bold text-gray-500 mb-1">{brand.koreanName}</p>
                         <p className="text-[10px] text-gray-400 max-w-[200px] truncate">{brand.description || '설명 없음'}</p>
                       </td>
                       <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: brand.themeColor || '#1A1A1A' }}></div>
                            <span className="text-[10px] font-mono text-gray-500">{brand.themeColor || '#1A1A1A'}</span>
                          </div>
                       </td>
                       <td className="p-4">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex w-fit items-center gap-1 ${brand.isDisplay ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                           <Power size={10} /> {brand.isDisplay ? 'ACTIVE' : 'INACTIVE'}
                         </span>
                       </td>
                       <td className="p-4 flex justify-end gap-2 items-center h-full pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(brand)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-black hover:text-[#D4AF37] transition-all title='수정'"><Edit size={16}/></button>
                          <button onClick={() => handleDelete(brand.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all title='삭제'"><Trash2 size={16}/></button>
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