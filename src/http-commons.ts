import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 자동 포함
});

// 응답 인터셉터 — Access Token 만료 시 자동 재발급
apiClient.interceptors.response.use(
  (response) => response, // 성공은 그냥 통과

  async (error) => {
    const originalRequest = error.config;

    // 401이고, 재시도한 적 없고, refresh 요청 자체가 아니면
    // (refresh가 401일 때 또 refresh를 호출하면 무한 루프가 되므로 제외)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/refresh')
    ) {
      originalRequest._retry = true; // 무한루프 방지

      try {
        // 쿠키가 자동으로 포함되므로 body 필요 없음
        await apiClient.post('/api/auth/refresh');

        // 원래 요청 재시도
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh Token도 만료 — /api/member/me는 비로그인 처리, 그 외는 로그인 페이지로 이동
        if (originalRequest.url !== '/api/member/me') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
