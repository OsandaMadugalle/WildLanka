import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

import { api } from '../services/api';

const EditProfileModal = ({ onClose, user }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  // Staff fields for guide profile
  const isGuide = user?.role === 'tour_guide';
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
  
  // Extract phone number without country code for display
  const extractPhoneNumber = (fullPhone, country) => {
    if (!fullPhone) return '';
    if (!country || !countryPhoneCodes[country]) return fullPhone;
    const code = countryPhoneCodes[country].code;
    if (fullPhone.startsWith(code)) {
      return fullPhone.slice(code.length);
    }
    // fallback: if starts with + and >8 digits, try to remove first 3-4 digits
    if (/^\+\d{10,}$/.test(fullPhone)) return fullPhone.slice(3);
    return fullPhone;
  };

  // Store the original phone from backend for reliable extraction
  const [originalPhone, setOriginalPhone] = useState(user?.phone || '');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    country: '',
    phone: '',
    role: user?.role || 'tour_guide',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    licenseNumber: user?.licenseNumber || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  // Fetch latest guide data from backend and prefill form
  // Helper to guess country from phone number
  const guessCountryFromPhone = (phone) => {
    if (!phone) return '';
    for (const [country, { code }] of Object.entries(countryPhoneCodes)) {
      if (phone.startsWith(code)) return country;
    }
    return 'Other';
  };

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const { data } = await api.get(`/api/staff/${user.id || user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const country = guessCountryFromPhone(data.phone);
        setOriginalPhone(data.phone || '');
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          country,
          phone: extractPhoneNumber(data.phone, country),
          role: data.role || 'tour_guide',
          specialization: data.specialization || '',
          experience: data.experience !== undefined && data.experience !== null ? String(data.experience) : '',
          licenseNumber: data.licenseNumber || '',
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } catch (err) {
        const country = guessCountryFromPhone(user?.phone);
        setOriginalPhone(user?.phone || '');
        setFormData({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          country,
          phone: extractPhoneNumber(user?.phone, country),
          role: user?.role || 'tour_guide',
          specialization: user?.specialization || '',
          experience: user?.experience !== undefined && user?.experience !== null ? String(user?.experience) : '',
          licenseNumber: user?.licenseNumber || '',
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      }
    };
    fetchGuide();
  }, [user]);

  // When country changes, re-extract phone number from original user.phone
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'country') {
      // When country changes, re-extract phone from original backend value
      setFormData(prev => ({
        ...prev,
        country: value,
        phone: extractPhoneNumber(originalPhone, value)
      }));
      if (errors['country']) {
        setErrors(prev => ({ ...prev, country: null }));
      }
      return;
    }
    // Handle phone number input - only allow numbers
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      const phoneData = formData.country && countryPhoneCodes[formData.country];
      if (phoneData && numericValue.length > phoneData.maxDigits) {
        return;
      }
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showPictureSuccessMessage, setShowPictureSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = useRef(null);

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
      errors.push(t('editProfile.validation.passwordRequirements.minLength', { length: minLength }));
    }
    if (!hasUpperCase) {
      errors.push(t('editProfile.validation.passwordRequirements.uppercase'));
    }
    if (!hasLowerCase) {
      errors.push(t('editProfile.validation.passwordRequirements.lowercase'));
    }
    if (!hasNumbers) {
      errors.push(t('editProfile.validation.passwordRequirements.number'));
    }
    if (!hasSpecialChar) {
      errors.push(t('editProfile.validation.passwordRequirements.specialChar'));
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const getPasswordStrengthColor = () => {
    if (!formData.newPassword) return 'text-gray-400';
    const validation = validatePassword(formData.newPassword);
    if (validation.isValid) return 'text-green-400';
    if (formData.newPassword.length >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t('editProfile.fileValidation.imageOnly'));
      return;
    }
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('editProfile.fileValidation.sizeLimit'));
      return;
    }
    setProfilePicture(file);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('editProfile.validation.firstNameRequired');
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = t('editProfile.validation.firstNameMinLength');
    }
    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('editProfile.validation.lastNameRequired');
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = t('editProfile.validation.lastNameMinLength');
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = t('editProfile.validation.emailRequired');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('editProfile.validation.emailInvalid');
    }
    // Phone validation (basic, since country is removed)
    if (!formData.phone.trim()) {
      newErrors.phone = t('editProfile.validation.phoneRequired');
    } else if (!/^\d+$/.test(formData.phone.trim())) {
      newErrors.phone = t('editProfile.validation.phoneNumbersOnly');
    }
    // Staff/guide fields validation
    if (isGuide) {
      if (!formData.specialization.trim()) {
        newErrors.specialization = 'Specialization is required';
      }
      if (!formData.experience.trim()) {
        newErrors.experience = 'Experience is required';
      } else if (isNaN(formData.experience) || Number(formData.experience) < 0) {
        newErrors.experience = 'Experience must be a positive number';
      }
      if (!formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'License number is required';
      }
    }
    // Password validation (only if new password is provided)
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = t('editProfile.validation.currentPasswordRequired');
      }
      const passwordValidation = validatePassword(formData.newPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = passwordValidation.errors;
      }
      if (!formData.confirmNewPassword) {
        newErrors.confirmNewPassword = t('editProfile.validation.confirmPasswordRequired');
      } else if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword = t('editProfile.validation.passwordsDoNotMatch');
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // (removed duplicate handleInputChange, now defined above)

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      // Combine country code and phone for backend
      let fullPhone = formData.phone.trim();
      if (formData.country && countryPhoneCodes[formData.country]) {
        const code = countryPhoneCodes[formData.country].code;
        // Avoid double code if user types it in phone
        if (!fullPhone.startsWith(code.replace('+', ''))) {
          fullPhone = code + fullPhone;
        } else {
          fullPhone = '+' + fullPhone;
        }
      } else if (!fullPhone.startsWith('+')) {
        fullPhone = '+' + fullPhone;
      }
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: fullPhone,
      };
      // Add staff/guide fields if guide
      if (isGuide) {
        payload.role = formData.role;
        payload.specialization = formData.specialization;
        payload.experience = formData.experience;
        payload.licenseNumber = formData.licenseNumber;
      }
      // Add password fields if new password is provided
      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }
      // Profile picture upload (if changed)
      if (profilePicture) {
        const formDataFile = new FormData();
        formDataFile.append('profilePicture', profilePicture);
        await authApi.uploadProfilePicture(formDataFile);
      }
      const { user: updatedUser } = await authApi.updateProfile(payload);
  // Save updated user to context and localStorage
  login(updatedUser, localStorage.getItem('auth_token'));
  // Force reload of window to ensure dashboard and modal get fresh user data
  // (workaround for stale user prop issue)
      const message = formData.newPassword ? t('editProfile.success.profileAndPasswordUpdated') : t('editProfile.success.profileUpdated');
      setSuccessMessage(message);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        onClose();
        window.location.reload(); // Force full reload to get fresh user data everywhere
      }, 3000);
    } catch (err) {
      const msg = err?.response?.data?.message || t('editProfile.fileValidation.uploadFailed');
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-lg border border-gray-700/50 max-h-[90vh] overflow-y-auto relative shadow-2xl">
        

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-abeze font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 mb-2">
            {t('editProfile.title')}
          </h2>
          <p className="text-slate-300 font-abeze">
            {t('editProfile.subtitle')}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-all duration-300 hover:rotate-90 bg-white/5 hover:bg-white/10 rounded-full p-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

                 {/* Edit Profile Form */}
         <form onSubmit={handleSubmit} className="space-y-6">
                       {/* Profile Picture Section */}
            <div className="text-center mb-6">
              {/* Profile Picture Success Message */}
              {showPictureSuccessMessage && (
                <div className="mb-4 p-3 bg-green-600/20 border border-green-400/30 rounded-lg">
                  <div className="flex items-center justify-center text-green-400">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-abeze text-sm">{t('editProfile.profilePicture.uploadSuccess')}</span>
                  </div>
                </div>
              )}
              
              <div 
                className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center cursor-pointer relative overflow-hidden border-4 border-gradient-to-r from-emerald-400 to-green-500 hover:border-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
                onClick={handleProfilePictureClick}
              >
               {user?.profilePicture?.url ? (
                 <img 
                   src={user.profilePicture.url} 
                   alt={t('userAccount.common.profileImageAlt')} 
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <div className="w-full h-full bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center">
                   <span className="text-xl font-abeze font-bold text-white">
                     {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || t('userAccount.common.defaultUser').charAt(0).toUpperCase()}
                   </span>
                 </div>
               )}
               
               {/* Upload overlay */}
               <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                 <div className="text-center">
                   {isUploadingPicture ? (
                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                   ) : (
                     <svg className="w-5 h-5 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                   )}
                   <p className="text-xs text-white mt-1 font-abeze">{t('editProfile.profilePicture.changePhoto')}</p>
                 </div>
               </div>
             </div>
             
             {/* Hidden file input */}
             <input
               ref={fileInputRef}
               type="file"
               accept="image/*"
               onChange={handleFileChange}
               className="hidden"
             />
             
             <p className="text-sm text-slate-300 font-abeze">
               {t('editProfile.profilePicture.clickToUpload')}
             </p>
           </div>

          {/* Name Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                {t('editProfile.form.firstName')}
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full bg-gradient-to-r from-white/5 to-white/10 border rounded-2xl px-6 py-4 text-white font-abeze placeholder-slate-400 focus:outline-none transition-all duration-300 ${
                  errors.firstName ? 'border-red-400 focus:border-red-500' : 'border-white/10 focus:border-emerald-400 hover:border-emerald-400/50'
                }`}
                placeholder={t('editProfile.form.firstNamePlaceholder')}
              />
              {errors.firstName && (
                <p className="text-red-400 text-sm mt-1 font-abeze">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                {t('editProfile.form.lastName')}
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full bg-gradient-to-r from-white/5 to-white/10 border rounded-2xl px-6 py-4 text-white font-abeze placeholder-slate-400 focus:outline-none transition-all duration-300 ${
                  errors.lastName ? 'border-red-400 focus:border-red-500' : 'border-white/10 focus:border-emerald-400 hover:border-emerald-400/50'
                }`}
                placeholder={t('editProfile.form.lastNamePlaceholder')}
              />
              {errors.lastName && (
                <p className="text-red-400 text-sm mt-1 font-abeze">{errors.lastName}</p>
              )}
            </div>
          </div>
          {/* Guide/Staff Fields */}
          {isGuide && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className={`w-full bg-gradient-to-r from-white/5 to-white/10 border rounded-2xl px-6 py-4 text-white font-abeze placeholder-slate-400 focus:outline-none transition-all duration-300 ${errors.specialization ? 'border-red-400 focus:border-red-500' : 'border-white/10 focus:border-emerald-400 hover:border-emerald-400/50'}`}
                    placeholder="e.g. Wildlife, Birdwatching"
                  />
                  {errors.specialization && <p className="text-red-400 text-sm mt-1 font-abeze">{errors.specialization}</p>}
                </div>
                <div>
                  <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">Experience (years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className={`w-full bg-gradient-to-r from-white/5 to-white/10 border rounded-2xl px-6 py-4 text-white font-abeze placeholder-slate-400 focus:outline-none transition-all duration-300 ${errors.experience ? 'border-red-400 focus:border-red-500' : 'border-white/10 focus:border-emerald-400 hover:border-emerald-400/50'}`}
                    placeholder="e.g. 5"
                  />
                  {errors.experience && <p className="text-red-400 text-sm mt-1 font-abeze">{errors.experience}</p>}
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className={`w-full bg-gradient-to-r from-white/5 to-white/10 border rounded-2xl px-6 py-4 text-white font-abeze placeholder-slate-400 focus:outline-none transition-all duration-300 ${errors.licenseNumber ? 'border-red-400 focus:border-red-500' : 'border-white/10 focus:border-emerald-400 hover:border-emerald-400/50'}`}
                  placeholder="e.g. TG-12345"
                />
                {errors.licenseNumber && <p className="text-red-400 text-sm mt-1 font-abeze">{errors.licenseNumber}</p>}
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
              {t('editProfile.form.email')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full bg-gradient-to-r from-white/5 to-white/10 border rounded-2xl px-6 py-4 text-white font-abeze placeholder-slate-400 focus:outline-none transition-all duration-300 ${
                errors.email ? 'border-red-400 focus:border-red-500' : 'border-white/10 focus:border-emerald-400 hover:border-emerald-400/50'
              }`}
              placeholder={t('editProfile.form.emailPlaceholder')}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1 font-abeze">{errors.email}</p>
            )}
          </div>

          {/* Country and Phone Number */}
          <div className="grid grid-cols-3 gap-4 items-end">
            <div className="col-span-1">
              <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                {t('editProfile.form.country') || 'Country'}
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className={`w-full bg-gradient-to-r from-white/5 to-white/10 border rounded-2xl px-4 py-4 text-white font-abeze focus:outline-none transition-all duration-300 ${errors.country ? 'border-red-400 focus:border-red-500' : 'border-white/10 focus:border-emerald-400 hover:border-emerald-400/50'}`}
              >
                <option value="">Select</option>
                {countries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              {errors.country && (
                <p className="text-red-400 text-sm mt-1 font-abeze">{errors.country}</p>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                {t('editProfile.form.phone')}
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-2xl bg-white/10 border border-r-0 border-white/10 text-white font-abeze">
                  {formData.country && countryPhoneCodes[formData.country] ? countryPhoneCodes[formData.country].code : '+'}
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full bg-gradient-to-r from-white/5 to-white/10 border rounded-r-2xl px-6 py-4 text-white font-abeze placeholder-slate-400 focus:outline-none transition-all duration-300 ${
                    errors.phone ? 'border-red-400 focus:border-red-500' : 'border-white/10 focus:border-emerald-400 hover:border-emerald-400/50'
                  }`}
                  placeholder={t('editProfile.form.phonePlaceholder')}
                />
              </div>
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1 font-abeze">{errors.phone}</p>
              )}
            </div>
          </div>

           {/* Password Change Section */}
           <div className="border-t border-white/10 pt-8">
             <h3 className="text-xl font-abeze font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 mb-6">
               {t('editProfile.form.passwordSection.title')}
             </h3>
             
             {/* Current Password */}
             <div className="mb-4">
               <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                 {t('editProfile.form.currentPassword')}
               </label>
               <div className="relative">
                 <input
                   type={showCurrentPassword ? 'text' : 'password'}
                   name="currentPassword"
                   value={formData.currentPassword}
                   onChange={handleInputChange}
                   className={`w-full bg-gradient-to-r from-white/5 to-white/10 border rounded-2xl px-6 py-4 text-white font-abeze placeholder-slate-400 focus:outline-none transition-all duration-300 pr-14 ${
                     errors.currentPassword ? 'border-red-400 focus:border-red-500' : 'border-white/10 focus:border-emerald-400 hover:border-emerald-400/50'
                   }`}
                   placeholder={t('editProfile.form.currentPasswordPlaceholder')}
                 />
                 <button
                   type="button"
                   onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                   className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-all duration-300 hover:scale-110"
                 >
                   {showCurrentPassword ? (
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
               {errors.currentPassword && (
                 <p className="text-red-400 text-sm mt-1 font-abeze">{errors.currentPassword}</p>
               )}
             </div>

             {/* New Password */}
             <div className="mb-4">
               <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                 {t('editProfile.form.newPassword')}
               </label>
               <div className="relative">
                 <input
                   type={showNewPassword ? 'text' : 'password'}
                   name="newPassword"
                   value={formData.newPassword}
                   onChange={handleInputChange}
                   className={`w-full bg-gradient-to-r from-white/5 to-white/10 border rounded-2xl px-6 py-4 text-white font-abeze placeholder-slate-400 focus:outline-none transition-all duration-300 pr-14 ${
                     errors.newPassword ? 'border-red-400 focus:border-red-500' : 'border-white/10 focus:border-emerald-400 hover:border-emerald-400/50'
                   }`}
                   placeholder={t('editProfile.form.newPasswordPlaceholder')}
                 />
                 <button
                   type="button"
                   onClick={() => setShowNewPassword(!showNewPassword)}
                   className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-all duration-300 hover:scale-110"
                 >
                   {showNewPassword ? (
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
               {errors.newPassword && (
                 <div className="mt-1">
                   {Array.isArray(errors.newPassword) ? (
                     <ul className="text-red-400 text-sm font-abeze">
                       {errors.newPassword.map((error, index) => (
                         <li key={index}>• {error}</li>
                       ))}
                     </ul>
                   ) : (
                     <p className="text-red-400 text-sm font-abeze">{errors.newPassword}</p>
                   )}
                 </div>
               )}
               {formData.newPassword && !errors.newPassword && (
                 <p className={`text-sm mt-1 font-abeze ${getPasswordStrengthColor()}`}>
                   {t('editProfile.form.strongPassword')}
                 </p>
               )}
             </div>

             {/* Confirm New Password */}
             <div className="mb-4">
               <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                 {t('editProfile.form.confirmPassword')}
               </label>
               <div className="relative">
                 <input
                   type={showConfirmPassword ? 'text' : 'password'}
                   name="confirmNewPassword"
                   value={formData.confirmNewPassword}
                   onChange={handleInputChange}
                   className={`w-full bg-gradient-to-r from-white/5 to-white/10 border rounded-2xl px-6 py-4 text-white font-abeze placeholder-slate-400 focus:outline-none transition-all duration-300 pr-14 ${
                     errors.confirmNewPassword ? 'border-red-400 focus:border-red-500' : 'border-white/10 focus:border-emerald-400 hover:border-emerald-400/50'
                   }`}
                   placeholder={t('editProfile.form.confirmPasswordPlaceholder')}
                 />
                 <button
                   type="button"
                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                   className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-all duration-300 hover:scale-110"
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
               {errors.confirmNewPassword && (
                 <p className="text-red-400 text-sm mt-1 font-abeze">{errors.confirmNewPassword}</p>
               )}
             </div>
           </div>

                       {/* Small Success Message */}
            {showSuccessMessage && (
              <div className="mb-4 p-3 bg-green-600/20 border border-green-400/30 rounded-lg">
                <div className="flex items-center justify-center text-green-400">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-abeze text-sm">{successMessage}</span>
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <button
             type="submit"
             disabled={isSubmitting}
             className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white py-4 rounded-2xl font-abeze font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25 disabled:hover:scale-100 disabled:hover:shadow-none"
           >
             {isSubmitting ? t('editProfile.form.updatingButton') : t('editProfile.form.updateButton')}
           </button>
        </form>
      </div>
    </div>
  );
};

export { EditProfileModal };
