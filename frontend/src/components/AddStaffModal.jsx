import React, { useState, useRef, useEffect } from 'react';
import { staffApi } from '../services/api';

const AddStaffModal = ({ onClose, onStaffAdded }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'driver',
    specialization: '',
    experience: '',
    licenseNumber: '',
    basicSalary: 75000
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  const roles = [
    { value: 'driver', label: 'Driver' },
    { value: 'tour_guide', label: 'Tour Guide' }
  ];

  // Log initial formData
  useEffect(() => {
    console.log('Component mounted - Initial formData:', formData);
  }, []);

  // Update basic salary when role changes
  useEffect(() => {
    // Always set the correct salary based on role
    const newSalary = formData.role === 'driver' ? 75000 : 50000;
    console.log('useEffect: Setting basic salary for role:', formData.role, 'to:', newSalary);
    
    setFormData(prev => {
      const updatedData = {
        ...prev,
        basicSalary: newSalary
      };
      console.log('useEffect: Updated formData:', updatedData);
      return updatedData;
    });
  }, [formData.role]);

  // Ensure basic salary is correctly set based on role
  const ensureCorrectBasicSalary = () => {
    // Always return the correct salary based on current role, regardless of form state
    const expectedSalary = formData.role === 'driver' ? 75000 : 50000;
    console.log('ensureCorrectBasicSalary - Role:', formData.role, 'Returning salary:', expectedSalary);
    return expectedSalary;
  };

  // Force update basic salary whenever role changes
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    console.log('Role changed to:', newRole);
    
    const newSalary = newRole === 'driver' ? 75000 : 50000;
    console.log('Setting salary for new role:', newRole, 'to:', newSalary);
    
    setFormData(prev => ({
      ...prev,
      role: newRole,
      basicSalary: newSalary
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input change - Field:', name, 'Value:', value);
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('Updated formData:', newData);
      return newData;
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.role) newErrors.role = 'Role is required';

    // Validate basic salary is correct for role
    const expectedSalary = formData.role === 'driver' ? 75000 : 50000;
    if (formData.basicSalary !== expectedSalary) {
      newErrors.basicSalary = `Basic salary must be LKR ${expectedSalary.toLocaleString()} for ${formData.role}`;
      console.error('Salary validation failed:', formData.basicSalary, 'expected:', expectedSalary);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Force the correct basic salary based on current role
    const correctSalary = formData.role === 'driver' ? 75000 : 50000;
    
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Current formData:', formData);
    console.log('Role:', formData.role);
    console.log('Correct salary for role:', correctSalary);
    console.log('============================');

    setIsSubmitting(true);
    try {
      // Create staff with guaranteed correct basic salary
      const submissionData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        specialization: formData.specialization,
        experience: formData.experience,
        licenseNumber: formData.licenseNumber,
        basicSalary: correctSalary // Force the correct salary
      };
      
      console.log('Final submission data:', submissionData);
      
      // Show alert with submission data for debugging
      alert(`Submitting staff data:\nRole: ${submissionData.role}\nBasic Salary: LKR ${submissionData.basicSalary?.toLocaleString()}\n\nCheck console for full data.`);
      
      const newStaff = await staffApi.createStaff(submissionData);
      
      // Upload image if selected
      if (selectedImage) {
        setIsUploadingImage(true);
        const imageFormData = new FormData();
        imageFormData.append('image', selectedImage);
        await staffApi.uploadStaffProfilePicture(newStaff._id, imageFormData);
      }
      
      onStaffAdded();
      onClose();
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to create staff member';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-abeze font-bold text-white mb-2">
            Add New Staff Member
          </h2>
          <p className="text-gray-300 font-abeze">
            Create a new staff account
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
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-abeze font-bold text-white mb-4">Basic Information</h3>
              
              {/* First Name */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                    errors.firstName ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-400 text-sm mt-1 font-abeze">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                    errors.lastName ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-400 text-sm mt-1 font-abeze">{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                    errors.email ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                  }`}
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1 font-abeze">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-12 text-white font-abeze placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                    placeholder="Enter password"
                    required
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
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-abeze font-bold text-white mb-4">Additional Details</h3>
              
              {/* Phone */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                    errors.phone ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                  }`}
                  placeholder="+94 71 123 4567"
                />
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-1 font-abeze">{errors.phone}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white font-abeze focus:outline-none transition-colors ${
                    errors.role ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                  }`}
                  style={{
                    color: 'white',
                    backgroundColor: '#1f2937'
                  }}
                >
                  {roles.map(role => (
                    <option 
                      key={role.value} 
                      value={role.value}
                      style={{
                        backgroundColor: '#1f2937',
                        color: 'white'
                      }}
                    >
                      {role.label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-red-400 text-sm mt-1 font-abeze">{errors.role}</p>
                )}
              </div>

              {/* Basic Salary Display */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Basic Salary (Auto-set based on role)
                </label>
                <div className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white font-abeze">
                  LKR {formData.basicSalary?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Driver: LKR 75,000 | Tour Guide: LKR 50,000
                </p>
                {errors.basicSalary && (
                  <p className="text-red-400 text-sm mt-1 font-abeze">{errors.basicSalary}</p>
                )}
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                  placeholder="e.g., Wildlife Photography, Bird Watching"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                  placeholder="5"
                />
              </div>

              {/* License Number / Register Number */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  {formData.role === 'driver' ? 'License Number' : 'Register Number'}
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                  placeholder={formData.role === 'driver' ? 'e.g., DL123456789' : 'e.g., TG123456789'}
                />
              </div>

              {/* Profile Picture */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Profile Picture
                </label>
                <div
                  onClick={handleImageClick}
                  className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <p className="text-gray-400 font-abeze text-sm">Click to upload image</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-abeze font-medium transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-abeze font-medium transition-colors duration-300"
            >
              {isSubmitting ? (isUploadingImage ? 'Uploading Image...' : 'Creating Staff...') : 'Create Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;
