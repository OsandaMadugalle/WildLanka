import React, { useState, useEffect } from 'react';


const AddVehicleModal = ({ isOpen, onClose, onVehicleAdded, vehicle, onVehicleUpdated }) => {
  const initialState = {
    vehicleType: 'Safari Jeep',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    color: '',
    capacity: 6,
    fuelType: 'Diesel',
    insuranceNumber: '',
    insuranceExpiry: '',
    features: [],
    notes: ''
  };
  const [formData, setFormData] = useState(initialState);
  // Fill form when editing
  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicleType: vehicle.vehicleType || 'Safari Jeep',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        licensePlate: vehicle.licensePlate || '',
        color: vehicle.color || '',
        capacity: vehicle.capacity || 6,
        fuelType: vehicle.fuelType || 'Diesel',
        insuranceNumber: vehicle.insuranceNumber || '',
        insuranceExpiry: vehicle.insuranceExpiry ? vehicle.insuranceExpiry.slice(0,10) : '',
        features: vehicle.features || [],
        notes: vehicle.notes || ''
      });
    } else {
      setFormData(initialState);
    }
  }, [vehicle, isOpen]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleFeatureChange = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.make.trim()) newErrors.make = 'Make is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';
    if (!formData.color.trim()) newErrors.color = 'Color is required';
    if (!formData.insuranceNumber.trim()) newErrors.insuranceNumber = 'Insurance number is required';
    if (!formData.insuranceExpiry) newErrors.insuranceExpiry = 'Insurance expiry date is required';

    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Invalid year';
    }

    if (formData.capacity < 1 || formData.capacity > 50) {
      newErrors.capacity = 'Capacity must be between 1 and 50';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const { vehicleApi } = await import('../services/api');
      let response;
      if (vehicle && vehicle._id) {
        // Edit mode
        response = await vehicleApi.updateVehicle(vehicle._id, formData);
        if (response.success) {
          onVehicleUpdated && onVehicleUpdated(response.vehicle);
          onClose();
        } else {
          alert(response.message || 'Failed to update vehicle');
        }
      } else {
        // Add mode
        response = await vehicleApi.addVehicle(formData);
        if (response.success) {
          onVehicleAdded(response.vehicle);
          onClose();
          setFormData(initialState);
        } else {
          alert(response.message || 'Failed to add vehicle');
        }
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Failed to save vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-abeze font-bold text-white">
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                Vehicle Type *
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white font-abeze focus:border-blue-500 focus:outline-none"
              >
                <option value="Safari Jeep">Safari Jeep</option>
                <option value="SUV">SUV</option>
                <option value="Van">Van</option>
                <option value="Bus">Bus</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                Make *
              </label>
              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white font-abeze focus:outline-none ${
                  errors.make ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                }`}
                placeholder="e.g., Toyota"
              />
              {errors.make && <p className="text-red-400 text-sm mt-1">{errors.make}</p>}
            </div>

            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                Model *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white font-abeze focus:outline-none ${
                  errors.model ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                }`}
                placeholder="e.g., Land Cruiser"
              />
              {errors.model && <p className="text-red-400 text-sm mt-1">{errors.model}</p>}
            </div>

            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                Year *
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white font-abeze focus:outline-none ${
                  errors.year ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                }`}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
              {errors.year && <p className="text-red-400 text-sm mt-1">{errors.year}</p>}
            </div>

            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                License Plate *
              </label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white font-abeze focus:outline-none ${
                  errors.licensePlate ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                }`}
                placeholder="e.g., ABC-1234"
              />
              {errors.licensePlate && <p className="text-red-400 text-sm mt-1">{errors.licensePlate}</p>}
            </div>

            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                Color *
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white font-abeze focus:outline-none ${
                  errors.color ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                }`}
                placeholder="e.g., White"
              />
              {errors.color && <p className="text-red-400 text-sm mt-1">{errors.color}</p>}
            </div>

            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white font-abeze focus:outline-none ${
                  errors.capacity ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                }`}
                min="1"
                max="50"
              />
              {errors.capacity && <p className="text-red-400 text-sm mt-1">{errors.capacity}</p>}
            </div>

            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                Fuel Type *
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white font-abeze focus:border-blue-500 focus:outline-none"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                Insurance Number *
              </label>
              <input
                type="text"
                name="insuranceNumber"
                value={formData.insuranceNumber}
                onChange={handleInputChange}
                className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white font-abeze focus:outline-none ${
                  errors.insuranceNumber ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                }`}
                placeholder="Insurance policy number"
              />
              {errors.insuranceNumber && <p className="text-red-400 text-sm mt-1">{errors.insuranceNumber}</p>}
            </div>

            <div>
              <label className="block text-white font-abeze font-medium mb-2">
                Insurance Expiry Date *
              </label>
              <input
                type="date"
                name="insuranceExpiry"
                value={formData.insuranceExpiry}
                onChange={handleInputChange}
                className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white font-abeze focus:outline-none ${
                  errors.insuranceExpiry ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                }`}
              />
              {errors.insuranceExpiry && <p className="text-red-400 text-sm mt-1">{errors.insuranceExpiry}</p>}
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-white font-abeze font-medium mb-2">
              Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['AC', 'GPS', 'Bluetooth', 'USB Charging', 'First Aid Kit', 'Fire Extinguisher', 'Spare Tire', 'Tool Kit'].map((feature) => (
                <label key={feature} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature)}
                    onChange={() => handleFeatureChange(feature)}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-white font-abeze text-sm">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-white font-abeze font-medium mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white font-abeze focus:border-blue-500 focus:outline-none"
              placeholder="Additional notes about the vehicle..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6">
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
              className={`px-6 py-3 rounded-lg font-abeze font-medium transition-colors duration-300 ${
                isSubmitting
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSubmitting ? (vehicle ? 'Saving...' : 'Adding...') : (vehicle ? 'Save Changes' : 'Add Vehicle')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleModal;
