import SafariRequest from "../models/SafariRequest.js";

// Get all safari requests (admin only)
export const getAllSafariRequests = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const requests = await SafariRequest.find()
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'firstName lastName email role');

    res.json(requests);
  } catch (error) {
    console.error('Error fetching safari requests:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get safari request by ID (admin only)
export const getSafariRequestById = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const request = await SafariRequest.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email role');

    if (!request) {
      return res.status(404).json({ message: "Safari request not found" });
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching safari request:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create new safari request (public)
export const createSafariRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      preferredDates,
      groupSize,
      duration,
      budget,
      preferredLocations,
      wildlifeInterests,
      specialRequirements
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !preferredDates || !groupSize || !duration) {
      return res.status(400).json({ 
        message: "Missing required fields: name, email, phone, preferredDates, groupSize, duration" 
      });
    }

    const newRequest = new SafariRequest({
      name,
      email,
      phone,
      preferredDates,
      groupSize,
      duration,
      budget,
      preferredLocations,
      wildlifeInterests,
      specialRequirements
    });

    await newRequest.save();

    res.status(201).json({
      message: "Safari request submitted successfully",
      request: newRequest
    });
  } catch (error) {
    console.error('Error creating safari request:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update safari request status (admin only)
export const updateSafariRequestStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { status, adminNotes, estimatedPrice, assignedTo } = req.body;

    const request = await SafariRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Safari request not found" });
    }

    // Update fields
    if (status) request.status = status;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;
    if (estimatedPrice !== undefined) request.estimatedPrice = estimatedPrice;
    if (assignedTo !== undefined) request.assignedTo = assignedTo;

    await request.save();

    res.json({
      message: "Safari request updated successfully",
      request
    });
  } catch (error) {
    console.error('Error updating safari request:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete safari request (admin only)
export const deleteSafariRequest = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const request = await SafariRequest.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Safari request not found" });
    }

    res.json({ message: "Safari request deleted successfully" });
  } catch (error) {
    console.error('Error deleting safari request:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get safari request statistics (admin only)
export const getSafariRequestStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const totalRequests = await SafariRequest.countDocuments();
    const pendingRequests = await SafariRequest.countDocuments({ status: 'pending' });
    const reviewedRequests = await SafariRequest.countDocuments({ status: 'reviewed' });
    const approvedRequests = await SafariRequest.countDocuments({ status: 'approved' });
    const completedRequests = await SafariRequest.countDocuments({ status: 'completed' });

    // Get recent requests (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRequests = await SafariRequest.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      total: totalRequests,
      pending: pendingRequests,
      reviewed: reviewedRequests,
      approved: approvedRequests,
      completed: completedRequests,
      recent: recentRequests
    });
  } catch (error) {
    console.error('Error fetching safari request stats:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};
