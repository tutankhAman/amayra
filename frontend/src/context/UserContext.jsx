import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../utils/api';
import toast from 'react-hot-toast';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuthStatus = async () => {
    try {
      const response = await apiClient.userService.getCurrentUser();
      if (response?.data?.data) {
        setUser(response.data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Redirect to login if accessing protected route without auth
  useEffect(() => {
    if (!loading && !user && location.pathname !== '/login' && location.pathname !== '/signup') {
      navigate('/login');
    }
  }, [user, loading, location, navigate]);

  const login = async (credentials) => {
    setAuthLoading(true);
    try {
      const response = await apiClient.userService.login(credentials);
      await checkAuthStatus(); // Recheck auth status after login
      toast.success('Logged in successfully');
      navigate('/');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (userData) => {
    setAuthLoading(true);
    try {
      const response = await apiClient.userService.register(userData);
      const newUser = response.data?.data;
      if (newUser) {
        setUser(newUser);
        toast.success('Account created successfully');
        navigate('/');
      }
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      await apiClient.userService.logout();
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Error logging out');
    } finally {
      setAuthLoading(false);
    }
  };

  const updateProfile = async (data) => {
    setAuthLoading(true);
    try {
      const response = await apiClient.userService.updateAccount(data);
      setUser(response.data.data);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      toast.success('Profile updated successfully');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

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

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
