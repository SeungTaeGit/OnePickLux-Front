import axios from 'axios';

// 1. 기본 API 클라이언트(axios) 세팅
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // 스프링 부트 서버 주소
  headers: {
    'Content-Type': 'application/json',
  },
});

// 💡 [핵심 버그 픽스!] 인터셉터(Interceptor) 설정
// 프론트엔드가 백엔드에 API 요청을 보내기 직전에 가로채서,
// 로컬 스토리지에 토큰이 있으면 무조건 헤더(Authorization)에 넣어서 보냅니다!
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // 로그인 시 저장해둔 토큰 꺼내기
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // 헤더에 장착!
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 상품 목록 조회 (GET) - 이제 자동으로 토큰이 딸려갑니다.
export const getProducts = async (params) => {
  const response = await apiClient.get('/products', { params });
  return response.data;
};

// 상품 상세 조회 (GET) - 이제 자동으로 토큰이 딸려갑니다.
export const getProductDetail = async (id) => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};

// (필요 시) 상품 등록, 수정 등 다른 API들도 아래에 계속 추가하시면 됩니다.