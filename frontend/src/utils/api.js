import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Token management utilities
const TOKEN_KEY = 'authTokens';

const tokenStorage = {
  get: () => {
    try {
      return JSON.parse(localStorage.getItem(TOKEN_KEY));
    } catch (e) {
      return null;
    }
  },
  set: (tokens) => {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// Check for auth from either cookies or localStorage
const getAuthToken = () => {
  const hasToken = document.cookie.includes('accessToken=');
  if (hasToken) return true;
  
  const localTokens = tokenStorage.get();
  return !!localTokens?.accessToken;
};

// Add auth check for protected routes
api.interceptors.request.use(
  (config) => {
    // Set content type to multipart/form-data only for file uploads
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    const publicPaths = ['/users/login', '/users/register'];
    if (publicPaths.some(path => config.url?.includes(path))) return config;
    
    // Try localStorage tokens if cookies aren't present
    const localTokens = tokenStorage.get();
    if (localTokens?.accessToken) {
      config.headers['Authorization'] = `Bearer ${localTokens.accessToken}`;
    }
    
    if (getAuthToken()) config.headers['has-auth'] = 'true';
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handling
api.interceptors.response.use(
  response => response,
  error => {
    const errorDetails = {
      status: error.response?.status,
      message: error.response?.data?.message || error.response?.data,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    };

    // Log error details for debugging
    console.error('API Error Details:', errorDetails);

    // Handle 500 errors specially
    if (error.response?.status === 500) {
      return Promise.reject({
        ...error,
        message: 'Internal server error. Please try again later.'
      });
    }

    return Promise.reject(error);
  }
);

// Base HTTP methods
const apiMethods = {
  get: (url, params) => api.get(url, { params }),
  post: (url, data) => api.post(url, data),
  put: (url, data) => api.put(url, data),
  patch: (url, data) => api.patch(url, data),
  del: (url) => api.delete(url)
};

export const productService = {
  getAll: (params) => apiMethods.get('/product', params),
  getById: (id) => apiMethods.get(`/product/${id}`),
  search: (params) => apiMethods.get('/product/search', params),
  create: (formData) => apiMethods.post('/product/create-product', formData),
  update: (productId, formData) => apiMethods.put(`/product/update/${productId}`, formData),
  delete: (productId) => apiMethods.del(`/product/delete/${productId}`)
};

export const cartService = {
  get: () => apiMethods.get('/cart'),
  add: (data) => apiMethods.post('/cart/add', data),
  update: (data) => apiMethods.put('/cart/update', data),
  remove: ({ productId, size }) => apiMethods.del(`/cart/delete?productId=${productId}&size=${size}`),
  clear: () => apiMethods.del('/cart/clear')
};

export const reviewService = {
  get: (productId) => apiMethods.post('/reviews', { productId }),
  add: (data) => apiMethods.post('/reviews/add', data),
  update: (data) => apiMethods.put('/reviews/update', data),
  delete: (reviewId) => apiMethods.del(`/reviews/delete/${reviewId}`)
};

export const orderService = {
  create: () => apiMethods.post('/order/create'),
  getUserOrders: () => apiMethods.get('/order/user-orders'),
  getById: (id) => apiMethods.get(`/order/${id}`),
  updateStatus: (orderId, data) => apiMethods.patch(`/order/${orderId}/status`, data),
  cancelOrder: (orderId) => apiMethods.patch(`/order/${orderId}/cancel`),
  getAll: () => apiMethods.get('/order/all')
};

export const analyticsService = {
  getSales: (params) => apiMethods.get('/analytics', params),
  getProduct: (productId, params) => apiMethods.get(`/analytics/product/${productId}`, params),
  getTopProducts: () => apiMethods.get('/analytics/top-products')
};

export const userService = {
  register: (userData) => apiMethods.post('/users/register', userData),
  login: async (data) => {
    const response = await apiMethods.post('/users/login', data);
    if (response.data?.data?.accessToken) {
      tokenStorage.set({
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken
      });
    }
    return response;
  },
  logout: async () => {
    const response = await apiMethods.post('/users/logout');
    tokenStorage.clear();
    return response;
  },
  refreshToken: () => apiMethods.post('/users/refresh-token'),
  getCurrentUser: () => apiMethods.get('/users/current-user'),
  changePassword: (data) => apiMethods.patch('/users/change-password', data),
  updateAccount: (data) => apiMethods.patch('/users/update-account', data),
  updateAvatar: (formData) => apiMethods.patch('/users/avatar', formData),
  getWishlist: () => apiMethods.get('/users/wishlist'),
  addToWishlist: (productId) => apiMethods.post('/users/wishlist', { productId }),
  removeFromWishlist: (productId) => apiMethods.del(`/users/wishlist/${productId}`)
};

// Export all services
export default {
  api,
  userService,
  productService,
  cartService,
  reviewService,
  orderService,
  analyticsService
};