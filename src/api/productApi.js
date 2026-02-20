import client from './client';

export const getProducts = async (params) => {
  try {
    const response = await client.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('상품 목록 조회 실패:', error);
    throw error;
  }
};

export const getProductDetail = async (productId) => {
  try {
    const response = await client.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('상품 상세 조회 실패:', error);
    throw error;
  }
};