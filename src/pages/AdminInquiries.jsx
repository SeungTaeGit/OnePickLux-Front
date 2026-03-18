import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MessageSquare, CheckCircle, Clock, X, Send } from 'lucide-react';
import axios from 'axios';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, WAITING, ANSWERED

  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:8080/api/admin/inquiries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.data) {
        setInquiries(response.data.data);
      }
    } catch (error) {
      console.error('문의 내역 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      const matchSearch = inq.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inq.memberName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = filterStatus === 'ALL' ? true : inq.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [inquiries, searchQuery, filterStatus]);

  const handleRowClick = (inquiry) => {
    setSelectedInquiry(inquiry);
    // 이미 답변이 완료된 상태면 기존 답변을 세팅, 아니면 빈 칸
    setAnswerContent(inquiry.answerContent || '');
  };

  const closeModal = () => {
    setSelectedInquiry(null);
    setAnswerContent('');
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) {
      alert('답변 내용을 입력해 주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('accessToken');
      await axios.post(`http://localhost:8080/api/admin/inquiries/${selectedInquiry.inquiryId}/answer`, {
        answerContent: answerContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('답변이 성공적으로 등록되었습니다. (고객에게 알림이 발송됩니다)');
      closeModal();
      fetchInquiries(); // 목록 새로고침
    } catch (error) {
      console.error('답변 등록 실패:', error);
      alert('답변 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 flex flex-col gap-6 font-sans">

      {/* 💡 1. 상단 검색 및 필터 영역 */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="제목 또는 회원명 검색..."
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
            <option value="WAITING">답변 대기 🚨</option>
            <option value="ANSWERED">답변 완료 ✅</option>
          </select>
        </div>
      </div>

      {/* 💡 2. 문의 내역 리스트 (테이블) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#FAFAFA] text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="p-6 w-32">Status</th>
              <th className="p-6">Type & Title</th>
              <th className="p-6 w-40">Member</th>
              <th className="p-6 w-40">Date</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="4" className="p-10 text-center text-gray-400 font-bold animate-pulse">데이터를 불러오는 중입니다...</td></tr>
            ) : filteredInquiries.length > 0 ? (
              filteredInquiries.map(inq => (
                <tr
                  key={inq.inquiryId}
                  onClick={() => handleRowClick(inq)}
                  className={`transition-colors cursor-pointer ${inq.status === 'WAITING' ? 'hover:bg-red-50 bg-white' : 'hover:bg-gray-50 bg-gray-50/30'}`}
                >
                  <td className="p-4 pl-6">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit ${
                      inq.status === 'WAITING' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {inq.status === 'WAITING' ? <><Clock size={10}/> {inq.statusDescription}</> : <><CheckCircle size={10}/> {inq.statusDescription}</>}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400 font-bold tracking-widest">[{inq.typeDescription}]</span>
                      <span className={`font-bold ${inq.status === 'WAITING' ? 'text-[#1A1A1A]' : 'text-gray-600'}`}>{inq.title}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-600">{inq.memberName}</td>
                  <td className="p-4 text-[10px] text-gray-400 font-mono pr-6">
                    {inq.createdAt ? inq.createdAt.replace('T', ' ').substring(0, 16) : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="p-10 text-center text-gray-400 font-bold">조회된 문의 내역이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 💡 3. 상세 조회 및 답변 작성 모달 */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-[#FAFAFA] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

            {/* 모달 헤더 */}
            <div className="bg-[#1A1A1A] p-6 text-white flex justify-between items-center shrink-0">
              <h3 className="text-lg font-serif font-bold tracking-widest uppercase flex items-center gap-2">
                <MessageSquare size={20} className="text-[#D4AF37]" /> Inquiry Details
              </h3>
              <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* 왼쪽: 고객의 질문 내용 (읽기 전용) */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">{selectedInquiry.typeDescription}</span>
                    <p className="text-sm font-bold text-[#1A1A1A] mt-1">{selectedInquiry.memberName} 고객님</p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{selectedInquiry.createdAt?.replace('T', ' ').substring(0, 16)}</span>
                </div>
                <h4 className="text-base font-bold text-[#1A1A1A] mb-4">{selectedInquiry.title}</h4>
                <div className="flex-1 bg-[#FDFBF7] p-4 rounded-lg border border-[#E5E0D8] text-sm text-[#5C5550] leading-relaxed whitespace-pre-wrap overflow-y-auto">
                  {selectedInquiry.content}
                </div>
              </div>

              {/* 오른쪽: 관리자 답변 영역 */}
              <div className="flex flex-col">
                <h4 className="text-sm font-black text-[#2C2C2C] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span> Admin Answer
                </h4>

                <form onSubmit={handleSubmitAnswer} className="flex-1 flex flex-col">
                  <textarea
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    readOnly={selectedInquiry.status === 'ANSWERED'} // 답변 완료면 수정 불가
                    placeholder={selectedInquiry.status === 'WAITING' ? "고객님께 전달할 답변을 정성껏 작성해 주세요..." : ""}
                    className={`flex-1 w-full p-5 rounded-xl text-sm leading-relaxed resize-none outline-none transition-all ${
                      selectedInquiry.status === 'ANSWERED'
                        ? 'bg-gray-100 text-gray-600 border border-gray-200 cursor-default'
                        : 'bg-white border-2 border-gray-200 focus:border-[#D4AF37] shadow-sm'
                    }`}
                  ></textarea>

                  {/* 답변 대기 상태일 때만 등록 버튼 노출 */}
                  {selectedInquiry.status === 'WAITING' ? (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-4 w-full bg-[#1A1A1A] text-[#D4AF37] py-4 rounded-xl font-black text-sm tracking-[0.2em] hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:text-white"
                    >
                      <Send size={18}/> {isSubmitting ? '발송 중...' : '답변 등록 및 알림 발송'}
                    </button>
                  ) : (
                    <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-xl text-center">
                      <p className="text-xs font-bold text-green-700">✅ 이미 답변이 완료된 문의입니다.</p>
                      <p className="text-[10px] text-green-600 mt-1 font-mono">답변일시: {selectedInquiry.answeredAt?.replace('T', ' ').substring(0, 16)}</p>
                    </div>
                  )}
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminInquiries;