import client from './client.js';

// 매입/위탁 판매 신청
export const createSellingApplication = async (sellingData) => {
  try {
    const response = await client.post('/selling', sellingData);
    return response.data;
  } catch (error) {
    console.error('매입 신청 실패:', error);
    throw error;
  }
};