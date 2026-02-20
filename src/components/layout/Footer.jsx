import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#2C2C2C] text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm font-light">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-2xl font-serif text-white mb-4">ONEPICK LUX</h2>
          <p className="mb-6 leading-relaxed opacity-70">
            엄격한 정품 검수를 거친 프리미엄 중고 명품 플랫폼.<br/>
            당신의 품격을 높여줄 단 하나의 선택.
          </p>
          <div className="flex gap-4">
             <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition cursor-pointer">In</div>
             <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition cursor-pointer">Fb</div>
          </div>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Help</h3>
          <ul className="space-y-2 opacity-70">
            <li><a href="#" className="hover:text-[#D4AF37]">FAQ</a></li>
            <li><a href="#" className="hover:text-[#D4AF37]">배송 안내</a></li>
            <li><a href="#" className="hover:text-[#D4AF37]">반품/환불 정책</a></li>
            <li><a href="#" className="hover:text-[#D4AF37]">정품 보증 정책</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Contact</h3>
          <ul className="space-y-2 opacity-70">
            <li>1544-XXXX</li>
            <li>support@onepicklux.com</li>
            <li>서울시 강남구 테헤란로</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;