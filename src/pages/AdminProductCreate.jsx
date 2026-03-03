import React, { useState } from 'react';
import { Upload, PackagePlus, Image as ImageIcon, Save, X } from 'lucide-react';
import axios from 'axios';

const BRAND_MAP = { 1: "Hermès", 2: "Chanel", 3: "Rolex", 4: "Louis Vuitton", 5: "Dior" };
const CATEGORY_MAP = { 1: "가방", 2: "의류", 3: "주얼리", 4: "신발", 5: "지갑", 6: "악세서리" };

const AdminProductCreate = () => {
  const [formData, setFormData] = useState({
    brandId: 1,
    categoryId: 1,
    name: '',
    price: '',
    discountRate: 0,
    status: 'SELLING',
    grade: 'S',
    description: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('상품 썸네일 이미지는 필수입니다.');
      return;
    }

    // 💡 이미지와 데이터를 함께 보내기 위해 FormData 사용
    const data = new FormData();
    data.append('image', selectedFile);

    // 나머지 데이터들을 문자열화하거나 개별 append
    data.append('brandId', formData.brandId);
    data.append('categoryId', formData.categoryId);
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('discountRate', formData.discountRate);
    data.append('status', formData.status);
    data.append('grade', formData.grade);
    data.append('description', formData.description);

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('http://localhost:8080/api/admin/products/new', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('상품이 성공적으로 등록되었습니다.');
      // 폼 초기화
      setFormData({ brandId: 1, categoryId: 1, name: '', price: '', discountRate: 0, status: 'SELLING', grade: 'S', description: '' });
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('상품 등록 실패:', error);
      alert('상품 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="animate-in fade-in duration-500 font-sans max-w-5xl">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 왼쪽: 이미지 업로드 영역 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Product Image</h3>
            <div className="relative aspect-square border-2 border-dashed border-gray-200 bg-gray-50 rounded-2xl overflow-hidden flex flex-col items-center justify-center group cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Upload size={32} className="mx-auto text-[#D4AF37] mb-2" />
                  <p className="text-xs font-bold text-gray-500">메인 썸네일 업로드</p>
                </div>
              )}
              {previewUrl && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-xs font-bold">이미지 변경하기</p>
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-3 text-center">권장 사이즈: 1000x1000px (1:1 비율)</p>
          </div>
        </div>

        {/* 오른쪽: 상세 정보 입력 영역 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <PackagePlus size={16} className="text-[#D4AF37]" /> Product Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Brand</label>
                <select name="brandId" value={formData.brandId} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none">
                  {Object.entries(BRAND_MAP).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Category</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none">
                  {Object.entries(CATEGORY_MAP).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Full Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="예: 샤넬 19 핸드백 램스킨 블랙 금장"
                className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Selling Price (원)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-lg font-serif font-black focus:border-[#D4AF37] outline-none text-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Discount Rate (%)</label>
                <input
                  type="number"
                  name="discountRate"
                  value={formData.discountRate}
                  onChange={handleChange}
                  max="99"
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Condition Grade</label>
                <select name="grade" value={formData.grade} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none">
                  <option value="NEW">새상품</option>
                  <option value="S">S등급 (미세 사용감)</option>
                  <option value="A_PLUS">A+등급</option>
                  <option value="A">A등급 (보통 중고)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Initial Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none">
                  <option value="SELLING">판매 중 (스토어 노출)</option>
                  <option value="PREPARING">판매 준비 중 (비노출)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Product Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4AF37] outline-none h-32 resize-none"
                placeholder="상품의 상세 상태 및 구성품 정보를 입력해주세요."
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#1A1A1A] text-[#D4AF37] py-4 rounded-xl font-black text-sm tracking-[0.2em] hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Save size={18} /> REGISTER PRODUCT
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductCreate;