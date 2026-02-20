import client from './client';

export const login = async (email, password) => {
  try {
    const response = await client.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('로그인 실패:', error);
    throw error;
  }
};

export const signup = async (userData) => {
  try {
    const response = await client.post('/auth/signup', userData);
    return response.data;
  } catch (error) {
    console.error('회원가입 실패:', error);
    throw error;
  }
};