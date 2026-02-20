import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BANNER_DATA } from '../../constants/data';

const InfoSliderSection = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth;
      const scrollPos = direction === 'left' ? -scrollAmount : scrollAmount;
      current.scrollBy({ left: scrollPos, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group max-w-7xl mx-auto mb-24 px-4 sm:px-6 lg:px-8 mt-12">
      <button onClick={() => scroll('left')} className="absolute left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-[#2C2C2C] transition-all duration-300 shadow-lg"><ChevronLeft size={24} strokeWidth={1.5} /></button>
      <div ref={scrollRef} className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory rounded-[2rem] shadow-2xl" style={{ scrollBehavior: 'smooth' }}>
        {BANNER_DATA.map((banner) => (
          <div key={banner.id} className={`min-w-full h-[320px] ${banner.color} ${banner.textColor} p-10 flex flex-col justify-center items-center text-center flex-shrink-0 snap-center relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
            <div className="relative z-10 max-w-3xl px-4">
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md text-[11px] tracking-[0.2em] font-medium mb-6 border border-white/30 uppercase rounded-full shadow-sm">Member Benefit</span>
              <h3 className="text-3xl md:text-4xl font-serif font-bold mb-6 leading-tight drop-shadow-md">{banner.title}</h3>
              <p className="opacity-90 text-sm md:text-base font-light leading-relaxed mb-8 max-w-lg mx-auto">{banner.desc}</p>
              <button className="group/btn relative px-8 py-3 border border-white/40 overflow-hidden rounded-full transition-all hover:bg-white hover:text-[#2C2C2C] hover:border-white hover:shadow-lg"><span className="relative z-10 text-xs font-bold tracking-widest uppercase">View More</span></button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => scroll('right')} className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-[#2C2C2C] transition-all duration-300 shadow-lg"><ChevronRight size={24} strokeWidth={1.5} /></button>
    </div>
  );
};

export default InfoSliderSection;