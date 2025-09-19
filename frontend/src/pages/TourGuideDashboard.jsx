  // Modal state for booking details
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Open modal with booking details
  const openBookingModal = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  // Close modal
  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedBooking(null);
  };
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingApi, payrollApi } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TourGuideDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookingsSubTab, setBookingsSubTab] = useState('available');
  const [availableBookings, setAvailableBookings] = useState([]);
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  // Search/filter state for bookings tab
  const [bookingsSearch, setBookingsSearch] = useState('');
  // Pagination state for bookings tab
  const BOOKINGS_PER_PAGE = 10;
  const [bookingsPage, setBookingsPage] = useState({
    available: 1,
    schedule: 1,
    completed: 1,
  });

  // Reset page to 1 when sub-tab or search changes
  useEffect(() => {
    setBookingsPage((prev) => ({ ...prev, [bookingsSubTab]: 1 }));
  }, [bookingsSubTab, bookingsSearch]);

  // Filter bookings by search string (customer name, package, or date)
  const filterBookings = (bookings) => {
    if (!bookingsSearch.trim()) return bookings;
    const search = bookingsSearch.trim().toLowerCase();
    return bookings.filter((booking) => {
      const customer = `${booking.userId?.firstName || ''} ${booking.userId?.lastName || ''}`.toLowerCase();
      const packageTitle = (booking.packageId?.title || booking.packageDetails?.title || '').toLowerCase();
      const startDate = booking.bookingDetails?.startDate ? formatDate(booking.bookingDetails.startDate).toLowerCase() : '';
      const endDate = booking.bookingDetails?.endDate ? formatDate(booking.bookingDetails.endDate).toLowerCase() : '';
      return (
        customer.includes(search) ||
        packageTitle.includes(search) ||
        startDate.includes(search) ||
        endDate.includes(search)
      );
    });
  };

  // Paginate bookings
  const paginateBookings = (bookings, tab) => {
    const page = bookingsPage[tab] || 1;
    const start = (page - 1) * BOOKINGS_PER_PAGE;
    return bookings.slice(start, start + BOOKINGS_PER_PAGE);
  };

  // Handle page change
  const handleBookingsPageChange = (tab, newPage) => {
    setBookingsPage((prev) => ({ ...prev, [tab]: newPage }));
  };
  const [loading, setLoading] = useState(false);
  const [payroll, setPayroll] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const [availableRes, acceptedRes, completedRes, payrollRes] = await Promise.all([
        bookingApi.getAvailableBookingsForGuide(),
        bookingApi.getGuideAcceptedBookings(),
        bookingApi.getGuideCompletedBookings(),
        payrollApi.getMyPayroll(currentMonth, currentYear)
      ]);

      if (availableRes.success) setAvailableBookings(availableRes.bookings);
      if (acceptedRes.success) setAcceptedBookings(acceptedRes.bookings);
      if (completedRes.success) setCompletedBookings(completedRes.bookings);
      setPayroll(payrollRes || null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get assigned but not yet accepted bookings
  const getAssignedBookings = () => {
    return availableBookings.filter(booking => 
      booking.guideId && !booking.guideAccepted
    );
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      setLoading(true);
      const response = await bookingApi.acceptBookingAsGuide(bookingId);
      if (response.success) {
        // Reload data to reflect changes
        await loadDashboardData();
      }
    } catch (err) {
      setError('Failed to accept booking');
      console.error('Accept booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTour = async (bookingId) => {
    try {
      setLoading(true);
      const response = await bookingApi.completeTourAsGuide(bookingId);
      if (response.success) {
        // Reload data to reflect  changes 
        await loadDashboardData();
      }
    } catch (err) {
      setError('Failed to complete tour');
      console.error('Complete tour error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Calculate  dashboard statistics
  const dashboardStats = {
    totalTours: acceptedBookings.length + completedBookings.length,
    completedTours: completedBookings.length,
    upcomingTours: acceptedBookings.length,
    totalGuests: [...acceptedBookings, ...completedBookings].reduce((sum, booking) => sum + booking.bookingDetails.numberOfPeople, 0),
    averageRating: 4.9  // This would come from reviews in a real implementation
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Generate monthly chart data for the last 12 months
  const generateMonthlyChartData = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      
      // Count completed bookings for this month
      const monthBookings = completedBookings.filter(booking => {
        const completionDate = new Date(booking.updatedAt);
        return completionDate.getMonth() === date.getMonth() && 
               completionDate.getFullYear() === date.getFullYear();
      });
      
      months.push({
        month: `${monthName} ${year}`,
        bookings: monthBookings.length,
        guests: monthBookings.reduce((sum, booking) => sum + booking.bookingDetails.numberOfPeople, 0),
        earnings: monthBookings.reduce((sum, booking) => sum + (booking.bookingDetails.numberOfPeople * 7500), 0) // Rs. 7500 per guest
      });
    }
    
    return months;
  };

  const downloadReport = () => {
    const monthlyData = generateMonthlyChartData();
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Calculate current month statistics
    const currentMonthData = monthlyData[monthlyData.length - 1];
    const baseSalary = user?.basicSalary || 50000;
    const commissionPerGuest = 7500; // Rs. 7500 per guest
    const monthlyGuests = currentMonthData.guests;
    const monthlyCommission = monthlyGuests * commissionPerGuest;
    const totalMonthlySalary = baseSalary + monthlyCommission;

    // Create report  content
    const reportContent = `
TOUR GUIDE MONTHLY REPORT
Generated on: ${new Date().toLocaleDateString()}
Tour Guide: ${user?.firstName} ${user?.lastName}
Email: ${user?.email}

MONTHLY OVERVIEW - ${currentMonth}
===========================================
Total Tours Completed: ${currentMonthData.bookings}
Total Guests: ${monthlyGuests}
Base Salary: Rs. ${baseSalary.toLocaleString()}
Commission (Rs. ${commissionPerGuest.toLocaleString()} per guest): Rs. ${monthlyCommission.toLocaleString()}
Total Monthly Salary: Rs. ${totalMonthlySalary.toLocaleString()}

MONTHLY TREND (Last 12 Months)
===========================================
${monthlyData.map(data => 
  `${data.month}: ${data.bookings} tours, ${data.guests} guests, Rs. ${data.earnings.toLocaleString()} earnings`
).join('\n')}

DETAILED TOUR BREAKDOWN - ${currentMonth}
===========================================
${completedBookings
  .filter(booking => {
    const completionDate = new Date(booking.updatedAt);
    const currentDate = new Date();
    return completionDate.getMonth() === currentDate.getMonth() && 
           completionDate.getFullYear() === currentDate.getFullYear();
  })
  .map((booking, index) => 
    `${index + 1}. ${booking.userId.firstName} ${booking.userId.lastName}
     Package: ${booking.packageId.title}
     Date: ${formatDate(booking.bookingDetails.startDate)}
     Guests: ${booking.bookingDetails.numberOfPeople}
     Commission: Rs. ${(booking.bookingDetails.numberOfPeople * commissionPerGuest).toLocaleString()}`
  ).join('\n\n')}

---
Report generated by Wildlife Safari Management System
    `;

    // Create and download  file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tour-guide-report-${currentMonth.replace(' ', '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Bookings sub-tabs
  const renderBookingsTabs = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      {[
        { id: 'available', label: 'Available' },
        { id: 'schedule', label: 'Schedule' },
        { id: 'completed', label: 'Completed' },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setBookingsSubTab(tab.id)}
          className={`px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${
            bookingsSubTab === tab.id
              ? 'bg-green-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  // Bookings tab content

  // Pagination controls (moved to top level for access in all renderers)
  const renderPagination = (total, tab) => {
    const totalPages = Math.ceil(total / BOOKINGS_PER_PAGE);
    const currentPage = bookingsPage[tab] || 1;
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          className="px-3 py-1 rounded bg-white/10 text-white font-abeze disabled:opacity-50"
          onClick={() => handleBookingsPageChange(tab, currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="text-white font-abeze">Page {currentPage} of {totalPages}</span>
        <button
          className="px-3 py-1 rounded bg-white/10 text-white font-abeze disabled:opacity-50"
          onClick={() => handleBookingsPageChange(tab, currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  const renderBookingsTabContent = () => {
    // Search/filter bar
    const searchBar = (
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white font-abeze w-full max-w-md"
          placeholder="Search by customer, package, or date..."
          value={bookingsSearch}
          onChange={e => setBookingsSearch(e.target.value)}
        />
        {bookingsSearch && (
          <button
            className="ml-2 px-3 py-2 rounded-lg bg-gray-600 text-white font-abeze"
            onClick={() => setBookingsSearch('')}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    );

    if (bookingsSubTab === 'available') {
      const assignedFiltered = filterBookings(getAssignedBookings());
      const availableFiltered = filterBookings(availableBookings.filter(b => !(b.guideId && !b.guideAccepted)));
      const pagedAssigned = paginateBookings(assignedFiltered, 'available');
      const pagedAvailable = paginateBookings(availableFiltered, 'available');
      return (
        <>
          {searchBar}
          {/* Assigned Tasks */}
          {assignedFiltered.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
              <h3 className="text-xl font-abeze font-bold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Assigned Tasks (Pending Acceptance)
              </h3>
              <div className="space-y-4">
                {pagedAssigned.map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-abeze font-medium">
                          {booking.userId?.firstName} {booking.userId?.lastName}
                        </h4>
                        <p className="text-gray-300 font-abeze text-sm">
                          {booking.packageDetails?.title || booking.packageId?.title} • {formatDate(booking.bookingDetails?.startDate)}
                        </p>
                        <p className="text-gray-400 font-abeze text-xs">
                          {booking.bookingDetails?.numberOfPeople} guests • Assigned by Admin
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAcceptBooking(booking._id)}
                      disabled={loading}
                      className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
                    >
                      Accept Assignment
                    </button>
                  </div>
                ))}
              </div>
              {renderPagination(assignedFiltered.length, 'available')}
            </div>
          )}

          {/* Available Bookings */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-abeze font-bold text-white mb-4">Available Bookings</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
                <p className="text-gray-300 mt-4">Loading available bookings...</p>
              </div>
            ) : availableFiltered.length === 0 ? (
              <p className="text-gray-300 text-center py-8">No available bookings at the moment.</p>
            ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 text-green-200 font-abeze">Customer</th>
                      <th className="text-left py-3 px-4 text-green-200 font-abeze">Package</th>
                      <th className="text-left py-3 px-4 text-green-200 font-abeze">Start Date</th>
                      <th className="text-left py-3 px-4 text-green-200 font-abeze">End Date</th>
                      <th className="text-left py-3 px-4 text-green-200 font-abeze">Guests</th>
                      <th className="text-left py-3 px-4 text-green-200 font-abeze">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAvailable.map((booking) => (
                      <tr key={booking._id} className="border-b border-white/10 hover:bg-white/5 cursor-pointer" onClick={() => openBookingModal(booking)}>
                        <td className="py-3 px-4 text-white font-abeze">
                          {booking.userId.firstName} {booking.userId.lastName}
                        </td>
                        <td className="py-3 px-4 text-white font-abeze">{booking.packageId.title}</td>
                        <td className="py-3 px-4 text-white font-abeze">{formatDate(booking.bookingDetails.startDate)}</td>
                        <td className="py-3 px-4 text-white font-abeze">{formatDate(booking.bookingDetails.endDate)}</td>
                        <td className="py-3 px-4 text-white font-abeze">{booking.bookingDetails.numberOfPeople}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={e => { e.stopPropagation(); handleAcceptBooking(booking._id); }}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
                          >
                            Accept
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {renderPagination(availableFiltered.length, 'available')}
            </>
            )}
          </div>
        </>
      );
    } else if (bookingsSubTab === 'schedule') {
      return (
        <>
          {searchBar}
          {renderScheduleFiltered()}
        </>
      );
    } else if (bookingsSubTab === 'completed') {
      return (
        <>
          {searchBar}
          {renderCompletedFiltered()}
        </>
      );
    }
    return null;
  };

  // Filtered schedule and completed renderers with pagination
  const renderScheduleFiltered = () => {
    const filtered = filterBookings(acceptedBookings);
    const paged = paginateBookings(filtered, 'schedule');
    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-abeze font-bold text-white mb-4">My Tour Schedule</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
              <p className="text-gray-300 mt-4">Loading schedule...</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-gray-300 text-center py-8">No upcoming tours scheduled.</p>
          ) : (
          <>
            <div className="space-y-4">
                {paged.map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer" onClick={() => openBookingModal(booking)}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-abeze font-medium">
                          {booking.userId.firstName} {booking.userId.lastName}
                        </h4>
                        <p className="text-gray-300 font-abeze text-sm">
                          {booking.packageId.title} • {formatDate(booking.bookingDetails.startDate)} - {formatDate(booking.bookingDetails.endDate)}
                        </p>
                        <p className="text-gray-400 font-abeze text-xs">
                          {booking.bookingDetails.numberOfPeople} guests • {booking.packageId.location}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleCompleteTour(booking._id); }}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
                    >
                      Complete Tour
                    </button>
                  </div>
                ))}
              </div>
              {renderPagination(filtered.length, 'schedule')}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderCompletedFiltered = () => {
    const filtered = filterBookings(completedBookings);
    const paged = paginateBookings(filtered, 'completed');
    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-abeze font-bold text-white mb-4">Completed Tours</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
              <p className="text-gray-300 mt-4">Loading completed tours...</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-gray-300 text-center py-8">No completed tours yet.</p>
          ) : (
          <>
            <div className="space-y-4">
                {paged.map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer" onClick={() => openBookingModal(booking)}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-abeze font-medium">
                          {booking.userId.firstName} {booking.userId.lastName}
                        </h4>
                        <p className="text-gray-300 font-abeze text-sm">
                          {booking.packageId.title} • {formatDate(booking.bookingDetails.startDate)} - {formatDate(booking.bookingDetails.endDate)}
                        </p>
                        <p className="text-gray-400 font-abeze text-xs">
                          {booking.bookingDetails.numberOfPeople} guests • {booking.packageId.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 font-abeze text-sm">Completed</span>
                      <p className="text-gray-400 font-abeze text-xs">
                        {formatDate(booking.updatedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {renderPagination(filtered.length, 'completed')}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 font-abeze text-sm">Total Tours</p>
              <p className="text-3xl font-abeze font-bold text-white">{dashboardStats.totalTours}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 font-abeze text-sm">Upcoming</p>
              <p className="text-3xl font-abeze font-bold text-white">{dashboardStats.upcomingTours}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 font-abeze text-sm">Completed</p>
              <p className="text-3xl font-abeze font-bold text-white">{dashboardStats.completedTours}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 font-abeze text-sm">Total Guests</p>
              <p className="text-3xl font-abeze font-bold text-white">{dashboardStats.totalGuests}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        
      </div>


      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
          <p className="text-red-400 font-abeze">{error}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
          <p className="text-red-400 font-abeze">{error}</p>
        </div>
      )}
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-abeze font-bold text-white mb-4">My Tour Schedule</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
            <p className="text-gray-300 mt-4">Loading schedule...</p>
          </div>
        ) : acceptedBookings.length === 0 ? (
          <p className="text-gray-300 text-center py-8">No upcoming tours scheduled.</p>
        ) : (
        <div className="space-y-4">
            {acceptedBookings.map((booking) => (
              <div key={booking._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                <div>
                    <h4 className="text-white font-abeze font-medium">
                      {booking.userId.firstName} {booking.userId.lastName}
                    </h4>
                    <p className="text-gray-300 font-abeze text-sm">
                      {booking.packageId.title} • {formatDate(booking.bookingDetails.startDate)} - {formatDate(booking.bookingDetails.endDate)}
                    </p>
                    <p className="text-gray-400 font-abeze text-xs">
                      {booking.bookingDetails.numberOfPeople} guests • {booking.packageId.location}
                    </p>
                </div>
              </div>
                <button
                  onClick={() => handleCompleteTour(booking._id)}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
                >
                  Complete Tour
                </button>
            </div>
          ))}
          </div>
        )}
        </div>
      </div>
  );

  const renderCompleted = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-abeze font-bold text-white mb-4">Completed Tours</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
            <p className="text-gray-300 mt-4">Loading completed tours...</p>
          </div>
        ) : completedBookings.length === 0 ? (
          <p className="text-gray-300 text-center py-8">No completed tours yet.</p>
        ) : (
        <div className="space-y-4">
            {completedBookings.map((booking) => (
              <div key={booking._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                    <h4 className="text-white font-abeze font-medium">
                      {booking.userId.firstName} {booking.userId.lastName}
                    </h4>
                    <p className="text-gray-300 font-abeze text-sm">
                      {booking.packageId.title} • {formatDate(booking.bookingDetails.startDate)} - {formatDate(booking.bookingDetails.endDate)}
                    </p>
                    <p className="text-gray-400 font-abeze text-xs">
                      {booking.bookingDetails.numberOfPeople} guests • {booking.packageId.location}
                    </p>
                </div>
              </div>
                <div className="text-right">
                  <span className="text-green-400 font-abeze text-sm">Completed</span>
                  <p className="text-gray-400 font-abeze text-xs">
                    {formatDate(booking.updatedAt)}
                  </p>
                </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );

  const renderReports = () => {
    const now = new Date();
    const monthIdx = now.getMonth();
    const year = now.getFullYear();

    const isSameMonth = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getMonth() === monthIdx && d.getFullYear() === year;
    };

    const monthlyCompleted = completedBookings.filter(b => isSameMonth(b.updatedAt));

    const downloadMonthlyCompletedReport = () => {
      const doc = new jsPDF();
      const fileMonth = String(monthIdx + 1).padStart(2, '0');
      doc.setFontSize(14);
      doc.text(`Monthly Completed Bookings - ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, 14, 18);
      const rows = monthlyCompleted.map(b => [
        `${b.userId?.firstName || ''} ${b.userId?.lastName || ''}`.trim(),
        b.packageId?.title || '',
        b.bookingDetails?.startDate ? new Date(b.bookingDetails.startDate).toLocaleDateString() : '-',
        b.bookingDetails?.endDate ? new Date(b.bookingDetails.endDate).toLocaleDateString() : '-',
        b.bookingDetails?.numberOfPeople ?? '-',
        b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : '-'
      ]);
      autoTable(doc, {
        startY: 24,
        head: [['Customer', 'Package', 'Trip Start', 'Trip End', 'Guests', 'Completed']],
        body: rows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [16, 185, 129] }
      });
      doc.save(`guide-monthly-completed-bookings-${year}-${fileMonth}.pdf`);
    };

    const downloadPayrollReport = () => {
      if (!payroll) return;
      const doc = new jsPDF();
      const fileMonth = String(monthIdx + 1).padStart(2, '0');
      doc.setFontSize(14);
      doc.text(`Payroll - ${payroll.monthYear || `${fileMonth}/${year}`}`, 14, 18);
      const rows = [
        ['Basic Salary (Rs.)', Number(payroll.basicSalary || 0).toLocaleString()],
        ['Regular Pay (Rs.)', Number(payroll.regularPay || 0).toLocaleString()],
        ['Overtime Pay (Rs.)', Number(payroll.overtimePay || 0).toLocaleString()],
        ['Allowances (Rs.)', Number(payroll.allowances || 0).toLocaleString()],
        ['Bonuses (Rs.)', Number(payroll.bonuses || 0).toLocaleString()],
        ['Deductions (Rs.)', Number(payroll.deductions || 0).toLocaleString()],
        ['Gross Pay (Rs.)', Number(payroll.grossPay || 0).toLocaleString()],
        ['Net Pay (Rs.)', Number(payroll.netPay || 0).toLocaleString()],
        ['Working Days', Number(payroll.totalWorkingDays || 0)],
        ['Working Hours', Number(payroll.totalWorkingHours || 0)],
        ['Status', payroll.statusFormatted || payroll.status || '']
      ];
      autoTable(doc, {
        startY: 24,
        head: [['Field', 'Value']],
        body: rows,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246] }
      });
      doc.save(`guide-payroll-${year}-${fileMonth}.pdf`);
    };

    const chartData = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(year, monthIdx - (11 - i), 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const count = completedBookings.filter(b => {
        const doneAt = b.updatedAt ? new Date(b.updatedAt) : null;
        return doneAt && doneAt.getMonth() === m && doneAt.getFullYear() === y;
      }).length;
      return { month: d.toLocaleDateString('en-US', { month: 'short' }), count };
    });

    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-abeze font-bold text-white">Monthly Completed Bookings - {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
            <button
              onClick={downloadMonthlyCompletedReport}
              disabled={monthlyCompleted.length === 0}
              className={`px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${
                monthlyCompleted.length === 0 ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              Download Report
            </button>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
            <h4 className="text-white font-abeze font-medium mb-3">Completed Bookings - Last 12 Months</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} stroke="#9CA3AF" />
                  <YAxis allowDecimals={false} tick={{ fill: '#9CA3AF' }} stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#F9FAFB' }} labelStyle={{ color: '#F9FAFB' }} />
                  <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
              <p className="text-gray-300 mt-4">Loading available bookings...</p>
            </div>
          ) : monthlyCompleted.length === 0 ? (
            <p className="text-gray-300 text-center py-8">No tours completed this month yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-green-200 font-abeze">Customer</th>
                    <th className="text-left py-3 px-4 text-green-200 font-abeze">Package</th>
                    <th className="text-left py-3 px-4 text-green-200 font-abeze">Trip Dates</th>
                    <th className="text-left py-3 px-4 text-green-200 font-abeze">Guests</th>
                    <th className="text-left py-3 px-4 text-green-200 font-abeze">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyCompleted.map((b) => (
                    <tr key={b._id} className="border-b border-white/10">
                      <td className="py-3 px-4 text-white font-abeze">{b.userId?.firstName} {b.userId?.lastName}</td>
                      <td className="py-3 px-4 text-white font-abeze">{b.packageId?.title}</td>
                      <td className="py-3 px-4 text-white font-abeze">{new Date(b.bookingDetails?.startDate).toLocaleDateString()} - {new Date(b.bookingDetails?.endDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-white font-abeze">{b.bookingDetails?.numberOfPeople}</td>
                      <td className="py-3 px-4 text-white font-abeze">{new Date(b.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-abeze font-bold text-white">Payroll </h3>
            <button
              onClick={downloadPayrollReport}
              disabled={!payroll}
              className={`px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${
                !payroll ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Download Payroll
            </button>
          </div>
          {!payroll ? (
            <div className="text-gray-300 font-abeze">No payroll record found for this month yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-gray-300 font-abeze text-sm mb-2">Basic Salary</h4>
                <p className="text-2xl font-abeze font-bold text-white">Rs. {Number(payroll.basicSalary || 0).toLocaleString()}</p>
                <p className="text-gray-400 font-abeze text-xs">{payroll.monthYear || ''}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-gray-300 font-abeze text-sm mb-2">Regular + Overtime</h4>
                <p className="text-white font-abeze">Regular: Rs. {Number(payroll.regularPay || 0).toLocaleString()}</p>
                <p className="text-white font-abeze">Overtime: Rs. {Number(payroll.overtimePay || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-gray-300 font-abeze text-sm mb-2">Net Pay</h4>
                <p className="text-2xl font-abeze font-bold text-white">Rs. {Number(payroll.netPay || 0).toLocaleString()}</p>
                <p className="text-gray-400 font-abeze text-xs">Status: {payroll.statusFormatted || payroll.status}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-gray-300 font-abeze text-sm mb-2">Allowances & Bonuses</h4>
                <p className="text-white font-abeze">Allowances: Rs. {Number(payroll.allowances || 0).toLocaleString()}</p>
                <p className="text-white font-abeze">Bonuses: Rs. {Number(payroll.bonuses || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-gray-300 font-abeze text-sm mb-2">Deductions</h4>
                <p className="text-white font-abeze">Rs. {Number(payroll.deductions || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-gray-300 font-abeze text-sm mb-2">Hours</h4>
                <p className="text-white font-abeze">Working Days: {Number(payroll.totalWorkingDays || 0)}</p>
                <p className="text-white font-abeze">Working Hours: {Number(payroll.totalWorkingHours || 0)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Main Content */}
      <div className="pt-8 pb-16">
        <div className="container mx-auto px-6">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="flex justify-between items-center mb-4">
              <div></div> {/* Empty div for spacing */}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
            <h1 className="text-4xl md:text-5xl font-abeze font-bold text-white mb-4">
              Tour Guide Dashboard
            </h1>
            <p className="text-gray-300 font-abeze text-lg">
              Welcome back, {user?.firstName} {user?.lastName}
            </p>
          </div>

          {/* Tour Guide Content */}
          <div className="max-w-7xl mx-auto">
            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'bookings', label: 'Bookings', icon: '🗂️' },
                { id: 'reports', label: 'Reports', icon: '📈' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-6 py-3 rounded-lg font-abeze font-medium transition-colors duration-300 ${
                    activeTab === tab.id
                      ? 'bg-green-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-96">
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'bookings' && (
                <>
                  {renderBookingsTabs()}
                  {renderBookingsTabContent()}
                  <BookingDetailsModal />
                </>
              )}
              {activeTab === 'reports' && renderReports()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourGuideDashboard;
