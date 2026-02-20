import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Shield, User, LogOut } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('accessToken'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E5E0D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex flex-col items-center cursor-pointer">
            <h1 className="text-xl font-serif font-bold tracking-widest text-[#2C2C2C]">ONEPICK LUX</h1>
            <div className="flex items-center gap-2 w-full justify-center">
              <div className="h-[1px] w-3 bg-[#997B4D]"></div>
              <span className="text-[0.5rem] tracking-[0.2em] text-[#997B4D] font-medium">PRE-OWNED LUXURY</span>
              <div className="h-[1px] w-3 bg-[#997B4D]"></div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5C5550]">
            <Link to="/products" className="hover:text-[#997B4D] transition">NEW</Link>
            <Link to="/products" className="hover:text-[#997B4D] transition">BEST</Link>
          </nav>
        </div>
        <div className="flex items-center gap-5 text-[#5C5550]">
          <button onClick={() => navigate('/selling')} className="hidden md:flex px-4 py-2 text-xs font-bold tracking-widest bg-[#997B4D] text-white rounded-sm hover:bg-[#8B7355] transition">
            내 명품 팔기
          </button>
          <button className="hover:text-[#997B4D] transition"><Search size={20} strokeWidth={1.5} /></button>
          <button className="hover:text-[#997B4D] transition relative">
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#997B4D] text-white text-[9px] flex items-center justify-center rounded-full">2</span>
          </button>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold tracking-widest hover:text-[#997B4D] transition uppercase"><LogOut size={16} /> LOGOUT</button>
          ) : (
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-xs font-bold tracking-widest hover:text-[#997B4D] transition uppercase"><User size={16} /> LOGIN</button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;