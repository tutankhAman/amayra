// API configuration and services
import axios from 'axios';

// Check for auth token in cookies
const hasAuthCookie = () => {
  return document.cookie.includes('accessToken=');
};

// Create axios instance with default config
export const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add auth check for protected routes
api.interceptors.request.use(
  (config) => {
    const publicPaths = ['/users/login', '/users/register'];
    if (publicPaths.some(path => config.url?.includes(path))) return config;
    
    if (hasAuthCookie()) config.headers['has-auth'] = 'true';
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response || error.response.status !== 401) {
      console.error('API Error:', error.response?.data?.message || 'An error occurred');
    }
    return Promise.reject(error);
  }
);

// Base HTTP methods
const apiMethods = {
  get: (url, params) => api.get(url, { params }),
  post: (url, data) => api.post(url, data),
  put: (url, data) => api.put(url, data),
  del: (url) => api.delete(url)
};

const { get, post, put, del } = apiMethods;

// User authentication and profile management
export const userService = {
  register: async (userData) => {
    try {
      const response = await api.post('/users/register', {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
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

// Product CRUD operations
export const productService = {
  getAll: (params) => get('/product', params),
  getById: (id) => get(`/product/${id}`),
  search: (params) => get('/product/search', params),
  create: (formData) => post('/product/create-product', formData),
  update: (id, formData) => put(`/product/update/${id}`, formData),
  delete: (id) => del(`/product/delete/${id}`)
};

// Shopping cart management
export const cartService = {
  get: () => get('/cart'),
  add: (data) => post('/cart/add', {
    productId: data.productId,
    quantity: data.quantity,
    size: data.size
  }),
  update: (data) => put('/cart/update', {
    productId: data.productId,
    quantity: data.quantity,
    size: data.size
  }),
  remove: (params) => del(`/cart/delete`, {
    params: {
      productId: params.productId,
      size: params.size
    }
  }),
  clear: () => del('/cart/clear')
};

// Product reviews
export const reviewService = {
  get: (productId) => api.post('/reviews', { productId }),
  add: (data) => api.post('/reviews/add', data),
  update: (data) => api.put('/reviews/update', data),
  delete: (reviewId) => api.delete('/reviews/delete', { data: { reviewId } })
};

// Order processing
export const orderService = {
  create: (data) => post('/order/create', data),
  getUserOrders: () => get('/order/user-orders'),
  getById: (id) => get(`/order/${id}`),
  updateStatus: (orderId, data) => put(`/order/${orderId}/status`, data)
};

// Analytics and reporting
export const analyticsService = {
  getSales: () => get('/analytics'),
  getProduct: (productId) => post(`/analytics/product/${productId}`),
  getTopProducts: () => get('/analytics/top-products')
};

// Export all services
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