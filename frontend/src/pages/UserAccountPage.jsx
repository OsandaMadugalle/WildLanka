import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { bookingApi } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EditProfileModal from '../components/EditProfileModal';
import UserContactMessages from '../components/UserContactMessages';
import AddReviewModal from '../components/AddReviewModal';
import { reviewApi } from '../services/api';
import { generateBookingPDF } from '../utils/pdfGenerator';


const UserAccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Role-based redirect: if driver or guide, redirect to their dashboard
  useEffect(() => {
    if (user?.role === 'driver') {
      navigate('/driver-dashboard', { replace: true });
    } else if (user?.role === 'tour_guide') {
      navigate('/tour-guide-dashboard', { replace: true });
    }
  }, [user, navigate]);
  const { t } = useLanguage();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showBookings, setShowBookings] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  const [showReviewForBookingId, setShowReviewForBookingId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);
  const [showAlreadyReviewedMessage, setShowAlreadyReviewedMessage] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(null); // Track which booking is being downloaded
  
  // Pagination states
  const [currentReviewsPage, setCurrentReviewsPage] = useState(1);
  const [currentBookingsPage, setCurrentBookingsPage] = useState(1);
  const [reviewsPerPage] = useState(10);
  const [bookingsPerPage] = useState(10);
  const [showCurrentBookings, setShowCurrentBookings] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleCloseEditProfile = () => {
    setShowEditProfile(false);
  };

  const handleViewBookings = useCallback(async () => {
    if (showBookings) {
      setShowBookings(false);
      return;
    }
    
    setShowBookings(true);
    setLoadingBookings(true);
    setBookingsError(null);
    
    try {
      const response = await bookingApi.getUserBookings();
      if (response.success) {
        setBookings(response.bookings);
      } else {
        setBookingsError(response.message || t('userAccount.errors.failedToLoadBookings'));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookingsError(`${t('userAccount.errors.failedToLoadBookings')}. ${t('userAccount.errors.pleaseTryAgain')}`);
    } finally {
      setLoadingBookings(false);
    }
  }, [showBookings, t]);

  // Fetch bookings when component mounts if user has any
  useEffect(() => {
    const checkBookings = async () => {
      try {
        const response = await bookingApi.getUserBookings();
        if (response.success && response.bookings.length > 0) {
          setBookings(response.bookings);
        }
      } catch (error) {
        console.error('Error checking initial bookings:', error);
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
    if (activeTab === 'bookings' && bookings.length === 0) {
      handleViewBookings();
    }
  }, [activeTab, bookings.length, handleViewBookings]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'bookings') {
      setCurrentBookingsPage(1);
      if (bookings.length === 0) {
        handleViewBookings();
      }
    }
    if (tab === 'reviews') {
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
      console.error('Error loading user reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const checkIfAlreadyReviewed = (bookingId) => {
    return reviews.some(review => {
      if (!review.bookingId) return false;
      // bookingId can be string or object
      if (typeof review.bookingId === 'string') {
        return review.bookingId === bookingId;
      }
      // If populated, compare _id
      return review.bookingId._id === bookingId;
    });
  };

  const handleAddReview = (bookingId) => {
    if (checkIfAlreadyReviewed(bookingId)) {
      setShowAlreadyReviewedMessage(true);
      // Hide message after 3 seconds
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
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalBookingsPages = Math.ceil(bookings.length / bookingsPerPage);

  const handleBookingsPageChange = (pageNumber) => {
    setCurrentBookingsPage(pageNumber);
  };

  const handleDownloadPDF = async (booking) => {
    setDownloadingPDF(booking._id);
    try {
      await generateBookingPDF(booking, user);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // You could add a toast notification here for better UX
    } finally {
      setDownloadingPDF(null);
    }
  };




  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Add Review Modal */}
      {showReviewForBookingId && (
        <AddReviewModal
          onClose={() => setShowReviewForBookingId(null)}
          onSubmit={async (reviewData) => {
            try {
              // Convert reviewData to FormData, use 'images' field for files
              const formData = new FormData();
              formData.append('rating', reviewData.rating);
              formData.append('comment', reviewData.comment || '');
              if (reviewData.files && reviewData.files.length > 0) {
                reviewData.files.forEach(file => {
                  formData.append('images', file);
                });
              }
              await reviewApi.createReview(showReviewForBookingId, formData);
              setShowReviewSuccess(true);
              setShowReviewForBookingId(null);
              loadUserReviews();
            } catch (error) {
              alert('Failed to submit review.');
            }
          }}
        />
      )}
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gray-800/50"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-repeat bg-center" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
             }}>
        </div>
      </div>
      
      <Header />
      
             {/* Main Content */}
       <div className="pt-24 pb-16 relative z-10">
         <div className="container mx-auto px-6">
           {/* Page Header */}
           <div className="text-center mb-12">
             <h1 className="text-4xl md:text-5xl font-abeze font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 mb-4 animate-fade-in">
               {t('userAccount.pageTitle')}
             </h1>
             <p className="text-slate-300 font-abeze text-lg opacity-90">
               {t('userAccount.pageSubtitle')}
             </p>
           </div>

          {/* Account Content */}
          <div className="max-w-4xl mx-auto">
                         {/* Tab Navigation */}
             <div className="flex flex-wrap justify-center mb-8 bg-gray-800/80 backdrop-blur-xl rounded-3xl p-3 border border-gray-700/50 shadow-2xl">
               <button
                 onClick={() => handleTabChange('profile')}
                 className={`px-8 py-4 rounded-2xl font-abeze font-medium transition-all duration-500 transform hover:scale-105 ${
                   activeTab === 'profile'
                     ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                     : 'text-slate-300 hover:text-white hover:bg-emerald-600/20'
                 }`}
               >
                 {t('userAccount.tabs.profile')}
               </button>
               <button
                 onClick={() => handleTabChange('bookings')}
                 className={`px-8 py-4 rounded-2xl font-abeze font-medium transition-all duration-500 transform hover:scale-105 ${
                   activeTab === 'bookings'
                     ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                     : 'text-slate-300 hover:text-white hover:bg-emerald-600/20'
                 }`}
               >
                 {t('userAccount.tabs.bookings')}
               </button>
               <button
                 onClick={() => handleTabChange('messages')}
                 className={`px-8 py-4 rounded-2xl font-abeze font-medium transition-all duration-500 transform hover:scale-105 ${
                   activeTab === 'messages'
                     ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                     : 'text-slate-300 hover:text-white hover:bg-emerald-600/20'
                 }`}
               >
                 {t('userAccount.tabs.messages')}
               </button>
               <button
                 onClick={() => handleTabChange('reviews')}
                 className={`px-8 py-4 rounded-2xl font-abeze font-medium transition-all duration-500 transform hover:scale-105 ${
                   activeTab === 'reviews'
                     ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                     : 'text-slate-300 hover:text-white hover:bg-emerald-600/20'
                 }`}
               >
                 {t('userAccount.myReviews')}
               </button>
            </div>
            {/* Bookings Tab Content (Current & History) */}
            {activeTab === 'bookings' && (
              <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                <div className="flex gap-4 mb-8 justify-center">
                  <button
                    className={`px-8 py-4 rounded-2xl font-abeze font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${showCurrentBookings ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-slate-300 hover:text-white hover:bg-emerald-600/20'}`}
                    onClick={() => setShowCurrentBookings(true)}
                  >
                    Current Bookings
                  </button>
                  <button
                    className={`px-8 py-4 rounded-2xl font-abeze font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${!showCurrentBookings ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-slate-300 hover:text-white hover:bg-emerald-600/20'}`}
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
                        <p className="text-gray-300 font-abeze">Loading your bookings...</p>
                      </div>
                    ) : bookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled').length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-300 font-abeze">No current bookings found.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto mb-8">
                        <table className="min-w-full bg-gray-900 rounded-2xl overflow-hidden">
                          <thead>
                            <tr className="bg-emerald-700/40 text-white">
                              <th className="px-6 py-3 text-left font-abeze">Package</th>
                              <th className="px-6 py-3 text-left font-abeze">Dates</th>
                              <th className="px-6 py-3 text-left font-abeze">Status</th>
                              <th className="px-6 py-3 text-left font-abeze">Total Price</th>
                              <th className="px-6 py-3 text-left font-abeze">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled').map((booking) => (
                              <tr key={booking._id} className="border-b border-gray-700/30">
                                <td className="px-6 py-4 text-white font-abeze">
                                  {booking.packageDetails?.title || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-white font-abeze">
                                  {booking.bookingDetails?.startDate ? new Date(booking.bookingDetails.startDate).toLocaleDateString() : 'N/A'}
                                  {' - '}
                                  {booking.bookingDetails?.endDate ? new Date(booking.bookingDetails.endDate).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 font-abeze">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    booking.status === 'Pending' ? 'bg-yellow-500 text-white' :
                                    'bg-gray-700 text-white'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-white font-abeze">
                                  Rs. {booking.totalPrice?.toLocaleString() || 'N/A'}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-2">
                                    {/* Download PDF Button */}
                                    {(booking.status === 'Payment Confirmed' || booking.status === 'Confirmed' || booking.status === 'In Progress' || booking.status === 'Completed') && (
                                      <button
                                        onClick={() => handleDownloadPDF(booking)}
                                        disabled={downloadingPDF === booking._id}
                                        className="group relative px-4 py-2 rounded font-abeze font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border bg-blue-600 hover:bg-blue-700 border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                      >
                                        {downloadingPDF === booking._id ? 'Generating PDF...' : 'Download PDF'}
                                      </button>
                                    )}
                                    {/* Update Booking Button */}
                                    {(booking.status === 'Pending' || booking.status === 'Payment Confirmed') && (
                                      <button
                                        onClick={() => navigate(`/update-booking/${booking._id}`)}
                                        className="group relative px-4 py-2 rounded font-abeze font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border bg-green-600 hover:bg-green-700 border-green-400/30 text-white"
                                      >
                                        Update
                                      </button>
                                    )}
                                    {/* Pay Now Button for Pending bookings */}
                                    {booking.status === 'Pending' && !booking.payment && (
                                      <button
                                        onClick={async () => {
                                          try {
                                            const payload = { bookingId: booking._id };
                                            const res = await bookingApi.createStripeCheckout(payload);
                                            if (res.success && res.session_url) {
                                              window.location.href = res.session_url;
                                            } else {
                                              alert(res.message || 'Failed to start payment.');
                                            }
                                          } catch (err) {
                                            alert('Error starting payment.');
                                          }
                                        }}
                                        className="group relative px-4 py-2 rounded font-abeze font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border bg-yellow-500 hover:bg-yellow-600 border-yellow-400/30 text-white"
                                      >
                                        Pay Now
                                      </button>
                                    )}
                                    {/* Cancel Booking Button */}
                                    {(booking.status === 'Pending' || booking.status === 'Payment Confirmed') && (
                                      <button
                                        onClick={async () => {
                                          if (window.confirm('Are you sure you want to cancel this booking?')) {
                                            try {
                                              const res = await bookingApi.updateBookingStatus(booking._id, 'Cancelled');
                                              if (!res.success) {
                                                alert(res.message || 'Failed to cancel booking.');
                                              } else {
                                                handleViewBookings();
                                              }
                                            } catch (err) {
                                              alert('An error occurred while cancelling the booking.');
                                            }
                                          }
                                        }}
                                        className="group relative px-4 py-2 rounded font-abeze font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border bg-red-600 hover:bg-red-700 border-red-400/30 text-white"
                                      >
                                        Cancel
                                      </button>
                                    )}
                                    {/* WhatsApp Contact Button for In Progress bookings */}
                                    {booking.guideId && booking.guideId.phone && (
                                      <a
                                        href={`https://wa.me/${booking.guideId.phone}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative px-4 py-2 rounded font-abeze font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border bg-green-500 hover:bg-green-600 border-green-400/30 text-white"
                                      >
                                        WhatsApp Guide: {booking.guideId.firstName} {booking.guideId.lastName}
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
                        <p className="text-gray-300 font-abeze">Loading your booking history...</p>
                      </div>
                    ) : bookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled').length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-300 font-abeze">No booking history found.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-900 rounded-2xl overflow-hidden">
                          <thead>
                            <tr className="bg-emerald-700/40 text-white">
                              <th className="px-6 py-3 text-left font-abeze">Package</th>
                              <th className="px-6 py-3 text-left font-abeze">Dates</th>
                              <th className="px-6 py-3 text-left font-abeze">Status</th>
                              <th className="px-6 py-3 text-left font-abeze">Total Price</th>
                              <th className="px-6 py-3 text-left font-abeze">Review</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled').map((booking) => (
                              <tr key={booking._id} className="border-b border-gray-700/30">
                                <td className="px-6 py-4 text-white font-abeze">
                                  {booking.packageDetails?.title || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-white font-abeze">
                                  {booking.bookingDetails?.startDate ? new Date(booking.bookingDetails.startDate).toLocaleDateString() : 'N/A'}
                                  {' - '}
                                  {booking.bookingDetails?.endDate ? new Date(booking.bookingDetails.endDate).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 font-abeze">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    booking.status === 'Completed' ? 'bg-green-600 text-white' :
                                    booking.status === 'Cancelled' ? 'bg-red-600 text-white' :
                                    'bg-gray-700 text-white'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-white font-abeze">
                                  Rs. {booking.totalPrice?.toLocaleString() || 'N/A'}
                                </td>
                                <td className="px-6 py-4 font-abeze">
                                  {booking.status === 'Completed' ? (
                                    checkIfAlreadyReviewed(booking._id) ? (
                                      <span className="text-green-400">Reviewed</span>
                                    ) : (
                                      <button
                                        onClick={() => handleAddReview(booking._id)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
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
            {activeTab === 'profile' && (
              <div className="grid md:grid-cols-3 gap-8">
                                 {/* Profile Card */}
                 <div className="md:col-span-1">
                   <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 transform hover:scale-[1.02]">
                                         <div className="text-center mb-6">
                       <div className="relative w-28 h-28 rounded-full mx-auto mb-6 overflow-hidden border-4 border-gradient-to-r from-emerald-400 to-green-500 p-1">
                                                 <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800">
                           {user?.profilePicture?.url ? (
                             <img 
                               src={user.profilePicture.url} 
                               alt={t('userAccount.common.profileImageAlt')} 
                               className="w-full h-full object-cover"
                             />
                           ) : (
                             <div className="w-full h-full bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center">
                               <span className="text-2xl font-abeze font-bold text-white">
                                 {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                               </span>
                             </div>
                           )}
                         </div>
                         {/* Online indicator */}
                         <div className="absolute bottom-2 right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg"></div>
                      </div>
                                             <h2 className="text-2xl font-abeze font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 mb-2">
                         {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || t('userAccount.common.defaultUser')}
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
                         {t('userAccount.profile.editProfile')}
                       </button>
                       <button
                         onClick={handleLogout}
                         className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-abeze font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
                       >
                         {t('userAccount.profile.logout')}
                       </button>
                     </div>
                  </div>
                </div>

                                 {/* Account Details */}
                 <div className="md:col-span-2">
                   <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                     <h3 className="text-2xl font-abeze font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 mb-8">
                       {t('userAccount.profile.accountInformation')}
                     </h3>
                    
                                         <div className="grid md:grid-cols-2 gap-6">
                       <div className="group">
                         <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                           {t('userAccount.profile.firstName')}
                         </label>
                         <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl px-6 py-4 text-white font-abeze group-hover:border-emerald-400/30 transition-all duration-300">
                           {user?.firstName || t('userAccount.profile.notProvided')}
                         </div>
                       </div>

                                             <div className="group">
                         <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                           {t('userAccount.profile.lastName')}
                         </label>
                         <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl px-6 py-4 text-white font-abeze group-hover:border-emerald-400/30 transition-all duration-300">
                           {user?.lastName || t('userAccount.profile.notProvided')}
                         </div>
                       </div>

                       <div className="group">
                         <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                           {t('userAccount.profile.emailAddress')}
                         </label>
                         <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl px-6 py-4 text-white font-abeze group-hover:border-emerald-400/30 transition-all duration-300 break-all truncate min-w-0">
                           {user?.email}
                         </div>
                       </div>

                       <div className="group">
                         <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                           {t('userAccount.profile.phoneNumber')}
                         </label>
                         <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl px-6 py-4 text-white font-abeze group-hover:border-emerald-400/30 transition-all duration-300">
                           {user?.phone || t('userAccount.profile.notProvided')}
                         </div>
                       </div>

                       <div className="group">
                         <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                           {t('userAccount.profile.country')}
                         </label>
                         <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl px-6 py-4 text-white font-abeze group-hover:border-emerald-400/30 transition-all duration-300">
                           {user?.country || t('userAccount.profile.notProvided')}
                         </div>
                       </div>

                       <div className="group">
                         <label className="block text-slate-300 font-abeze font-medium mb-3 text-sm uppercase tracking-wider">
                           {t('userAccount.profile.memberSince')}
                         </label>
                         <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl px-6 py-4 text-white font-abeze group-hover:border-emerald-400/30 transition-all duration-300">
                           {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : t('userAccount.profile.recentlyJoined')}
                         </div>
                       </div>
                     </div>
                  </div>

                  
                </div>
              </div>
            )}

            {/* Messages Tab Content */}
            {activeTab === 'messages' && (
              <UserContactMessages userEmail={user?.email} />
            )}

                         {/* Reviews Tab Content */}
             {activeTab === 'reviews' && (
               <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                 <h3 className="text-2xl font-abeze font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 mb-8">
                   {t('userAccount.myReviews')}
                 </h3>
                
                {loadingReviews ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                    <p className="text-gray-300 font-abeze">{t('userAccount.loadingReviews')}</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gray-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <p className="text-gray-300 font-abeze mb-4">{t('userAccount.noReviewsYet')}</p>
                    <p className="text-gray-400 font-abeze text-sm">{t('userAccount.completeBookingToReview')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentReviews.map((review) => (
                      <div key={review._id} className="bg-gray-700/50 p-6 rounded-2xl border border-gray-600/50 shadow-md transition-all duration-300 transform hover:scale-[1.01]">
                        {/* Review Images Section */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex flex-wrap gap-3 mb-4">
                            {review.images.map((img, idx) => (
                              <img
                                key={img.id || idx}
                                src={img.url}
                                alt={`Review image ${idx + 1}`}
                                className="w-24 h-24 object-cover rounded-lg border border-gray-600 shadow"
                              />
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            {/* Removed circular package image for cleaner review card */}
                            <div>
                              <p className="text-white font-abeze font-semibold text-lg">
                                {review.packageId?.title || review.bookingId.packageDetails?.title || 'N/A'}
                              </p>
                              <p className="text-slate-400 font-abeze text-sm">
                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              review.rating === 5 ? 'bg-green-600 text-white' :
                              review.rating >= 3 ? 'bg-yellow-500 text-white' :
                              'bg-red-600 text-white'
                            }`}>
                              {review.rating} stars
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-300 font-abeze mb-4">
                          {review.comment || t('userAccount.reviews.noComment')}
                        </p>
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleAddReview(review.bookingId._id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
                          >
                            Edit Review
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
                          >
                            Delete Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div> {/* Close .max-w-4xl mx-auto */}
        </div> {/* Close .container mx-auto px-6 */}
      </div> {/* Close .pt-24 pb-16 relative z-10 */}
      <Footer />
    </div>
  );
};

export default UserAccountPage;
