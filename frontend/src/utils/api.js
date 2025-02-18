import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies with requests
});

// Basic error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
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
  getProduct: (productId) => post(`/analytics/product/${productId}`)
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
