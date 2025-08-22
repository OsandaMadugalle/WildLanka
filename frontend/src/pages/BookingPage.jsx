import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { packageApi, bookingApi } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BookingPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const loginTriggerRef = useRef(null);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    numberOfPeople: 1,
    specialRequests: '',
    emergencyContact: '',
    dietaryRestrictions: '',
    accommodationPreference: 'Standard',
    transportationPreference: 'Included'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPackageData();
  }, [packageId]);

  const loadPackageData = async () => {
    try {
      const data = await packageApi.getPackageById(packageId);
      setPackageData(data);
    } catch (error) {
      console.error('Error loading package:', error);
      alert('Failed to load package details');
      navigate('/travel-packages');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Auto-calculate end date when start date is selected
    if (name === 'startDate' && value && packageData) {
      const endDate = calculateEndDate(value, packageData.duration);
      setBookingData(prev => ({
        ...prev,
        endDate: endDate
      }));
    }
  };

  const calculateEndDate = (startDate, duration) => {
    const start = new Date(startDate);
    let daysToAdd = 0;
    
    // Parse duration string to extract number of days
    if (duration.includes('1 Night') || duration.includes('1 Day')) {
      daysToAdd = 1;
    } else if (duration.includes('2 Days') || duration.includes('2 Nights')) {
      daysToAdd = 2;
    } else if (duration.includes('3 Days') || duration.includes('3 Nights')) {
      daysToAdd = 3;
    } else if (duration.includes('4 Days') || duration.includes('4 Nights')) {
      daysToAdd = 4;
    } else if (duration.includes('5 Days') || duration.includes('5 Nights')) {
      daysToAdd = 5;
    } else if (duration.includes('6 Days') || duration.includes('6 Nights')) {
      daysToAdd = 6;
    } else if (duration.includes('7 Days') || duration.includes('7 Nights')) {
      daysToAdd = 7;
    } else {
      // Default to 1 day if duration can't be parsed
      daysToAdd = 1;
    }
    
    const end = new Date(start);
    end.setDate(start.getDate() + daysToAdd);
    
    return end.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors = {};

    if (!bookingData.startDate) newErrors.startDate = 'Start date is required';
    if (!bookingData.endDate) newErrors.endDate = 'End date is required';
    if (!bookingData.emergencyContact) newErrors.emergencyContact = 'Emergency contact is required';
    
    if (bookingData.startDate && bookingData.endDate) {
      const startDate = new Date(bookingData.startDate);
      const endDate = new Date(bookingData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (bookingData.numberOfPeople < 1) {
      newErrors.numberOfPeople = 'Number of people must be at least 1';
    }

    if (packageData && bookingData.numberOfPeople > packageData.maxGroupSize) {
      newErrors.numberOfPeople = `Maximum group size is ${packageData.maxGroupSize} people`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalPrice = () => {
    if (!packageData) return 0;
    
    let basePrice = packageData.price * bookingData.numberOfPeople;
    let extraCosts = 0;
    
    // Add accommodation preference costs
    switch (bookingData.accommodationPreference) {
      case 'Luxury':
        extraCosts += 5000 * bookingData.numberOfPeople;
        break;
      case 'Tented Camp':
        extraCosts += 2000 * bookingData.numberOfPeople;
        break;
      case 'Eco Lodge':
        extraCosts += 3000 * bookingData.numberOfPeople;
        break;
      default:
        break;
    }
    
    // Add transportation preference costs
    switch (bookingData.transportationPreference) {
      case 'Private Vehicle':
        extraCosts += 3000 * bookingData.numberOfPeople;
        break;
      case 'Shared Vehicle':
        extraCosts += 1000 * bookingData.numberOfPeople;
        break;
      default:
        break;
    }
    
    return basePrice + extraCosts;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingPayload = {
        packageId,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        numberOfPeople: bookingData.numberOfPeople,
        specialRequests: bookingData.specialRequests,
        emergencyContact: bookingData.emergencyContact,
        dietaryRestrictions: bookingData.dietaryRestrictions,
        accommodationPreference: bookingData.accommodationPreference,
        transportationPreference: bookingData.transportationPreference
      };

      const response = await bookingApi.createStripeCheckout(bookingPayload);
      
      if (response.success) {
        // Redirect to Stripe checkout
        window.location.href = response.session_url;
      } else {
        alert('Failed to create booking. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
        <Header />
        <div className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-white font-abeze text-lg">Loading package details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
        <Header triggerLogin={loginTriggerRef} />
        <div className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-white font-abeze text-lg">Package not found</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      <Header triggerLogin={loginTriggerRef} />
      
      <div className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-6">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-abeze font-bold text-white mb-4">
              Book Your <span className="text-green-400">Safari</span>
            </h1>
            <p className="text-gray-300 font-abeze text-lg">
              Complete your booking for {packageData.title}
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Package Summary */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-abeze font-bold text-white mb-6">Package Summary</h2>
                
                <div className="space-y-6">
                  {/* Package Image */}
                  <div className="relative h-48 bg-gradient-to-br from-green-600/20 to-green-400/20 rounded-lg overflow-hidden">
                    {packageData.image?.url ? (
                      <img 
                        src={packageData.image.url} 
                        alt={packageData.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-abeze font-bold">
                        {packageData.duration}
                      </span>
                    </div>
                    {packageData.isPopular && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-abeze font-bold">
                          Popular
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Package Title and Description */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-abeze font-bold text-white">{packageData.title}</h3>
                    <p className="text-gray-300 font-abeze text-sm leading-relaxed">{packageData.description}</p>
                  </div>

                  {/* Package Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <div>
                        <span className="text-gray-400 font-abeze">Category:</span>
                        <span className="text-white font-abeze ml-2">{packageData.category || 'Safari'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <span className="text-gray-400 font-abeze">Location:</span>
                        <span className="text-white font-abeze ml-2">{packageData.location || 'Sri Lanka'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <span className="text-gray-400 font-abeze">Duration:</span>
                        <span className="text-white font-abeze ml-2">{packageData.duration}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div>
                        <span className="text-gray-400 font-abeze">Max Group:</span>
                        <span className="text-white font-abeze ml-2">{packageData.maxGroupSize || 'Unlimited'} people</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Information */}
                  <div className="bg-green-600/20 rounded-lg p-4 border border-green-400/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-abeze font-medium">Base Price:</span>
                      <span className="text-2xl font-abeze font-bold text-green-400">
                        LKR {packageData.price?.toLocaleString()}/person
                      </span>
                    </div>
                    {packageData.originalPrice && packageData.originalPrice !== packageData.price && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-abeze text-sm">Original Price:</span>
                        <span className="text-gray-400 font-abeze text-sm line-through">
                          LKR {packageData.originalPrice?.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {packageData.discount && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-green-400 font-abeze text-sm">Discount:</span>
                        <span className="text-green-400 font-abeze font-bold text-sm">{packageData.discount}</span>
                      </div>
                    )}
                  </div>

                  {/* Highlights */}
                  {packageData.highlights && packageData.highlights.length > 0 && (
                    <div>
                      <h4 className="text-green-400 font-abeze font-medium text-base mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Key Highlights
                      </h4>
                      <div className="space-y-2">
                        {packageData.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span className="text-gray-300 font-abeze text-sm">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {packageData.features && packageData.features.length > 0 && (
                    <div>
                      <h4 className="text-blue-400 font-abeze font-medium text-base mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Included Features
                      </h4>
                      <div className="space-y-2">
                        {packageData.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-300 font-abeze text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Important Notes */}
                  <div className="bg-yellow-600/20 rounded-lg p-4 border border-yellow-400/30">
                    <h4 className="text-yellow-400 font-abeze font-medium text-base mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Important Notes
                    </h4>
                    <ul className="text-gray-300 font-abeze text-sm space-y-1">
                      <li>• Booking confirmation subject to availability</li>
                      <li>• Prices may vary during peak seasons</li>
                      <li>• Cancellation policy applies</li>
                      <li>• Weather conditions may affect safari experience</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-abeze font-bold text-white mb-6">Booking Details</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Travel Dates */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-abeze font-medium mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={bookingData.startDate}
                        onChange={handleInputChange}
                        className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                          errors.startDate ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                        }`}
                      />
                      {errors.startDate && (
                        <p className="text-red-400 text-sm mt-1 font-abeze">{errors.startDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-white font-abeze font-medium mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={bookingData.endDate}
                        onChange={handleInputChange}
                        className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                          errors.endDate ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                        }`}
                      />
                      {errors.endDate && (
                        <p className="text-red-400 text-sm mt-1 font-abeze">{errors.endDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Number of People */}
                  <div>
                    <label className="block text-white font-abeze font-medium mb-2">
                      Number of People *
                    </label>
                    <input
                      type="number"
                      name="numberOfPeople"
                      value={bookingData.numberOfPeople}
                      onChange={handleInputChange}
                      min="1"
                      max={packageData.maxGroupSize}
                      className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                        errors.numberOfPeople ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                      }`}
                    />
                    {errors.numberOfPeople && (
                      <p className="text-red-400 text-sm mt-1 font-abeze">{errors.numberOfPeople}</p>
                    )}
                  </div>

                                     {/* Emergency Contact */}
                   <div>
                     <label className="block text-white font-abeze font-medium mb-2">
                       Emergency Contact *
                     </label>
                     <input
                       type="tel"
                       name="emergencyContact"
                       value={bookingData.emergencyContact}
                       onChange={handleInputChange}
                       className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                         errors.emergencyContact ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                       }`}
                       placeholder="+94 71 123 4567"
                     />
                     {errors.emergencyContact && (
                       <p className="text-red-400 text-sm mt-1 font-abeze">{errors.emergencyContact}</p>
                     )}
                   </div>

                                     {/* Preferences */}
                   <div className="grid md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-white font-abeze font-medium mb-2">
                         Accommodation Preference
                       </label>
                       <select
                         name="accommodationPreference"
                         value={bookingData.accommodationPreference}
                         onChange={handleInputChange}
                         className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze focus:outline-none focus:border-green-400 transition-colors"
                       >
                         <option value="Standard">Standard</option>
                         <option value="Luxury">Luxury (+LKR 5,000/person)</option>
                         <option value="Tented Camp">Tented Camp (+LKR 2,000/person)</option>
                         <option value="Eco Lodge">Eco Lodge (+LKR 3,000/person)</option>
                       </select>
                     </div>

                     <div>
                       <label className="block text-white font-abeze font-medium mb-2">
                         Transportation Preference
                       </label>
                       <select
                         name="transportationPreference"
                         value={bookingData.transportationPreference}
                         onChange={handleInputChange}
                         className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze focus:outline-none focus:border-green-400 transition-colors"
                       >
                         <option value="Included">Included</option>
                         <option value="Private Vehicle">Private Vehicle (+LKR 3,000/person)</option>
                         <option value="Shared Vehicle">Shared Vehicle (+LKR 1,000/person)</option>
                       </select>
                     </div>
                   </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-white font-abeze font-medium mb-2">
                      Special Requests
                    </label>
                    <textarea
                      name="specialRequests"
                      value={bookingData.specialRequests}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                      placeholder="Any special requirements or requests..."
                    />
                  </div>

                  {/* Dietary Restrictions */}
                  <div>
                    <label className="block text-white font-abeze font-medium mb-2">
                      Dietary Restrictions
                    </label>
                    <textarea
                      name="dietaryRestrictions"
                      value={bookingData.dietaryRestrictions}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                      placeholder="Vegetarian, Vegan, Gluten-free, etc."
                    />
                  </div>

                                     {/* Total Price */}
                   <div className="bg-green-600/20 rounded-lg p-4 border border-green-400/30">
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-white font-abeze font-medium">Total Price:</span>
                       <span className="text-2xl font-abeze font-bold text-green-400">
                         LKR {calculateTotalPrice().toLocaleString()}
                       </span>
                     </div>
                     <div className="space-y-1 text-sm">
                       <div className="flex justify-between">
                         <span className="text-gray-300 font-abeze">Base Price:</span>
                         <span className="text-gray-300 font-abeze">LKR {(packageData.price * bookingData.numberOfPeople).toLocaleString()}</span>
                       </div>
                       {bookingData.accommodationPreference !== 'Standard' && (
                         <div className="flex justify-between">
                           <span className="text-gray-300 font-abeze">Accommodation Upgrade:</span>
                           <span className="text-green-400 font-abeze">
                             +LKR {(() => {
                               switch (bookingData.accommodationPreference) {
                                 case 'Luxury': return (5000 * bookingData.numberOfPeople).toLocaleString();
                                 case 'Tented Camp': return (2000 * bookingData.numberOfPeople).toLocaleString();
                                 case 'Eco Lodge': return (3000 * bookingData.numberOfPeople).toLocaleString();
                                 default: return '0';
                               }
                             })()}
                           </span>
                         </div>
                       )}
                       {bookingData.transportationPreference !== 'Included' && (
                         <div className="flex justify-between">
                           <span className="text-gray-300 font-abeze">Transportation Upgrade:</span>
                           <span className="text-green-400 font-abeze">
                             +LKR {(() => {
                               switch (bookingData.transportationPreference) {
                                 case 'Private Vehicle': return (3000 * bookingData.numberOfPeople).toLocaleString();
                                 case 'Shared Vehicle': return (1000 * bookingData.numberOfPeople).toLocaleString();
                                 default: return '0';
                               }
                             })()}
                           </span>
                         </div>
                       )}
                     </div>
                   </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-4 rounded-lg font-abeze font-bold transition-colors duration-300"
                  >
                    {isSubmitting ? 'Processing Booking...' : 'Confirm Booking'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingPage;
