import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ShieldAlert, ShieldCheck, X, Save, Edit3, ShoppingBag, MessageSquare, Activity, UserX, Coins } from 'lucide-react';
import axios from 'axios';

const AdminMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [selectedMember, setSelectedMember] = useState(null);
  const [member360Data, setMember360Data] = useState(null);
  const [memoInput, setMemoInput] = useState('');
  const [is360Loading, setIs360Loading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:8080/api/admin/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.data) {
        setMembers(response.data.data);
      }
    } catch (error) {
      console.error('회원 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchSearch = m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'ALL' ? true : m.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [members, searchQuery, filterStatus]);

  const handleRowClick = async (memberId) => {
    setSelectedMember(memberId);
    setIs360Loading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:8080/api/admin/members/${memberId}/360`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.data) {
        setMember360Data(response.data.data);
        setMemoInput(response.data.data.adminMemo || '');
      }
    } catch (error) {
      console.error('360도 뷰 로드 실패:', error);
      alert('회원 상세 정보를 불러오는 데 실패했습니다.');
      setSelectedMember(null);
    } finally {
      setIs360Loading(false);
    }
  };

  const closeModal = () => {
    setSelectedMember(null);
    setMember360Data(null);
  };

  const handleSaveMemo = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(`http://localhost:8080/api/admin/members/${selectedMember}/memo`, {
        memo: memoInput
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('관리자 메모가 성공적으로 저장되었습니다.');
      setMember360Data(prev => ({ ...prev, adminMemo: memoInput }));
    } catch (error) {
      alert('메모 저장 중 오류가 발생했습니다.');
    }
  };

  const handlePointSubmit = async (type) => {
    const amountInput = document.getElementById('pointAmount').value;
    if (!amountInput || amountInput <= 0) {
      alert('올바른 금액을 입력해주세요.');
      return;
    }

    const reason = prompt(type === 'GRANT' ? '지급 사유를 입력하세요 (예: 이벤트 참여 보상)' : '차감 사유를 입력하세요 (예: 반품 배송비 차감)');
    if (!reason) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`http://localhost:8080/api/admin/members/${selectedMember}/points`, {
        amount: Number(amountInput),
        type: type,
        description: reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`포인트가 성공적으로 ${type === 'GRANT' ? '지급' : '차감'}되었습니다.`);
      document.getElementById('pointAmount').value = '';
      fetchMembers(); // 백그라운드에서 전체 리스트 갱신 (잔여 포인트 갱신용)
      handleRowClick(selectedMember); // 현재 모달의 포인트 내역 즉시 갱신
    } catch (error) {
      alert(error.response?.data?.message || '포인트 처리 중 오류가 발생했습니다.');
    }
  };

  const handleToggleSuspend = async () => {
    const isSuspending = member360Data.basicInfo.status !== 'SUSPENDED';
    const confirmMsg = isSuspending
      ? '정말 이 회원을 정지(Ban) 하시겠습니까? 로그인이 즉시 차단됩니다.'
      : '이 회원의 정지를 해제하시겠습니까?';

    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(`http://localhost:8080/api/admin/members/${selectedMember}/suspend`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(response.data.data || '상태가 변경되었습니다.');

      closeModal();
      fetchMembers();
    } catch (error) {
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="animate-in fade-in duration-500 flex flex-col gap-6 font-sans">

      {/* 1. 상단 검색 및 필터 영역 */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        {/* ... (이전과 동일) ... */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="이름 또는 이메일 검색..."
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
            <option value="ALL">모든 상태</option>
            <option value="ACTIVE">활성 계정</option>
            <option value="SUSPENDED">정지됨 (Ban)</option>
            <option value="WITHDRAWN">탈퇴 계정</option>
          </select>
        </div>
      </div>

      {/* 2. 회원 내역 리스트 (테이블) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#FAFAFA] text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="p-6">Member Info</th>
              <th className="p-6">Grade / Total Spent</th>
              <th className="p-6">Point Balance</th>
              <th className="p-6">Status / Last Login</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="4" className="p-10 text-center text-gray-400 font-bold animate-pulse">데이터를 불러오는 중입니다...</td></tr>
            ) : filteredMembers.length > 0 ? (
              filteredMembers.map(m => (
                <tr
                  key={m.memberId}
                  onClick={() => handleRowClick(m.memberId)}
                  className={`transition-colors cursor-pointer ${
                    m.status === 'SUSPENDED' ? 'bg-red-50/50 hover:bg-red-50' :
                    m.status === 'WITHDRAWN' ? 'bg-gray-100 opacity-50' : 'hover:bg-gray-50 bg-white'
                  }`}
                >
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#D4AF37] font-serif font-bold text-lg shrink-0">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#1A1A1A]">{m.name}</p>
                        <p className="text-[10px] text-gray-400">{m.email}</p>
                        {/* 💡 [추가] 리스트에서도 성별과 나이를 작게 보여줍니다 */}
                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                          {m.gender} · {m.age ? `${m.age}세` : '나이 미상'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded w-fit ${
                        m.grade === 'VIP' ? 'bg-black text-[#D4AF37]' :
                        m.grade === '골드' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {m.grade}
                      </span>
                      <span className="font-serif font-bold text-blue-600">₩ {m.totalSpent?.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-[#D4AF37]">{m.availablePoint?.toLocaleString() || 0} P</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                        m.status === 'ACTIVE' ? 'bg-green-100 text-green-600' :
                        m.status === 'SUSPENDED' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {m.statusDescription}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {m.lastLoginAt ? m.lastLoginAt.replace('T', ' ').substring(0, 16) : '-'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="p-10 text-center text-gray-400 font-bold">조회된 회원이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 3. 360도 뷰 모달 */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="bg-[#F8F9FA] w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">

            {/* 모달 헤더 */}
            <div className="bg-[#1A1A1A] p-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-[#D4AF37] font-serif text-xl">
                  {member360Data?.basicInfo?.name?.charAt(0) || <Activity size={20}/>}
                </div>
                <div className="text-white">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    {member360Data?.basicInfo?.name}
                    <span className="text-[10px] font-normal text-gray-400 font-mono">{member360Data?.basicInfo?.email}</span>
                  </h3>
                  <div className="flex gap-2 mt-1 items-center">
                    {/* 💡 [추가] 모달 헤더에도 성별과 나이 배지를 달아줍니다 */}
                    <span className="text-[10px] text-gray-300 mr-1">
                      {member360Data?.basicInfo?.gender} · {member360Data?.basicInfo?.age ? `${member360Data.basicInfo.age}세` : '나이 미상'}
                    </span>
                    <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded font-black tracking-widest">{member360Data?.basicInfo?.grade}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black tracking-widest ${
                      member360Data?.basicInfo?.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {member360Data?.basicInfo?.statusDescription}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {member360Data && member360Data.basicInfo.status !== 'WITHDRAWN' && (
                  <button
                    onClick={handleToggleSuspend}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm ${
                      member360Data.basicInfo.status === 'SUSPENDED'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {member360Data.basicInfo.status === 'SUSPENDED' ? <><ShieldCheck size={14}/> 정지 해제</> : <><UserX size={14}/> 계정 정지 (Ban)</>}
                  </button>
                )}
                <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors"><X size={24}/></button>
              </div>
            </div>

            {/* 모달 바디 */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {is360Loading || !member360Data ? (
                <div className="py-20 text-center text-gray-400 font-bold animate-pulse">고객의 모든 데이터를 수집하고 있습니다...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* 왼쪽 열 (기본 정보 + 관리자 메모 + 포인트 컨트롤) */}
                  <div className="lg:col-span-1 space-y-6">

                    {/* 관리자 메모 */}
                    <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400 opacity-10 rounded-bl-full pointer-events-none"></div>
                      <h4 className="text-[10px] font-black text-yellow-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Edit3 size={14} /> Admin CS Memo
                      </h4>
                      <textarea
                        value={memoInput}
                        onChange={(e) => setMemoInput(e.target.value)}
                        placeholder="블랙 컨슈머 여부, VIP 특별 케어 사항 등을 자유롭게 기록하세요."
                        className="w-full h-24 bg-white/50 border border-yellow-300 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:border-yellow-500 focus:bg-white resize-none"
                      />
                      <button onClick={handleSaveMemo} className="w-full mt-3 bg-yellow-600 text-white py-2 rounded-lg text-xs font-bold tracking-widest hover:bg-yellow-700 transition">
                        메모 저장
                      </button>
                    </div>

                    {/* 활동 지표 요약 */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Activity Summary</h4>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                        <span className="text-xs font-bold text-gray-500">누적 구매 금액</span>
                        <span className="text-sm font-serif font-black text-blue-600">₩ {member360Data.basicInfo.totalSpent?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                        <span className="text-xs font-bold text-gray-500">가입 일자</span>
                        <span className="text-xs font-mono text-gray-600">{member360Data.basicInfo.joinedAt?.split('T')[0]}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500">최근 로그인</span>
                        <span className="text-xs font-mono text-gray-600">{member360Data.basicInfo.lastLoginAt?.split('T')[0] || '-'}</span>
                      </div>
                    </div>

                    {/* 포인트 수동 지급창 */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <h4 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mb-4 flex items-center gap-2">
                        Point Control
                      </h4>
                      <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-50">
                        <span className="text-xs font-bold text-gray-500">현재 보유 포인트</span>
                        <span className="text-lg font-serif font-black text-[#1A1A1A]">
                          {member360Data.basicInfo.availablePoint?.toLocaleString() || 0} P
                        </span>
                      </div>
                      <input
                        type="number"
                        id="pointAmount"
                        placeholder="적용할 금액 입력"
                        className="w-full mb-2 border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-[#D4AF37] bg-[#FAFAFA]"
                      />
                      <div className="flex gap-2">
                         <button onClick={() => handlePointSubmit('GRANT')} className="flex-1 bg-[#1A1A1A] text-white py-2.5 rounded-lg text-xs font-bold tracking-widest hover:bg-black transition shadow-sm">지급 (+)</button>
                         <button onClick={() => handlePointSubmit('DEDUCT')} className="flex-1 bg-red-50 text-red-500 py-2.5 rounded-lg text-xs font-bold tracking-widest hover:bg-red-100 transition shadow-sm">차감 (-)</button>
                      </div>
                    </div>
                  </div>

                  {/* 오른쪽 열 (위탁 내역 + 문의 내역 + 포인트 내역) */}
                  <div className="lg:col-span-2 space-y-6">

                    {/* 💡 [신규] 포인트 히스토리(원장) 리스트 */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-64">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Coins size={14} className="text-yellow-500" /> Point History (최근 10건)
                      </h4>
                      <div className="flex-1 overflow-y-auto pr-2">
                        {member360Data.pointHistory && member360Data.pointHistory.length > 0 ? (
                          <div className="space-y-3">
                            {member360Data.pointHistory.map((history, idx) => {
                              const isPositive = history.type === 'GRANT' || history.type === 'EARN';
                              return (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded tracking-widest ${isPositive ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                                        {history.typeDescription}
                                      </span>
                                      <span className="text-[10px] text-gray-400 font-mono">{history.createdAt?.replace('T', ' ').substring(0, 16)}</span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-600">{history.description}</p>
                                  </div>
                                  <span className={`font-serif font-black ${isPositive ? 'text-blue-600' : 'text-red-500'}`}>
                                    {isPositive ? '+' : '-'}{history.amount?.toLocaleString()} P
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs font-bold text-gray-400">포인트 증감 내역이 없습니다.</div>
                        )}
                      </div>
                    </div>

                    {/* 1:1 문의 내역 */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-56">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MessageSquare size={14} className="text-blue-500" /> CS Inquiries (1:1 문의 내역)
                      </h4>
                      <div className="flex-1 overflow-y-auto pr-2">
                        {member360Data.inquiryHistory && member360Data.inquiryHistory.length > 0 ? (
                          <div className="space-y-3">
                            {member360Data.inquiryHistory.map(inq => (
                              <div key={inq.inquiryId} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-black text-gray-500 bg-gray-200 px-2 py-0.5 rounded">{inq.typeDescription}</span>
                                  <span className={`text-[10px] font-black tracking-widest ${inq.status === 'WAITING' ? 'text-red-500' : 'text-green-600'}`}>{inq.statusDescription}</span>
                                </div>
                                <p className="text-xs font-bold text-[#1A1A1A] truncate">{inq.title}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs font-bold text-gray-400">1:1 문의 내역이 없습니다.</div>
                        )}
                      </div>
                    </div>

                    {/* 위탁/판매 내역 */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-48">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShoppingBag size={14} className="text-[#D4AF37]" /> Selling Requests (위탁/매입 신청 내역)
                      </h4>
                      <div className="flex-1 overflow-y-auto pr-2">
                        {member360Data.sellingHistory && member360Data.sellingHistory.length > 0 ? (
                          <div className="space-y-3">
                            {member360Data.sellingHistory.map(sell => (
                              <div key={sell.requestId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                  <p className="text-xs font-bold text-[#1A1A1A]">{sell.brandName} - {sell.itemName}</p>
                                  <p className="text-[10px] text-gray-400 mt-1">{sell.requestedAt?.replace('T', ' ').substring(0, 16)}</p>
                                </div>
                                <span className="text-[10px] font-black bg-gray-200 text-gray-600 px-2 py-1 rounded tracking-widest">{sell.status}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs font-bold text-gray-400">위탁/판매 신청 내역이 없습니다.</div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMembers;