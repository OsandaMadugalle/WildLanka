import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { donationApi } from '../services/api';

const DonationDetailsPage = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    postalCode: '',
    isAnonymous: false,
    receiveUpdates: true
  });

  const [errors, setErrors] = useState({});
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1');  

  // Get donation details from location state
  const donationAmount = location.state?.amount || '';
  const selectedCurrency = location.state?.currency || 'USD';

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' }
  ];

  const countries = [
    { code: 'US', name: 'United States', phoneCode: '+1', maxDigits: 10 },
    { code: 'CA', name: 'Canada', phoneCode: '+1', maxDigits: 10 },
    { code: 'GB', name: 'United Kingdom', phoneCode: '+44', maxDigits: 10 },
    { code: 'AU', name: 'Australia', phoneCode: '+61', maxDigits: 9 },
    { code: 'LK', name: 'Sri Lanka', phoneCode: '+94', maxDigits: 9 },
    { code: 'IN', name: 'India', phoneCode: '+91', maxDigits: 10 },
    { code: 'DE', name: 'Germany', phoneCode: '+49', maxDigits: 11 },
    { code: 'FR', name: 'France', phoneCode: '+33', maxDigits: 9 },
    { code: 'JP', name: 'Japan', phoneCode: '+81', maxDigits: 10 },
    { code: 'CN', name: 'China', phoneCode: '+86', maxDigits: 11 },
    { code: 'BR', name: 'Brazil', phoneCode: '+55', maxDigits: 11 },
    { code: 'MX', name: 'Mexico', phoneCode: '+52', maxDigits: 10 },
    { code: 'IT', name: 'Italy', phoneCode: '+39', maxDigits: 10 },
    { code: 'ES', name: 'Spain', phoneCode: '+34', maxDigits: 9 },
    { code: 'NL', name: 'Netherlands', phoneCode: '+31', maxDigits: 9 },
    { code: 'SE', name: 'Sweden', phoneCode: '+46', maxDigits: 9 },
    { code: 'NO', name: 'Norway', phoneCode: '+47', maxDigits: 8 },
    { code: 'DK', name: 'Denmark', phoneCode: '+45', maxDigits: 8 },
    { code: 'FI', name: 'Finland', phoneCode: '+358', maxDigits: 9 },
    { code: 'CH', name: 'Switzerland', phoneCode: '+41', maxDigits: 9 }
  ];

  const getCurrencySymbol = () => {
    return currencies.find(c => c.code === selectedCurrency)?.symbol || '$';
  };

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
        [name]: ''
      }));
    }
  };

  const handleCountryChange = (e) => {
    const selectedCountry = countries.find(c => c.code === e.target.value);
    setFormData(prev => ({
      ...prev,
      country: e.target.value
    }));
    setSelectedCountryCode(selectedCountry?.phoneCode || '+1');
    
    // Clear phone error when country changes
    if (errors.phone) {
      setErrors(prev => ({
        ...prev,
        phone: ''
      }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    const selectedCountry = countries.find(c => c.code === formData.country) || countries[0];
    
    // Limit to max digits for the selected country
    if (value.length <= selectedCountry.maxDigits) {
      setFormData(prev => ({
        ...prev,
        phone: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors.phone) {
      setErrors(prev => ({
        ...prev,
        phone: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = 'First name can only contain letters and spaces';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = 'Last name can only contain letters and spaces';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional but if provided, must be valid)
    if (formData.phone.trim()) {
      const selectedCountry = countries.find(c => c.code === formData.country) || countries[0];
      if (formData.phone.length < selectedCountry.maxDigits) {
        newErrors.phone = `Phone number must be ${selectedCountry.maxDigits} digits for ${selectedCountry.name}`;
      }
    }

    // Country validation
    if (!formData.country) {
      newErrors.country = 'Please select a country';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }

    // Postal Code validation
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (formData.postalCode.trim().length < 3) {
      newErrors.postalCode = 'Postal code must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Store donation data in localStorage for PDF generation
      const donationDataForPDF = {
        _id: 'donation_' + Date.now(), // Generate a temporary ID
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        country: formData.country,
        postalCode: formData.postalCode,
        amount: Number(donationAmount),
        currency: selectedCurrency,
        isAnonymous: !!formData.isAnonymous,
        receiveUpdates: formData.receiveUpdates,
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('pendingDonationData', JSON.stringify(donationDataForPDF));

      const payload = {
        amount: Number(donationAmount),
        currency: selectedCurrency,
        donor: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          isAnonymous: !!formData.isAnonymous,
        },
        donorDetails: {
          phone: formData.phone,
          address: formData.address,
          country: formData.country,
          postalCode: formData.postalCode,
          receiveUpdates: formData.receiveUpdates,
        },
      };
      const response = await donationApi.createStripeCheckout(payload);
      if (response?.success && response?.session_url) {
        window.location.href = response.session_url;
      } else {
        alert('Failed to start donation payment. Please try again.');
      }
    } catch (error) {
      console.error('Donation checkout error:', error);
      alert('Something went wrong while starting the payment.');
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-12">
        <div className="container mx-auto px-6 text-center">
                     <h1 className="text-4xl font-abeze font-bold mb-4">
             Donation <span className="text-yellow-300">Details</span>
           </h1>
           <p className="text-xl font-abeze max-w-3xl mx-auto">
             Thank you for supporting wildlife conservation. Please provide your details to proceed with your donation.
           </p>
          <div className="mt-6 bg-white/20 rounded-lg p-4 inline-block">
            <span className="font-abeze font-bold text-2xl">
              {getCurrencySymbol()}{donationAmount}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-abeze font-bold text-white mb-6">
                Personal Information
              </h2>
              
                             <div className="grid md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-white font-abeze font-bold mb-2">
                     First Name *
                   </label>
                   <input
                     type="text"
                     name="firstName"
                     value={formData.firstName}
                     onChange={handleInputChange}
                     required
                     className={`w-full bg-white/10 text-white px-4 py-3 rounded-lg border font-abeze focus:outline-none focus:border-green-400 ${
                       errors.firstName ? 'border-red-400' : 'border-white/20'
                     }`}
                     placeholder="Enter your first name"
                   />
                   {errors.firstName && (
                     <p className="text-red-400 text-sm mt-1 font-abeze">{errors.firstName}</p>
                   )}
                 </div>
                 
                 <div>
                   <label className="block text-white font-abeze font-bold mb-2">
                     Last Name *
                   </label>
                   <input
                     type="text"
                     name="lastName"
                     value={formData.lastName}
                     onChange={handleInputChange}
                     required
                     className={`w-full bg-white/10 text-white px-4 py-3 rounded-lg border font-abeze focus:outline-none focus:border-green-400 ${
                       errors.lastName ? 'border-red-400' : 'border-white/20'
                     }`}
                     placeholder="Enter your last name"
                   />
                   {errors.lastName && (
                     <p className="text-red-400 text-sm mt-1 font-abeze">{errors.lastName}</p>
                   )}
                 </div>
                 
                 <div>
                   <label className="block text-white font-abeze font-bold mb-2">
                     Email Address *
                   </label>
                   <input
                     type="email"
                     name="email"
                     value={formData.email}
                     onChange={handleInputChange}
                     required
                     className={`w-full bg-white/10 text-white px-4 py-3 rounded-lg border font-abeze focus:outline-none focus:border-green-400 ${
                       errors.email ? 'border-red-400' : 'border-white/20'
                     }`}
                     placeholder="Enter your email address"
                   />
                   {errors.email && (
                     <p className="text-red-400 text-sm mt-1 font-abeze">{errors.email}</p>
                   )}
                 </div>
                 
                 <div>
                   <label className="block text-white font-abeze font-bold mb-2">
                     Country *
                   </label>
                   <select
                     name="country"
                     value={formData.country}
                     onChange={handleCountryChange}
                     className={`w-full bg-white/10 text-white px-4 py-3 rounded-lg border font-abeze focus:outline-none focus:border-green-400 ${
                       errors.country ? 'border-red-400' : 'border-white/20'
                     }`}
                   >
                     <option value="" className="bg-gray-800">Select a country</option>
                     {countries.map((country) => (
                       <option key={country.code} value={country.code} className="bg-gray-800">
                         {country.name}
                       </option>
                     ))}
                   </select>
                   {errors.country && (
                     <p className="text-red-400 text-sm mt-1 font-abeze">{errors.country}</p>
                   )}
                 </div>
               </div>
              
                             <div className="mt-6">
                 <label className="block text-white font-abeze font-bold mb-2">
                   Address *
                 </label>
                 <input
                   type="text"
                   name="address"
                   value={formData.address}
                   onChange={handleInputChange}
                   className={`w-full bg-white/10 text-white px-4 py-3 rounded-lg border font-abeze focus:outline-none focus:border-green-400 ${
                     errors.address ? 'border-red-400' : 'border-white/20'
                   }`}
                   placeholder="Enter your full address"
                 />
                 {errors.address && (
                   <p className="text-red-400 text-sm mt-1 font-abeze">{errors.address}</p>
                 )}
               </div>
               
               <div className="grid md:grid-cols-2 gap-6 mt-6">
                 <div>
                   <label className="block text-white font-abeze font-bold mb-2">
                     Postal Code *
                   </label>
                   <input
                     type="text"
                     name="postalCode"
                     value={formData.postalCode}
                     onChange={handleInputChange}
                     className={`w-full bg-white/10 text-white px-4 py-3 rounded-lg border font-abeze focus:outline-none focus:border-green-400 ${
                       errors.postalCode ? 'border-red-400' : 'border-white/20'
                     }`}
                     placeholder="Enter postal code"
                   />
                   {errors.postalCode && (
                     <p className="text-red-400 text-sm mt-1 font-abeze">{errors.postalCode}</p>
                   )}
                 </div>
                 
                 <div>
                   <label className="block text-white font-abeze font-bold mb-2">
                     Phone Number
                   </label>
                   <div className="flex">
                     <span className="bg-white/10 text-white px-4 py-3 rounded-l-lg border border-white/20">
                       {selectedCountryCode}
                     </span>
                     <input
                       type="tel"
                       name="phone"
                       value={formData.phone}
                       onChange={handlePhoneChange}
                       className={`flex-1 bg-white/10 text-white px-4 py-3 rounded-r-lg border font-abeze focus:outline-none focus:border-green-400 ${
                         errors.phone ? 'border-red-400' : 'border-white/20'
                       }`}
                       placeholder="Enter phone number"
                     />
                   </div>
                   {errors.phone && (
                     <p className="text-red-400 text-sm mt-1 font-abeze">{errors.phone}</p>
                   )}
                 </div>
               </div>
            </div>

            {/* Preferences */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-abeze font-bold text-white mb-6">
                Preferences
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <label className="ml-3 text-white font-abeze">
                    Make this donation anonymous
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="receiveUpdates"
                    checked={formData.receiveUpdates}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <label className="ml-3 text-white font-abeze">
                    Receive updates about our conservation work
                  </label>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30">
              <div className="flex items-start">
                <div className="text-green-400 text-2xl mr-4">🔒</div>
                <div>
                  <h3 className="text-white font-abeze font-bold mb-2">Secure Payment</h3>
                  <p className="text-gray-300 font-abeze text-sm">
                    Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/donate"
                className="bg-transparent border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-xl font-abeze font-bold transition-all duration-300 text-center"
              >
                ← Back to Donation
              </Link>
              
                             <button
                 type="submit"
                 className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-abeze font-bold transition-colors duration-300"
               >
                 Continue to Payment - {getCurrencySymbol()}{donationAmount}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonationDetailsPage;
