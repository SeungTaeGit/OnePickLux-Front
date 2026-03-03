import React, { useState, useEffect } from 'react';
import { SearchCode, X, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const BRAND_MAP = { 1: "Hermès", 2: "Chanel", 3: "Rolex", 4: "Louis Vuitton", 5: "Dior" };
const CATEGORY_MAP = { 1: "가방", 2: "의류", 3: "주얼리", 4: "신발", 5: "지갑", 6: "악세서리" };

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);

  // 검수(Inspect) 모달 상태
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [approveForm, setApproveForm] = useState({
    brandId: 1, categoryId: 1, name: '', price: 0, grade: 'S', description: '',
    inspectorName: '시스템 감정사', leatherStatus: 'S', hardwareStatus: 'S', shapeStatus: 'S', innerStatus: 'S',
    // 💡 [수정됨] 백엔드 @NotBlank 에러를 피하기 위해 기본값을 넣어줍니다.
    finalComment: '특이사항 없음'
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:8080/api/admin/selling-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.data) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error("위탁 신청 로드 실패", error);
    }
  };

  const handleInspectClick = (request) => {
    setSelectedItem(request);
    const foundBrandId = Object.keys(BRAND_MAP).find(key => BRAND_MAP[key] === request.brandName) || 1;

    setApproveForm({
      ...approveForm,
      brandId: foundBrandId,
      name: request.itemName || '',
      price: request.expectedPrice || 0,
      finalComment: '특이사항 없음' // 💡 모달을 열 때마다 기본값으로 리셋
    });
    setIsInspectModalOpen(true);
  };

  const handleActionSubmit = async (actionType, e) => {
    if (e) e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      if (actionType === 'APPROVED') {
        if (!window.confirm('입력하신 정보로 상품을 최종 승인하고 쇼핑몰에 등록하시겠습니까?')) return;

        // 🚨 방금 에러가 났던 지점입니다! 이제 finalComment가 항상 채워져서 날아갑니다.
        await axios.post(`http://localhost:8080/api/admin/selling/${selectedItem.requestId}/approve`, approveForm, { headers });
        alert('✅ 상품 검수 완료 및 스토어 등록 성공!');
      } else {
        const actionLabel = actionType === 'REJECTED' ? '반려' : '검수중';
        if (!window.confirm(`이 신청 건을 [${actionLabel}] 상태로 변경하시겠습니까?`)) return;
        await axios.patch(`http://localhost:8080/api/admin/selling/${selectedItem.requestId}/status`, null, {
          params: { status: actionType },
          headers
        });
        alert(`✅ ${actionLabel} 처리되었습니다.`);
      }

      setIsInspectModalOpen(false);
      fetchRequests();
    } catch (error) {
      // 💡 [팁] 백엔드가 던진 400(Validation 에러) 메시지를 화면에 띄워주면 디버깅이 훨씬 쉽습니다.
      const errorMessage = error.response?.data?.message || '처리 중 오류가 발생했습니다.';
      alert(`❌ 오류: ${errorMessage}`);
      console.error(error);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 font-sans">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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

      {/* --- INSPECT MODAL --- */}
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
                    <textarea
                      value={approveForm.finalComment}
                      onChange={(e) => setApproveForm({...approveForm, finalComment: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-gray-500 h-16 resize-none bg-white"
                      placeholder="예: 핸들 부분 미세 스크래치 발견 등"
                      required // 💡 [추가] 이제 프론트엔드에서도 무조건 입력하도록 강제합니다.
                    />
                  </div>
                </form>
              </div>
            </div>

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
    </div>
  );
};

export default AdminRequests;