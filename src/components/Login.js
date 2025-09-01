import React, { useState } from 'react';
import { getIcon, LoadingSpinner } from '../utils/icons';

const Login = ({ onLogin, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login/registration
      const userData = {
        email: formData.email,
        firstName: formData.firstName || 'User',
        lastName: formData.lastName || '',
        isAuthenticated: true
      };
      
      onLogin(userData);
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-1">
            {isLogin ? 'Sign in to your account' : 'Join Ask4Rent today'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {getIcon('user', 'sm', 'muted')}
                  </div>
                  <input
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors ${
                      errors.firstName ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {getIcon('user', 'sm', 'muted')}
                  </div>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors ${
                      errors.lastName ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getIcon('mail', 'sm', 'muted')}
              </div>
              <input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors ${
                  errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getIcon('lock', 'sm', 'muted')}
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-colors ${
                  errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? getIcon('eyeOff', 'sm', 'muted') : getIcon('eye', 'sm', 'muted')}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {getIcon('lock', 'sm', 'muted')}
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors ${
                    errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="text-white" />
                <span>Please wait...</span>
              </>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6 text-center">
          <p className="text-gray-600 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setFormData({
                  email: '',
                  password: '',
                  confirmPassword: '',
                  firstName: '',
                  lastName: ''
                });
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;