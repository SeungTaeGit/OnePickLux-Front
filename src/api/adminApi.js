import client from './client.js';

export const getAdminDashboard = async () => {
  try {
    const response = await client.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('대시보드 데이터 조회 실패:', error);
    throw error;
  }
};

export const getAdminProducts = async () => {
  try {
    const response = await client.get('/admin/products');
    return response.data;
  } catch (error) {
    console.error('관리자 상품 목록 조회 실패:', error);
    throw error;
  }
};

export const getAdminSellingRequests = async () => {
  try {
    const response = await client.get('/admin/selling-requests');
    return response.data;
  } catch (error) {
    console.error('매입/위탁 신청 목록 조회 실패:', error);
    throw error;
  }
};

export const updateSellingStatus = async (requestId, status) => {
  try {
    const response = await client.patch(`/admin/selling/${requestId}/status`, null, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    console.error('상태 변경 실패:', error);
    throw error;
  }
};

export const approveSellingRequest = async (requestId, approveData) => {
  try {
    const response = await client.post(`/admin/selling/${requestId}/approve`, approveData);
    return response.data;
  } catch (error) {
    console.error('승인 처리 실패:', error);
    throw error;
  }
};

export const updateAdminProduct = async (productId, updateData) => {
  try {
    const response = await client.patch(`/admin/products/${productId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('상품 수정 실패:', error);
    throw error;
  }
};

export const deleteAdminProduct = async (productId) => {
  try {
    const response = await client.delete(`/admin/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('상품 삭제 실패:', error);
    throw error;
  }
};