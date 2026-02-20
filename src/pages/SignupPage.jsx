import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api/authApi.js';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', passwordConfirm: '', name: '', phone: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      await signup({ email: formData.email, password: formData.password, name: formData.name, phone: formData.phone });
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (err) {
      setError('회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FDFBF7] animate-fade-in py-20">
      <div className="w-full max-w-md bg-white p-10 border border-[#E5E0D8] shadow-xl rounded-sm">
        <div className="text-center mb-10"><h2 className="text-3xl font-serif text-[#2C2C2C] mb-2 tracking-widest">SIGN UP</h2></div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label className="block text-xs font-bold mb-2">NAME</label><input type="text" name="name" onChange={handleChange} className="w-full border p-3 text-sm focus:outline-none focus:border-[#997B4D]" required /></div>
          <div><label className="block text-xs font-bold mb-2">EMAIL</label><input type="email" name="email" onChange={handleChange} className="w-full border p-3 text-sm focus:outline-none focus:border-[#997B4D]" required /></div>
          <div><label className="block text-xs font-bold mb-2">PHONE</label><input type="text" name="phone" onChange={handleChange} className="w-full border p-3 text-sm focus:outline-none focus:border-[#997B4D]" /></div>
          <div><label className="block text-xs font-bold mb-2">PASSWORD</label><input type="password" name="password" onChange={handleChange} className="w-full border p-3 text-sm focus:outline-none focus:border-[#997B4D]" required /></div>
          <div><label className="block text-xs font-bold mb-2">CONFIRM PASSWORD</label><input type="password" name="passwordConfirm" onChange={handleChange} className="w-full border p-3 text-sm focus:outline-none focus:border-[#997B4D]" required /></div>
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <button type="submit" className="w-full bg-[#2C2C2C] text-white py-4 font-bold text-sm tracking-widest hover:bg-[#444] transition mt-4">CREATE ACCOUNT</button>
        </form>
        <div className="mt-6 text-center text-xs text-[#5C5550]">
          이미 계정이 있으신가요? <span onClick={() => navigate('/login')} className="font-bold ml-2 cursor-pointer text-[#997B4D] hover:underline">로그인</span>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;