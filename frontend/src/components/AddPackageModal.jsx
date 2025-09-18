import React, { useState, useRef } from 'react';
import { packageApi } from '../services/api';

const AddPackageModal = ({ onClose, onPackageAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Safari',
    duration: '',
    price: '',
    description: '',
    features: '',
    highlights: '',
    location: '',
    included: '',
    notIncluded: '',
    requirements: '',
    maxGroupSize: '10',
    difficulty: 'Moderate',
    isPopular: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const categories = ['Safari', 'Hiking', 'Photography', 'Birding', 'Adventure', 'Marine'];
  const difficulties = ['Easy', 'Moderate', 'Challenging'];

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    Promise.all(files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    })).then(previews => setImagePreviews(previews));
  };

  const handleImageClick = () => {
  fileInputRef.current?.click();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';

    if (formData.price && isNaN(formData.price)) {
      newErrors.price = 'Price must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Create package first
      const newPackage = await packageApi.createPackage(formData);
      // Upload gallery images if selected
      if (selectedImages.length > 0) {
        setIsUploadingImage(true);
        for (const img of selectedImages) {
          const imageFormData = new FormData();
          imageFormData.append('image', img);
          await packageApi.uploadPackageGalleryImage(newPackage._id, imageFormData);
        }
      }
      onPackageAdded();
      onClose();
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to create package';
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
            Add New Package
          </h2>
          <p className="text-gray-300 font-abeze">
            Create a new wildlife safari package for your customers
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
              
              {/* Title */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Package Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                    errors.title ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                  }`}
                  placeholder="Enter package title"
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1 font-abeze">{errors.title}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze focus:outline-none focus:border-green-400 transition-colors"
                  style={{
                    color: 'white',
                    backgroundColor: '#1f2937'
                  }}
                >
                  {categories.map(category => (
                    <option 
                      key={category} 
                      value={category}
                      style={{
                        backgroundColor: '#1f2937',
                        color: 'white'
                      }}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                    errors.duration ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                  }`}
                  placeholder="e.g., 2 days, 1 week"
                />
                {errors.duration && (
                  <p className="text-red-400 text-sm mt-1 font-abeze">{errors.duration}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                    errors.price ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                  }`}
                  placeholder="45000"
                />
                {errors.price && (
                  <p className="text-red-400 text-sm mt-1 font-abeze">{errors.price}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                    errors.location ? 'border-red-400' : 'border-white/20 focus:border-green-400'
                  }`}
                  placeholder="e.g., Yala National Park, Sri Lanka"
                />
                {errors.location && (
                  <p className="text-red-400 text-sm mt-1 font-abeze">{errors.location}</p>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-abeze font-bold text-white mb-4">Additional Details</h3>
              
              {/* Max Group Size */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Max Group Size
                </label>
                <input
                  type="number"
                  name="maxGroupSize"
                  value={formData.maxGroupSize}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                  placeholder="10"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Difficulty Level
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze focus:outline-none focus:border-green-400 transition-colors"
                  style={{
                    color: 'white',
                    backgroundColor: '#1f2937'
                  }}
                >
                  {difficulties.map(difficulty => (
                    <option 
                      key={difficulty} 
                      value={difficulty}
                      style={{
                        backgroundColor: '#1f2937',
                        color: 'white'
                      }}
                    >
                      {difficulty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Popular Package */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPopular"
                  checked={formData.isPopular}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500 focus:ring-2"
                />
                <label className="ml-2 text-white font-abeze">
                  Mark as Popular Package
                </label>
              </div>

              {/* Package Gallery Images */}
              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Package Gallery Images
                </label>
                <div
                  onClick={handleImageClick}
                  className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors"
                >
                  {imagePreviews.length > 0 ? (
                    <div className="flex gap-2 w-full h-full">
                      {imagePreviews.map((preview, idx) => (
                        <img key={idx} src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <p className="text-gray-400 font-abeze text-sm">Click to upload images</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-abeze font-medium mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none transition-colors ${
                errors.description ? 'border-red-400' : 'border-white/20 focus:border-green-400'
              }`}
              placeholder="Describe the package experience, what makes it special..."
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1 font-abeze">{errors.description}</p>
            )}
          </div>

          {/* Features and Highlights */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                Features
              </label>
              <textarea
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                rows="3"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                placeholder="List key features of this package..."
              />
            </div>

            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                Highlights
              </label>
              <textarea
                name="highlights"
                value={formData.highlights}
                onChange={handleInputChange}
                rows="3"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                placeholder="What are the main highlights of this experience?"
              />
            </div>
          </div>

          {/* Included/Not Included */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                What's Included
              </label>
              <textarea
                name="included"
                value={formData.included}
                onChange={handleInputChange}
                rows="3"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                placeholder="What services and items are included in the price?"
              />
            </div>

            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                What's Not Included
              </label>
              <textarea
                name="notIncluded"
                value={formData.notIncluded}
                onChange={handleInputChange}
                rows="3"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                placeholder="What additional costs might customers expect?"
              />
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-white font-abeze font-medium mb-2">
              Requirements
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows="3"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
              placeholder="Any physical requirements, age restrictions, or special considerations?"
            />
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
              {isSubmitting ? (isUploadingImage ? 'Uploading Image...' : 'Creating Package...') : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPackageModal;
