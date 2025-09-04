
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Toast } from "../components/Toast";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { UserContactMessages } from "../components/UserContactMessages";
import { AddReviewModal } from "../components/AddReviewModal";
import { bookingApi } from "../services/api";
import { galleryApi } from "../services/api";
import { reviewApi } from "../services/api";
import { generateBookingPDF } from "../utils/pdfGenerator";
import { EditProfileModal } from "../components/EditProfileModal";
import { useTranslation } from "react-i18next";

const UserAccountPage = () => {
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleEditProfile = () => setShowEditProfile(true);
  const handleCloseEditProfile = () => setShowEditProfile(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [activeTab, setActiveTab] = useState("profile");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userGallery, setUserGallery] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [showCurrentBookings, setShowCurrentBookings] = useState(true);
  const [currentBookingsPage, setCurrentBookingsPage] = useState(1);
  const [currentReviewsPage, setCurrentReviewsPage] = useState(1);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(null);
  const [galleryTab, setGalleryTab] = useState("pending");
  const [showReviewForBookingId, setShowReviewForBookingId] = useState(null);
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);
  const [modalReview, setModalReview] = useState(null);
  const [showAlreadyReviewedMessage, setShowAlreadyReviewedMessage] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const bookingsPerPage = 5;
  const reviewsPerPage = 3;

  // Fetch user data, bookings, reviews, and gallery on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const userResponse = await fetch("http://localhost:5000/api/users/me", {
          credentials: "include",
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        } else {
          setToast({ message: "Failed to load user data.", type: "error" });
        }

        // Fetch bookings, reviews, and gallery in parallel
        const [bookingsResponse, reviewsResponse, galleryResponse] = await Promise.all([
          bookingApi.getUserBookings(),
          reviewApi.getUserReviews(),
          galleryApi.getUserGallery(),
        ]);

        if (bookingsResponse.success) {
          setBookings(bookingsResponse.bookings);
        } else {
          setToast({ message: "Failed to load bookings.", type: "error" });
        }

        if (reviewsResponse.reviews) {
          setReviews(reviewsResponse.reviews);
        } else {
          setToast({ message: "Failed to load reviews.", type: "error" });
        }

        if (galleryResponse && galleryResponse.success && Array.isArray(galleryResponse.images)) {
          setUserGallery(galleryResponse.images);
        } else {
          setToast({ message: "Failed to load gallery.", type: "error" });
        }
      } catch (error) {
        setToast({ message: error.message || "An error occurred.", type: "error" });
      }
    };

    fetchData();
  }, []);

  // Handle view bookings button
  const handleViewBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const response = await bookingApi.getUserBookings();
      if (response.success) {
        setBookings(response.bookings);
      } else {
        setToast({ message: "Failed to load bookings.", type: "error" });
      }
    } catch (error) {
      setToast({
        message: `${t("userAccount.errors.failedToLoadBookings")}. ${t(
          "userAccount.errors.pleaseTryAgain"
        )}`,
        type: "error",
      });
    } finally {
      setLoadingBookings(false);
    }
  }, [t]);

  // Fetch bookings when component mounts if user has any
  useEffect(() => {
    const checkBookings = async () => {
      try {
        const response = await bookingApi.getUserBookings();
        if (response.success && response.bookings.length > 0) {
          setBookings(response.bookings);
        }
      } catch (error) {
        console.error("Error checking initial bookings:", error);
      }
    };

    checkBookings();
  }, []);

  // Ensure user reviews are available for button state in bookings list
  useEffect(() => {
    loadUserReviews();
  }, []);

  // Load bookings when bookings tab is selected
  useEffect(() => {
    if (activeTab === "bookings" && bookings.length === 0) {
      handleViewBookings();
    }
  }, [activeTab, bookings.length, handleViewBookings]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "bookings") {
      setCurrentBookingsPage(1);
      if (bookings.length === 0) {
        handleViewBookings();
      }
    }
    if (tab === "reviews") {
      setCurrentReviewsPage(1);
      loadUserReviews();
    }
  };

  const loadUserReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await reviewApi.getUserReviews();
      if (response.reviews) {
        setReviews(response.reviews);
      }
    } catch (error) {
      console.error("Error loading user reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const checkIfAlreadyReviewed = (bookingId) => {
    return reviews.some((review) => {
      if (!review.bookingId) return false;
      // bookingId can be string or object
      if (typeof review.bookingId === "string") {
        return review.bookingId === bookingId;
      }
      // If populated, compare _id
      return review.bookingId._id === bookingId;
    });
  };

  const handleAddReview = (bookingId) => {
    if (checkIfAlreadyReviewed(bookingId)) {
      setShowAlreadyReviewedMessage(true);
      showToast("You have already reviewed this booking.", "error");
      setTimeout(() => setShowAlreadyReviewedMessage(false), 3000);
      return;
    }
    setShowReviewForBookingId(bookingId);
  };

  // Pagination functions for reviews
  const indexOfLastReview = currentReviewsPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalReviewsPages = Math.ceil(reviews.length / reviewsPerPage);

  const handleReviewsPageChange = (pageNumber) => {
    setCurrentReviewsPage(pageNumber);
  };

  // Pagination functions for bookings
  const indexOfLastBooking = currentBookingsPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;

  const currentBookings = bookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );



  const handleDownloadPDF = async (booking) => {
    setDownloadingPDF(booking._id);
    try {
      await generateBookingPDF(booking, user);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      // You could add a toast notification here for better UX
    } finally {
      setDownloadingPDF(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Add Review Modal */}
      {showReviewForBookingId && (
        <AddReviewModal
          onClose={() => setShowReviewForBookingId(null)}
          onSubmit={async (reviewData) => {
            try {
              // Convert reviewData to FormData, use 'images' field for files
              const formData = new FormData();
              formData.append("rating", reviewData.rating);
              formData.append("comment", reviewData.comment || "");
              if (reviewData.files && reviewData.files.length > 0) {
                reviewData.files.forEach((file) => {
                  formData.append("images", file);
                });
              }
              await reviewApi.createReview(showReviewForBookingId, formData);
              setShowReviewSuccess(true);
              setShowReviewForBookingId(null);
              loadUserReviews();
              showToast("Review submitted successfully!", "success");
            } catch (error) {
              showToast("Failed to submit review.", "error");
            }
          }}
        />
      )}
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gray-800/50"></div>
      <div className="absolute inset-0 opacity-30">
        <div
          className="w-full h-full bg-repeat bg-center"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>
      <Header />
      {/* Main Content */}
      <div className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4 md:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-abeze font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 mb-4 animate-fade-in drop-shadow-lg">
              {t("userAccount.pageTitle")}
            </h1>
            <p className="text-slate-300 font-abeze text-lg opacity-90">
              {t("userAccount.pageSubtitle")}
            </p>
          </div>
          {/* Account Content */}
          <div className="max-w-7xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center mb-8 bg-gray-800/90 backdrop-blur-xl rounded-3xl p-3 border border-gray-700/50 shadow-2xl transition-colors duration-500 hover:shadow-emerald-400/30 w-full">
              <button
                onClick={() => handleTabChange("profile")}
                className={`px-8 py-4 rounded-2xl font-abeze font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  activeTab === "profile"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                    : "text-slate-300 hover:text-white hover:bg-emerald-600/20"
                }`}
              >
                {t("userAccount.tabs.profile")}
              </button>
              <button
                onClick={() => handleTabChange("bookings")}
                className={`px-8 py-4 rounded-2xl font-abeze font-medium transition-all duration-500 transform hover:scale-105 ${
                  activeTab === "bookings"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                    : "text-slate-300 hover:text-white hover:bg-emerald-600/20"
                }`}
              >
                {t("userAccount.tabs.bookings")}
              </button>
              <button
                onClick={() => handleTabChange("messages")}
                className={`px-8 py-4 rounded-2xl font-abeze font-medium transition-all duration-500 transform hover:scale-105 ${
                  activeTab === "messages"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                    : "text-slate-300 hover:text-white hover:bg-emerald-600/20"
                }`}
              >
                {t("userAccount.tabs.messages")}
              </button>
              <button
                onClick={() => handleTabChange("gallery")}
                className={`px-8 py-4 rounded-2xl font-abeze font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  activeTab === "gallery"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                    : "text-slate-300 hover:text-white hover:bg-emerald-600/20"
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => handleTabChange("reviews")}
                className={`px-8 py-4 rounded-2xl font-abeze font-medium transition-all duration-500 transform hover:scale-105 ${
                  activeTab === "reviews"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                    : "text-slate-300 hover:text-white hover:bg-emerald-600/20"
                }`}
              >
                {t("userAccount.myReviews")}
              </button>
            </div>
            {/* Gallery Upload Section (now outside tab navigation) */}
            {activeTab === "gallery" && (
              <div className="w-full flex flex-col items-center mt-6">
                <div className="bg-gray-900/80 rounded-2xl p-8 border border-gray-700/50 shadow-xl w-full max-w-xl mb-8">
                  <h3 className="text-2xl font-abeze font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 mb-6 text-center">
                    Upload Your Photos to Sell
                  </h3>
                  <button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-abeze font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25 mb-4"
                    onClick={() => setShowPhotoUpload(true)}
                  >
                    Upload Photo
                  </button>
                  <p className="text-slate-400 text-sm mt-4 text-center">
                    Photos will be reviewed by admin before being listed for sale.<br />
                    <span className="text-emerald-400">Commission applies.</span>
                  </p>
                </div>
                <div className="w-full max-w-3xl">
                  <h4 className="text-lg font-bold text-white mb-4">Your Gallery Images</h4>
                  {/* Gallery status tabs */}
                  <div className="flex space-x-2 mb-6">
                    {['pending', 'approved', 'rejected'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setGalleryTab(tab)}
                        className={`px-4 py-2 rounded-t-lg font-bold capitalize transition-colors duration-150 ${
                          galleryTab === tab
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-slate-300 hover:bg-gray-700'
                        }`}
                      >
                        {tab}
                        {userGallery.filter(img => img.status === tab).length > 0 ? ` (${userGallery.filter(img => img.status === tab).length})` : ''}
                      </button>
                    ))}
                  </div>
                  {loadingGallery ? (
                    <div className="text-slate-300">Loading your images...</div>
                  ) : userGallery.length === 0 ? (
                    <div className="text-slate-400">No images found.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userGallery.filter(img => img.status === galleryTab).length === 0 ? (
                        <div className="text-slate-400">No {galleryTab} images.</div>
                      ) : (
                        userGallery.filter(img => img.status === galleryTab).map((img) => (
                          <div key={img._id} className="bg-gray-800 rounded-lg p-4 flex flex-col items-center border border-gray-700/40">
                            <div className="w-40 h-40 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden mb-2">
                              {img.imageUrl ? (
                                <img src={img.imageUrl} alt={img.title || 'Gallery Image'} className="object-cover w-full h-full" />
                              ) : (
                                <span className="text-slate-400">No image</span>
                              )}
                            </div>
                            <div className="text-white font-bold mb-1">{img.title || 'Untitled'}</div>
                            <div className="text-slate-300 mb-1">Price: ${img.price}</div>
                            <div className={`text-xs px-2 py-1 rounded-full mb-1 font-bold ${img.status === 'approved' ? 'bg-green-600 text-white' : img.status === 'pending' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'}`}>{img.status}</div>
                            <div className="text-slate-400 text-xs">Commission: {img.commission || 0}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Bookings Tab Content (Current & History) */}
            {activeTab === "bookings" && (
              <div className="bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                <div className="flex gap-4 mb-8 justify-center">
                  <button
                    className={`px-8 py-4 rounded-2xl font-abeze font-medium transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                      showCurrentBookings
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-700 text-slate-300 hover:text-white hover:bg-emerald-600/20"
                    }`}
                    onClick={() => setShowCurrentBookings(true)}
                  >
                    Current Bookings
                  </button>
                  <button
                    className={`px-8 py-4 rounded-2xl font-abeze font-medium transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                      !showCurrentBookings
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-700 text-slate-300 hover:text-white hover:bg-emerald-600/20"
                    }`}
                    onClick={() => setShowCurrentBookings(false)}
                  >
                    Booking History
                  </button>
                </div>
                {showCurrentBookings ? (
                  <>
                    <h3 className="text-2xl font-abeze font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 mb-8">
                      Current Bookings
                    </h3>
                    {loadingBookings ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                        <p className="text-gray-300 font-abeze">
                          Loading your bookings...
                        </p>
                      </div>
                    ) : bookings.filter(
                        (b) =>
                          b.status !== "Completed" && b.status !== "Cancelled"
                      ).length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-300 font-abeze">
                          No current bookings found.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto mb-8">
                        <table className="min-w-full bg-gray-900 rounded-2xl overflow-hidden">
                          <thead>
                            <tr className="bg-emerald-700/40 text-white">
                              <th className="px-6 py-3 text-left font-abeze">
                                Package
                              </th>
                              <th className="px-6 py-3 text-left font-abeze">
                                Dates
                              </th>
                              <th className="px-6 py-3 text-left font-abeze">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left font-abeze">
                                Total Price
                              </th>
                              <th className="px-6 py-3 text-left font-abeze">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookings
                              .filter(
                                (b) =>
                                  b.status !== "Completed" &&
                                  b.status !== "Cancelled"
                              )
                              .map((booking) => (
                                <tr
                                  key={booking._id}
                                  className="border-b border-gray-700/30"
                                >
                                  <td className="px-6 py-4 text-white font-abeze">
                                    {booking.packageDetails?.title || "N/A"}
                                  </td>
                                  <td className="px-6 py-4 text-white font-abeze">
                                    {booking.bookingDetails?.startDate
                                      ? new Date(
                                          booking.bookingDetails.startDate
                                        ).toLocaleDateString()
                                      : "N/A"}
                                    {" - "}
                                    {booking.bookingDetails?.endDate
                                      ? new Date(
                                          booking.bookingDetails.endDate
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </td>
                                  <td className="px-6 py-4 font-abeze">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        booking.status === "Pending"
                                          ? "bg-yellow-500 text-white"
                                          : "bg-gray-700 text-white"
                                      }`}
                                    >
                                      {booking.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-white font-abeze">
                                    Rs.{" "}
                                    {booking.totalPrice?.toLocaleString() ||
                                      "N/A"}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-2">
                                      {/* Download PDF Button */}
                                      {downloadingPDF === booking._id ? (
                                        <button
                                          onClick={() =>
                                            handleDownloadPDF(booking)
                                          }
                                          disabled
                                          title="Download your booking details as PDF"
                                          className="group relative px-4 py-2 rounded font-abeze font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl border bg-blue-500 hover:bg-blue-700 border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                        >
                                          Generating PDF...
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            handleDownloadPDF(booking)
                                          }
                                          title="Download your booking details as PDF"
                                          className="group relative px-4 py-2 rounded font-abeze font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl border bg-blue-500 hover:bg-blue-700 border-blue-400/30 text-white"
                                        >
                                          Download PDF
                                        </button>
                                      )}
                                      {/* Update Booking Button */}
                                      {(booking.status === "Pending" ||
                                        booking.status ===
                                          "Payment Confirmed") && (
                                        <button
                                          onClick={() =>
                                            navigate(
                                              `/update-booking/${booking._id}`
                                            )
                                          }
                                          title="Update your booking details"
                                          className="group relative px-4 py-2 rounded font-abeze font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl border bg-green-500 hover:bg-green-700 border-green-400/30 text-white"
                                        >
                                          Update
                                        </button>
                                      )}
                                      {/* Pay Now Button for Pending bookings */}
                                      {booking.status === "Pending" &&
                                        !booking.payment && (
                                          <button
                                            onClick={async () => {
                                              try {
                                                const payload = {
                                                  bookingId: booking._id,
                                                };
                                                const res =
                                                  await bookingApi.createStripeCheckout(
                                                    payload
                                                  );
                                                if (
                                                  res.success &&
                                                  res.session_url
                                                ) {
                                                  window.location.href =
                                                    res.session_url;
                                                } else {
                                                  alert(
                                                    res.message ||
                                                      "Failed to start payment."
                                                  );
                                                }
                                              } catch (err) {
                                                alert(
                                                  "Error starting payment."
                                                );
                                              }
                                            }}
                                            title="Pay for your booking now"
                                            className="group relative px-4 py-2 rounded font-abeze font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl border bg-yellow-400 hover:bg-yellow-500 border-yellow-300/30 text-white"
                                          >
                                            Pay Now
                                          </button>
                                        )}
                                      {/* Cancel Booking Button */}
                                      {(booking.status === "Pending" ||
                                        booking.status ===
                                          "Payment Confirmed") && (
                                        <button
                                          onClick={async () => {
                                            if (
                                              window.confirm(
                                                "Are you sure you want to cancel this booking?"
                                              )
                                            ) {
                                              try {
                                                const res =
                                                  await bookingApi.updateBookingStatus(
                                                    booking._id,
                                                    "Cancelled"
                                                  );
                                                if (!res.success) {
                                                  showToast(
                                                    res.message ||
                                                      "Failed to cancel booking.",
                                                    "error"
                                                  );
                                                } else {
                                                  handleViewBookings();
                                                  showToast(
                                                    "Booking cancelled.",
                                                    "success"
                                                  );
                                                }
                                              } catch (err) {
                                                showToast(
                                                  "An error occurred while cancelling the booking.",
                                                  "error"
                                                );
                                              }
                                            }
                                          }}
                                          title="Cancel this booking"
                                          className="group relative px-4 py-2 rounded font-abeze font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl border bg-red-500 hover:bg-red-700 border-red-400/30 text-white"
                                        >
                                          Cancel
                                        </button>
                                      )}
                                      {/* WhatsApp Contact Button for In Progress bookings */}
                                      {booking.guideId &&
                                        booking.guideId.phone && (
                                          <a
                                            href={`https://wa.me/${booking.guideId.phone}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={`Contact your guide (${booking.guideId.firstName} ${booking.guideId.lastName}) on WhatsApp`}
                                            className="group relative px-4 py-2 rounded font-abeze font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl border bg-green-400 hover:bg-green-600 border-green-300/30 text-white"
                                          >
                                            WhatsApp Guide:{" "}
                                            {booking.guideId.firstName}{" "}
                                            {booking.guideId.lastName}
                                          </a>
                                        )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-abeze font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 mb-8">
                      Booking History
                    </h3>
                    {loadingBookings ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                        <p className="text-gray-300 font-abeze">
                          Loading your booking history...
                        </p>
                      </div>
                    ) : bookings.filter(
                        (b) =>
                          b.status === "Completed" || b.status === "Cancelled"
                      ).length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-300 font-abeze">
                          No booking history found.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-900 rounded-2xl overflow-hidden">
                          <thead>
                            <tr className="bg-emerald-700/40 text-white">
                              <th className="px-6 py-3 text-left font-abeze">
                                Package
                              </th>
                              <th className="px-6 py-3 text-left font-abeze">
                                Dates
                              </th>
                              <th className="px-6 py-3 text-left font-abeze">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left font-abeze">
                                Total Price
                              </th>
                              <th className="px-6 py-3 text-left font-abeze">
                                Review
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookings
                              .filter(
                                (b) =>
                                  b.status === "Completed" ||
                                  b.status === "Cancelled"
                              )
                              .map((booking) => (
                                <tr
                                  key={booking._id}
                                  className="border-b border-gray-700/30"
                                >
                                  <td className="px-6 py-4 text-white font-abeze">
                                    {booking.packageDetails?.title || "N/A"}
                                  </td>
                                  <td className="px-6 py-4 text-white font-abeze">
                                    {booking.bookingDetails?.startDate
                                      ? new Date(
                                          booking.bookingDetails.startDate
                                        ).toLocaleDateString()
                                      : "N/A"}
                                    {" - "}
                                    {booking.bookingDetails?.endDate
                                      ? new Date(
                                          booking.bookingDetails.endDate
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </td>
                                  <td className="px-6 py-4 font-abeze">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        booking.status === "Completed"
                                          ? "bg-green-600 text-white"
                                          : booking.status === "Cancelled"
                                          ? "bg-red-600 text-white"
                                          : "bg-gray-700 text-white"
                                      }`}
                                    >
                                      {booking.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-white font-abeze">
                                    Rs.{" "}
                                    {booking.totalPrice?.toLocaleString() ||
                                      "N/A"}
                                  </td>
                                  <td className="px-6 py-4 font-abeze">
                                    {booking.status === "Completed" ? (
                                      checkIfAlreadyReviewed(booking._id) ? (
                                        <span className="text-green-400">
                                          Reviewed
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            handleAddReview(booking._id)
                                          }
                                          title="Add a review for this completed booking"
                                          className="bg-emerald-500 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
                                        >
                                          Add Review
                                        </button>
                                      )
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Profile Tab Content */}
            {activeTab === "profile" && (
              <div className="grid md:grid-cols-3 gap-12 w-full">
                {/* Profile Card */}
                <div className="md:col-span-1">
                  <div className="bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl hover:shadow-emerald-500/10 transition-colors duration-500">
                    <div className="text-center mb-6">
                      <div className="relative w-28 h-28 rounded-full mx-auto mb-6 overflow-hidden border-4 border-gradient-to-r from-emerald-400 to-green-500 p-1 shadow-xl transition-all duration-500 hover:border-emerald-400 animate-avatar">
                        <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                          {user?.profilePicture?.url ? (
                            <img
                              src={user.profilePicture.url}
                              alt={t("userAccount.common.profileImageAlt")}
                              className="w-full h-full object-cover drop-shadow-lg"
                            />
                          ) : (
                            <svg
                              className="w-16 h-16 text-emerald-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <circle cx="12" cy="8" r="4" strokeWidth="2" />
                              <path
                                strokeWidth="2"
                                d="M4 20c0-4 4-6 8-6s8 2 8 6"
                              />
                            </svg>
                          )}
                        </div>
                        {/* Online indicator */}
                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg"></div>
                      </div>
                      <h2 className="text-2xl font-abeze font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 mb-2">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user?.firstName ||
                            t("userAccount.common.defaultUser")}
                      </h2>
                      <p className="text-slate-400 font-abeze text-sm break-all truncate min-w-0">
                        {user?.email}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={handleEditProfile}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-abeze font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
                      >
                        {t("userAccount.profile.editProfile")}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-abeze font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
                      >
                        {t("userAccount.profile.logout")}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="md:col-span-2">
                  <div className="bg-gray-800/90 backdrop-blur-xl rounded-3xl p-10 border border-gray-700/50 shadow-2xl transition-colors duration-500 hover:shadow-emerald-400/30 w-full">
                    <h3 className="text-2xl font-abeze font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 mb-8">
                      {t("userAccount.profile.accountInformation")}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                          {t("userAccount.profile.firstName")}
                        </label>
                        <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl px-6 py-4 text-white font-abeze group-hover:border-emerald-400/30 transition-all duration-300">
                          {user?.firstName ||
                            t("userAccount.profile.notProvided")}
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                          {t("userAccount.profile.lastName")}
                        </label>
                        <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl px-6 py-4 text-white font-abeze group-hover:border-emerald-400/30 transition-all duration-300">
                          {user?.lastName ||
                            t("userAccount.profile.notProvided")}
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                          {t("userAccount.profile.emailAddress")}
                        </label>
                        <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl px-6 py-4 text-white font-abeze group-hover:border-emerald-400/30 transition-all duration-300 break-all truncate min-w-0">
                          {user?.email}
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                          {t("userAccount.profile.phoneNumber")}
                        </label>
                        <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl px-6 py-4 text-white font-abeze group-hover:border-emerald-400/30 transition-all duration-300">
                          {user?.phone || t("userAccount.profile.notProvided")}
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                          {t("userAccount.profile.country")}
                        </label>
                        <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl px-6 py-4 text-white font-abeze group-hover:border-emerald-400/30 transition-all duration-300">
                          {user?.country ||
                            t("userAccount.profile.notProvided")}
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                          {t("userAccount.profile.memberSince")}
                        </label>
                        <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl px-6 py-4 text-white font-abeze group-hover:border-emerald-400/30 transition-all duration-300">
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : t("userAccount.profile.recentlyJoined")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages Tab Content */}
            {activeTab === "messages" && (
              <UserContactMessages userEmail={user?.email} />
            )}

            {/* Reviews Tab Content */}
            {activeTab === "reviews" && (
              <div className="bg-gray-800/90 backdrop-blur-xl rounded-3xl p-10 border border-gray-700/50 shadow-2xl transition-colors duration-500 hover:shadow-emerald-400/30 w-full">
                <h3 className="text-2xl font-abeze font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 mb-8">
                  {t("userAccount.myReviews")}
                </h3>
                {loadingReviews ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                    <p className="text-gray-300 font-abeze">
                      {t("userAccount.loadingReviews")}
                    </p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gray-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-300 font-abeze mb-4">
                      {t("userAccount.noReviewsYet")}
                    </p>
                    <p className="text-gray-400 font-abeze text-sm">
                      {t("userAccount.completeBookingToReview")}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {currentReviews.map((review) => (
                        <div
                          key={review._id}
                          className="bg-gray-700/50 p-6 rounded-2xl border border-gray-600/50 shadow-md flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-white font-abeze font-semibold text-lg">
                                  {review.packageId?.title ||
                                    review.bookingId.packageDetails?.title ||
                                    "N/A"}
                                </p>
                                <p className="text-slate-400 font-abeze text-sm">
                                  {review.createdAt
                                    ? new Date(
                                        review.createdAt
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  review.rating === 5
                                    ? "bg-green-500 text-white"
                                    : review.rating >= 3
                                    ? "bg-yellow-400 text-white"
                                    : "bg-red-500 text-white"
                                }`}
                              >
                                {review.rating} stars
                              </span>
                            </div>
                            <p className="text-slate-300 font-abeze mb-2 line-clamp-3">
                              {review.comment ||
                                t("userAccount.reviews.noComment")}
                            </p>
                            {review.images && review.images.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {review.images.slice(0, 3).map((img, idx) => (
                                  <img
                                    key={img.id || idx}
                                    src={img.url}
                                    alt={`Review image ${idx + 1}`}
                                    className="w-16 h-16 object-cover rounded border border-gray-600 shadow cursor-pointer"
                                    onClick={() => setModalReview(review)}
                                  />
                                ))}
                                {review.images.length > 3 && (
                                  <span className="text-xs text-gray-400 ml-2">
                                    +{review.images.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() =>
                                handleAddReview(review.bookingId._id)
                              }
                              title="Edit your review for this booking"
                              className="flex-1 bg-emerald-500 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              title="Delete this review"
                              className="flex-1 bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setModalReview(review)}
                              title="View Details"
                              className="flex-1 bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Modal for review details */}
                    {modalReview && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                        <div className="bg-gray-900 rounded-2xl p-8 max-w-lg w-full relative">
                          <button
                            onClick={() => setModalReview(null)}
                            className="absolute top-4 right-4 text-white text-2xl font-bold"
                            title="Close"
                          >
                            ×
                          </button>
                          <h4 className="text-xl font-bold text-white mb-2">
                            {modalReview.packageId?.title ||
                              modalReview.bookingId.packageDetails?.title ||
                              "N/A"}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block ${
                              modalReview.rating === 5
                                ? "bg-green-500 text-white"
                                : modalReview.rating >= 3
                                ? "bg-yellow-400 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {modalReview.rating} stars
                          </span>
                          <p className="text-slate-300 font-abeze mb-4">
                            {modalReview.comment ||
                              t("userAccount.reviews.noComment")}
                          </p>
                          {modalReview.images &&
                            modalReview.images.length > 0 && (
                              <div className="flex flex-wrap gap-3 mb-4">
                                {modalReview.images.map((img, idx) => (
                                  <img
                                    key={img.id || idx}
                                    src={img.url}
                                    alt={`Review image ${idx + 1}`}
                                    className="w-32 h-32 object-cover rounded border border-gray-600 shadow"
                                  />
                                ))}
                              </div>
                            )}
                          <p className="text-slate-400 text-sm">
                            {modalReview.createdAt
                              ? new Date(
                                  modalReview.createdAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>{" "}
          {/* Close .max-w-4xl mx-auto */}
        </div>{" "}
        {/* Close .container mx-auto px-6 */}
      </div>{" "}
      {/* Close .pt-24 pb-16 relative z-10 */}
      {/* Render EditProfileModal when showEditProfile is true */}
      {showEditProfile && (
        <EditProfileModal onClose={handleCloseEditProfile} user={user} />
      )}
      <Footer />
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "" })}
        />
      )}
    </div>
  );
}

export default UserAccountPage;

export function PhotoUploadModal({ user, setToast, onClose, fetchUserGallery }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFilesChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!selectedFiles || selectedFiles.length === 0) {
        setToast({ message: "Please select at least one image to upload.", type: "error" });
        return;
      }
      setUploading(true);
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("images", file));
      formData.append("title", description);
      formData.append("price", price);
      formData.append("tags", tags);
      if (user && user._id) {
        formData.append("userId", user._id);
        formData.append("userEmail", user.email);
      }
      setToast({ message: "Uploading...", type: "success" });
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch("http://localhost:5000/api/gallery/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          setToast({ message: "Your photos have been submitted for review!", type: "success" });
          setSelectedFiles([]);
          setDescription("");
          setPrice("");
          setTags("");
          fetchUserGallery();
          onClose();
        } else {
          const error = await response.json();
          setToast({ message: error.error || error.message || "Upload failed.", type: "error" });
        }
      } catch (err) {
        setToast({ message: err.message || "An error occurred while uploading.", type: "error" });
      } finally {
        setUploading(false);
      }
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 rounded-xl p-8 w-full max-w-md shadow-2xl relative">
        <button
          className="absolute top-2 right-2 text-white bg-red-600 hover:bg-red-700 rounded px-3 py-1 font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <h4 className="text-xl font-bold text-white mb-4 text-center">Upload Photo</h4>
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            multiple
            accept="image/*"
            className="block w-full mb-4 text-slate-300"
            onChange={handleFilesChange}
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="block w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
            required
          />
          <input
            type="number"
            placeholder="Price (USD)"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="block w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
            min="0"
            required
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={e => setTags(e.target.value)}
            className="block w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
          />
          <button
            type="submit"
            disabled={uploading}
            className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold mt-2 ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {uploading ? "Uploading..." : "Submit"}
          </button>
        </form>
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <div className="text-slate-300 mb-2">Preview:</div>
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, idx) => (
                <img key={idx} src={URL.createObjectURL(file)} alt={file.name} className="w-20 h-20 object-cover rounded border border-gray-700" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
  }
