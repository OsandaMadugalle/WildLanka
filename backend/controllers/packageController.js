import Package from "../models/Package.js";
import { uploadToImgBB } from "../config/imgbb.js";

// Get all packages
export const getAllPackages = async (req, res, next) => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ createdAt: -1 });
    return res.json(packages);
  } catch (err) {
    next(err);
  }
};

// Get package by ID
export const getPackageById = async (req, res, next) => {
  try {
    const packageData = await Package.findById(req.params.id);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }
    return res.json(packageData);
  } catch (err) {
    next(err);
  }
};

// Create new package
export const createPackage = async (req, res, next) => {
  try {
    const {
      title,
      category,
      duration,
      price,
      description,
      features,
      highlights,
      isPopular,
      maxGroupSize,
      difficulty,
      location,
      included,
      notIncluded,
      requirements
    } = req.body;

    if (!title || !category || !duration || !price || !description || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newPackage = await Package.create({
      title,
      category,
      duration,
      price: Number(price),
      description,
      features: features ? features.split(',').map(f => f.trim()) : [],
      highlights: highlights ? highlights.split(',').map(h => h.trim()) : [],
      isPopular: isPopular === 'true',
      maxGroupSize: Number(maxGroupSize) || 10,
      difficulty,
      location,
      included: included ? included.split(',').map(i => i.trim()) : [],
      notIncluded: notIncluded ? notIncluded.split(',').map(n => n.trim()) : [],
      requirements: requirements ? requirements.split(',').map(r => r.trim()) : [],
      createdBy: req.user._id
    });

    return res.status(201).json(newPackage);
  } catch (err) {
    next(err);
  }
};

// Update package
export const updatePackage = async (req, res, next) => {
  try {
    const {
      title,
      category,
      duration,
      price,
      description,
      features,
      highlights,
      isPopular,
      maxGroupSize,
      difficulty,
      location,
      included,
      notIncluded,
      requirements
    } = req.body;

    const packageData = await Package.findById(req.params.id);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Helper to normalize string/array fields
    const normalize = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return val.split(',').map((v) => v.trim());
      return [];
    };

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      {
        title,
        category,
        duration,
        price: Number(price),
        description,
        features: normalize(features),
        highlights: normalize(highlights),
        isPopular: isPopular === 'true' || isPopular === true,
        maxGroupSize: Number(maxGroupSize) || 10,
        difficulty,
        location,
        included: normalize(included),
        notIncluded: normalize(notIncluded),
        requirements: normalize(requirements)
      },
      { new: true, runValidators: true }
    );

    return res.json(updatedPackage);
  } catch (err) {
    next(err);
  }
};

// Delete package
export const deletePackage = async (req, res, next) => {
  try {
    const packageData = await Package.findById(req.params.id);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    await Package.findByIdAndDelete(req.params.id);
    return res.json({ message: "Package deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Upload package image
export const uploadPackageImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const packageId = req.params.id;
    const packageData = await Package.findById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Upload image to ImgBB
    const filename = `package_${packageId}_${Date.now()}`;
    const uploadResult = await uploadToImgBB(req.file.buffer, filename);

    // Update package with new image
    const updatedPackage = await Package.findByIdAndUpdate(
      packageId,
      {
        image: {
          url: uploadResult.url,
          deleteUrl: uploadResult.deleteUrl,
          id: uploadResult.id,
        }
      },
      { new: true, runValidators: true }
    );

    return res.json({
      package: updatedPackage,
      message: "Package image uploaded successfully"
    });
  } catch (err) {
    console.error('Error in uploadPackageImage:', err);
    next(err);
  }
};

// Toggle package active status
export const togglePackageStatus = async (req, res, next) => {
  try {
    const packageData = await Package.findById(req.params.id);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    packageData.isActive = !packageData.isActive;
    await packageData.save();

    return res.json(packageData);
  } catch (err) {
    next(err);
  }
};
