import React, { useState, useRef, useEffect } from 'react';
import { packageApi } from '../services/api';

const EditPackageModal = ({ package: packageData, onClose, onPackageUpdated }) => {
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
    maxGroupSize: 10,
    difficulty: 'Moderate',
    isPopular: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  // For gallery images
  const [selectedGalleryImages, setSelectedGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const galleryInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Populate form data when package prop changes
  useEffect(() => {
    if (packageData) {
      setFormData({
        title: packageData.title || '',
        category: packageData.category || 'Safari',
        duration: packageData.duration || '',
        price: packageData.price || '',
        description: packageData.description || '',
        features: packageData.features ? packageData.features.join(', ') : '',
        highlights: packageData.highlights ? packageData.highlights.join(', ') : '',
        location: packageData.location || '',
        included: packageData.included ? packageData.included.join(', ') : '',
        notIncluded: packageData.notIncluded ? packageData.notIncluded.join(', ') : '',
        requirements: packageData.requirements ? packageData.requirements.join(', ') : '',
        maxGroupSize: packageData.maxGroupSize || 10,
        difficulty: packageData.difficulty || 'Moderate',
        isPopular: packageData.isPopular || false
      });
  setImagePreview(packageData.image?.url || null);
  setGalleryPreviews(packageData.gallery ? packageData.gallery.map(img => img.url) : []);
    }
  }, [packageData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle gallery images
  const handleGalleryImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedGalleryImages(files);
    Promise.all(files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    })).then(previews => setGalleryPreviews(previews));
  };

  const handleGalleryImageClick = () => {
    galleryInputRef.current?.click();
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.maxGroupSize || formData.maxGroupSize <= 0) newErrors.maxGroupSize = 'Valid group size is required';
    if (!formData.difficulty) newErrors.difficulty = 'Difficulty is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // Update package
      const updatedPackage = await packageApi.updatePackage(packageData._id, formData);
      
      // Upload new image if selected
      if (selectedImage) {
        setIsUploadingImage(true);
        const imageFormData = new FormData();
        imageFormData.append('image', selectedImage);
        await packageApi.uploadPackageImage(updatedPackage._id, imageFormData);
      }
      // Upload new gallery images if selected
      if (selectedGalleryImages.length > 0) {
        setIsUploadingImage(true);
        const galleryFormData = new FormData();
        selectedGalleryImages.forEach((img) => {
          galleryFormData.append('images', img);
        });
        try {
          const galleryRes = await packageApi.uploadPackageGalleryImage(updatedPackage._id, galleryFormData);
          console.log('Gallery upload response:', galleryRes);
        } catch (galleryErr) {
          console.error('Gallery upload error:', galleryErr);
          alert(galleryErr?.response?.data?.message || 'Gallery image upload failed');
        }
      }
      onPackageUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating package:', err);
      alert(err.response?.data?.message || 'Failed to update package');
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  };

  if (!packageData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-abeze font-bold text-white">Edit Package</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-green-200 font-abeze font-medium mb-2">
                Package Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white font-abeze ${
                  errors.title ? 'border-red-500' : 'border-white/20'
                } focus:border-green-400 focus:outline-none transition-colors`}
                placeholder="Enter package title"
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-green-200 font-abeze font-medium mb-2">
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
                <option value="Safari">Safari</option>
                <option value="Hiking">Hiking</option>
                <option value="Photography">Photography</option>
                <option value="Birding">Birding</option>
                <option value="Adventure">Adventure</option>
                <option value="Marine">Marine</option>
              </select>
              {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-green-200 font-abeze font-medium mb-2">
                Duration *
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white font-abeze ${
                  errors.duration ? 'border-red-500' : 'border-white/20'
                } focus:border-green-400 focus:outline-none transition-colors`}
                placeholder="e.g., 3 Days, 2 Nights"
              />
              {errors.duration && <p className="text-red-400 text-sm mt-1">{errors.duration}</p>}
            </div>

            <div>
              <label className="block text-green-200 font-abeze font-medium mb-2">
                Price (LKR) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white font-abeze ${
                  errors.price ? 'border-red-500' : 'border-white/20'
                } focus:border-green-400 focus:outline-none transition-colors`}
                placeholder="Enter price"
                min="0"
              />
              {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-green-200 font-abeze font-medium mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white font-abeze ${
                  errors.location ? 'border-red-500' : 'border-white/20'
                } focus:border-green-400 focus:outline-none transition-colors`}
                placeholder="e.g., Yala National Park"
              />
              {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-green-200 font-abeze font-medium mb-2">
                Max Group Size *
              </label>
              <input
                type="number"
                name="maxGroupSize"
                value={formData.maxGroupSize}
                onChange={handleInputChange}
                className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white font-abeze ${
                  errors.maxGroupSize ? 'border-red-500' : 'border-white/20'
                } focus:border-green-400 focus:outline-none transition-colors`}
                placeholder="Enter max group size"
                min="1"
              />
              {errors.maxGroupSize && <p className="text-red-400 text-sm mt-1">{errors.maxGroupSize}</p>}
            </div>

            <div>
              <label className="block text-green-200 font-abeze font-medium mb-2">
                Difficulty Level *
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
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Challenging">Challenging</option>
              </select>
              {errors.difficulty && <p className="text-red-400 text-sm mt-1">{errors.difficulty}</p>}
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isPopular"
                checked={formData.isPopular}
                onChange={handleInputChange}
                className="w-4 h-4 text-green-600 bg-white/5 border-white/20 rounded focus:ring-green-500 focus:ring-2"
              />
              <label className="text-green-200 font-abeze font-medium">
                Mark as Popular Package
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-green-200 font-abeze font-medium mb-2">
              Package Cover Image
            </label>
            <div
              onClick={handleImageClick}
              className="w-full h-48 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Package preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-400 font-abeze">Click to upload image</p>
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
          {/* Gallery Images Upload */}
          <div>
            <label className="block text-green-200 font-abeze font-medium mb-2">
              Package Gallery Images
            </label>
            <div
              onClick={handleGalleryImageClick}
              className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors overflow-x-auto scrollbar-none"
            >
              {galleryPreviews.length > 0 ? (
                <div className="flex gap-2 w-full h-full flex-nowrap overflow-x-auto scrollbar-none">
                  {galleryPreviews.map((preview, idx) => (
                    <img key={idx} src={preview} alt={`Gallery Preview ${idx + 1}`} className="h-28 w-auto object-cover rounded-lg flex-shrink-0 border border-white/10" />
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-400 font-abeze text-sm">Click to upload images</p>
                </div>
              )}
            </div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryImageChange}
              className="hidden"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-green-200 font-abeze font-medium mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white font-abeze ${
                errors.description ? 'border-red-500' : 'border-white/20'
              } focus:border-green-400 focus:outline-none transition-colors resize-none`}
              placeholder="Enter detailed description of the package"
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Features */}
          <div>
            <label className="block text-green-200 font-abeze font-medium mb-2">
              Features (comma-separated)
            </label>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze focus:border-green-400 focus:outline-none transition-colors resize-none"
              placeholder="e.g., Professional guide, Transportation, Meals"
            />
          </div>

          {/* Highlights */}
          <div>
            <label className="block text-green-200 font-abeze font-medium mb-2">
              Highlights (comma-separated)
            </label>
            <textarea
              name="highlights"
              value={formData.highlights}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze focus:border-green-400 focus:outline-none transition-colors resize-none"
              placeholder="e.g., Wildlife spotting, Photography opportunities, Scenic views"
            />
          </div>

          {/* Included/Not Included */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-green-200 font-abeze font-medium mb-2">
                What's Included (comma-separated)
              </label>
              <textarea
                name="included"
                value={formData.included}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze focus:border-green-400 focus:outline-none transition-colors resize-none"
                placeholder="e.g., Accommodation, Meals, Guide"
              />
            </div>

            <div>
              <label className="block text-green-200 font-abeze font-medium mb-2">
                What's Not Included (comma-separated)
              </label>
              <textarea
                name="notIncluded"
                value={formData.notIncluded}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze focus:border-green-400 focus:outline-none transition-colors resize-none"
                placeholder="e.g., Personal expenses, Tips"
              />
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-green-200 font-abeze font-medium mb-2">
              Requirements (comma-separated)
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze focus:border-green-400 focus:outline-none transition-colors resize-none"
              placeholder="e.g., Comfortable walking shoes, Camera, Valid ID"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
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
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg font-abeze font-medium transition-colors duration-300 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{isUploadingImage ? 'Uploading Image...' : 'Updating Package...'}</span>
                </>
              ) : (
                <span>Update Package</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPackageModal;
