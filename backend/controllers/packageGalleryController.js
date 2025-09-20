import Package from "../models/Package.js";
import { uploadToImgBB } from "../config/imgbb.js";

// Upload one or more gallery images for a package
export const uploadPackageGalleryImage = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image files provided" });
    }

    const packageId = req.params.id;
    const packageData = await Package.findById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    const uploadedImages = [];
    for (const file of req.files) {
      const filename = `package_gallery_${packageId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const uploadResult = await uploadToImgBB(file.buffer, filename);
      const imageObj = {
        url: uploadResult.url,
        deleteUrl: uploadResult.deleteUrl,
        id: uploadResult.id,
      };
      packageData.gallery.push(imageObj);
      uploadedImages.push(imageObj);
    }
    await packageData.save();
    return res.json({
      message: "Gallery images uploaded successfully",
      images: uploadedImages,
      package: packageData
    });
  } catch (err) {
    console.error('Error in uploadPackageGalleryImage:', err);
    next(err);
  }
};
