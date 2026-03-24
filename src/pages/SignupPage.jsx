import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api/authApi.js';

const SignupPage = () => {
  const navigate = useNavigate();
  // 💡 [수정] formData 상태에 gender(기본값 UNKNOWN)와 birthDate 추가
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
    gender: 'UNKNOWN',
    birthDate: ''
  });
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
      // 💡 [수정] 백엔드 SignupRequest DTO에 맞춰 gender와 birthDate를 함께 전송합니다.
      // 빈 문자열("")이 백엔드로 가면 LocalDate 파싱 에러가 날 수 있으므로, 값이 없으면 null로 보냅니다.
      await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        birthDate: formData.birthDate || null
      });

      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FDFBF7] animate-fade-in py-20 font-sans">
      <div className="w-full max-w-md bg-white p-10 border border-[#E5E0D8] shadow-xl rounded-sm">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif text-[#2C2C2C] mb-2 tracking-widest">SIGN UP</h2>
          <p className="text-xs text-[#888] tracking-widest uppercase">원픽럭스의 프리미엄 회원이 되어보세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#5C5550] mb-2">NAME <span className="text-red-500">*</span></label>
            <input type="text" name="name" onChange={handleChange} className="w-full border border-[#E5E0D8] p-3 text-sm focus:outline-none focus:border-[#997B4D] bg-[#FAFAFA]" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#5C5550] mb-2">EMAIL <span className="text-red-500">*</span></label>
            <input type="email" name="email" onChange={handleChange} className="w-full border border-[#E5E0D8] p-3 text-sm focus:outline-none focus:border-[#997B4D] bg-[#FAFAFA]" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 💡 [추가] 성별 선택 (버튼 형태의 고급스러운 UI) */}
            <div>
              <label className="block text-xs font-bold text-[#5C5550] mb-2">GENDER</label>
              <div className="flex gap-2">
                {[
                  { value: 'MALE', label: '남성' },
                  { value: 'FEMALE', label: '여성' },
                  { value: 'UNKNOWN', label: '선택안함' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: option.value })}
                    className={`flex-1 py-3 text-[10px] font-bold transition-colors rounded-sm border ${
                      formData.gender === option.value
                        ? 'border-[#2C2C2C] bg-[#2C2C2C] text-white'
                        : 'border-[#E5E0D8] bg-[#FAFAFA] text-[#888] hover:border-[#997B4D]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 💡 [추가] 생년월일 입력 */}
            <div>
              <label className="block text-xs font-bold text-[#5C5550] mb-2">BIRTH DATE</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full border border-[#E5E0D8] p-3 text-sm focus:outline-none focus:border-[#997B4D] bg-[#FAFAFA] text-[#5C5550]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5C5550] mb-2">PHONE</label>
            <input type="text" name="phone" onChange={handleChange} placeholder="010-0000-0000" className="w-full border border-[#E5E0D8] p-3 text-sm focus:outline-none focus:border-[#997B4D] bg-[#FAFAFA]" />
          </div>

          <div className="pt-4 border-t border-[#E5E0D8]">
            <label className="block text-xs font-bold text-[#5C5550] mb-2">PASSWORD <span className="text-red-500">*</span></label>
            <input type="password" name="password" onChange={handleChange} className="w-full border border-[#E5E0D8] p-3 text-sm focus:outline-none focus:border-[#997B4D] bg-[#FAFAFA]" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#5C5550] mb-2">CONFIRM PASSWORD <span className="text-red-500">*</span></label>
            <input type="password" name="passwordConfirm" onChange={handleChange} className="w-full border border-[#E5E0D8] p-3 text-sm focus:outline-none focus:border-[#997B4D] bg-[#FAFAFA]" required />
          </div>

          {error && <p className="text-xs text-red-500 text-center font-bold bg-red-50 py-2">{error}</p>}

          <button type="submit" className="w-full bg-[#2C2C2C] text-white py-4 font-bold text-sm tracking-widest hover:bg-[#444] transition mt-4 shadow-lg">
            CREATE ACCOUNT
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[#5C5550]">
          이미 계정이 있으신가요? <span onClick={() => navigate('/login')} className="font-bold ml-2 cursor-pointer text-[#997B4D] hover:underline">로그인</span>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;