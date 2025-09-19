import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const StaffLogin = ({ onClose, onSwitchToRegularLogin }) => {
  const navigate = useNavigate();
  const { staffLogin } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    setIsSubmitting(true);
    try {
      const { token, user } = await authApi.staffLogin({
        email: formData.email.trim(),
        password: formData.password,
      });
      
      staffLogin(user, token);
      onClose();
      
      // Redirect based on role - admins go to admin page, others to their specific dashboards
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'driver') {
        navigate('/driver-dashboard');
      } else if (user.role === 'tour_guide') {
        navigate('/tour-guide-dashboard');
      } else {
        navigate('/staff');
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Login failed';
      
      // Trigger shake animation
      triggerShake();
      
      // Set error messages based on the type of error
      if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('user')) {
        setErrors({ email: errorMessage });
      } else if (errorMessage.toLowerCase().includes('password')) {
        setErrors({ password: errorMessage });
      } else if (errorMessage.toLowerCase().includes('access denied')) {
        setErrors({ email: errorMessage });
      } else {
        // General error - show on both fields or as a general error
        setErrors({ 
          email: 'Invalid credentials',
          password: 'Invalid credentials'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-gray-900/95 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-white/20 transition-all duration-300 ${
        isShaking ? 'animate-shake' : ''
      }`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-abeze font-bold text-white mb-2">
            {t('staffLogin.title')}
          </h2>
          <p className="text-gray-300 font-abeze">
            {t('staffLogin.subtitle')}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-white font-abeze font-medium mb-2">
              {t('staffLogin.emailLabel')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                errors.email ? 'border-red-400' : 'border-white/20 focus:border-green-400'
              }`}
              placeholder={t('staffLogin.emailPlaceholder')}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1 font-abeze">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-white font-abeze font-medium mb-2">
              {t('staffLogin.passwordLabel')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors pr-12 ${
                  errors.password ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                }`}
                placeholder={t('staffLogin.passwordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1 font-abeze">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-abeze font-bold transition-colors duration-300"
          >
            {isSubmitting ? t('staffLogin.signingIn') : t('staffLogin.signInButton')}
          </button>

          {/* Switch to Regular Login */}
          <div className="text-center">
            <p className="text-gray-300 font-abeze">
              {t('staffLogin.customerQuestion')}{' '}
              <button
                type="button"
                onClick={onSwitchToRegularLogin}
                className="text-green-400 hover:text-green-300 font-abeze font-medium transition-colors"
              >
                {t('staffLogin.customerLoginLink')}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffLogin;
