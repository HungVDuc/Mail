import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Cờ để ngăn nhiều request gọi refresh token cùng lúc
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
};

// Interceptor response để xử lý lỗi 401
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    // Trường hợp đang login sai thông tin (không có _retry flag) → cho nó tự rơi vào catch ở component
    if (
      err.response?.status === 401 &&
      originalRequest.url.includes("/auth/login")
    ) {
      return Promise.reject(err); // ⬅️ Để LoginPage xử lý
    }

    // Nếu lỗi là 401 và chưa thử refresh
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Nếu đang refresh thì chờ kết quả
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(API(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data.data.accessToken;
        localStorage.setItem("token", newToken);

        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return API(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        // Nếu fail thì xoá token và reload (hoặc điều hướng login)
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    if (err.response?.status === 401) {
      console.warn("Token hết hạn hoặc không hợp lệ");
    }

    return Promise.reject(err);
  }
);

export default API;
