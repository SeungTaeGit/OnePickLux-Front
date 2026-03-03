import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Trash2, Power, Plus, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:8080/api/admin/banners', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.data) {
        setBanners(response.data.data);
      }
    } catch (error) {
      console.error('배너 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('이미지 파일을 선택해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('linkUrl', linkUrl);
    formData.append('isActive', isActive);
    formData.append('image', selectedFile);

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('http://localhost:8080/api/admin/banners', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('배너가 등록되었습니다.');
      setTitle('');
      setLinkUrl('');
      setSelectedFile(null);
      setPreviewUrl('');
      fetchBanners();
    } catch (error) {
      console.error('배너 등록 실패:', error);
      alert('배너 등록에 실패했습니다.');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(`http://localhost:8080/api/admin/banners/${id}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBanners();
    } catch (error) {
      console.error('상태 변경 실패:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:8080/api/admin/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBanners();
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* 왼쪽: 배너 등록 폼 */}
        <div className="xl:col-span-1">
          <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm h-fit">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#1A1A1A] mb-6 flex items-center gap-2">
              <Plus size={18} className="text-[#D4AF37]" /> Upload New Banner
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Banner Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 25FW 샤넬 신상 기획전"
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <LinkIcon size={12} /> Target Link URL
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="예: /products?category=가방"
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Image File</label>
                <div className="relative border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition rounded-xl p-6 text-center cursor-pointer overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="mx-auto max-h-32 object-contain rounded-lg shadow-sm" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <Upload size={24} className="mb-2 text-[#D4AF37]" />
                      <span className="text-xs font-bold text-gray-500">클릭하여 이미지 업로드</span>
                      <span className="text-[10px] mt-1">권장 1920x600 (Max 10MB)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-gray-600 cursor-pointer">등록 즉시 메인 화면에 노출 (Active)</label>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-[#1A1A1A] text-[#D4AF37] py-4 rounded-xl font-black text-sm tracking-[0.2em] hover:bg-black transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ImageIcon size={16} /> UPLOAD BANNER
              </button>
            </form>
          </div>
        </div>

        {/* 오른쪽: 등록된 배너 리스트 */}
        <div className="xl:col-span-2">
          {loading ? (
            <div className="text-center py-20 text-gray-400 font-bold">배너 정보를 불러오는 중...</div>
          ) : banners.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-20 flex flex-col items-center justify-center">
              <ImageIcon size={48} className="text-gray-200 mb-4" strokeWidth={1.5} />
              <p className="text-gray-400 font-bold">등록된 배너가 없습니다.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <table className="w-full text-left">
                 <thead className="bg-[#FAFAFA] text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                   <tr><th className="p-6">Preview</th><th className="p-6">Banner Info</th><th className="p-6">Status</th><th className="p-6 text-right">Actions</th></tr>
                 </thead>
                 <tbody className="text-sm divide-y divide-gray-50">
                   {banners.map(banner => (
                     <tr key={banner.id} className="hover:bg-gray-50 transition-colors group">
                       <td className="p-4 w-48">
                         <div className="w-40 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group-hover:shadow-md transition-shadow">
                           <img src={`http://localhost:8080${banner.imageUrl}`} alt={banner.title} className="w-full h-full object-cover" />
                           {!banner.active && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]"></div>}
                         </div>
                       </td>
                       <td className="p-4">
                         <h3 className={`text-sm font-bold mb-1 ${banner.active ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>{banner.title}</h3>
                         <p className="text-[10px] font-mono text-gray-400 break-all">{banner.linkUrl || 'No Link'}</p>
                         <p className="text-[10px] text-gray-300 mt-2 font-bold">{new Date(banner.createdAt).toLocaleDateString()}</p>
                       </td>
                       <td className="p-4">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex w-fit items-center gap-1 ${banner.active ? 'bg-[#fcf8ed] text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                           <Power size={10} /> {banner.active ? 'ACTIVE' : 'INACTIVE'}
                         </span>
                       </td>
                       <td className="p-4 flex justify-end gap-2 items-center h-full pt-8">
                          <button onClick={() => handleToggleStatus(banner.id)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-[#1A1A1A] hover:text-[#D4AF37] transition-all title='상태 변경'">
                            <Power size={16}/>
                          </button>
                          <button onClick={() => handleDelete(banner.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all title='삭제'">
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

export default AdminBanners;