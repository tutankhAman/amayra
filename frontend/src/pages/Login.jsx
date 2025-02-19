import React, { useState } from 'react';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
  };

  return (
    <div className="flex justify-center items-center w-full min-h-screen py-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-[1200px] flex items-center">
        {/* Left side - Image */}
        <div className="hidden lg:block lg:w-[45%]">
          <div className="p-6">
            <img
              src="/src/assets/images/login-cover3.jpeg"
              alt="Login Cover"
              className="object-cover w-full rounded-xl "
            />
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-[55%] flex items-center justify-center px-8">
          <div className="max-w-md w-full">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Welcome back</h2>
              <p className="subheading text-gray-600">Please enter your details to sign in</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <span className="subheading absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <FiMail size={20} />
                  </span>
                  <input
                    type="email"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                    type="password"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
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
                <a href="#" className="subheading text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="group w-full bg-primary text-white py-3.5 rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium text-lg flex items-center justify-center gap-2"
              >
                Sign in
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
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