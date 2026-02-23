import client from './client.js';

export const getMyProfile = async () => {
  try {
    const response = await client.get('/mypage/profile');
    return response.data;
  } catch (error) {
    console.error('프로필 조회 실패:', error);
    throw error;
  }
};

export const getMySellingHistory = async () => {
  try {
    const response = await client.get('/mypage/selling');
    return response.data;
  } catch (error) {
    console.error('판매 내역 조회 실패:', error);
    throw error;
  }
};

export const getMyOrderHistory = async () => {
  try {
    const response = await client.get('/mypage/orders');
    return response.data;
  } catch (error) {
    console.error('구매 내역 조회 실패:', error);
    throw error;
  }
};