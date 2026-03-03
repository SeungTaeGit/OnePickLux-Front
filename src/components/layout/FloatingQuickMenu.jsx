import React from 'react';
import {
  MessageCircle, // 카카오톡 대체용
  Instagram,
  Zap,           // 번개장터 (번개)
  Carrot,        // 당근마켓 (당근)
  ShoppingBag,   // 후루츠패밀리 (쇼핑백)
  ArrowUp,       // 맨 위로
  ArrowDown      // 맨 아래로
} from 'lucide-react';

const FloatingQuickMenu = () => {
  // 💡 부드럽게 스크롤을 맨 위/아래로 이동시키는 함수
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    // 문서 전체 높이에서 현재 보이는 창의 높이만큼 스크롤
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  // 💡 새 창으로 외부 링크 열기
  const openLink = (url) => {
    if (url === '#') {
      alert('클라이언트로부터 아직 링크를 전달받지 못했습니다!');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const quickLinks = [
    { name: '카카오 문의', icon: MessageCircle, bg: 'bg-[#FEE500]', text: 'text-black', url: '#' }, // 링크 대기 중
    { name: '인스타그램', icon: Instagram, bg: 'bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4]', text: 'text-white', url: '#' }, // 링크 대기 중
    { name: '번개장터', icon: Zap, bg: 'bg-[#D32F2F]', text: 'text-white', url: 'https://m.bunjang.co.kr/' },
    { name: '당근마켓', icon: Carrot, bg: 'bg-[#FF8A3D]', text: 'text-white', url: 'https://www.daangn.com/' },
    { name: 'FruitsFamily', icon: ShoppingBag, bg: 'bg-[#2C2C2C]', text: 'text-white', url: 'https://fruitsfamily.com/' },
  ];

  return (
    // 💡 fixed: 화면 스크롤과 상관없이 화면에 고정
    // left-6: 왼쪽 여백, top-1/2 -translate-y-1/2: 세로 정중앙
    // z-50: 다른 요소들보다 무조건 맨 위에 보이게 함
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-3 animate-fade-in">

      {/* 1. 위로 가기 버튼 */}
      <button
        onClick={scrollToTop}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all group"
      >
        <ArrowUp size={20} />
      </button>

      {/* 2. SNS 및 중고 플랫폼 링크들 */}
      <div className="flex flex-col gap-2 my-2 p-2 bg-white/80 backdrop-blur-md border border-gray-100 rounded-full shadow-sm">
        {quickLinks.map((link, idx) => (
          <div key={idx} className="relative group">
            <button
              onClick={() => openLink(link.url)}
              className={`w-10 h-10 flex items-center justify-center rounded-full ${link.bg} ${link.text} hover:scale-110 hover:shadow-lg transition-transform`}
            >
              <link.icon size={18} strokeWidth={2} />
            </button>
            {/* 💡 마우스 올렸을 때 오른쪽으로 말풍선(툴팁) 띄우기 */}
            <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-black/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {link.name}
            </span>
          </div>
        ))}
      </div>

      {/* 3. 아래로 가기 버튼 */}
      <button
        onClick={scrollToBottom}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all group"
      >
        <ArrowDown size={20} />
      </button>

    </div>
  );
};

// 🚨🚨🚨 이 부분이 빠져있어서 발생한 에러입니다! 반드시 파일 맨 끝에 이 줄이 있어야 합니다. 🚨🚨🚨
export default FloatingQuickMenu;