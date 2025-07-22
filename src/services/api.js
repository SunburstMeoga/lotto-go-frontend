import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除本地存储的认证信息
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-storage');
      // 重定向到登录页面
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API方法
export const authAPI = {
  // 登录
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 注册
  register: (userData) => api.post('/auth/register', userData),
  
  // 获取用户信息
  getProfile: () => api.get('/auth/profile'),
  
  // 更新用户信息
  updateProfile: (userData) => api.put('/auth/profile', userData),
  
  // 刷新token
  refreshToken: () => api.post('/auth/refresh'),
};

export const lotteryAPI = {
  // 获取彩票类型
  getLotteryTypes: () => api.get('/lottery/types'),
  
  // 获取开奖历史
  getDrawHistory: (type, page = 1, limit = 10) => 
    api.get(`/lottery/history/${type}?page=${page}&limit=${limit}`),
  
  // 购买彩票
  buyTicket: (ticketData) => api.post('/lottery/buy', ticketData),
  
  // 获取用户彩票
  getUserTickets: (page = 1, limit = 10) => 
    api.get(`/lottery/tickets?page=${page}&limit=${limit}`),
  
  // 检查中奖
  checkWinning: (ticketId) => api.get(`/lottery/check/${ticketId}`),
};

export default api;
