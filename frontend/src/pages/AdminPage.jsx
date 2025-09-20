import React, { useState, useEffect } from "react";
import { generateAllBookingsPDF } from '../utils/pdfGenerator';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  packageApi,
  userApi,
  staffApi,
  safariRequestApi,
  bookingApi,
  reviewApi,
  donationApi,
} from "../services/api";
import { sendThankYouEmail, sendCustomEmail } from "../services/emailService";

import AddPackageModal from "../components/AddPackageModal";
import EditPackageModal from "../components/EditPackageModal";
import AddStaffModal from "../components/AddStaffModal";
import EditStaffModal from "../components/EditStaffModal";
import ContactMessages from "../components/ContactMessages";
import Attendance from "../components/Attendance";
import Payroll from "../components/Payroll";
import AssignmentModal from "../components/AssignmentModal";
import BookingCalendar from "../components/BookingCalendar";

import Carousel from "../components/Carousel";
import AdminGalleryManager from "../components/AdminGalleryManager";
// ...existing code...

// ...existing code...

const AdminPage = () => {
  // Utility to convert bookings to CSV and trigger download
  const [expandedBookings, setExpandedBookings] = useState([]);
  const [copiedBookingId, setCopiedBookingId] = useState(null);
  const toggleBookingExpand = (id) => {
    setExpandedBookings((prev) =>
      prev.includes(id)
        ? prev.filter((bid) => bid !== id)
        : [...prev, id]
    );
  };
  const downloadBookingsCSV = (bookings) => {
    if (!Array.isArray(bookings) || bookings.length === 0) {
      alert('No bookings to export.');
      return;
    }
    const headers = [
      'Booking ID', 'Customer Name', 'Email', 'Package', 'Location', 'Start Date', 'End Date', 'People', 'Status', 'Payment', 'Total Price'
    ];
    const rows = bookings.map(b => [
      b._id,
      `${b.userId?.firstName || ''} ${b.userId?.lastName || ''}`,
      b.userId?.email || '',
      b.packageDetails?.title || '',
      b.packageDetails?.location || '',
      b.bookingDetails?.startDate ? new Date(b.bookingDetails.startDate).toLocaleDateString() : '',
      b.bookingDetails?.endDate ? new Date(b.bookingDetails.endDate).toLocaleDateString() : '',
      b.bookingDetails?.numberOfPeople || '',
      b.status,
      b.payment ? 'Paid' : 'Pending',
      b.totalPrice || ''
    ]);
    // CSV string
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookings_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadBookings = () => {
    if (downloadType === 'pdf') {
      generateAllBookingsPDF(getFilteredBookings());
    } else {
      downloadBookingsCSV(getFilteredBookings());
    }
  };
  const [downloadType, setDownloadType] = useState("csv");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    // Get the active tab from localStorage, default to 'dashboard' if not found
    return localStorage.getItem("adminActiveTab") || "dashboard";
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [showEditPackage, setShowEditPackage] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [safariRequests, setSafariRequests] = useState([]);
  const [safariRequestsLoading, setSafariRequestsLoading] = useState(false);
  const [safariRequestStats, setSafariRequestStats] = useState(null);
  const [showSafariRequestModal, setShowSafariRequestModal] = useState(false);
  const [selectedSafariRequest, setSelectedSafariRequest] = useState(null);
  const [showEditStaff, setShowEditStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [donations, setDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedBookingForAssignment, setSelectedBookingForAssignment] =
    useState(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Booking status and date filter states
  const [statusFilter, setStatusFilter] = useState("All");
  const [ongoingDateFilter, setOngoingDateFilter] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");

  // Filter bookings by status and date (custom options)
  const getFilteredBookings = () => {
    let filtered = bookings;
    if (statusFilter !== "All") {
      if (statusFilter === "Payment Confirmed") {
        filtered = bookings.filter((b) => b.status === "Payment Confirmed");
      } else if (statusFilter === "Payment Pending") {
        filtered = bookings.filter((b) => b.status === "Pending");
      } else if (statusFilter === "In Progress") {
        filtered = bookings.filter((b) => b.status === "In Progress");
        if (ongoingDateFilter) {
          filtered = filtered.filter((b) => {
            const startDate = b.bookingDetails?.startDate
              ? new Date(b.bookingDetails.startDate).toISOString().slice(0, 10)
              : "";
            return startDate === ongoingDateFilter;
          });
        }
      } else if (statusFilter === "Completed") {
        filtered = bookings.filter((b) => b.status === "Completed");
      } else if (statusFilter === "Cancelled") {
        filtered = bookings.filter((b) => b.status === "Cancelled");
      }
    }
    if (bookingSearch.trim()) {
      const searchLower = bookingSearch.trim().toLowerCase();
      filtered = filtered.filter((b) => {
        const customer = `${b.userId?.firstName || ""} ${b.userId?.lastName || ""}`.toLowerCase();
        const packageName = (b.packageDetails?.title || "").toLowerCase();
        const bookingId = (b._id || "").toLowerCase();
        return (
          customer.includes(searchLower) ||
          packageName.includes(searchLower) ||
          bookingId.includes(searchLower)
        );
      });
    }
    return filtered;
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Save the active tab to localStorage to persist across page refreshes
    localStorage.setItem("adminActiveTab", tab);
  };

  // Navigation items
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", color: "blue" },
    { id: "users", label: "Customers", icon: "👥", color: "blue" },
    { id: "staff", label: "Staff Management", icon: "👨‍💼", color: "blue" },
    { id: "packages", label: "Packages", icon: "🎒", color: "blue" },
    {
      id: "safari-requests",
      label: "Safari Requests",
      icon: "🦁",
      color: "blue",
    },
    {
      id: "contact-messages",
      label: "Contact Messages",
      icon: "💬",
      color: "blue",
    },
    { id: "bookings", label: "Bookings", icon: "📅", color: "blue" },
    { id: "gallery", label: "Gallery", icon: "🖼️", color: "blue" },
    { id: "reviews", label: "Reviews", icon: "⭐", color: "blue" },
    { id: "donations", label: "Donations", icon: "💝", color: "blue" },
    { id: "attendance", label: "Attendance", icon: "⏰", color: "blue" },
    { id: "payroll", label: "Payroll", icon: "💰", color: "blue" },
  ];

  // Load data when tabs are selected
  useEffect(() => {
    if (activeTab === "packages") {
      loadPackages();
    } else if (activeTab === "users") {
      loadUsers();
    } else if (activeTab === "staff") {
      loadStaff();
    } else if (activeTab === "safari-requests") {
      loadSafariRequests();
    } else if (activeTab === "bookings") {
      loadBookings();
    } else if (activeTab === "reviews") {
      loadReviews();
    } else if (activeTab === "donations") {
      loadDonations();
    }
  }, [activeTab]);

  // Load initial data for dashboard
  useEffect(() => {
    loadUsers();
    loadStaff();
    loadBookings();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const packagesData = await packageApi.getAllPackages();
      setPackages(packagesData);
    } catch (error) {
      console.error("Error loading packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageAdded = () => {
    loadPackages();
  };

  const handlePackageUpdated = () => {
    loadPackages();
  };

  const handleEditPackage = (pkg) => {
    setSelectedPackage(pkg);
    setShowEditPackage(true);
  };

  const handleDeletePackage = async (packageId) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        await packageApi.deletePackage(packageId);
        loadPackages();
      } catch (error) {
        console.error("Error deleting package:", error);
        alert("Failed to delete package");
      }
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const usersData = await userApi.getAllUsers();
      // Filter out admin users, show only customers (normal users)
      const customersOnly = usersData.filter((user) => user.role === "user");
      setUsers(customersOnly);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await userApi.deleteUser(userId);
        loadUsers();
        alert("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert(error.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const loadStaff = async () => {
    setStaffLoading(true);
    try {
      const staffData = await staffApi.getAllStaff();
      setStaff(staffData);
    } catch (error) {
      console.error("Error loading staff:", error);
    } finally {
      setStaffLoading(false);
    }
  };

  const handleStaffAdded = () => {
    loadStaff();
  };

  const handleEditStaff = (staffMember) => {
    setSelectedStaff(staffMember);
    setShowEditStaff(true);
  };

  const handleStaffUpdated = () => {
    loadStaff();
  };

  const handleDeleteStaff = async (staffId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this staff member? This action cannot be undone."
      )
    ) {
      try {
        await staffApi.deleteStaff(staffId);
        loadStaff();
        alert("Staff member deleted successfully");
      } catch (error) {
        console.error("Error deleting staff:", error);
        alert(error.response?.data?.message || "Failed to delete staff member");
      }
    }
  };

  const loadSafariRequests = async () => {
    setSafariRequestsLoading(true);
    try {
      const [requestsData, statsData] = await Promise.all([
        safariRequestApi.getAllSafariRequests(),
        safariRequestApi.getSafariRequestStats(),
      ]);
      setSafariRequests(requestsData);
      setSafariRequestStats(statsData);
    } catch (error) {
      console.error("Error loading safari requests:", error);
    } finally {
      setSafariRequestsLoading(false);
    }
  };

  const handleViewSafariRequest = (request) => {
    setSelectedSafariRequest(request);
    setShowSafariRequestModal(true);
  };

  const handleApproveSafariRequest = async (requestId) => {
    try {
      await safariRequestApi.updateSafariRequestStatus(requestId, {
        status: "approved",
        adminNotes:
          selectedSafariRequest.adminNotes || "Request approved by admin",
      });

      // Update the local state
      setSafariRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "approved" } : req
        )
      );

      // Update the selected request
      setSelectedSafariRequest((prev) => ({ ...prev, status: "approved" }));

      alert("Safari request approved successfully!");
    } catch (error) {
      console.error("Error approving safari request:", error);
      alert("Failed to approve safari request");
    }
  };

  const handleCloseSafariRequestModal = () => {
    setShowSafariRequestModal(false);
    setSelectedSafariRequest(null);
  };

  const handleDeleteSafariRequest = async (requestId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this safari request? This action cannot be undone."
      )
    ) {
      try {
        await safariRequestApi.deleteSafariRequest(requestId);
        loadSafariRequests();
        alert("Safari request deleted successfully");
      } catch (error) {
        console.error("Error deleting safari request:", error);
        alert("Failed to delete safari request");
      }
    }
  };

  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const bookingsData = await bookingApi.getAllBookings();
      console.log("Bookings API response:", bookingsData);

      // Note: getAllBookings returns { success: true, bookings: [...] }
      // while other APIs like getAllUsers return the array directly
      if (Array.isArray(bookingsData)) {
        setBookings(bookingsData);
      } else if (bookingsData && Array.isArray(bookingsData.bookings)) {
        // If the API returns an object with a bookings array
        setBookings(bookingsData.bookings);
      } else {
        console.warn("Unexpected bookings data format:", bookingsData);
        setBookings([]);
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId) => {
    const newStatus = prompt(
      'Enter new status for booking (e.g., "Payment Confirmed", "Confirmed", "In Progress", "Completed", "Cancelled"):'
    );
    if (newStatus) {
      try {
        await bookingApi.updateBookingStatus(bookingId, newStatus);
        loadBookings();
        alert("Booking status updated successfully!");
      } catch (error) {
        console.error("Error updating booking status:", error);
        alert("Failed to update booking status");
      }
    }
  };

  const handleStatusSelectChange = async (bookingId, status) => {
    try {
      await bookingApi.updateBookingStatus(bookingId, status);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
      );
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to update booking status");
    }
  };

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const data = await reviewApi.getAllReviews();
      if (data && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadDonations = async () => {
    setDonationsLoading(true);
    try {
      const data = await donationApi.getAllDonations();
      if (data && Array.isArray(data.donations)) {
        setDonations(data.donations);
      } else {
        setDonations([]);
      }
    } catch (error) {
      console.error("Error loading donations:", error);
      setDonations([]);
    } finally {
      setDonationsLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await reviewApi.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      console.error("Failed to delete review", error);
      alert("Failed to delete review");
    }
  };

  const handleAssignStaff = (booking) => {
    setSelectedBookingForAssignment(booking);
    setShowAssignmentModal(true);
  };

  const handleAssignmentComplete = (updatedBooking) => {
    // Update the booking in the local state
    setBookings((prev) =>
      prev.map((b) => (b._id === updatedBooking._id ? updatedBooking : b))
    );
    setSelectedBookingForAssignment(null);
  };

  // Sort bookings based on current sort settings
  const getSortedBookings = (bookingsArray) => {
    if (!Array.isArray(bookingsArray)) return [];
    return [...bookingsArray].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "customerName":
          aValue = `${a.userId?.firstName || ""} ${
            a.userId?.lastName || ""
          }`.toLowerCase();
          bValue = `${b.userId?.firstName || ""} ${
            b.userId?.lastName || ""
          }`.toLowerCase();
          break;
        case "packageName":
          aValue = (a.packageDetails?.title || "").toLowerCase();
          bValue = (b.packageDetails?.title || "").toLowerCase();
          break;
        case "startDate":
          aValue = new Date(a.bookingDetails?.startDate || 0);
          bValue = new Date(b.bookingDetails?.startDate || 0);
          break;
        case "totalPrice":
          aValue = a.totalPrice || 0;
          bValue = b.totalPrice || 0;
          break;
        case "status":
          aValue = (a.status || "").toLowerCase();
          bValue = (b.status || "").toLowerCase();
          break;
        case "createdAt":
        default:
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  const handleSendEmail = (donation) => {
    setSelectedDonation(donation);
    setEmailSubject(`Thank you for your donation - Wildlife Safari`);
    setEmailMessage(`Dear ${
      donation.isAnonymous ? "Valued Donor" : donation.firstName
    },

Thank you so much for your generous donation of ${
      donation.currency
    } ${donation.amount?.toLocaleString()} to our wildlife conservation efforts.

Your contribution will help us:
• Protect endangered wildlife species
• Maintain and preserve natural habitats
• Support our conservation programs
• Educate communities about wildlife protection

We are truly grateful for your support in helping us make a difference in wildlife conservation.

Best regards,
The Wildlife Safari Team`);
    setShowEmailModal(true);
  };

  const handleSendThankYouEmail = async () => {
    if (!selectedDonation) return;

    setSendingEmail(true);
    try {
      const result = await sendThankYouEmail(selectedDonation);

      if (result.success) {
        alert("Thank you email sent successfully!");
        setShowEmailModal(false);
        setSelectedDonation(null);
        setEmailSubject("");
        setEmailMessage("");
        // Refresh donations to show updated email status
        loadDonations();
      } else {
        alert(result.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendCustomEmail = async () => {
    if (!selectedDonation || !emailSubject.trim() || !emailMessage.trim()) {
      alert("Please fill in both subject and message.");
      return;
    }

    setSendingEmail(true);
    try {
      const result = await sendCustomEmail(
        selectedDonation,
        emailSubject.trim(),
        emailMessage.trim()
      );

      if (result.success) {
        alert("Custom email sent successfully!");
        setShowEmailModal(false);
        setSelectedDonation(null);
        setEmailSubject("");
        setEmailMessage("");
        // Refresh donations to show updated email status
        loadDonations();
      } else {
        alert(result.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setSelectedDonation(null);
    setEmailSubject("");
    setEmailMessage("");
    setSendingEmail(false);
  };

  // Calculate dashboard stats from real data
  const dashboardStats = {
    totalUsers: users.length,
    totalBookings: Array.isArray(bookings) ? bookings.length : 0,
    totalRevenue: Array.isArray(bookings)
      ? bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)
      : 0,
    activeStaff: staff.filter((s) => s.isActive).length,
  };

  // Get color classes for navigation items
  const getColorClasses = (color, isActive = false) => {
    const colorMap = {
      blue: isActive
        ? "bg-blue-600 text-white"
        : "text-blue-400 hover:bg-blue-600/20",
      green: isActive
        ? "bg-green-600 text-white"
        : "text-green-400 hover:bg-green-600/20",
      purple: isActive
        ? "bg-purple-600 text-white"
        : "text-purple-400 hover:bg-purple-600/20",
      yellow: isActive
        ? "bg-yellow-600 text-white"
        : "text-yellow-400 hover:bg-yellow-600/20",
      orange: isActive
        ? "bg-orange-600 text-white"
        : "text-orange-400 hover:bg-orange-600/20",
      pink: isActive
        ? "bg-pink-600 text-white"
        : "text-pink-400 hover:bg-pink-600/20",
      indigo: isActive
        ? "bg-indigo-600 text-white"
        : "text-indigo-400 hover:bg-indigo-600/20",
      amber: isActive
        ? "bg-amber-600 text-white"
        : "text-amber-400 hover:bg-amber-600/20",
      cyan: isActive
        ? "bg-cyan-600 text-white"
        : "text-cyan-400 hover:bg-cyan-600/20",
      emerald: isActive
        ? "bg-emerald-600 text-white"
        : "text-emerald-400 hover:bg-emerald-600/20",
      rose: isActive
        ? "bg-rose-600 text-white"
        : "text-rose-400 hover:bg-rose-600/20",
    };
    return colorMap[color] || colorMap.blue;
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 font-abeze text-sm">Total Users</p>
              <p className="text-3xl font-abeze font-bold text-white">
                {dashboardStats.totalUsers}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 font-abeze text-sm">Total Bookings</p>
              <p className="text-3xl font-abeze font-bold text-white">
                {dashboardStats.totalBookings}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 font-abeze text-sm">
                Total Revenue
              </p>
              <p className="text-3xl font-abeze font-bold text-white">
                LKR {dashboardStats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 font-abeze text-sm">Active Staff</p>
              <p className="text-3xl font-abeze font-bold text-white">
                {dashboardStats.activeStaff}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-abeze font-bold text-white mb-4">
          Recent Bookings
        </h3>
        {bookingsLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-300 font-abeze">
              Loading recent bookings...
            </div>
          </div>
        ) : Array.isArray(bookings) && bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-green-200 font-abeze">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-green-200 font-abeze">
                    Package
                  </th>
                  <th className="text-left py-3 px-4 text-green-200 font-abeze">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-green-200 font-abeze">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking._id} className="border-b border-white/10">
                    <td className="py-3 px-4 text-white font-abeze">
                      {booking.userId?.firstName} {booking.userId?.lastName}
                    </td>
                    <td className="py-3 px-4 text-white font-abeze">
                      {booking.packageDetails?.title}
                    </td>
                    <td className="py-3 px-4 text-white font-abeze">
                      {new Date(
                        booking.bookingDetails?.startDate
                      ).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-abeze ${
                          booking.status === "Payment Confirmed" ||
                          booking.status === "Confirmed"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-300 font-abeze">No bookings found.</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-abeze font-bold text-white">
          Customer Management
        </h3>
        <div className="text-gray-300 font-abeze text-sm">
          Total Customers: {users.length}
        </div>
      </div>

      {/* Users List */}
      {usersLoading ? (
        <div className="text-center py-8">
          <div className="text-gray-300 font-abeze">Loading customers...</div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-300 font-abeze">No customers found.</div>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Name
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Email
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Phone
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Country
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Role
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Joined
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Update Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-6 text-white font-abeze">
                      <div className="flex items-center space-x-3">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.firstName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <span className="text-green-400 text-sm font-abeze">
                              {user.firstName?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-white font-abeze">
                      {user.email}
                    </td>
                    <td className="py-4 px-6 text-white font-abeze">
                      {user.phone || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-white font-abeze">
                      {user.country || "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-abeze ${
                          user.role === "admin"
                            ? "bg-red-500/20 text-red-400"
                            : user.role === "staff"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white font-abeze text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      {user.role !== "admin" && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-abeze transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderStaff = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-abeze font-bold text-white">
          Staff Management
        </h3>
        <button
          onClick={() => setShowAddStaff(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 flex items-center space-x-2"
        >
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>Add Staff</span>
        </button>
      </div>

      {/* Staff List */}
      {staffLoading ? (
        <div className="text-center py-8">
          <div className="text-gray-300 font-abeze">Loading staff...</div>
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-300 font-abeze">
            No staff members found.
          </div>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Name
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Email
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Phone
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Role
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Basic Salary
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    License/Register
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Specialization
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Experience
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {staff.map((staffMember) => (
                  <tr
                    key={staffMember._id}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-6 text-white font-abeze">
                      <div className="flex items-center space-x-3">
                        {staffMember.profilePicture?.url ? (
                          <img
                            src={staffMember.profilePicture.url}
                            alt={staffMember.firstName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-blue-400 text-sm font-abeze">
                              {staffMember.firstName?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {staffMember.firstName} {staffMember.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-white font-abeze">
                      {staffMember.email}
                    </td>
                    <td className="py-4 px-6 text-white font-abeze">
                      {staffMember.phone}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-abeze ${
                          staffMember.role === "admin"
                            ? "bg-red-500/20 text-red-400"
                            : staffMember.role === "tour_guide"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {staffMember.role === "tour_guide"
                          ? "Tour Guide"
                          : staffMember.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white font-abeze text-sm">
                      LKR {staffMember.basicSalary?.toLocaleString() || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-white font-abeze text-sm">
                      {staffMember.licenseNumber || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-white font-abeze text-sm">
                      {staffMember.specialization || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-white font-abeze text-sm">
                      {staffMember.experience || 0} years
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-abeze ${
                          staffMember.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {staffMember.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditStaff(staffMember)}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-xs font-abeze transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staffMember._id)}
                          className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-abeze transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderSafariRequests = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-abeze font-bold text-white">
          Safari Requests
        </h3>
        <div className="text-sm text-gray-300 font-abeze">
          {safariRequestStats && (
            <span>
              Total: {safariRequestStats.total} | Pending:{" "}
              {safariRequestStats.pending} | Recent: {safariRequestStats.recent}
            </span>
          )}
        </div>
      </div>

      {/* Safari Requests List */}
      {safariRequestsLoading ? (
        <div className="text-center py-8">
          <div className="text-gray-300 font-abeze">
            Loading safari requests...
          </div>
        </div>
      ) : safariRequests.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-300 font-abeze">
            No safari requests found.
          </div>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Customer
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Contact
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Dates
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Group Size
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Duration
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Budget
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {safariRequests.map((request) => (
                  <tr
                    key={request._id}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-6 text-white font-abeze">
                      <div>
                        <div className="font-medium">{request.name}</div>
                        <div className="text-sm text-gray-400">
                          {request.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-white font-abeze text-sm">
                      {request.phone}
                    </td>
                    <td className="py-4 px-6 text-white font-abeze text-sm">
                      {request.preferredDates}
                    </td>
                    <td className="py-4 px-6 text-white font-abeze text-sm">
                      {request.groupSize}
                    </td>
                    <td className="py-4 px-6 text-white font-abeze text-sm">
                      {request.duration}
                    </td>
                    <td className="py-4 px-6 text-white font-abeze text-sm">
                      {request.budget || "Not specified"}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-abeze ${
                          request.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : request.status === "reviewed"
                            ? "bg-blue-500/20 text-blue-400"
                            : request.status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : request.status === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewSafariRequest(request)}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-xs font-abeze transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteSafariRequest(request._id)}
                          className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-abeze transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderPackages = () => (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-abeze font-bold text-white">
          Package Management
        </h3>
        <button
          onClick={() => setShowAddPackage(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 flex items-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>Add Package</span>
        </button>
      </div>

      {/* Packages List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-300 font-abeze">Loading packages...</div>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-300 font-abeze">
            No packages found. Add your first package!
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Package Images Carousel */}
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                    <Carousel
                      images={[
                        ...(pkg.image?.url ? [pkg.image.url] : []),
                        ...(pkg.gallery && Array.isArray(pkg.gallery)
                          ? pkg.gallery.map((img) => img.url)
                          : [])
                      ]}
                      alt={pkg.title}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Package Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-abeze font-bold text-white">
                        {pkg.title}
                      </h4>
                      {pkg.isPopular && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-abeze">
                          Popular
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-abeze ${
                          pkg.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {pkg.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300 font-abeze">
                      <div>
                        <span className="text-gray-400">Category:</span>{" "}
                        {pkg.category}
                      </div>
                      <div>
                        <span className="text-gray-400">Duration:</span>{" "}
                        {pkg.duration}
                      </div>
                      <div>
                        <span className="text-gray-400">Price:</span> LKR{" "}
                        {pkg.price?.toLocaleString()}
                      </div>
                      <div>
                        <span className="text-gray-400">Location:</span>{" "}
                        {pkg.location}
                      </div>
                    </div>

                    <p className="text-gray-300 font-abeze text-sm mt-2 line-clamp-2">
                      {pkg.description}
                    </p>
                  </div>
                </div>

                {/* Popular Toggle Button */}
                <div className="flex flex-col items-end space-y-2">
                  <button
                    onClick={async () => {
                      try {
                        await packageApi.updatePackage(pkg._id, {
                          ...pkg,
                          isPopular: !pkg.isPopular,
                        });
                        loadPackages();
                      } catch (err) {
                        alert("Failed to update popular status");
                      }
                    }}
                    className={`px-3 py-1 rounded text-xs font-abeze transition-colors ${pkg.isPopular ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30' : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'}`}
                  >
                    {pkg.isPopular ? 'Unmark Popular' : 'Mark as Popular'}
                  </button>
                </div>
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditPackage(pkg)}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-xs font-abeze transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg._id)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-abeze transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBookings = () => (
  <div className="space-y-6">
      {/* Enhanced Header with Stats */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h3 className="text-2xl font-abeze font-bold text-white">
              Booking Management
            </h3>
            <p className="text-gray-300 font-abeze mt-1">
              Manage and track all safari bookings
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="bg-blue-500/20 px-3 py-2 rounded-lg">
              <span className="text-blue-300 font-abeze">Total: </span>
              <span className="text-white font-bold">
                {Array.isArray(bookings) ? bookings.length : 0}
              </span>
            </div>
            <div className="bg-green-500/20 px-3 py-2 rounded-lg">
              <span className="text-green-300 font-abeze">Confirmed: </span>
              <span className="text-white font-bold">
                {Array.isArray(bookings)
                  ? bookings.filter(
                      (b) =>
                        b.status === "Confirmed" ||
                        b.status === "Payment Confirmed"
                    ).length
                  : 0}
              </span>
            </div>
            <div className="bg-yellow-500/20 px-3 py-2 rounded-lg">
              <span className="text-yellow-300 font-abeze">Pending: </span>
              <span className="text-white font-bold">
                {Array.isArray(bookings)
                  ? bookings.filter((b) => b.status === "Pending").length
                  : 0}
              </span>
            </div>
            <div className="bg-purple-500/20 px-3 py-2 rounded-lg">
              <span className="text-purple-300 font-abeze">Completed: </span>
              <span className="text-white font-bold">
                {Array.isArray(bookings)
                  ? bookings.filter((b) => b.status === "Completed").length
                  : 0}
              </span>
            </div>
            <div className="bg-red-500/20 px-3 py-2 rounded-lg">
              <span className="text-red-300 font-abeze">Cancelled: </span>
              <span className="text-white font-bold">
                {Array.isArray(bookings)
                  ? bookings.filter((b) => b.status === "Cancelled").length
                  : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar and Booking Details Side by Side */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2 w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 h-full flex flex-col">
            <h4 className="text-lg font-abeze font-bold text-white mb-4">Calendar View</h4>
            <BookingCalendar
              bookings={bookings}
              onDateClick={(date) => setSelectedCalendarDate(date)}
            />
          </div>
        </div>
        <div className="md:w-1/2 w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 h-full flex flex-col">
            <h4 className="text-lg font-abeze font-bold text-white mb-4">
              {selectedCalendarDate
                ? `Bookings for ${selectedCalendarDate.toLocaleDateString()}`
                : "Select a date to view bookings"}
            </h4>
            {selectedCalendarDate ? (
              (() => {
                const dateStr = selectedCalendarDate.toISOString().slice(0, 10);
                const bookingsForDate = bookings.filter((b) => {
                  const startDate = b.bookingDetails?.startDate
                    ? new Date(b.bookingDetails.startDate)
                        .toISOString()
                        .slice(0, 10)
                    : "";
                  return startDate === dateStr;
                });
                if (bookingsForDate.length === 0) {
                  return (
                    <p className="text-gray-300 font-abeze text-center py-8">
                      No bookings for this date.
                    </p>
                  );
                }
                return (
                  <ul className="space-y-3">
                    {bookingsForDate.map((booking) => (
                      <li
                        key={booking._id}
                        className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div>
                            <span className="text-white font-abeze font-semibold">
                              {booking.userId?.firstName} {booking.userId?.lastName}
                            </span>
                            <span className="text-gray-400 font-abeze text-sm ml-2">
                              ({booking.packageDetails?.title})
                            </span>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-abeze font-medium ml-2 ${
                              booking.status === "Payment Confirmed"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : booking.status === "Confirmed"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : booking.status === "In Progress"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : booking.status === "Completed"
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : booking.status === "Cancelled"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                );
              })()
            ) : (
              <p className="text-gray-300 font-abeze text-center py-8">
                Please select a date from the calendar to view bookings.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sorting Controls - Professional UI */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <input
              type="text"
              placeholder="Search bookings..."
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 font-abeze min-w-[180px]"
              style={{ marginRight: "1rem" }}
              aria-label="Search bookings"
            />
            <label
              htmlFor="statusFilterDropdown"
              className="text-white font-abeze text-sm font-medium"
            >
              Status Filter:
            </label>
            <select
              id="statusFilterDropdown"
              aria-label="Filter bookings by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 font-abeze"
              title="Filter bookings by status"
            >
              <option value="All">All</option>
              <option value="Payment Confirmed">Payment Confirmed</option>
              <option value="Payment Pending">Payment Pending</option>
              <option value="In Progress">Tour In Progress</option>
              <option value="Completed">Completed Tours</option>
              <option value="Cancelled">Cancelled Tours</option>
            </select>
            {/* Date filter for 'In Progress - Tour Still Not Ended' */}
            {statusFilter === "In Progress - Tour Still Not Ended" && (
              <input
                type="date"
                aria-label="Filter bookings by date"
                value={ongoingDateFilter}
                onChange={(e) => setOngoingDateFilter(e.target.value)}
                className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 font-abeze"
                style={{ minWidth: 150 }}
                title="Filter bookings by date"
              />
            )}
            {/* Download Options - moved here */}
            <label
              htmlFor="downloadType"
              className="text-white font-abeze text-sm font-medium ml-4"
            >
              Download as:
            </label>
            <select
              id="downloadType"
              value={downloadType}
              onChange={(e) => setDownloadType(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 font-abeze"
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              onClick={handleDownloadBookings}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-abeze font-medium transition-colors duration-300 flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {bookingsLoading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2 text-gray-300 font-abeze">
            <svg
              className="animate-spin h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Loading bookings...</span>
          </div>
        </div>
      ) : !Array.isArray(bookings) || bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-xl font-abeze font-bold text-white mb-2">
            No Bookings Found
          </h3>
          <p className="text-gray-400 font-abeze">
            There are no bookings to display at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {getSortedBookings(getFilteredBookings()).map((booking) => {
            const expanded = expandedBookings.includes(booking._id);
            return (
              <div
                key={booking._id}
                className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300"
              >
                {/* Booking Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 space-y-3 lg:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-abeze font-bold text-white">
                        Booking #{booking._id.slice(-6).toUpperCase()}
                      </h4>
                      <p className="text-gray-400 font-abeze text-sm">
                        <span className="font-semibold text-white">Booking ID:</span> {booking._id}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(booking._id);
                            setCopiedBookingId(booking._id);
                            setTimeout(() => setCopiedBookingId(null), 1500);
                          }}
                          title="Copy Booking ID"
                          className="ml-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-abeze border border-gray-500 transition-colors"
                          style={{ verticalAlign: 'middle' }}
                        >
                          Copy
                        </button>
                        {copiedBookingId === booking._id && (
                          <span className="ml-2 text-green-400 text-xs font-abeze">Copied!</span>
                        )}
                      </p>
                      <p className="text-gray-400 font-abeze text-sm">
                        Created on {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-abeze font-medium ${
                        booking.status === "Payment Confirmed"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : booking.status === "Confirmed"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : booking.status === "In Progress"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : booking.status === "Completed"
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : booking.status === "Cancelled"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-abeze font-medium ${
                        booking.payment
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {booking.payment ? "Paid" : "Payment Pending"}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleBookingExpand(booking._id)}
                    className="ml-4 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-abeze border border-gray-500 transition-colors"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    {expanded ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                {expanded && (
                  <>
                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Customer Information */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <h5 className="font-abeze font-semibold text-white">
                          Customer
                        </h5>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-abeze font-medium">
                          {booking.userId?.firstName} {booking.userId?.lastName}
                        </p>
                        <p className="text-gray-400 font-abeze text-sm">
                          {booking.userId?.email}
                        </p>
                      </div>
                    </div>
                    {/* Package Information */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                        </div>
                        <h5 className="font-abeze font-semibold text-white">
                          Package
                        </h5>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-abeze font-medium">
                          {booking.packageDetails?.title}
                        </p>
                        <p className="text-gray-400 font-abeze text-sm">
                          {booking.packageDetails?.location}
                        </p>
                      </div>
                    </div>
                    {/* Trip Details */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-yellow-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <h5 className="font-abeze font-semibold text-white">
                          Trip Details
                        </h5>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-abeze text-sm">
                          <span className="text-gray-400">Start:</span>{" "}
                          {new Date(
                            booking.bookingDetails?.startDate
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-white font-abeze text-sm">
                          <span className="text-gray-400">End:</span>{" "}
                          {new Date(
                            booking.bookingDetails?.endDate
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-white font-abeze text-sm">
                          <span className="text-gray-400">People:</span>{" "}
                          {booking.bookingDetails?.numberOfPeople}
                        </p>
                      </div>
                    </div>
                    {/* Financial Information */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-purple-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2-2h-2a2 2 0 012-2"
                            />
                          </svg>
                        </div>
                        <h5 className="font-abeze font-semibold text-white">
                          Payment
                        </h5>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-abeze font-bold text-lg">
                          LKR {booking.totalPrice?.toLocaleString()}
                        </p>
                        <p className="text-gray-400 font-abeze text-sm">
                          Total Amount
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Staff Assignment Section */}
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 mb-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-indigo-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <h5 className="font-abeze font-semibold text-white">
                        Staff Assignment
                      </h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Driver Assignment */}
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-blue-400 text-lg">🚗</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-abeze font-medium">
                            Driver
                          </p>
                          {booking.driverId ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-abeze text-sm">
                                {booking.driverId?.firstName}{" "}
                                {booking.driverId?.lastName}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-abeze ${
                                  booking.driverAccepted
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                                }`}
                              >
                                {booking.driverAccepted ? "Accepted" : "Pending"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 font-abeze text-sm">
                              Not assigned
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Tour Guide Assignment */}
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-green-400 text-lg">👨‍💼</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-abeze font-medium">
                            Tour Guide
                          </p>
                          {booking.guideId ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-abeze text-sm">
                                {booking.guideId?.firstName}{" "}
                                {booking.guideId?.lastName}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-abeze ${
                                  booking.guideAccepted
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                                }`}
                              >
                                {booking.guideAccepted ? "Accepted" : "Pending"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 font-abeze text-sm">
                              Not assigned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Actions Section */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleAssignStaff(booking)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-abeze font-medium transition-colors duration-300 flex items-center space-x-2"
                        disabled={booking.status === "Cancelled"}
                        style={
                          booking.status === "Cancelled"
                            ? { opacity: 0.5, cursor: "not-allowed" }
                            : {}
                        }
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <span>Assign Staff</span>
                      </button>
                      {booking.status === "Cancelled" && (
                        <span className="ml-2 text-red-500 font-abeze text-sm">
                          Cannot assign staff to a cancelled booking.
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="text-white font-abeze text-sm">
                        Update Status:
                      </label>
                      <select
                        value={booking.status}
                        onChange={(e) =>
                          handleStatusSelectChange(booking._id, e.target.value)
                        }
                        className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 font-abeze focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={booking.status === "Cancelled"}
                        style={
                          booking.status === "Cancelled"
                            ? { opacity: 0.5, cursor: "not-allowed" }
                            : {}
                        }
                      >
                        <option value="Payment Confirmed">Payment Confirmed</option>
                        <option value="Payment Pending">Payment Pending</option>
                        <option value="In Progress">Tour In Progress</option>
                        <option value="Completed">Completed Tours</option>
                        <option value="Cancelled">Cancelled Tours</option>
                      </select>
                      {booking.status === "Cancelled" && (
                        <span className="ml-2 text-red-500 font-abeze text-sm">
                          Cannot update status of a cancelled booking.
                        </span>
                      )}
                    </div>
                  </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderGallery = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-abeze font-bold text-white">
        Gallery Management
      </h3>
      <AdminGalleryManager />
      {/* Removed gallery features info paragraph as requested */}
    </div>
  );

  // Add to main render logic
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-gray-900/95 backdrop-blur-xl border-r border-gray-700 transition-all duration-300 ease-in-out flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">WS</span>
                </div>
                <div>
                  <h2 className="text-white font-abeze font-bold text-lg">
                    Wildlife Safari
                  </h2>
                  <p className="text-gray-400 text-xs">Admin Panel</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-abeze font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? getColorClasses(item.color, true)
                  : getColorClasses(item.color, false)
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.firstName?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-white font-abeze text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-gray-400 text-xs">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-abeze font-bold text-white">
                {navigationItems.find((item) => item.id === activeTab)?.label ||
                  "Dashboard"}
              </h1>
              <p className="text-gray-400 font-abeze">
                Welcome back, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-colors flex items-center space-x-2"
                title="Logout"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="font-abeze font-medium">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Tab Content */}
            <div className="min-h-96">
              {activeTab === "dashboard" && renderDashboard()}
              {activeTab === "users" && renderUsers()}
              {activeTab === "staff" && renderStaff()}
              {activeTab === "packages" && renderPackages()}
              {activeTab === "safari-requests" && renderSafariRequests()}
              {activeTab === "contact-messages" && <ContactMessages />}
              {activeTab === "bookings" && renderBookings()}
              {activeTab === "attendance" && <Attendance />}
              {activeTab === "reviews" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-abeze font-bold text-white">
                      Reviews
                    </h3>
                    <div className="text-sm text-gray-300 font-abeze">
                      Total: {reviews.length}
                    </div>
                  </div>
                  {reviewsLoading ? (
                    <div className="text-center py-8">
                      <div className="text-gray-300 font-abeze">
                        Loading reviews...
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/20">
                              <th className="text-left py-4 px-6 text-green-200 font-abeze">
                                Package
                              </th>
                              <th className="text-left py-4 px-6 text-green-200 font-abeze">
                                User
                              </th>
                              <th className="text-left py-4 px-6 text-green-200 font-abeze">
                                Rating
                              </th>
                              <th className="text-left py-4 px-6 text-green-200 font-abeze">
                                Comment
                              </th>
                              <th className="text-left py-4 px-6 text-green-200 font-abeze">
                                Images
                              </th>
                              <th className="text-left py-4 px-6 text-green-200 font-abeze">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {reviews.map((rev) => (
                              <tr
                                key={rev._id}
                                className="border-b border-white/10 hover:bg-white/5 transition-colors"
                              >
                                <td className="py-4 px-6 text-white font-abeze">
                                  {rev.packageId?.title}
                                </td>
                                <td className="py-4 px-6 text-white font-abeze">
                                  {rev.userId?.firstName} {rev.userId?.lastName}
                                </td>
                                <td className="py-4 px-6 text-white font-abeze">
                                  {rev.rating} / 5
                                </td>
                                <td className="py-4 px-6 text-white font-abeze text-sm max-w-md truncate">
                                  {rev.comment}
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex gap-2">
                                    {(rev.images || [])
                                      .slice(0, 3)
                                      .map((img) => (
                                        <img
                                          key={img.id || img.url}
                                          src={img.url}
                                          className="w-10 h-10 object-cover rounded"
                                          alt="review"
                                        />
                                      ))}
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <button
                                    onClick={() => handleDeleteReview(rev._id)}
                                    className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-abeze transition-colors"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "donations" && (
                <div className="space-y-6">
                  {/* Enhanced Header with Stats */}
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                      <div>
                        <h3 className="text-2xl font-abeze font-bold text-white">
                          Donation Management
                        </h3>
                        <p className="text-gray-300 font-abeze mt-1">
                          Track and manage all wildlife conservation donations
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="bg-blue-500/20 px-3 py-2 rounded-lg">
                          <span className="text-blue-300 font-abeze">
                            Total:{" "}
                          </span>
                          <span className="text-white font-bold">
                            {donations.length}
                          </span>
                        </div>
                        <div className="bg-green-500/20 px-3 py-2 rounded-lg">
                          <span className="text-green-300 font-abeze">
                            Completed:{" "}
                          </span>
                          <span className="text-white font-bold">
                            {
                              donations.filter(
                                (d) => d.paymentStatus === "completed"
                              ).length
                            }
                          </span>
                        </div>
                        <div className="bg-yellow-500/20 px-3 py-2 rounded-lg">
                          <span className="text-yellow-300 font-abeze">
                            Pending:{" "}
                          </span>
                          <span className="text-white font-bold">
                            {
                              donations.filter(
                                (d) => d.paymentStatus === "pending"
                              ).length
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Donations List */}
                  {donationsLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center space-x-2 text-gray-300 font-abeze">
                        <svg
                          className="animate-spin h-5 w-5 text-blue-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Loading donations...</span>
                      </div>
                    </div>
                  ) : donations.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-abeze font-bold text-white mb-2">
                        No Donations Found
                      </h3>
                      <p className="text-gray-400 font-abeze">
                        There are no donations to display at the moment.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {donations.map((donation) => (
                        <div
                          key={donation._id}
                          className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300"
                        >
                          {/* Donation Header */}
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 space-y-3 lg:space-y-0">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-lg font-abeze font-bold text-white">
                                  Donation #
                                  {donation._id.slice(-6).toUpperCase()}
                                </h4>
                                <p className="text-gray-400 font-abeze text-sm">
                                  Received on{" "}
                                  {new Date(
                                    donation.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-abeze font-medium ${
                                  donation.paymentStatus === "completed"
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : donation.paymentStatus === "pending"
                                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                                }`}
                              >
                                {donation.paymentStatus}
                              </span>
                              {donation.isAnonymous && (
                                <span className="px-3 py-1 rounded-full text-sm font-abeze font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                  Anonymous
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Donation Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {/* Donor Information */}
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                  <svg
                                    className="w-4 h-4 text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                </div>
                                <h5 className="font-abeze font-semibold text-white">
                                  Donor
                                </h5>
                              </div>
                              <div className="space-y-1">
                                <p className="text-white font-abeze font-medium">
                                  {donation.isAnonymous
                                    ? "Anonymous Donor"
                                    : `${donation.firstName} ${donation.lastName}`}
                                </p>
                                <p className="text-gray-400 font-abeze text-sm">
                                  {donation.email}
                                </p>
                              </div>
                            </div>

                            {/* Amount Information */}
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                  <svg
                                    className="w-4 h-4 text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                    />
                                  </svg>
                                </div>
                                <h5 className="font-abeze font-semibold text-white">
                                  Amount
                                </h5>
                              </div>
                              <div className="space-y-1">
                                <p className="text-white font-abeze font-bold text-lg">
                                  {donation.currency}{" "}
                                  {donation.amount?.toLocaleString()}
                                </p>
                                <p className="text-gray-400 font-abeze text-sm">
                                  Donation Amount
                                </p>
                              </div>
                            </div>

                            {/* Location Information */}
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                  <svg
                                    className="w-4 h-4 text-yellow-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                  </svg>
                                </div>
                                <h5 className="font-abeze font-semibold text-white">
                                  Location
                                </h5>
                              </div>
                              <div className="space-y-1">
                                <p className="text-white font-abeze font-medium">
                                  {donation.country}
                                </p>
                                <p className="text-gray-400 font-abeze text-sm">
                                  Donor's Country
                                </p>
                              </div>
                            </div>

                            {/* Payment Information */}
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                  <svg
                                    className="w-4 h-4 text-purple-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </div>
                                <h5 className="font-abeze font-semibold text-white">
                                  Payment
                                </h5>
                              </div>
                              <div className="space-y-1">
                                <p
                                  className={`font-abeze font-medium ${
                                    donation.paymentStatus === "completed"
                                      ? "text-green-400"
                                      : donation.paymentStatus === "pending"
                                      ? "text-yellow-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {donation.paymentStatus}
                                </p>
                                <p className="text-gray-400 font-abeze text-sm">
                                  Payment Status
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Additional Information */}
                          {donation.message && (
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 mb-6">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                  <svg
                                    className="w-4 h-4 text-indigo-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                  </svg>
                                </div>
                                <h5 className="font-abeze font-semibold text-white">
                                  Donor Message
                                </h5>
                              </div>
                              <p className="text-white font-abeze text-sm italic">
                                "{donation.message}"
                              </p>
                            </div>
                          )}

                          {/* Email Actions */}
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => handleSendEmail(donation)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-abeze font-medium transition-colors duration-300 flex items-center space-x-2"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span>Send Email</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeTab === "payroll" && <Payroll />}
              {activeTab === "gallery" && renderGallery()}
            </div>
          </div>
        </main>
      </div>

      {/* Add Package Modal */}
      {showAddPackage && (
        <AddPackageModal
          onClose={() => setShowAddPackage(false)}
          onPackageAdded={handlePackageAdded}
        />
      )}

      {/* Edit Package Modal */}
      {showEditPackage && selectedPackage && (
        <EditPackageModal
          package={selectedPackage}
          onClose={() => {
            setShowEditPackage(false);
            setSelectedPackage(null);
          }}
          onPackageUpdated={handlePackageUpdated}
        />
      )}

      {/* Add Staff Modal */}
      {showAddStaff && (
        <AddStaffModal
          onClose={() => setShowAddStaff(false)}
          onStaffAdded={handleStaffAdded}
        />
      )}

      {/* Edit Staff Modal */}
      {showEditStaff && selectedStaff && (
        <EditStaffModal
          staff={selectedStaff}
          onClose={() => {
            setShowEditStaff(false);
            setSelectedStaff(null);
          }}
          onStaffUpdated={handleStaffUpdated}
        />
      )}

      {/* Safari Request Modal */}
      {showSafariRequestModal && selectedSafariRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-abeze font-bold text-white">
                      Safari Request Details
                    </h2>
                    <p className="text-gray-400 font-abeze">
                      Request ID: {selectedSafariRequest._id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseSafariRequestModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-abeze font-medium ${
                    selectedSafariRequest.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : selectedSafariRequest.status === "reviewed"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : selectedSafariRequest.status === "approved"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : selectedSafariRequest.status === "rejected"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                  }`}
                >
                  {selectedSafariRequest.status.charAt(0).toUpperCase() +
                    selectedSafariRequest.status.slice(1)}
                </span>
                <span className="text-gray-400 font-abeze text-sm">
                  Submitted:{" "}
                  {new Date(
                    selectedSafariRequest.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-abeze font-bold text-white mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 font-abeze text-sm">
                      Name
                    </label>
                    <p className="text-white font-abeze">
                      {selectedSafariRequest.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 font-abeze text-sm">
                      Email
                    </label>
                    <p className="text-white font-abeze">
                      {selectedSafariRequest.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 font-abeze text-sm">
                      Phone
                    </label>
                    <p className="text-white font-abeze">
                      {selectedSafariRequest.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Safari Details */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-abeze font-bold text-white mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 text-green-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                    />
                  </svg>
                  Safari Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 font-abeze text-sm">
                      Preferred Dates
                    </label>
                    <p className="text-white font-abeze">
                      {selectedSafariRequest.preferredDates}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 font-abeze text-sm">
                      Group Size
                    </label>
                    <p className="text-white font-abeze">
                      {selectedSafariRequest.groupSize}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 font-abeze text-sm">
                      Duration
                    </label>
                    <p className="text-white font-abeze">
                      {selectedSafariRequest.duration}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 font-abeze text-sm">
                      Budget
                    </label>
                    <p className="text-white font-abeze">
                      {selectedSafariRequest.budget || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-abeze font-bold text-white mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 text-purple-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Additional Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 font-abeze text-sm">
                      Preferred Locations
                    </label>
                    <p className="text-white font-abeze">
                      {selectedSafariRequest.preferredLocations ||
                        "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 font-abeze text-sm">
                      Wildlife Interests
                    </label>
                    <p className="text-white font-abeze">
                      {selectedSafariRequest.wildlifeInterests ||
                        "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 font-abeze text-sm">
                      Special Requirements
                    </label>
                    <p className="text-white font-abeze">
                      {selectedSafariRequest.specialRequirements || "None"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Section */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-abeze font-bold text-white mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 text-yellow-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Admin Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 font-abeze text-sm">
                      Estimated Price
                    </label>
                    <p className="text-white font-abeze">
                      {selectedSafariRequest.estimatedPrice
                        ? `LKR ${selectedSafariRequest.estimatedPrice.toLocaleString()}`
                        : "Not estimated yet"}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 font-abeze text-sm">
                      Admin Notes
                    </label>
                    <p className="text-white font-abeze">
                      {selectedSafariRequest.adminNotes || "No notes yet"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700 flex items-center justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={() =>
                    handleDeleteSafariRequest(selectedSafariRequest._id)
                  }
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-abeze font-medium transition-colors duration-300 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-4.867 4.867a2 2 0 01-2.828 0L7 7m0 10l4.867-4.867a2 2 0 012.828 0L17 17"
                    />
                  </svg>
                  <span>Delete Request</span>
                </button>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCloseSafariRequestModal}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-abeze font-medium transition-colors duration-300"
                >
                  Close
                </button>
                {selectedSafariRequest.status !== "approved" && (
                  <button
                    onClick={() =>
                      handleApproveSafariRequest(selectedSafariRequest._id)
                    }
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-abeze font-medium transition-colors duration-300 flex items-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Approve Request</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Package Modal */}
      {showAddPackage && (
        <AddPackageModal
          onClose={() => setShowAddPackage(false)}
          onPackageAdded={handlePackageAdded}
        />
      )}

      {/* Edit Package Modal */}
      {showEditPackage && selectedPackage && (
        <EditPackageModal
          package={selectedPackage}
          onClose={() => {
            setShowEditPackage(false);
            setSelectedPackage(null);
          }}
          onPackageUpdated={handlePackageUpdated}
        />
      )}

      {/* Add Staff Modal */}
      {showAddStaff && (
        <AddStaffModal
          onClose={() => setShowAddStaff(false)}
          onStaffAdded={handleStaffAdded}
        />
      )}

      {/* Edit Staff Modal */}
      {showEditStaff && selectedStaff && (
        <EditStaffModal
          staff={selectedStaff}
          onClose={() => {
            setShowEditStaff(false);
            setSelectedStaff(null);
          }}
          onStaffUpdated={handleStaffUpdated}
        />
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && selectedBookingForAssignment && (
        <AssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedBookingForAssignment(null);
          }}
          booking={selectedBookingForAssignment}
          onAssignmentComplete={handleAssignmentComplete}
        />
      )}

      {/* Email Modal */}
      {showEmailModal && selectedDonation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-abeze font-bold text-white">
                      Send Email to Donor
                    </h2>
                    <p className="text-gray-400 font-abeze">
                      {selectedDonation.isAnonymous
                        ? "Anonymous Donor"
                        : `${selectedDonation.firstName} ${selectedDonation.lastName}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseEmailModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Donation Summary */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="text-lg font-abeze font-bold text-white mb-3">
                  Donation Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400 font-abeze">Amount:</span>
                    <p className="text-white font-abeze font-semibold">
                      {selectedDonation.currency}{" "}
                      {selectedDonation.amount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-abeze">Date:</span>
                    <p className="text-white font-abeze">
                      {new Date(
                        selectedDonation.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-abeze">Email:</span>
                    <p className="text-white font-abeze">
                      {selectedDonation.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-abeze">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-abeze font-medium ${
                        selectedDonation.paymentStatus === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : selectedDonation.paymentStatus === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {selectedDonation.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-abeze font-medium mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-4 py-3 font-abeze focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email subject..."
                  />
                </div>
                <div>
                  <label className="block text-white font-abeze font-medium mb-2">
                    Email Message
                  </label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    rows={8}
                    className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-4 py-3 font-abeze focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter your email message..."
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700 flex items-center justify-between">
              <button
                onClick={handleCloseEmailModal}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-abeze font-medium transition-colors duration-300"
              >
                Cancel
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={handleSendThankYouEmail}
                  disabled={sendingEmail}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-abeze font-medium transition-colors duration-300 flex items-center space-x-2"
                >
                  {sendingEmail ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Send Thank You</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleSendCustomEmail}
                  disabled={
                    sendingEmail || !emailSubject.trim() || !emailMessage.trim()
                  }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-abeze font-medium transition-colors duration-300 flex items-center space-x-2"
                >
                  {sendingEmail ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Send Custom Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
