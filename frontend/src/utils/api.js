import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Keep this to allow cookies when supported
});

// Check for auth via multiple methods
const hasAuth = () => {
  // Check cookies first
  const hasCookie = document.cookie.includes('accessToken=');
  // Check localStorage as backup
  const hasLocalToken = !!localStorage.getItem('accessToken');
  
  return hasCookie || hasLocalToken;
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
    
    // Use localStorage token as backup when cookies aren't available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (hasAuth()) config.headers['has-auth'] = 'true';
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

// Token refresh mechanism
const refreshTokenIfNeeded = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/users/refresh-token`,
      { refreshToken: localStorage.getItem('refreshToken') },
      { withCredentials: true }
    );
    
    if (response.data?.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      if (response.data.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
      return response.data.data.accessToken;
    }
  } catch (error) {
    console.error("Failed to refresh token:", error);
    // Clear tokens and redirect to login if refresh fails
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
  return null;
};

// Base HTTP methods
const apiMethods = {
  get: async (url, params) => {
    try {
      return await api.get(url, { params });
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await refreshTokenIfNeeded();
        if (newToken) {
          return api.get(url, { params });
        }
      }
      throw error;
    }
  },
  post: async (url, data) => {
    try {
      return await api.post(url, data);
    } catch (error) {
      if (error.response?.status === 401 && !url.includes('/users/login') && !url.includes('/users/refresh-token')) {
        const newToken = await refreshTokenIfNeeded();
        if (newToken) {
          return api.post(url, data);
        }
      }
      throw error;
    }
  },
  put: async (url, data) => {
    try {
      return await api.put(url, data);
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await refreshTokenIfNeeded();
        if (newToken) {
          return api.put(url, data);
        }
      }
      throw error;
    }
  },
  patch: async (url, data) => {
    try {
      return await api.patch(url, data);
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await refreshTokenIfNeeded();
        if (newToken) {
          return api.patch(url, data);
        }
      }
      throw error;
    }
  },
  del: async (url) => {
    try {
      return await api.delete(url);
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await refreshTokenIfNeeded();
        if (newToken) {
          return api.delete(url);
        }
      }
      throw error;
    }
  }
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
  register: async (userData) => {
    const response = await apiMethods.post('/users/register', userData);
    if (response.data?.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    return response;
  },
  login: async (data) => {
    const response = await apiMethods.post('/users/login', data);
    if (response.data?.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    return response;
  },
  logout: async () => {
    const response = await apiMethods.post('/users/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return response;
  },
  refreshToken: async () => {
    const response = await apiMethods.post('/users/refresh-token');
    if (response.data?.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      if (response.data.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
    }
    return response;
  },
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