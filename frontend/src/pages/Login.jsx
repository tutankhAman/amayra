import React, { useState, useEffect } from 'react';
import { FiPhone, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { useUser } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, authLoading, user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    // Only redirect if user is logged in and we're not coming from a protected route
    if (user && !location.state?.from) {
      navigate('/');
    }
  }, [user, navigate, location]);

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;  // Indian phone number format
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setFormData({ ...formData, phone: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Validation check
    if (!validatePhone(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(formData);
      
      // After successful login, redirect to the originally attempted URL or home
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (error) {
      // Error is handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent form submission while loading
  const isLoading = authLoading || isSubmitting;

  return (
    <div className="relative flex justify-center items-center w-full min-h-screen py-8 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Background - Only visible on mobile */}
      <div className="absolute inset-0 lg:hidden">
        <div 
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: `url('https://res.cloudinary.com/dh0xbfq7w/image/upload/f_auto,q_auto/v1/website%20assets/nmveob5vmr7fvfsg6bwv')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 " />
        </div>
      </div>

      <div className="relative w-full max-w-[1200px] flex items-center">
        {/* Left side - Image (Desktop only) */}
        <div className="hidden lg:block lg:w-[45%]">
          <div className="p-6">
            <img
              src="https://res.cloudinary.com/dh0xbfq7w/image/upload/f_auto,q_auto/v1/website%20assets/nmveob5vmr7fvfsg6bwv"
              alt="Login Cover"
              className="object-cover w-full rounded-xl"
            />
          </div>
        </div>

        {/* Right side - Form */}
        <div className="relative z-10 w-full lg:w-[55%] flex items-center justify-center px-8">
          <div className="max-w-md w-full lg:bg-transparent lg:shadow-none 
            backdrop-blur-md bg-white/80 rounded-2xl shadow-xl border border-white/40 lg:border-0 p-8 lg:p-0">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Welcome back</h2>
              <p className="subheading text-gray-600">Please enter your details to sign in</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="subheading absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <FiPhone size={20} />
                  </span>
                  <input
                    type="tel"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="subheading block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <FiLock size={20} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary/50"
                    id="remember"
                  />
                  <label htmlFor="remember" className="subheading ml-2 text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
                {/* <a href="#" className="subheading text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                  Forgot password?
                </a> */}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`group w-full bg-primary text-white py-3.5 rounded-xl transition-all duration-200 font-medium text-lg flex items-center justify-center gap-2 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90'
                }`}
              >
                {isLoading ? 'Please wait...' : 'Sign in'}
                {!isLoading && <FiArrowRight className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <p className="subheading mt-8 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;