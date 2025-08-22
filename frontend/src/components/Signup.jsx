import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Signup = ({ onClose, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    country: '',
    agreeToTerms: false,
    newsletter: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Country to phone code mapping with max digits
  const countryPhoneCodes = {
    'Sri Lanka': { code: '+94', maxDigits: 9 },
    'India': { code: '+91', maxDigits: 10 },
    'United States': { code: '+1', maxDigits: 10 },
    'United Kingdom': { code: '+44', maxDigits: 10 },
    'Canada': { code: '+1', maxDigits: 10 },
    'Australia': { code: '+61', maxDigits: 9 },
    'Germany': { code: '+49', maxDigits: 11 },
    'France': { code: '+33', maxDigits: 9 },
    'Japan': { code: '+81', maxDigits: 10 },
    'China': { code: '+86', maxDigits: 11 },
    'Singapore': { code: '+65', maxDigits: 8 },
    'Malaysia': { code: '+60', maxDigits: 9 },
    'Thailand': { code: '+66', maxDigits: 9 },
    'Vietnam': { code: '+84', maxDigits: 9 },
    'Indonesia': { code: '+62', maxDigits: 9 },
    'Philippines': { code: '+63', maxDigits: 9 },
    'South Africa': { code: '+27', maxDigits: 9 },
    'Kenya': { code: '+254', maxDigits: 9 },
    'Tanzania': { code: '+255', maxDigits: 9 },
    'Other': { code: '+', maxDigits: 15 }
  };

  const countries = [
    'Sri Lanka', 'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
    'Germany', 'France', 'Japan', 'China', 'Singapore', 'Malaysia', 'Thailand',
    'Vietnam', 'Indonesia', 'Philippines', 'South Africa', 'Kenya', 'Tanzania',
    'Other'
  ];

  // Password strength validation
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const errors = [];
    
    if (password.length < minLength) {
      errors.push(t('signup.password.minLength', { minLength }));
    }
    if (!hasUpperCase) {
      errors.push(t('signup.password.uppercase'));
    }
    if (!hasLowerCase) {
      errors.push(t('signup.password.lowercase'));
    }
    if (!hasNumbers) {
      errors.push(t('signup.password.numbers'));
    }
    if (!hasSpecialChar) {
      errors.push(t('signup.password.specialChar'));
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('signup.validation.firstName.required');
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = t('signup.validation.firstName.minLength');
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('signup.validation.lastName.required');
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = t('signup.validation.lastName.minLength');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = t('signup.validation.email.required');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('signup.validation.email.invalid');
    }

    // Country validation
    if (!formData.country) {
      newErrors.country = t('signup.validation.country.required');
    }

    // Phone validation (only if country is selected)
    if (formData.country && formData.country !== 'Other') {
      const phoneData = countryPhoneCodes[formData.country];
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = t('signup.validation.phone.required');
      } else if (!/^\d+$/.test(formData.phoneNumber.trim())) {
        newErrors.phoneNumber = t('signup.validation.phone.numbersOnly');
      } else if (formData.phoneNumber.trim().length !== phoneData.maxDigits) {
        newErrors.phoneNumber = t('signup.validation.phone.digits', { digits: phoneData.maxDigits });
      }
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!formData.password) {
      newErrors.password = t('signup.validation.password.required');
    } else if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors;
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('signup.validation.confirmPassword.required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('signup.validation.confirmPassword.mismatch');
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = t('signup.validation.terms.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle phone number input - only allow numbers
    if (name === 'phoneNumber') {
      const numericValue = value.replace(/\D/g, ''); // Remove non-digits
      const phoneData = formData.country && countryPhoneCodes[formData.country];
      
      // Limit to max digits for the selected country
      if (phoneData && numericValue.length > phoneData.maxDigits) {
        return; // Don't update if exceeding max digits
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine country code with phone number
      const fullPhoneNumber = formData.country && formData.country !== 'Other' 
        ? countryPhoneCodes[formData.country].code + formData.phoneNumber.trim()
        : formData.phoneNumber.trim();
        
      const { token, user } = await authApi.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: fullPhoneNumber,
        country: formData.country,
        password: formData.password,
      });
      login(user, token);
      onClose();
      navigate('/');
    } catch (err) {
      const msg = err?.response?.data?.message || t('signup.error.general');
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!formData.password) return 'text-gray-400';
    const validation = validatePassword(formData.password);
    if (validation.isValid) return 'text-green-400';
    if (formData.password.length >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-8 w-full max-w-lg border border-white/20 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-abeze font-bold text-white mb-2">
            {t('signup.title')}
          </h2>
          <p className="text-gray-300 font-abeze">
            {t('signup.subtitle')}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label={t('common.close')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                {t('signup.form.firstName')} *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                  errors.firstName ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                }`}
                placeholder={t('signup.form.firstNamePlaceholder')}
              />
              {errors.firstName && (
                <p className="text-red-400 text-sm mt-1 font-abeze">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                {t('signup.form.lastName')} *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                  errors.lastName ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                }`}
                placeholder={t('signup.form.lastNamePlaceholder')}
              />
              {errors.lastName && (
                <p className="text-red-400 text-sm mt-1 font-abeze">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-white font-abeze font-medium mb-2">
              {t('signup.form.email')} *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                errors.email ? 'border-red-400' : 'border-white/20 focus:border-green-400'
              }`}
              placeholder={t('signup.form.emailPlaceholder')}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1 font-abeze">{errors.email}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-white font-abeze font-medium mb-2">
              {t('signup.form.country')} *
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze focus:outline-none transition-colors ${
                errors.country ? 'border-red-400' : 'border-white/20 focus:border-green-400'
              }`}
            >
              <option value="" className="bg-gray-800 text-white">{t('signup.form.countryPlaceholder')}</option>
              {countries.map((country, index) => (
                <option key={index} value={country} className="bg-gray-800 text-white">{country}</option>
              ))}
            </select>
            {errors.country && (
              <p className="text-red-400 text-sm mt-1 font-abeze">{errors.country}</p>
            )}
          </div>

          {/* Phone Number - moved after country */}
          {formData.country && (
            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                {t('signup.form.phone')} {formData.country !== 'Other' ? '*' : ''}
              </label>
              <div className="flex">
                {/* Country Code Display */}
                {formData.country !== 'Other' && (
                  <div className="bg-white/20 border border-white/20 rounded-l-lg px-4 py-3 text-white font-abeze font-medium min-w-[80px] flex items-center justify-center">
                    {countryPhoneCodes[formData.country].code}
                  </div>
                )}
                {/* Phone Number Input */}
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  maxLength={formData.country !== 'Other' ? countryPhoneCodes[formData.country].maxDigits : 15}
                  className={`flex-1 bg-white/10 border border-white/20 rounded-r-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                    formData.country === 'Other' ? 'rounded-lg' : ''
                  } ${
                    errors.phoneNumber ? 'border-red-400' : 'focus:border-green-400'
                  }`}
                  placeholder={formData.country !== 'Other' 
                    ? t('signup.form.phonePlaceholder', { digits: countryPhoneCodes[formData.country].maxDigits })
                    : t('signup.form.phonePlaceholderOther')
                  }
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-red-400 text-sm mt-1 font-abeze">{errors.phoneNumber}</p>
              )}
              {formData.country !== 'Other' && formData.phoneNumber && (
                <p className="text-gray-400 text-sm mt-1 font-abeze">
                  {formData.phoneNumber.length}/{countryPhoneCodes[formData.country].maxDigits} {t('signup.form.digits')}
                </p>
              )}
            </div>
          )}

          {/* Password Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                {t('signup.form.password')} *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors pr-12 ${
                    errors.password ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                  }`}
                  placeholder={t('signup.form.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
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
                <div className="mt-1">
                  {Array.isArray(errors.password) ? (
                    <ul className="text-red-400 text-sm font-abeze">
                      {errors.password.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-red-400 text-sm font-abeze">{errors.password}</p>
                  )}
                </div>
              )}
              {formData.password && !errors.password && (
                <p className={`text-sm mt-1 font-abeze ${getPasswordStrengthColor()}`}>
                  ✓ {t('signup.form.passwordStrong')}
                </p>
              )}
            </div>
            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                {t('signup.form.confirmPassword')} *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors pr-12 ${
                    errors.confirmPassword ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                  }`}
                  placeholder={t('signup.form.confirmPasswordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label={showConfirmPassword ? t('common.hidePassword') : t('common.showPassword')}
                >
                  {showConfirmPassword ? (
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
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1 font-abeze">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500 focus:ring-2 mt-1"
              />
              <span className="ml-2 text-gray-300 font-abeze text-sm">
                {t('signup.form.terms.agree')}{' '}
                <button type="button" className="text-green-400 hover:text-green-300">
                  {t('signup.form.terms.termsAndConditions')}
                </button>
                {' '}{t('signup.form.terms.and')}{' '}
                <button type="button" className="text-green-400 hover:text-green-300">
                  {t('signup.form.terms.privacyPolicy')}
                </button>
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="text-red-400 text-sm font-abeze">{errors.agreeToTerms}</p>
            )}
            <label className="flex items-start">
              <input
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleInputChange}
                className="w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500 focus:ring-2 mt-1"
              />
              <span className="ml-2 text-gray-300 font-abeze text-sm">
                {t('signup.form.newsletter')}
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-abeze font-bold transition-colors duration-300"
          >
            {isSubmitting ? t('signup.form.submitting') : t('signup.form.submit')}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-300 font-abeze">
              {t('signup.form.alreadyHaveAccount')}{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-green-400 hover:text-green-300 font-abeze font-medium transition-colors"
              >
                {t('signup.form.signInHere')}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup; 