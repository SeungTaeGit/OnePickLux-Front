import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import Product360Viewer from '../common/Product360Viewer.jsx';

const Hero3DShowcase = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full bg-[#1A1A1A] overflow-hidden border-b-[6px] border-[#D4AF37]">

      {/* 장식용 빛 번짐 (블러) 효과 */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#D4AF37] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-white rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center py-16 md:py-24 gap-12">

        {/* 왼쪽: 텍스트 및 CTA 버튼 영역 */}
        <div className="flex-1 text-center md:text-left pt-10 md:pt-0">
          <span className="inline-flex items-center gap-2 text-[#D4AF37] text-[10px] font-black tracking-[0.4em] uppercase mb-6 px-3 py-1 border border-[#D4AF37]/30 rounded-full bg-[#D4AF37]/10">
            <Sparkles size={14} /> 360° 3D Showcase
          </span>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
            EXPERIENCE<br />
            <span className="italic font-light text-[#D4AF37]">PERFECTION</span>
          </h1>

          <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed mb-10 max-w-md mx-auto md:mx-0">
            원픽럭스의 프리미엄 3D 뷰어로<br className="hidden md:block"/>
            상품의 모든 디테일을 360도로 생생하게 확인하세요.<br/>
            어떤 미세한 사용감도 숨기지 않습니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={() => navigate('/products')}
              className="px-8 py-4 bg-[#D4AF37] text-black text-xs font-black tracking-widest uppercase hover:bg-white transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#D4AF37]/20"
            >
              Explore Collection <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* 오른쪽: 360도 뷰어 탑재 영역 */}
        <div className="flex-1 w-full max-w-lg relative">
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-black rounded-[100%] blur-[10px] opacity-80"></div>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4/5 h-2 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent blur-[2px]"></div>

                  {/* 💡 [핵심] 현재 가지고 계신 사진 개수(3장)와 확장자(.png 또는 .jpg)를 정확히 입력해 주세요! */}
                  <Product360Viewer
                    folderUrl="/360-test"
                    totalFrames={3}     // 💡 승태님이 넣으신 사진 개수만큼 숫자를 바꿔주세요! (예: 3)
                    extension=".png"    // 💡 사진 확장자가 png라면 .png, jpg라면 .jpg 로 적어주세요!
                    autoPlay={true}
                    speed={500}         // 사진이 3장밖에 없으니 너무 빨리 돌지 않게 속도를 늦췄습니다.
                    className="z-10"
                  />
        </div>

      </div>
    </section>
  );
};

export default Hero3DShowcase;