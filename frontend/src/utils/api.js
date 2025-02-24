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
      console.error('API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'An error occurred',
        url: error.config?.url
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

const { get, post, put, patch, del } = apiMethods;

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
  changePassword: (data) => {
    return api.patch('/users/change-password', {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword
    });
  },
  updateAccount: (data) => patch('/users/update-account', data),
  updateAvatar: (formData) => {
    return api.patch('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getWishlist: () => get('/users/wishlist'),
  addToWishlist: (productId) => post('/users/wishlist', { productId }),
  removeFromWishlist: (productId) => del(`/users/wishlist/${productId}`)
};

// Product CRUD operations
export const productService = {
  getAll: (params) => get('/product', params),
  getById: (id) => get(`/product/${id}`),
  search: (params) => get('/product/search', params),
  create: (formData) => {
    return api.post('/product/create-product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  update: (productId, formData) => {
    return api.put(`/product/update/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  delete: (productId) => del(`/product/delete/${productId}`)
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
  remove: ({ productId, size }) => del(`/cart/delete?productId=${productId}&size=${size}`),
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
  create: () => post('/order/create'),
  getUserOrders: () => get('/order/user-orders'),
  getById: (id) => get(`/order/${id}`),
  updateStatus: (orderId, data) => patch(`/order/${orderId}/status`, data), // Changed from put to patch
  cancelOrder: (orderId) => patch(`/order/${orderId}/cancel`),
  getAll: () => {
    console.log('Fetching all orders...');
    return get('/order/all').catch(error => {
      console.error('Error fetching orders:', error);
      throw error;
    });
  }
};

// Analytics and reporting
export const analyticsService = {
  getSales: (params) => get('/analytics', params),  // Added params for date range
  getProduct: (productId, params) => get(`/analytics/product/${productId}`, params), // Changed from POST to GET
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