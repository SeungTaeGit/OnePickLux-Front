import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BANNER_DATA } from '../../constants/data';

const BannerSection = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -340 : 340;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group max-w-7xl mx-auto mt-8 mb-12 px-4 sm:px-6 lg:px-8">
      <button onClick={() => scroll('left')} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 bg-white/90 backdrop-blur-sm border border-[#E5E0D8] text-[#5C5550] rounded-full shadow-xl hover:bg-[#2C2C2C] hover:text-white hover:border-[#2C2C2C] transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"><ChevronLeft size={24} /></button>
      <div ref={scrollRef} className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory gap-0 rounded-lg shadow-lg" style={{ scrollBehavior: 'smooth' }}>
        {BANNER_DATA.map((banner) => (
          <div key={banner.id} className={`min-w-[100%] md:min-w-[calc(100%/3)] lg:min-w-[calc(100%/3)] h-[400px] ${banner.color} ${banner.textColor} p-10 flex flex-col justify-between flex-shrink-0 snap-center relative overflow-hidden transition-transform hover:brightness-105 border-r border-white/5 last:border-r-0`}>
            <div className="relative z-10 flex flex-col h-full justify-between items-start">
              <div><span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md text-[10px] tracking-[0.2em] font-medium mb-4 border border-white/20 uppercase">Event</span><h3 className="text-3xl md:text-4xl font-serif leading-tight mb-4 max-w-[80%]">{banner.title}</h3><div className="w-16 h-[1px] bg-current opacity-50 mb-4"></div><p className="opacity-90 text-sm font-light leading-relaxed max-w-[90%]">{banner.desc}</p></div>
              <button className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white hover:text-[#2C2C2C] text-xs font-bold tracking-widest transition uppercase mt-4">View Details</button>
            </div>
            <div className="absolute -bottom-10 -right-10 text-[10rem] font-serif opacity-5 select-none pointer-events-none">{banner.id}</div>
          </div>
        ))}
      </div>
      <button onClick={() => scroll('right')} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 bg-white/90 backdrop-blur-sm border border-[#E5E0D8] text-[#5C5550] rounded-full shadow-xl hover:bg-[#2C2C2C] hover:text-white hover:border-[#2C2C2C] transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"><ChevronRight size={24} /></button>
    </div>
  );
};

export default BannerSection;