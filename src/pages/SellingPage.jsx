import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { INITIAL_BRANDS } from '../constants/data.js';
import { createSellingApplication } from '../api/sellingApi.js';

const SellingPage = () => {
  const navigate = useNavigate();
  const [sellingType, setSellingType] = useState('CONSIGNMENT');

  const [formData, setFormData] = useState({
    brandName: INITIAL_BRANDS[0].name,
    itemName: '',
    purchasePrice: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem('accessToken')) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }
    try {
      const payload = {
        requestType: sellingType,
        brandName: formData.brandName,
        itemName: formData.itemName,
        purchasePrice: Number(formData.purchasePrice),
        purchaseYear: "2023",
        imageUrl: ""
      };
      await createSellingApplication(payload);
      alert('성공적으로 매입/위탁 신청이 완료되었습니다!');
      navigate('/');
    } catch (error) {
      alert('신청에 실패했습니다.');
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="bg-[#2C2C2C] text-white py-20 px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">잠들어 있는 당신의 명품,<br/>최고의 가치로 돌려드립니다.</h2>
      </div>
      <div className="max-w-2xl mx-auto px-4 mt-10">
        <div className="flex gap-4 mb-8">
           <button onClick={() => setSellingType('CONSIGNMENT')} className={`flex-1 py-4 font-bold border-2 transition ${sellingType === 'CONSIGNMENT' ? 'border-[#997B4D] text-[#997B4D]' : 'border-[#E5E0D8] text-[#888]'}`}>위탁 판매 (높은 가격)</button>
           <button onClick={() => setSellingType('INSTANT')} className={`flex-1 py-4 font-bold border-2 transition ${sellingType === 'INSTANT' ? 'border-[#2C2C2C] text-[#2C2C2C]' : 'border-[#E5E0D8] text-[#888]'}`}>즉시 매입 (빠른 현금화)</button>
        </div>
        <div className="bg-white p-8 border border-[#E5E0D8] shadow-lg rounded-sm">
          <h3 className="text-xl font-bold text-[#2C2C2C] mb-6 pb-4 border-b border-[#E5E0D8]">판매 신청 정보 입력</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#5C5550] mb-2">브랜드명</label>
              <select name="brandName" value={formData.brandName} onChange={handleChange} className="w-full border border-[#E5E0D8] p-3 text-sm focus:outline-none focus:border-[#997B4D] bg-white">
                {INITIAL_BRANDS.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5C5550] mb-2">상품명 / 모델명</label>
              <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} placeholder="예: 샤넬 클래식 미디움 블랙" className="w-full border border-[#E5E0D8] p-3 text-sm focus:outline-none focus:border-[#997B4D]" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5C5550] mb-2">희망 가격 (원)</label>
              <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} placeholder="숫자만 입력 (예: 1500000)" className="w-full border border-[#E5E0D8] p-3 text-sm focus:outline-none focus:border-[#997B4D]" required />
            </div>
            <button type="submit" className="w-full bg-[#2C2C2C] text-white py-4 font-bold text-sm tracking-widest hover:bg-[#444] shadow-lg">신청 완료하기</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellingPage;