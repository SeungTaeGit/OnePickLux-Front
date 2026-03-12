import React, { useState, useEffect } from 'react';
import { Upload, PackagePlus, Image as ImageIcon, Save, X } from 'lucide-react';
import axios from 'axios';

const AdminProductCreate = () => {
  const [brandList, setBrandList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  // 로딩 상태를 명확히 관리하는 State
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    brandId: '',
    categoryId: '',
    name: '',
    price: '',
    discountRate: 0,
    status: 'SELLING',
    grade: 'S',
    description: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [detailImages, setDetailImages] = useState([]);
  const [detailPreviews, setDetailPreviews] = useState([]);

  useEffect(() => {
    fetchBrandsAndCategories();
  }, []);

  const fetchBrandsAndCategories = async () => {
    setIsInitialLoading(true);
    try {
      const token = localStorage.getItem('accessToken');

      const brandRes = await axios.get('http://localhost:8080/api/admin/brands', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("✅ 원본 브랜드 목록 로드 성공:", brandRes.data);

      let allBrands = [];
      if (brandRes.data && Array.isArray(brandRes.data.data)) {
        allBrands = brandRes.data.data;
      } else if (Array.isArray(brandRes.data)) {
        allBrands = brandRes.data;
      }

      if (allBrands.length > 0) {
        console.log("🧐 첫 번째 브랜드 데이터 구조 확인 (필드명 체크용):", allBrands[0]);
      }

      // 💡 [핵심 수정] 관리자는 비활성화(display: false)된 브랜드도 상품 등록 시 선택할 수 있어야 합니다.
      // 따라서 깐깐했던 필터링 로직을 제거하고 무조건 모두 드롭다운에 넣습니다!
      const fetchedBrands = allBrands;

      console.log("🎯 드롭다운에 들어갈 브랜드 세팅 완료:", fetchedBrands);
      setBrandList(fetchedBrands);

      // 카테고리 임시 하드코딩
      const fetchedCategories = [
        { id: 1, name: "가방" }, { id: 2, name: "의류" }, { id: 3, name: "주얼리" },
        { id: 4, name: "신발" }, { id: 5, name: "지갑" }, { id: 6, name: "악세서리" }
      ];
      setCategoryList(fetchedCategories);

      // 첫 번째 항목으로 드롭다운 초기화
      if (fetchedBrands.length > 0 && fetchedCategories.length > 0) {
        setFormData(prev => ({
          ...prev,
          brandId: fetchedBrands[0].id || fetchedBrands[0].brandId, // id 필드명 방어
          categoryId: fetchedCategories[0].id
        }));
      }
    } catch (error) {
      console.error("기준 정보 로드 실패", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

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

  const handleDetailImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setDetailImages(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setDetailPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeDetailImage = (index) => {
    setDetailImages(prev => prev.filter((_, i) => i !== index));
    setDetailPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.brandId || formData.brandId === '') {
      alert('브랜드를 먼저 등록한 뒤 상품을 추가해주세요.');
      return;
    }

    if (!selectedFile) {
      alert('상품 썸네일 이미지는 필수입니다.');
      return;
    }

    const data = new FormData();

    const requestPayload = {
      brandId: Number(formData.brandId),
      categoryId: Number(formData.categoryId),
      name: formData.name,
      price: Number(formData.price),
      discountRate: Number(formData.discountRate || 0),
      status: formData.status,
      grade: formData.grade,
      description: formData.description
    };

    const requestBlob = new Blob([JSON.stringify(requestPayload)], { type: 'application/json' });
    data.append('request', requestBlob);
    data.append('thumbnail', selectedFile);

    detailImages.forEach((file) => {
      data.append('detailImages', file);
    });

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('http://localhost:8080/api/admin/products', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('상품이 성공적으로 등록되었습니다.');

      setFormData({
        brandId: brandList[0]?.id || '',
        categoryId: categoryList[0]?.id || '',
        name: '', price: '', discountRate: 0, status: 'SELLING', grade: 'S', description: ''
      });
      setSelectedFile(null);
      setPreviewUrl('');
      setDetailImages([]);
      setDetailPreviews([]);
    } catch (error) {
      console.error('상품 등록 실패:', error);
      alert(error.response?.data?.message || '상품 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="animate-in fade-in duration-500 font-sans max-w-5xl">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 왼쪽: 이미지 업로드 영역 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Main Thumbnail</h3>
            <div className="relative aspect-square border-2 border-dashed border-gray-200 bg-gray-50 rounded-2xl overflow-hidden flex flex-col items-center justify-center group cursor-pointer">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Upload size={32} className="mx-auto text-[#D4AF37] mb-2" />
                  <p className="text-xs font-bold text-gray-500">메인 썸네일 업로드</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              Detail Images <span className="text-[10px] text-gray-400 font-normal normal-case">최대 10장</span>
            </h3>
            <div className="relative border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors mb-4">
              <input type="file" accept="image/*" multiple onChange={handleDetailImagesChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              <ImageIcon size={24} className="mx-auto text-gray-400 mb-1" />
              <p className="text-[10px] font-bold text-gray-500">클릭하여 여러 장 추가</p>
            </div>
            {detailPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {detailPreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden group bg-white">
                    <img src={preview} alt={`상세 미리보기 ${index}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeDetailImage(index)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-20"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
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
                <select name="brandId" value={formData.brandId} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none bg-white">
                  {isInitialLoading ? (
                    <option value="">브랜드 로딩중...</option>
                  ) : brandList.length === 0 ? (
                    <option value="">등록된 활성 브랜드가 없습니다</option>
                  ) : (
                    brandList.map((brand) => <option key={brand.id || brand.brandId} value={brand.id || brand.brandId}>{brand.name}</option>)
                  )}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Category</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none bg-white">
                  {isInitialLoading ? (
                    <option value="">카테고리 로딩중...</option>
                  ) : categoryList.length === 0 ? (
                    <option value="">카테고리가 없습니다</option>
                  ) : (
                    categoryList.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Full Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="예: 샤넬 19 핸드백 램스킨 블랙 금장" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Selling Price (원)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl p-3 text-lg font-serif font-black focus:border-[#D4AF37] outline-none text-blue-600" required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Discount Rate (%)</label>
                <input type="number" name="discountRate" value={formData.discountRate} onChange={handleChange} max="99" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Condition Grade</label>
                <select name="grade" value={formData.grade} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none bg-white">
                  <option value="NEW">새상품</option><option value="S">S등급 (미세 사용감)</option><option value="A_PLUS">A+등급</option><option value="A">A등급 (보통 중고)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Initial Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-[#D4AF37] outline-none bg-white">
                  <option value="SELLING">판매 중 (스토어 노출)</option><option value="PREPARING">판매 준비 중 (비노출)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Product Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4AF37] outline-none h-32 resize-none" placeholder="상품의 상세 상태 및 구성품 정보를 입력해주세요." required />
            </div>

            <button type="submit" className="w-full bg-[#1A1A1A] text-[#D4AF37] py-4 rounded-xl font-black text-sm tracking-[0.2em] hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2">
              <Save size={18} /> REGISTER PRODUCT
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductCreate;