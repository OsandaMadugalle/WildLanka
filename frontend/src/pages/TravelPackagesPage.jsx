import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { packageApi, safariRequestApi } from '../services/api';
import Carousel from '../components/Carousel';

const TravelPackagesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setRedirectPath, redirectAfterLogin } = useAuth();
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('All');
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDates: '',
    groupSize: '',
    duration: '',
    budget: '',
    specialRequirements: '',
    preferredLocations: '',
    wildlifeInterests: ''
  });
  const [requestFormErrors, setRequestFormErrors] = useState({});
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const loginTriggerRef = useRef(null);

  const filters = ['All', 'Safari', 'Hiking', 'Photography', 'Birding', 'Adventure', 'Marine'];

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const packagesData = await packageApi.getAllPackages();
      setPackages(packagesData);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = activeFilter === 'All' 
    ? packages 
    : packages.filter(pkg => pkg.category === activeFilter);

  const handleBookNow = (packageId) => {
    if (!isAuthenticated) {
      // Set the redirect path to the booking page for this package
      setRedirectPath(`/booking/${packageId}`);
      // Trigger the login modal from header
      if (loginTriggerRef.current) {
        loginTriggerRef.current();
      }
      return;
    }
    navigate(`/booking/${packageId}`);
  };

  const handleRequestFormChange = (e) => {
    const { name, value } = e.target;
    
    // Handle phone number input - only allow numbers
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setRequestFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setRequestFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (requestFormErrors[name]) {
      setRequestFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateRequestForm = () => {
    const newErrors = {};

    if (!requestFormData.name.trim()) newErrors.name = 'Name is required';
    if (!requestFormData.email.trim()) newErrors.email = 'Email is required';
    if (!requestFormData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!requestFormData.preferredDates.trim()) newErrors.preferredDates = 'Preferred dates are required';
    if (!requestFormData.groupSize.trim()) newErrors.groupSize = 'Group size is required';
    if (!requestFormData.duration.trim()) newErrors.duration = 'Duration is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (requestFormData.email && !emailRegex.test(requestFormData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone number validation - must be exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (requestFormData.phone && !phoneRegex.test(requestFormData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    // Group size validation - must be numbers only
    const numberRegex = /^\d+$/;
    if (requestFormData.groupSize && !numberRegex.test(requestFormData.groupSize.trim())) {
      newErrors.groupSize = 'Group size must be a number only';
    }

    // Duration validation - must be numbers only
    if (requestFormData.duration && !numberRegex.test(requestFormData.duration.trim())) {
      newErrors.duration = 'Duration must be a number only';
    }

    // Budget validation - must be numbers only (if provided)
    if (requestFormData.budget && !numberRegex.test(requestFormData.budget.trim())) {
      newErrors.budget = 'Budget must be a number only';
    }

    setRequestFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestSafari = async (e) => {
    e.preventDefault();
    
    if (!validateRequestForm()) {
      return;
    }

    setIsSubmittingRequest(true);
    try {
      await safariRequestApi.createSafariRequest(requestFormData);
      alert(t('packages.requestForm.success'));
      setRequestFormData({
        name: '',
        email: '',
        phone: '',
        preferredDates: '',
        groupSize: '',
        duration: '',
        budget: '',
        specialRequirements: '',
        preferredLocations: '',
        wildlifeInterests: ''
      });
      setShowRequestForm(false);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || t('packages.requestForm.error');
      alert(errorMessage);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900">
      <Header triggerLogin={loginTriggerRef} />
      
  <div className="pt-24 md:pt-32">
        <div className="container mx-auto px-2 sm:px-4 md:px-6">
          {/* Page Header */}
          <div className="text-center mb-10 md:mb-16 px-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-abeze font-bold text-white mb-2 md:mb-4 break-words">
              {(() => {
                const title = t('packages.title');
                const [first, ...rest] = title.split(' ');
                return <>{first} <span className="text-green-400">{rest.join(' ')}</span></>;
              })()}
            </h1>
            <p className="text-green-200 font-abeze text-base sm:text-lg max-w-2xl md:max-w-3xl mx-auto">
              {t('packages.subtitle')}
            </p>
          </div>

          {/* Redirect Message */}
          {redirectAfterLogin && !isAuthenticated && (
            <div className="bg-green-600/20 border border-green-400/30 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-400 font-abeze text-lg">
                  {t('packages.loginToContinue')}
                </p>
              </div>
            </div>
          )}

          {/* Filter Section */}
          <div className="mb-8 md:mb-12">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-3 rounded-full font-abeze font-medium transition-all duration-300 ${
                    activeFilter === filter
                      ? 'bg-green-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {t(`packages.filters.${filter.toLowerCase()}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Packages Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-300 font-abeze">{t('packages.loading')}</div>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-300 font-abeze">{t('packages.noPackagesFound')}</div>
            </div>
          ) : (
            <div id="packages-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-16">
              {filteredPackages.map((pkg) => (
                <div
                  key={pkg._id}
                  className="group bg-white/8 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/20 hover:border-green-400/50 transition-all duration-500 hover:transform hover:scale-102 hover:shadow-xl hover:shadow-green-400/15 flex flex-col h-full"
                >
                  <div className="relative h-56 sm:h-64 md:h-72 bg-gradient-to-br from-green-600/15 to-green-400/10 overflow-hidden">
                    {/* Enhanced gradient overlay for better readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                    
                    {/* Carousel for all images */}
                    {pkg.image?.url || (pkg.gallery && pkg.gallery.length > 0) ? (
                      <Carousel
                        images={[
                          ...(pkg.image?.url ? [pkg.image.url] : []),
                          ...(pkg.gallery ? pkg.gallery.map(img => img.url) : [])
                        ]}
                        alt={pkg.title}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Enhanced Duration Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-2 rounded-full text-sm font-abeze font-bold shadow-lg backdrop-blur-sm border border-green-300/30">
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{pkg.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Category Badge */}
                    <div className="absolute bottom-4 left-4 z-20">
                      <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm font-abeze font-medium border border-white/20 shadow-lg">
                        {pkg.category}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col h-full bg-gradient-to-b from-transparent to-white/5">
                    <div className="flex-grow">
                      {/* Enhanced Title and Popular Badge */}
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl sm:text-2xl md:text-2xl font-abeze font-bold text-white leading-tight group-hover:text-green-300 transition-colors duration-300">
                          {pkg.title}
                        </h3>
                        {pkg.isPopular && (
                          <div className="ml-2">
                            <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-abeze font-bold shadow-md">
                              <div className="flex items-center space-x-1">
                                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span>{t('packages.popular')}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Enhanced Rating */}
                      {(pkg.rating || pkg.reviews) && (
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="flex items-center space-x-1 bg-amber-500/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < (pkg.rating || 0) ? 'text-amber-400 fill-current' : 'text-gray-500'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                            <span className="text-amber-300 font-abeze text-sm font-bold ml-2">
                              {pkg.rating ? `${pkg.rating}` : '0'}
                            </span>
                          </div>
                          {pkg.reviews && (
                            <span className="text-gray-400 font-abeze text-sm">
                              ({pkg.reviews} {t('packages.reviews')})
                            </span>
                          )}
                        </div>
                      )}
                      
                      <p className="text-gray-300 font-abeze text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                        {pkg.description}
                      </p>
                      
                      {/* Package Details */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs">
                        {pkg.location && (
                          <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-gray-300 font-abeze">{pkg.location}</span>
                          </div>
                        )}
                        {pkg.maxGroupSize && (
                          <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-gray-300 font-abeze">{t('packages.maxPeople', { count: pkg.maxGroupSize })}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Highlights */}
                      {pkg.highlights && pkg.highlights.length > 0 && (
                        <div className="space-y-3 mb-6">
                          <h4 className="text-green-400 font-abeze font-medium text-xs sm:text-base">{t('packages.highlights')}</h4>
                          <div className="space-y-2">
                            {pkg.highlights.slice(0, 4).map((highlight, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                </svg>
                                <span className="text-gray-300 font-abeze text-sm">{highlight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Features */}
                      {pkg.features && pkg.features.length > 0 && (
                        <div className="space-y-3 mb-6">
                          <h4 className="text-blue-400 font-abeze font-medium text-xs sm:text-base">{t('packages.features')}</h4>
                          <div className="space-y-2">
                            {pkg.features.slice(0, 3).map((feature, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-300 font-abeze text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Enhanced Price and Button Section */}
                    <div className="mt-auto pt-6 border-t border-white/10">
                      <div className="mb-5">
                        <div className="bg-gradient-to-r from-green-400/15 to-emerald-400/15 p-4 rounded-2xl border border-green-400/20 backdrop-blur-sm">
                          <div className="flex items-baseline">
                            <div>
                              <span className="text-2xl sm:text-3xl font-abeze font-bold text-green-400">
                                LKR {pkg.price?.toLocaleString()}
                              </span>
                              <p className="text-gray-400 font-abeze text-sm">{t('packages.perPerson')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleBookNow(pkg._id)}
                        className="group/btn w-full bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-500 hover:via-emerald-500 hover:to-green-500 text-white py-4 px-6 rounded-2xl font-abeze font-bold transition-all duration-300 transform hover:scale-102 hover:shadow-lg hover:shadow-green-400/15 border border-green-400/30"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-base">{t('packages.bookNow')}</span>
                          <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center mb-10 md:mb-16 px-2">
            <div className="bg-gradient-to-r from-green-600/20 to-green-400/20 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-green-400/30">
              <h3 className="text-lg sm:text-2xl font-abeze font-bold text-white mb-2 sm:mb-4">
                {t('packages.customPackage.title')}
              </h3>
              <p className="text-gray-300 font-abeze mb-4 sm:mb-6 max-w-xl sm:max-w-2xl mx-auto text-xs sm:text-base">
                {t('packages.customPackage.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
                <button 
                  onClick={() => {
                    if (showRequestForm) {
                      setShowRequestForm(false);
                    } else {
                      setShowRequestForm(true);
                      setTimeout(() => {
                        const el = document.getElementById('request-safari-form');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-abeze font-bold transition-colors duration-300"
                >
                  {showRequestForm ? t('packages.customPackage.hideForm') : t('packages.customPackage.requestSafari')}
                </button>
                <button 
                  onClick={() => {
                    navigate('/contact');
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 400);
                  }}
                  className="bg-transparent border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-white px-8 py-3 rounded-full font-abeze font-bold transition-all duration-300"
                >
                  {t('packages.customPackage.contactUs')}
                </button>
              </div>
            </div>
          </div>

          {/* Request Safari Form */}
          {showRequestForm && (
            <div id="request-safari-form" className="mb-10 md:mb-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/20">
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-abeze font-bold text-white mb-1 sm:mb-2">
                    {t('packages.requestForm.title')}
                  </h3>
                  <p className="text-gray-300 font-abeze text-xs sm:text-base">
                    {t('packages.requestForm.subtitle')}
                  </p>
                </div>

                <form onSubmit={handleRequestSafari} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h4 className="text-base sm:text-xl font-abeze font-bold text-white mb-2 sm:mb-4">{t('packages.requestForm.personalInfo')}</h4>
                      
                      <div>
                        <label className="block text-white font-abeze font-medium mb-2">
                          {t('packages.requestForm.fullName')}
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={requestFormData.name}
                          onChange={handleRequestFormChange}
                          className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                            requestFormErrors.name ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                          }`}
                          placeholder={t('packages.requestForm.placeholders.name')}
                        />
                        {requestFormErrors.name && (
                          <p className="text-red-400 text-sm mt-1 font-abeze">{requestFormErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white font-abeze font-medium mb-2">
                          {t('packages.requestForm.email')}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={requestFormData.email}
                          onChange={handleRequestFormChange}
                          className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                            requestFormErrors.email ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                          }`}
                          placeholder={t('packages.requestForm.placeholders.email')}
                        />
                        {requestFormErrors.email && (
                          <p className="text-red-400 text-sm mt-1 font-abeze">{requestFormErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white font-abeze font-medium mb-2">
                          {t('packages.requestForm.phone')}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={requestFormData.phone}
                          onChange={handleRequestFormChange}
                          className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                            requestFormErrors.phone ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                          }`}
                          placeholder={t('packages.requestForm.placeholders.phone')}
                          maxLength="10"
                          pattern="[0-9]{10}"
                        />
                        {requestFormErrors.phone && (
                          <p className="text-red-400 text-sm mt-1 font-abeze">{requestFormErrors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Safari Details */}
                    <div className="space-y-4">
                      <h4 className="text-base sm:text-xl font-abeze font-bold text-white mb-2 sm:mb-4">{t('packages.requestForm.safariDetails')}</h4>
                      
                      <div>
                        <label className="block text-white font-abeze font-medium mb-2">
                          {t('packages.requestForm.preferredDates')}
                        </label>
                        <input
                          type="text"
                          name="preferredDates"
                          value={requestFormData.preferredDates}
                          onChange={handleRequestFormChange}
                          className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                            requestFormErrors.preferredDates ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                          }`}
                          placeholder={t('packages.requestForm.placeholders.dates')}
                        />
                        {requestFormErrors.preferredDates && (
                          <p className="text-red-400 text-sm mt-1 font-abeze">{requestFormErrors.preferredDates}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white font-abeze font-medium mb-2">
                          {t('packages.requestForm.groupSize')}
                        </label>
                        <input
                          type="number"
                          name="groupSize"
                          value={requestFormData.groupSize}
                          onChange={handleRequestFormChange}
                          className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                            requestFormErrors.groupSize ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                          }`}
                          placeholder={t('packages.requestForm.placeholders.group')}
                          min="1"
                        />
                        {requestFormErrors.groupSize && (
                          <p className="text-red-400 text-sm mt-1 font-abeze">{requestFormErrors.groupSize}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white font-abeze font-medium mb-2">
                          {t('packages.requestForm.duration')}
                        </label>
                        <input
                          type="number"
                          name="duration"
                          value={requestFormData.duration}
                          onChange={handleRequestFormChange}
                          className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                            requestFormErrors.duration ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                          }`}
                          placeholder={t('packages.requestForm.placeholders.duration')}
                          min="1"
                        />
                        {requestFormErrors.duration && (
                          <p className="text-red-400 text-sm mt-1 font-abeze">{requestFormErrors.duration}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-base sm:text-xl font-abeze font-bold text-white mb-2 sm:mb-4">{t('packages.requestForm.additionalInfo')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-white font-abeze font-medium mb-2">
                          {t('packages.requestForm.budget')}
                        </label>
                        <input
                          type="number"
                          name="budget"
                          value={requestFormData.budget}
                          onChange={handleRequestFormChange}
                          className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                            requestFormErrors.budget ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                          }`}
                          placeholder={t('packages.requestForm.placeholders.budget')}
                          min="0"
                        />
                        {requestFormErrors.budget && (
                          <p className="text-red-400 text-sm mt-1 font-abeze">{requestFormErrors.budget}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white font-abeze font-medium mb-2">
                          {t('packages.requestForm.preferredLocations')}
                        </label>
                        <input
                          type="text"
                          name="preferredLocations"
                          value={requestFormData.preferredLocations}
                          onChange={handleRequestFormChange}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                          placeholder={t('packages.requestForm.placeholders.locations')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-abeze font-medium mb-2">
                        {t('packages.requestForm.wildlifeInterests')}
                      </label>
                      <input
                        type="text"
                        name="wildlifeInterests"
                        value={requestFormData.wildlifeInterests}
                        onChange={handleRequestFormChange}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                        placeholder={t('packages.requestForm.placeholders.interests')}
                      />
                    </div>

                    <div>
                      <label className="block text-white font-abeze font-medium mb-2">
                        {t('packages.requestForm.specialRequirements')}
                      </label>
                      <textarea
                        name="specialRequirements"
                        value={requestFormData.specialRequirements}
                        onChange={handleRequestFormChange}
                        rows="4"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors resize-none"
                        placeholder={t('packages.requestForm.placeholders.requirements')}
                      ></textarea>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-abeze font-medium transition-colors duration-300"
                    >
                      {t('packages.requestForm.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingRequest}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-abeze font-bold transition-colors duration-300"
                    >
                      {isSubmittingRequest ? t('packages.requestForm.submitting') : t('packages.requestForm.submit')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TravelPackagesPage; 