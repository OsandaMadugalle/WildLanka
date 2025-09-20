import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingApi, vehicleApi, payrollApi } from '../services/api';
import AddVehicleModal from '../components/AddVehicleModal';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// ...existing code...

const DriverDashboard = () => {
  // Simple reports tab for driver
  // --- TourGuideDashboard style reports for drivers ---
  const renderReportsSimple = () => {
    const now = new Date();
    const monthIdx = now.getMonth();
    const year = now.getFullYear();
    const isSameMonth = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getMonth() === monthIdx && d.getFullYear() === year;
    };
    const monthlyCompleted = acceptedBookings.filter(b => b.status === 'Completed' && isSameMonth(b.updatedAt));

    // PDF for completed bookings
    const downloadMonthlyCompletedReport = () => {
      const doc = new jsPDF();
      const fileMonth = String(monthIdx + 1).padStart(2, '0');
      doc.setFontSize(14);
      doc.text(`Monthly Completed Trips - ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, 14, 18);
      const rows = monthlyCompleted.map(b => [
        `${b.userId?.firstName || ''} ${b.userId?.lastName || ''}`.trim(),
        b.packageId?.title || b.packageDetails?.title || '',
        b.packageId?.location || b.packageDetails?.location || '',
        b.bookingDetails?.startDate ? new Date(b.bookingDetails.startDate).toLocaleDateString() : '-',
        b.bookingDetails?.numberOfPeople ?? '-',
        b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : '-'
      ]);
      autoTable(doc, {
        startY: 24,
        head: [['Customer', 'Package', 'Location', 'Trip Start', 'Guests', 'Completed']],
        body: rows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [16, 185, 129] }
      });
      doc.save(`driver-monthly-completed-trips-${year}-${fileMonth}.pdf`);
    };

    // Payroll report
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
      doc.save(`driver-payroll-${year}-${fileMonth}.pdf`);
    };

    // Chart data for last 12 months
    const chartData = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(year, monthIdx - (11 - i), 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const count = acceptedBookings.filter(b => {
        const doneAt = b.updatedAt ? new Date(b.updatedAt) : null;
        return b.status === 'Completed' && doneAt && doneAt.getMonth() === m && doneAt.getFullYear() === y;
      }).length;
      return { month: d.toLocaleDateString('en-US', { month: 'short' }), count };
    });

    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-abeze font-bold text-white">Monthly Completed Trips - {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
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
            <h4 className="text-white font-abeze font-medium mb-3">Completed Trips - Last 12 Months</h4>
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
            <p className="text-gray-300 text-center py-8">No trips completed this month yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-green-200 font-abeze">Customer</th>
                    <th className="text-left py-3 px-4 text-green-200 font-abeze">Package</th>
                    <th className="text-left py-3 px-4 text-green-200 font-abeze">Location</th>
                    <th className="text-left py-3 px-4 text-green-200 font-abeze">Trip Start</th>
                    <th className="text-left py-3 px-4 text-green-200 font-abeze">Guests</th>
                    <th className="text-left py-3 px-4 text-green-200 font-abeze">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyCompleted.map((b) => (
                    <tr key={b._id} className="border-b border-white/10">
                      <td className="py-3 px-4 text-white font-abeze">{b.userId?.firstName} {b.userId?.lastName}</td>
                      <td className="py-3 px-4 text-white font-abeze">{b.packageId?.title || b.packageDetails?.title}</td>
                      <td className="py-3 px-4 text-white font-abeze">{b.packageId?.location || b.packageDetails?.location}</td>
                      <td className="py-3 px-4 text-white font-abeze">{b.bookingDetails?.startDate ? new Date(b.bookingDetails.startDate).toLocaleDateString() : '-'}</td>
                      <td className="py-3 px-4 text-white font-abeze">{b.bookingDetails?.numberOfPeople}</td>
                      <td className="py-3 px-4 text-white font-abeze">{b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : '-'}</td>
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
  // Tab state for Bookings section
  const [bookingsTab, setBookingsTab] = useState('assigned');
  // Returns bookings assigned to the driver that are pending acceptance

  // Render Bookings section with Assigned Tasks, Schedule, Completed
  const renderBookings = () => (
    <>
      {/* Bookings Tabs */}
      <div>
        <div className="flex gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${bookingsTab === 'assigned' ? 'bg-yellow-600 text-white' : 'bg-white/10 text-yellow-300 hover:bg-yellow-500/20'}`}
            onClick={() => setBookingsTab('assigned')}
          >
            Assigned Tasks
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${bookingsTab === 'schedule' ? 'bg-blue-600 text-white' : 'bg-white/10 text-blue-300 hover:bg-blue-500/20'}`}
            onClick={() => setBookingsTab('schedule')}
          >
            Schedule
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${bookingsTab === 'completed' ? 'bg-green-600 text-white' : 'bg-white/10 text-green-300 hover:bg-green-500/20'}`}
            onClick={() => setBookingsTab('completed')}
          >
            Completed
          </button>
        </div>
        {/* Tab Content */}
        {bookingsTab === 'assigned' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-yellow-400/30">
            <h3 className="text-xl font-abeze font-bold text-yellow-300 mb-4 flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Assigned Tasks (Pending Acceptance)
            </h3>
            {getAssignedBookings().length === 0 ? (
              <div className="text-gray-400 font-abeze text-center py-4">No assigned tasks pending acceptance.</div>
            ) : (
              <div className="space-y-4">
                {getAssignedBookings().map((booking) => (
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
                          {booking.packageDetails?.title || booking.packageId?.title} • {new Date(booking.bookingDetails?.startDate).toLocaleDateString()}
                        </p>
                        <p className="text-gray-400 font-abeze text-xs">
                          {booking.bookingDetails?.numberOfPeople} guests • Assigned by Admin
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAcceptBooking(booking._id)}
                      disabled={acceptingBooking === booking._id}
                      className={`px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${
                        acceptingBooking === booking._id
                          ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                          : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      }`}
                    >
                      {acceptingBooking === booking._id ? 'Accepting...' : 'Accept Assignment'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {bookingsTab === 'schedule' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-blue-400/30">
            <h3 className="text-xl font-abeze font-bold text-blue-300 mb-4">Schedule</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-300 font-abeze">Loading your schedule...</div>
              </div>
            ) : acceptedBookings.filter(booking => booking.status === 'Driver Assigned').length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-300 font-abeze">No scheduled bookings at the moment</div>
                <p className="text-gray-400 font-abeze text-sm mt-2">Accept bookings to see them here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {acceptedBookings
                  .filter(booking => booking.status === 'Driver Assigned')
                  .sort((a, b) => new Date(a.bookingDetails?.startDate) - new Date(b.bookingDetails?.startDate))
                  .map((booking) => (
                    <div key={booking._id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-white font-abeze font-semibold text-lg">
                                {booking.packageId?.title || booking.packageDetails?.title || 'N/A'}
                              </h4>
                              <p className="text-blue-300 font-abeze text-sm">
                                {booking.packageId?.location || booking.packageDetails?.location || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-gray-400 font-abeze text-xs">Customer</p>
                              <p className="text-white font-abeze font-medium">
                                {booking.userId?.firstName || 'N/A'} {booking.userId?.lastName || 'N/A'}
                              </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-gray-400 font-abeze text-xs">Start Date</p>
                              <p className="text-white font-abeze font-medium">
                                {booking.bookingDetails?.startDate 
                                  ? new Date(booking.bookingDetails.startDate).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : 'N/A'
                                }
                              </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-gray-400 font-abeze text-xs">End Date</p>
                              <p className="text-white font-abeze font-medium">
                                {booking.bookingDetails?.endDate 
                                  ? new Date(booking.bookingDetails.endDate).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : 'N/A'
                                }
                              </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-gray-400 font-abeze text-xs">Guests</p>
                              <p className="text-white font-abeze font-medium">
                                {booking.bookingDetails?.numberOfPeople || 'N/A'} people
                              </p>
                            </div>
                          </div>
                          {booking.bookingDetails?.specialRequests && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-3">
                              <p className="text-yellow-300 font-abeze text-sm font-medium">Special Requests:</p>
                              <p className="text-yellow-200 font-abeze text-sm">{booking.bookingDetails.specialRequests}</p>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-abeze">
                              {booking.status}
                            </span>
                            <span className="text-gray-400 text-sm">
                              Accepted on {booking.driverAcceptedAt 
                                ? new Date(booking.driverAcceptedAt).toLocaleDateString()
                                : 'N/A'
                              }
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => handleCompleteBooking(booking._id)}
                            disabled={completingBooking === booking._id}
                            className={`px-6 py-3 rounded-lg font-abeze font-medium transition-colors duration-300 ${
                              completingBooking === booking._id
                                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {completingBooking === booking._id ? 'Completing...' : 'Complete Trip'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
        {bookingsTab === 'completed' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-green-400/30">
            <h3 className="text-xl font-abeze font-bold text-green-300 mb-4">Completed</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-300 font-abeze">Loading completed bookings...</div>
              </div>
            ) : acceptedBookings.filter(booking => booking.status === 'Completed').length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-300 font-abeze">No completed bookings yet</div>
                <p className="text-gray-400 font-abeze text-sm mt-2">Complete your accepted bookings to see them here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {acceptedBookings
                  .filter(booking => booking.status === 'Completed')
                  .sort((a, b) => new Date(b.bookingDetails?.startDate) - new Date(a.bookingDetails?.startDate))
                  .map((booking) => (
                    <div key={booking._id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-white font-abeze font-semibold text-lg">
                                {booking.packageId?.title || booking.packageDetails?.title || 'N/A'}
                              </h4>
                              <p className="text-green-300 font-abeze text-sm">
                                {booking.packageId?.location || booking.packageDetails?.location || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-gray-400 font-abeze text-xs">Customer</p>
                              <p className="text-white font-abeze font-medium">
                                {booking.userId?.firstName || 'N/A'} {booking.userId?.lastName || 'N/A'}
                              </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-gray-400 font-abeze text-xs">Trip Date</p>
                              <p className="text-white font-abeze font-medium">
                                {booking.bookingDetails?.startDate 
                                  ? new Date(booking.bookingDetails.startDate).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : 'N/A'
                                }
                              </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-gray-400 font-abeze text-xs">Guests</p>
                              <p className="text-white font-abeze font-medium">
                                {booking.bookingDetails?.numberOfPeople || 'N/A'} people
                              </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-gray-400 font-abeze text-xs">Completed</p>
                              <p className="text-white font-abeze font-medium">
                                {booking.updatedAt 
                                  ? new Date(booking.updatedAt).toLocaleDateString()
                                  : 'N/A'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-abeze">
                              {booking.status}
                            </span>
                            <span className="text-gray-400 text-sm">
                              Trip completed successfully
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingBookings, setPendingBookings] = useState([]);
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingBooking, setAcceptingBooking] = useState(null);
  const [completingBooking, setCompletingBooking] = useState(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  // AddVehicleModal rendering
  // Show modal for add or edit
  // onVehicleAdded and onVehicleUpdated update the vehicles list
  // onClose closes the modal and clears editVehicle
  // Pass vehicle prop for editing

  // Place this just before the return statement
  const handleCloseVehicleModal = () => {
    setShowAddVehicle(false);
    setEditVehicle(null);
  };
  const [payroll, setPayroll] = useState(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Debug: Log user information
      console.log('Current user:', user);
      console.log('User role:', user?.role);
      
      // Test driver authentication first
      try {
        const authTest = await bookingApi.testDriverAuth();
        console.log('Driver auth test result:', authTest);
      } catch (authError) {
        console.error('Driver auth test failed:', authError);
      }
      
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const [pendingResponse, acceptedResponse, vehiclesResponse, payrollResponse] = await Promise.all([
        bookingApi.getPendingBookingsForDriver(),
        bookingApi.getDriverAcceptedBookings(),
        vehicleApi.getDriverVehicles(),
        payrollApi.getMyPayroll(currentMonth, currentYear)
      ]);

      // Debug: Log API responses
      console.log('Pending bookings response:', pendingResponse);
      console.log('Accepted bookings response:', acceptedResponse);
      console.log('Vehicles response:', vehiclesResponse);

      if (pendingResponse.success) {
        setPendingBookings(pendingResponse.bookings || []);
      } else {
        console.error('Failed to load pending bookings:', pendingResponse.message);
        setPendingBookings([]);
      }

      if (acceptedResponse.success) {
        setAcceptedBookings(acceptedResponse.bookings || []);
      } else {
        console.error('Failed to load accepted bookings:', acceptedResponse.message);
        setAcceptedBookings([]);
      }

      if (vehiclesResponse.success) {
        setVehicles(vehiclesResponse.vehicles || []);
      } else {
        console.error('Failed to load vehicles:', vehiclesResponse.message);
        setVehicles([]);
      }

      setPayroll(payrollResponse || null);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty arrays to prevent further errors
      setPendingBookings([]);
      setAcceptedBookings([]);
      setVehicles([]);
      
      // Show user-friendly error message
      alert('Failed to load dashboard data. Please refresh the page and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      setAcceptingBooking(bookingId);
      const response = await bookingApi.acceptBooking(bookingId);
      
      if (response.success) {
        // Reload dashboard data
        await loadDashboardData();
        alert('Booking accepted successfully!');
      } else {
        alert(response.message || 'Failed to accept booking');
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
      alert('Failed to accept booking. Please try again.');
    } finally {
      setAcceptingBooking(null);
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      setCompletingBooking(bookingId);
      const response = await bookingApi.completeBooking(bookingId);
      
      if (response.success) {
        // Reload dashboard data
        await loadDashboardData();
        alert('Booking completed successfully!');
      } else {
        alert(response.message || 'Failed to complete booking');
      }
    } catch (error) {
      console.error('Error completing booking:', error);
      alert('Failed to complete booking. Please try again.');
    } finally {
      setCompletingBooking(null);
    }
  };


  const handleVehicleAdded = (newVehicle) => {
    setVehicles(prev => [newVehicle, ...prev]);
  };

  const handleVehicleUpdated = (updatedVehicle) => {
    setVehicles(prev => prev.map(v => v._id === updatedVehicle._id ? updatedVehicle : v));
  };

  const handleEditVehicle = (vehicle) => {
    setEditVehicle(vehicle);
    setShowAddVehicle(true);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      const { vehicleApi } = await import('../services/api');
      const response = await vehicleApi.deleteVehicle(vehicleId);
      if (response.success) {
        setVehicles(prev => prev.filter(v => v._id !== vehicleId));
      } else {
        alert(response.message || 'Failed to delete vehicle');
      }
    } catch (err) {
      alert('Failed to delete vehicle. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Calculate dashboard stats
  const dashboardStats = {
    totalTrips: acceptedBookings.length,
    completedTrips: acceptedBookings.filter(booking => booking.status === 'Completed').length,
    pendingTrips: acceptedBookings.filter(booking => booking.status === 'Driver Assigned').length,
    availableBookings: pendingBookings.length,
    averageRating: 4.8 // This could be calculated from actual ratings if available
  };

  // Get assigned but not yet accepted bookings
  const getAssignedBookings = () => {
    return pendingBookings.filter(booking => 
      booking.driverId && !booking.driverAccepted
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 font-abeze text-sm">Total Trips</p>
              <p className="text-3xl font-abeze font-bold text-white">{dashboardStats.totalTrips}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 font-abeze text-sm">Completed</p>
              <p className="text-3xl font-abeze font-bold text-white">{dashboardStats.completedTrips}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 font-abeze text-sm">Pending</p>
              <p className="text-3xl font-abeze font-bold text-white">{dashboardStats.pendingTrips}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 font-abeze text-sm">Available</p>
              <p className="text-3xl font-abeze font-bold text-white">{dashboardStats.availableBookings}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        
      </div>

      {/* Assigned Tasks */}
      {getAssignedBookings().length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-abeze font-bold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Assigned Tasks (Pending Acceptance)
          </h3>
          <div className="space-y-4">
            {getAssignedBookings().map((booking) => (
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
                      {booking.packageDetails?.title || booking.packageId?.title} • {new Date(booking.bookingDetails?.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400 font-abeze text-xs">
                      {booking.bookingDetails?.numberOfPeople} guests • Assigned by Admin
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAcceptBooking(booking._id)}
                  disabled={acceptingBooking === booking._id}
                  className={`px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${
                    acceptingBooking === booking._id
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }`}
                >
                  {acceptingBooking === booking._id ? 'Accepting...' : 'Accept Assignment'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Bookings */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-abeze font-bold text-white mb-4">Available Bookings</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-300 font-abeze">Loading available bookings...</div>
          </div>
        ) : pendingBookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-300 font-abeze">No available bookings at the moment</div>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-blue-200 font-abeze">Customer</th>
                  <th className="text-left py-3 px-4 text-blue-200 font-abeze">Package</th>
                  <th className="text-left py-3 px-4 text-blue-200 font-abeze">Location</th>
                  <th className="text-left py-3 px-4 text-blue-200 font-abeze">Start Date</th>
                  <th className="text-left py-3 px-4 text-blue-200 font-abeze">People</th>
                  <th className="text-left py-3 px-4 text-blue-200 font-abeze">Action</th>
              </tr>
            </thead>
            <tbody>
                {pendingBookings
                  .filter(booking => !(booking.driverId && !booking.driverAccepted))
                  .map((booking) => (
                  <tr key={booking._id} className="border-b border-white/10">
                    <td className="py-3 px-4 text-white font-abeze">
                      {booking.userId?.firstName || 'N/A'} {booking.userId?.lastName || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-white font-abeze">
                      {booking.packageId?.title || booking.packageDetails?.title || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-white font-abeze">
                      {booking.packageId?.location || booking.packageDetails?.location || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-white font-abeze">
                      {booking.bookingDetails?.startDate 
                        ? new Date(booking.bookingDetails.startDate).toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                    <td className="py-3 px-4 text-white font-abeze">
                      {booking.bookingDetails?.numberOfPeople || 'N/A'}
                    </td>
                  <td className="py-3 px-4">
                      <button
                        onClick={() => handleAcceptBooking(booking._id)}
                        disabled={acceptingBooking === booking._id}
                        className={`px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${
                          acceptingBooking === booking._id
                            ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {acceptingBooking === booking._id ? 'Accepting...' : 'Accept'}
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* My Accepted Bookings */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-abeze font-bold text-white mb-4">My Accepted Bookings</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-300 font-abeze">Loading your bookings...</div>
          </div>
        ) : acceptedBookings.filter(booking => booking.status === 'Driver Assigned').length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-300 font-abeze">No accepted bookings yet</div>
            <p className="text-gray-400 font-abeze text-sm mt-2">Accept bookings from above to see them here</p>
          </div>
        ) : (
        <div className="space-y-4">
            {acceptedBookings
              .filter(booking => booking.status === 'Driver Assigned')
              .sort((a, b) => new Date(a.bookingDetails?.startDate) - new Date(b.bookingDetails?.startDate))
              .map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-4">
                <div>
                      <h4 className="text-white font-abeze font-medium">
                        {booking.userId?.firstName || 'N/A'} {booking.userId?.lastName || 'N/A'}
                      </h4>
                      <p className="text-gray-300 font-abeze text-sm">
                        {booking.packageId?.title || booking.packageDetails?.title || 'N/A'} • {booking.packageId?.location || booking.packageDetails?.location || 'N/A'}
                      </p>
                      <p className="text-gray-300 font-abeze text-sm">
                        {booking.bookingDetails?.startDate && booking.bookingDetails?.endDate
                          ? `${new Date(booking.bookingDetails.startDate).toLocaleDateString()} - ${new Date(booking.bookingDetails.endDate).toLocaleDateString()}`
                          : 'N/A'
                        }
                      </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-abeze ${
                      booking.status === 'Completed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : booking.status === 'Driver Assigned'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {booking.status}
                    </span>
                    {booking.status === 'Driver Assigned' && (
                      <button
                        onClick={() => handleCompleteBooking(booking._id)}
                        disabled={completingBooking === booking._id}
                        className={`px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${
                          completingBooking === booking._id
                            ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {completingBooking === booking._id ? 'Completing...' : 'Complete'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Completed Bookings */}
      {acceptedBookings.filter(booking => booking.status === 'Completed').length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-abeze font-bold text-white mb-4">Recently Completed</h3>
          <div className="space-y-4">
            {acceptedBookings
              .filter(booking => booking.status === 'Completed')
              .sort((a, b) => new Date(b.bookingDetails?.startDate) - new Date(a.bookingDetails?.startDate))
              .slice(0, 3) // Show only the 3 most recent completed bookings
              .map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="text-white font-abeze font-medium">
                        {booking.userId?.firstName || 'N/A'} {booking.userId?.lastName || 'N/A'}
                      </h4>
                      <p className="text-gray-300 font-abeze text-sm">
                        {booking.packageId?.title || booking.packageDetails?.title || 'N/A'} • {booking.packageId?.location || booking.packageDetails?.location || 'N/A'}
                      </p>
                      <p className="text-gray-300 font-abeze text-sm">
                        Completed on {booking.updatedAt 
                          ? new Date(booking.updatedAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-abeze">
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => handleTabChange('completed')}
              className="text-blue-400 hover:text-blue-300 font-abeze text-sm"
            >
              View All Completed Bookings →
            </button>
          </div>
        </div>

      )}
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      {/* Accepted Bookings (Schedule) */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-abeze font-bold text-white mb-4">My Schedule - Accepted Bookings</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-300 font-abeze">Loading your schedule...</div>
          </div>
        ) : acceptedBookings.filter(booking => booking.status === 'Driver Assigned').length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-300 font-abeze">No scheduled bookings at the moment</div>
            <p className="text-gray-400 font-abeze text-sm mt-2">Accept bookings from the Dashboard to see them here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards Only */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <p className="text-blue-200 font-abeze text-sm">Total Trips</p>
                <p className="text-3xl font-abeze font-bold text-white">{dashboardStats.totalTrips}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <p className="text-green-200 font-abeze text-sm">Completed Trips</p>
                <p className="text-3xl font-abeze font-bold text-white">{dashboardStats.completedTrips}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <p className="text-yellow-200 font-abeze text-sm">Pending Trips</p>
                <p className="text-3xl font-abeze font-bold text-white">{dashboardStats.pendingTrips}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <p className="text-purple-200 font-abeze text-sm">Available Bookings</p>
                <p className="text-3xl font-abeze font-bold text-white">{dashboardStats.availableBookings}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderVehicle = () => (


    <div className="space-y-6">
      {/* Vehicle Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-abeze font-bold text-white">My Vehicles</h3>
        <button
          onClick={() => setShowAddVehicle(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-abeze font-medium transition-colors duration-300 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Vehicles List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-300 font-abeze">Loading vehicles...</div>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white/5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-white font-abeze font-medium text-lg mb-2">No Vehicles Added</h3>
          <p className="text-gray-400 font-abeze text-sm mb-6">Add your first vehicle to get started</p>
          <button
            onClick={() => setShowAddVehicle(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-abeze font-medium transition-colors duration-300"
          >
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 relative flex flex-col justify-between h-full">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13l2-2m0 0l7-7 7 7M13 5v6h6" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-abeze font-bold text-white mb-1">{vehicle.make} {vehicle.model}</h4>
                  <p className="text-gray-300 font-abeze text-sm">{vehicle.plateNumber}</p>
                  <p className="text-gray-400 font-abeze text-xs">{vehicle.type} • {vehicle.year}</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-gray-200 font-abeze text-sm mb-2">Color: <span className="font-medium">{vehicle.color || 'N/A'}</span></p>
                <p className="text-gray-200 font-abeze text-sm mb-2">Seats: <span className="font-medium">{vehicle.seats || 'N/A'}</span></p>
                <p className="text-gray-200 font-abeze text-sm mb-2">Status: <span className="font-medium">{vehicle.status || 'Active'}</span></p>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => { setEditVehicle(vehicle); setShowAddVehicle(true); }}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-abeze font-medium transition-colors duration-300 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteVehicle(vehicle._id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-abeze font-medium transition-colors duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AddVehicleModal
        isOpen={showAddVehicle}
        onClose={handleCloseVehicleModal}
        onVehicleAdded={handleVehicleAdded}
        onVehicleUpdated={handleVehicleUpdated}
        vehicle={editVehicle}
      />
      {/* Check if user is authenticated and is a driver */}
      {!user ? (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-white font-abeze text-lg">Loading...</div>
        </div>
      ) : user.role !== 'driver' ? (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 font-abeze text-xl mb-4">Access Denied</div>
            <div className="text-gray-300 font-abeze">Only drivers can access this dashboard.</div>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-abeze"
            >
              Go Home
            </button>
          </div>
        </div>
      ) : (
        <>
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
              Driver Dashboard
            </h1>
            <p className="text-gray-300 font-abeze text-lg">
              Welcome back, {user?.firstName} {user?.lastName}
            </p>
          </div>

          {/* Driver Content */}
          <div className="max-w-7xl mx-auto">
            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'bookings', label: 'Bookings', icon: '📚' },
                { id: 'vehicle', label: 'Vehicle', icon: '🚗' },
                { id: 'reports', label: 'Reports', icon: '📈' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-6 py-3 rounded-lg font-abeze font-medium transition-colors duration-300 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
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
              {activeTab === 'bookings' && renderBookings()}
              {activeTab === 'vehicle' && renderVehicle()}
              {activeTab === 'reports' && renderReportsSimple && renderReportsSimple()}
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default DriverDashboard;
