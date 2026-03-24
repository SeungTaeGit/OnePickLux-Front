import React, { useState, useEffect } from 'react';
import { Coins, ChevronLeft, ChevronRight, Search, Download } from 'lucide-react';
import axios from 'axios';

const AdminPoints = () => {
  const [pointLogs, setPointLogs] = useState([]);
  const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 1, totalElements: 0 });
  const [loading, setLoading] = useState(true);

  // 현재 페이지 번호 (0부터 시작)
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchPointLogs(currentPage);
  }, [currentPage]);

  const fetchPointLogs = async (page) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      // 💡 Spring Data JPA의 Pageable API 스펙에 맞춰 page 파라미터 전달
      const response = await axios.get(`http://localhost:8080/api/admin/points?page=${page}&size=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.data) {
        const pageData = response.data.data;
        setPointLogs(pageData.content); // 실제 배열 데이터
        setPageInfo({
          number: pageData.number,
          totalPages: pageData.totalPages,
          totalElements: pageData.totalElements
        });
      }
    } catch (error) {
      console.error('포인트 원장 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < pageInfo.totalPages - 1) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="animate-in fade-in duration-500 flex flex-col gap-6 font-sans">

      {/* 상단 헤더 & 검색 (UI만 구현) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2 uppercase tracking-widest">
            <Coins size={20} className="text-yellow-500" /> Point Ledger
          </h3>
          <p className="text-xs text-gray-400 mt-1 font-bold">총 <span className="text-yellow-600">{pageInfo.totalElements}</span>건의 포인트 변동 내역이 기록되어 있습니다.</p>
        </div>
        <button className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-100 transition border border-green-200">
          <Download size={14}/> 엑셀 다운로드
        </button>
      </div>

      {/* 포인트 원장 리스트 (테이블) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#FAFAFA] text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 sticky top-0 z-10">
              <tr>
                <th className="p-4 pl-6">ID / Date</th>
                <th className="p-4">Member</th>
                <th className="p-4">Type</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-right pr-6">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-400 font-bold animate-pulse">원장 데이터를 불러오는 중입니다...</td></tr>
              ) : pointLogs.length > 0 ? (
                pointLogs.map(log => {
                  const isPositive = log.type === 'GRANT' || log.type === 'EARN';
                  return (
                    <tr key={log.historyId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="text-[10px] text-gray-400 font-mono">#{log.historyId}</p>
                        <p className="text-[10px] text-gray-500 font-bold">{log.createdAt?.replace('T', ' ').substring(0, 16)}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-[#1A1A1A]">{log.memberName}</p>
                        <p className="text-[10px] text-gray-400">{log.memberEmail}</p>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded tracking-widest ${isPositive ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                          {log.typeDescription}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-bold text-gray-600 truncate max-w-[200px]">
                        {log.description}
                      </td>
                      <td className={`p-4 text-right pr-6 font-serif font-black ${isPositive ? 'text-blue-600' : 'text-red-500'}`}>
                        {isPositive ? '+' : '-'}{log.amount?.toLocaleString()} P
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="5" className="p-10 text-center text-gray-400 font-bold">기록된 포인트 내역이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 💡 [핵심] 페이지네이션 (Pagination) 컨트롤 */}
        <div className="bg-[#FAFAFA] border-t border-gray-100 p-4 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500">
            Page {pageInfo.number + 1} of {pageInfo.totalPages === 0 ? 1 : pageInfo.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={pageInfo.number === 0}
              className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextPage}
              disabled={pageInfo.number >= pageInfo.totalPages - 1}
              className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminPoints;