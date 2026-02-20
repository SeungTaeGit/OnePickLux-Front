import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authApi.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await login(formData.email, formData.password);
      if (response.status === 'OK' && response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        alert('로그인되었습니다.');
        navigate('/');
      } else {
        setError('로그인에 실패했습니다. 정보를 확인해주세요.');
      }
    } catch (err) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FDFBF7] animate-fade-in">
      <div className="w-full max-w-md bg-white p-10 border border-[#E5E0D8] shadow-xl rounded-sm">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif text-[#2C2C2C] mb-2 tracking-widest">LOGIN</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div><label className="block text-xs font-bold text-[#5C5550] mb-2">EMAIL</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-[#E5E0D8] p-3 text-sm focus:outline-none focus:border-[#997B4D] bg-[#FAFAFA]" required /></div>
          <div><label className="block text-xs font-bold text-[#5C5550] mb-2">PASSWORD</label><input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border border-[#E5E0D8] p-3 text-sm focus:outline-none focus:border-[#997B4D] bg-[#FAFAFA]" required /></div>
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <button type="submit" className="w-full bg-[#2C2C2C] text-white py-4 font-bold text-sm tracking-widest hover:bg-[#444] transition shadow-lg">SIGN IN</button>
        </form>
        <div className="mt-8 text-center text-xs text-[#5C5550]">
          아직 회원이 아니신가요? <span onClick={() => navigate('/signup')} className="font-bold ml-2 cursor-pointer text-[#997B4D] hover:underline">회원가입</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;