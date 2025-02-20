// User authentication context and provider
import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../utils/api';
import toast from 'react-hot-toast';

const UserContext = createContext();

// Manages user authentication state and operations
export const UserProvider = ({ children }) => {
  // Auth states
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch current user data
  const checkAuthStatus = async () => {
    try {
      const response = await apiClient.userService.getCurrentUser();
      setUser(response?.data?.data?.user || null);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Protect private routes
  useEffect(() => {
    const publicRoutes = ['/login', '/signup', '/', '/shop'];
    if (!loading && !user && !publicRoutes.includes(location.pathname)) {
      navigate('/login');
    }
  }, [user, loading, location.pathname]);

  // Handle user login
  const login = async (credentials) => {
    setAuthLoading(true);
    try {
      await apiClient.userService.login(credentials);
      await checkAuthStatus();
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle user registration
  const signup = async (userData) => {
    setAuthLoading(true);
    try {
      // Validate required fields before making API call
      if (!userData.email) {
        throw new Error('Email is required');
      }
      
      const response = await apiClient.userService.register({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password
      });
      
      if (response?.data?.data?.user) {
        setUser(response.data.data.user);
        return response.data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle user logout
  const logout = async () => {
    setAuthLoading(true);
    try {
      await apiClient.userService.logout();
      setUser(null);
      // Clear auth cookies
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Error logging out');
    } finally {
      setAuthLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data) => {
    setAuthLoading(true);
    try {
      const response = await apiClient.userService.updateAccount(data);
      setUser(response?.data?.data || null);
      toast.success('Profile updated successfully');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    authLoading,
    login,
    logout,
    signup,
    updateProfile,
    checkAuthStatus
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook for accessing user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};