import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, MessageSquare, HelpCircle, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import axios from 'axios'; // 💡 API 호출을 위해 axios 추가

const FAQ_DATA = [
  { id: 1, category: 'AUTH', question: '정품이 맞나요? 가품일 경우 어떻게 되나요?', answer: '원픽럭스에서 판매하는 모든 상품은 전문 감정사의 2중 검수를 거친 100% 정품입니다.\n만약 가품으로 판명될 경우, 구매 금액의 200%를 보상해 드리는 안심 보상제를 실시하고 있습니다.' },
  { id: 2, category: 'SHIPPING', question: '배송은 얼마나 걸리나요?', answer: '평일 오후 2시 이전 결제 완료 건은 당일 출고되며, 프리미엄 우체국 안심 소포를 통해 평균 1~2영업일 이내에 안전하게 수령하실 수 있습니다.\n(단, 제주 및 도서산간 지역은 1~2일 추가 소요될 수 있습니다.)' },
  { id: 3, category: 'SHIPPING', question: '관부가세가 포함된 가격인가요?', answer: '네, 원픽럭스의 모든 상품(병행수입 새상품 포함)은 관세 및 부가세가 모두 포함된 최종 결제 금액입니다. 수령 시 추가로 납부하실 비용은 전혀 없습니다.' },
  { id: 4, category: 'RETURN', question: '단순 변심으로 인한 교환/반품이 가능한가요?', answer: '상품 수령 후 7일 이내에 1:1 문의를 통해 반품 접수가 가능합니다.\n단, 명품 특성상 상품에 부착된 [보안 택(Security Tag)]이 훼손되거나 제거된 경우 어떠한 사유로도 교환/반품이 절대 불가합니다.\n* 단순 변심 반품 시 왕복 특수 배송비 20,000원이 차감됩니다.' },
  { id: 5, category: 'ETC', question: 'A/S는 어떻게 진행되나요?', answer: '병행수입 및 프리오운드(중고) 명품 특성상 국내 백화점 및 공식 매장에서의 무상 A/S는 불가할 수 있습니다.\n상품 사용 중 수선이 필요하신 경우, 명품 전문 수선사(사설)를 이용해 주시기 바랍니다.' },
  { id: 6, category: 'AUTH', question: '병행수입 상품과 백화점 상품의 차이가 있나요?', answer: '병행수입 상품은 이탈리아, 프랑스 등 유럽 현지 부띠끄 및 정식 매장에서 직접 바잉하여 정식 통관을 거쳐 수입된 100% 정품입니다. 제품 자체는 백화점 판매 상품과 완전히 동일하며, 유통 과정의 마진을 줄여 보다 합리적인 가격에 제공해 드리고 있습니다.' },
];

const CustomerCenterPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('faq');
  const [faqCategory, setFaqCategory] = useState('ALL');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const [inquiryType, setInquiryType] = useState('PRODUCT');
  const [inquiryTitle, setInquiryTitle] = useState('');
  const [inquiryContent, setInquiryContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // 💡 중복 전송 방지용 상태

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const filteredFaqs = faqCategory === 'ALL'
    ? FAQ_DATA
    : FAQ_DATA.filter(faq => faq.category === faqCategory);

  // 💡 [핵심 수정] 1:1 문의 접수 시 실제 백엔드 API 호출
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('1:1 문의는 로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post('http://localhost:8080/api/inquiries', {
        type: inquiryType,
        title: inquiryTitle,
        content: inquiryContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('문의가 성공적으로 접수되었습니다. 마이페이지에서 답변을 확인하실 수 있습니다.');
      setInquiryTitle('');
      setInquiryContent('');

      // 💡 문의 작성 완료 후 마이페이지의 'inquiries' 탭으로 바로 이동시키는 센스!
      navigate('/mypage', { state: { activeTab: 'inquiries' } });

    } catch (error) {
      console.error('문의 접수 실패:', error);
      alert('문의 접수 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in font-sans min-h-screen bg-[#FAFAFA] pb-20">

      {/* 상단 히어로 배너 */}
      <div className="bg-[#1A1A1A] py-20 px-4 text-center border-b-[4px] border-[#D4AF37]">
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 tracking-widest uppercase">
          Customer Care
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-light">
          원픽럭스 고객님들을 위한 프리미엄 고객센터입니다. 무엇을 도와드릴까요?
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">

        {/* 탭 전환 UI */}
        <div className="flex justify-center border-b border-[#E5E0D8] mb-12">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 px-8 py-4 text-sm md:text-base font-bold transition-colors ${
              activeTab === 'faq' ? 'text-[#2C2C2C] border-b-2 border-[#2C2C2C]' : 'text-[#888] hover:text-[#2C2C2C]'
            }`}
          >
            <HelpCircle size={18} /> 자주 묻는 질문 (FAQ)
          </button>
          <button
            onClick={() => setActiveTab('inquiry')}
            className={`flex items-center gap-2 px-8 py-4 text-sm md:text-base font-bold transition-colors ${
              activeTab === 'inquiry' ? 'text-[#2C2C2C] border-b-2 border-[#2C2C2C]' : 'text-[#888] hover:text-[#2C2C2C]'
            }`}
          >
            <MessageSquare size={18} /> 1:1 문의하기
          </button>
        </div>

        {/* FAQ 탭 영역 */}
        {activeTab === 'faq' && (
          <div className="animate-fade-in-up">
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { id: 'ALL', label: '전체보기' },
                { id: 'AUTH', label: '정품/검수', icon: <ShieldCheck size={14}/> },
                { id: 'SHIPPING', label: '배송/관부가세', icon: <Truck size={14}/> },
                { id: 'RETURN', label: '교환/반품', icon: <RefreshCcw size={14}/> },
                { id: 'ETC', label: '기타/AS' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFaqCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    faqCategory === cat.id
                    ? 'bg-[#2C2C2C] text-white border border-[#2C2C2C]'
                    : 'bg-white text-[#5C5550] border border-[#E5E0D8] hover:border-[#997B4D] hover:text-[#997B4D]'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            <div className="bg-white border border-[#E5E0D8] rounded-sm shadow-sm divide-y divide-[#E5E0D8]">
              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="group">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#FDFBF7] transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-[#D4AF37] font-serif font-bold text-lg">Q.</span>
                      <span className={`text-sm font-bold transition-colors ${expandedFaq === faq.id ? 'text-[#997B4D]' : 'text-[#2C2C2C]'}`}>
                        {faq.question}
                      </span>
                    </div>
                    {expandedFaq === faq.id ? <ChevronUp size={20} className="text-[#997B4D] shrink-0" /> : <ChevronDown size={20} className="text-gray-400 shrink-0 group-hover:text-[#997B4D]" />}
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-[#FAFAFA] ${expandedFaq === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-6 pl-14 text-sm text-[#5C5550] leading-relaxed border-t border-[#E5E0D8] flex gap-4">
                      <span className="text-gray-300 font-serif font-bold text-lg shrink-0">A.</span>
                      <span className="whitespace-pre-wrap">{faq.answer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center text-xs text-gray-400">
              원하시는 답변을 찾지 못하셨나요? 1:1 문의를 남겨주시면 빠르게 답변해 드리겠습니다.
            </div>
          </div>
        )}

        {/* 1:1 문의 탭 영역 */}
        {activeTab === 'inquiry' && (
          <div className="animate-fade-in-up bg-white p-8 md:p-10 border border-[#E5E0D8] rounded-sm shadow-sm">
            <h2 className="text-xl font-serif font-bold text-[#2C2C2C] mb-6 border-b border-[#E5E0D8] pb-4">
              무엇을 도와드릴까요?
            </h2>
            <form onSubmit={handleInquirySubmit} className="space-y-6">

              <div>
                <label className="block text-xs font-bold text-[#5C5550] mb-2">문의 유형 <span className="text-red-500">*</span></label>
                <select value={inquiryType} onChange={(e) => setInquiryType(e.target.value)} className="w-full md:w-1/2 p-3 border border-[#E5E0D8] rounded-sm text-sm focus:border-[#997B4D] outline-none bg-white">
                  <option value="PRODUCT">상품 관련 문의 (상태, 사이즈 등)</option>
                  <option value="SHIPPING">배송 문의</option>
                  <option value="RETURN">교환/반품 문의</option>
                  <option value="ORDER">결제/주문 문의</option>
                  <option value="ETC">기타 문의</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5550] mb-2">제목 <span className="text-red-500">*</span></label>
                <input type="text" value={inquiryTitle} onChange={(e) => setInquiryTitle(e.target.value)} placeholder="문의 제목을 입력해 주세요." required className="w-full p-3 border border-[#E5E0D8] rounded-sm text-sm focus:border-[#997B4D] outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5550] mb-2">문의 내용 <span className="text-red-500">*</span></label>
                <textarea value={inquiryContent} onChange={(e) => setInquiryContent(e.target.value)} placeholder="고객님의 개인정보(주민번호, 비밀번호 등)는 포함하지 않도록 주의해 주세요.&#10;문의 남겨주시면 평일 기준 24시간 이내에 답변해 드리겠습니다." required className="w-full h-48 p-4 border border-[#E5E0D8] rounded-sm text-sm focus:border-[#997B4D] outline-none resize-none leading-relaxed"></textarea>
              </div>

              <div className="bg-[#FDFBF7] p-4 text-xs text-[#888] rounded-sm border border-[#E5E0D8] leading-relaxed">
                <p className="font-bold text-[#5C5550] mb-1">고객센터 운영시간 안내</p>
                <p>• 평일 10:00 ~ 17:00 (점심시간 13:00 ~ 14:00)</p>
                <p>• 주말 및 공휴일 휴무</p>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" disabled={isSubmitting} className="px-10 py-4 bg-[#1A1A1A] text-white text-sm font-bold tracking-widest hover:bg-[#D4AF37] disabled:bg-gray-400 transition uppercase shadow-md">
                  {isSubmitting ? '접수 중...' : '문의 접수하기'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerCenterPage;