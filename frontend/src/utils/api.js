import axios from 'axios';

// Helper to check if auth cookie exists
const hasAuthCookie = () => {
  return document.cookie.includes('accessToken=');
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Simple request interceptor to check auth status
api.interceptors.request.use(
  (config) => {
    // Skip auth check for auth-related endpoints
    if (config.url?.includes('login') || config.url?.includes('register')) {
      return config;
    }
    
    // Auth check header for protected routes
    if (hasAuthCookie()) {
      config.headers['has-auth'] = 'true';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Remove all interceptors and let the UserContext handle auth
api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response || error.response.status !== 401) {
      console.error('API Error:', error.response?.data?.message || 'An error occurred');
    }
    return Promise.reject(error);
  }
);

// Base API methods - define once
const apiMethods = {
  get: (url, params) => api.get(url, { params }),
  post: (url, data) => api.post(url, data),
  put: (url, data) => api.put(url, data),
  del: (url) => api.delete(url)
};

// Destructure methods for services to use
const { get, post, put, del } = apiMethods;

// API Services
export const userService = {
  register: (formData) => post('/users/register', formData),
  login: (data) => post('/users/login', data),
  logout: () => post('/users/logout'),
  refreshToken: () => post('/users/refresh-token'),
  getCurrentUser: () => get('/users/current-user'),
  changePassword: (data) => put('/users/change-password', data),
  updateAccount: (data) => put('/users/update-account', data),
  updateAvatar: (formData) => put('/users/avatar', formData),
  getWishlist: () => get('/users/wishlist'),
  addToWishlist: (data) => post('/users/wishlist', data),
  removeFromWishlist: (data) => del('/users/wishlist', data)
};

export const productService = {
  getAll: (params) => get('/product', params),
  getById: (id) => get(`/product/${id}`),
  search: (params) => get('/product/search', params),
  create: (formData) => post('/product/create-product', formData),
  update: (id, formData) => put(`/product/update/${id}`, formData),
  delete: (id) => del(`/product/delete/${id}`)
};

export const cartService = {
  get: () => get('/cart'),
  add: (data) => post('/cart/add', data),
  update: (data) => put('/cart/update', data),
  remove: (data) => del('/cart/delete', data)
};

export const reviewService = {
  get: () => get('/reviews'),
  add: (data) => post('/reviews/add', data),
  update: (data) => put('/reviews/update', data),
  delete: () => del('/reviews/delete')
};

export const orderService = {
  create: (data) => post('/order/create', data),
  getUserOrders: () => get('/order/user-orders'),
  getById: (id) => get(`/order/${id}`),
  updateStatus: (orderId, data) => put(`/order/${orderId}/status`, data)
};

export const analyticsService = {
  getSales: () => get('/analytics'),
  getProduct: (productId) => post(`/analytics/product/${productId}`),
  getTopProducts: () => get('/analytics/top-products')
};

// Export everything as a default object
export default {
  ...apiMethods,
  api,
  userService,
  productService,
  cartService,
  reviewService,
  orderService,
  analyticsService
};
